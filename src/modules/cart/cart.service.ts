import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) {}

    async getCart(userId: string): Promise<CartResponseDto> {
        const cart = await this.getOrCreateCart(userId);
        return this.formatCart(cart);
    }

    async addItem(userId: string, addToCartDto: AddToCartDto): Promise<CartResponseDto> {
        const { productId, quantity } = addToCartDto;

        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException(`Product not found: ${productId}`);
        }

        if (!product.isActive) {
            throw new BadRequestException(`Product is not active: ${product.name}`);
        }

        const cart = await this.getOrCreateCart(userId);

        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        if (existingItem) {
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }

        const updatedCart = await this.getOrCreateCart(userId);
        return this.formatCart(updatedCart);
    }

    async updateItem(
        userId: string,
        productId: string,
        updateCartItemDto: UpdateCartItemDto,
    ): Promise<CartResponseDto> {
        const cart = await this.getOrCreateCart(userId);

        const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Item not found in cart');
        }

        await this.prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: updateCartItemDto.quantity },
        });

        const updatedCart = await this.getOrCreateCart(userId);
        return this.formatCart(updatedCart);
    }

    async removeItem(userId: string, productId: string): Promise<CartResponseDto> {
        const cart = await this.getOrCreateCart(userId);

        const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Item not found in cart');
        }

        await this.prisma.cartItem.delete({
            where: { id: cartItem.id },
        });

        const updatedCart = await this.getOrCreateCart(userId);
        return this.formatCart(updatedCart);
    }

    async clearCart(userId: string): Promise<void> {
        const cart = await this.prisma.cart.findFirst({
            where: { userId, checkedOut: false },
        });

        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }
    }

    private async getOrCreateCart(userId: string) {
        let cart = await this.prisma.cart.findFirst({
            where: { userId, checkedOut: false },
            include: {
                cartItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId, checkedOut: false },
                include: {
                    cartItems: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        }

        return cart;
    }

    private formatCart(cart: any): CartResponseDto {
        let totalAmount = 0;
        const items = cart.cartItems.map((item) => {
            const subTotal = Number(item.product.price) * item.quantity;
            totalAmount += subTotal;

            return {
                id: item.id,
                productId: item.productId,
                productName: item.product.name,
                productImageUrl: item.product.imageUrl,
                price: Number(item.product.price),
                quantity: item.quantity,
                subTotal,
            };
        });

        return {
            id: cart.id,
            userId: cart.userId,
            items,
            totalAmount,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }
}
