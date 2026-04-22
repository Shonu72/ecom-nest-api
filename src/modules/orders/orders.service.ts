import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) {}

    async create(
        userId: string,
        createOrderDto: CreateOrderDto,
    ): Promise<OrderResponseDto> {
        const { items, shippingAddress } = createOrderDto;

        // Start transaction
        return await this.prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsData: any[] = [];

            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new NotFoundException(`Product not found: ${item.productId}`);
                }

                if (!product.isActive) {
                    throw new BadRequestException(`Product is not active: ${product.name}`);
                }

                if (product.stock < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for product: ${product.name}. Available: ${product.stock}`,
                    );
                }

                // Deduct stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });

                const itemPrice = Number(product.price);
                totalAmount += itemPrice * item.quantity;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                });
            }

            // Create Order
            const order = await tx.order.create({
                data: {
                    userId,
                    shippingAddress,
                    status: OrderStatus.PENDING,
                    totalAmount,
                    orderItems: {
                        create: orderItemsData,
                    },
                },
                include: {
                    orderItems: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            return this.formatOrder(order);
        });
    }

    async findAll(user: { id: string; role: Role }, query: QueryOrderDto) {
        const { status, page, limit } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (user.role !== Role.ADMIN) {
            where.userId = user.id;
        }

        if (status) {
            where.status = status;
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    orderItems: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders.map((order) => this.formatOrder(order)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(
        id: string,
        user: { id: string; role: Role },
    ): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order not found: ${id}`);
        }

        if (user.role !== Role.ADMIN && order.userId !== user.id) {
            throw new ForbiddenException('You do not have access to this order');
        }

        return this.formatOrder(order);
    }

    async updateStatus(
        id: string,
        updateOrderStatusDto: UpdateOrderStatusDto,
    ): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException(`Order not found: ${id}`);
        }

        // If status is being updated to CANCELLED, restore stock
        if (
            updateOrderStatusDto.status === OrderStatus.CANCELLED &&
            order.status !== OrderStatus.CANCELLED
        ) {
            await this.restoreStock(id);
        }

        const updatedOrder = await this.prisma.order.update({
            where: { id },
            data: { status: updateOrderStatusDto.status },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return this.formatOrder(updatedOrder);
    }

    async cancel(id: string, user: { id: string; role: Role }): Promise<void> {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundException(`Order not found: ${id}`);
        }

        if (user.role !== Role.ADMIN && order.userId !== user.id) {
            throw new ForbiddenException('You do not have access to this order');
        }

        if (order.status !== OrderStatus.PENDING && user.role !== Role.ADMIN) {
            throw new BadRequestException(
                'Only pending orders can be cancelled by the user',
            );
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Order is already cancelled');
        }

        await this.prisma.$transaction(async (tx) => {
            // Restore stock
            const items = await tx.orderItem.findMany({
                where: { orderId: id },
            });

            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }

            // Update status
            await tx.order.update({
                where: { id },
                data: { status: OrderStatus.CANCELLED },
            });
        });
    }

    private async restoreStock(orderId: string) {
        const items = await this.prisma.orderItem.findMany({
            where: { orderId },
        });

        for (const item of items) {
            await this.prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
            });
        }
    }

    private formatOrder(order: any): OrderResponseDto {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: Number(order.totalAmount),
            userId: order.userId,
            shippingAddress: order.shippingAddress,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.orderItems.map((item) => ({
                id: item.id,
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                price: Number(item.price),
            })),
        };
    }
}
