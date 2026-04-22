import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) {}

    async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        const { categoryId, sku, price, ...rest } = createProductDto;

        // Verify category exists
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw new NotFoundException(`Category not found with ID: ${categoryId}`);
        }

        // Verify SKU uniqueness
        const existingSku = await this.prisma.product.findUnique({
            where: { sku },
        });

        if (existingSku) {
            throw new ConflictException(`Product with SKU ${sku} already exists`);
        }

        const product = await this.prisma.product.create({
            data: {
                ...rest,
                sku,
                price: new Prisma.Decimal(price),
                category: {
                    connect: { id: categoryId },
                },
            },
            include: {
                category: true,
            },
        });

        return this.formatProduct(product);
    }

    async findAll(query: QueryProductDto) {
        const {
            isActive,
            search,
            categoryId,
            minPrice,
            maxPrice,
            page,
            limit,
        } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ProductWhereInput = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = new Prisma.Decimal(minPrice);
            if (maxPrice !== undefined) where.price.lte = new Prisma.Decimal(maxPrice);
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products.map((prod) => this.formatProduct(prod)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(idOrSku: string): Promise<ProductResponseDto> {
        const isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                idOrSku,
            );

        const product = await this.prisma.product.findUnique({
            where: isUuid ? { id: idOrSku } : { sku: idOrSku },
            include: {
                category: true,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product not found: ${idOrSku}`);
        }

        return this.formatProduct(product);
    }

    async update(
        id: string,
        updateProductDto: UpdateProductDto,
    ): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product not found with ID: ${id}`);
        }

        const { categoryId, sku, price, ...rest } = updateProductDto;

        // If updating category, verify it exists
        if (categoryId && categoryId !== product.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                throw new NotFoundException(`Category not found with ID: ${categoryId}`);
            }
        }

        // If updating SKU, verify uniqueness
        if (sku && sku !== product.sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku },
            });
            if (existingSku) {
                throw new ConflictException(`Product with SKU ${sku} already exists`);
            }
        }

        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: {
                ...rest,
                sku,
                price: price !== undefined ? new Prisma.Decimal(price) : undefined,
                categoryId,
            },
            include: {
                category: true,
            },
        });

        return this.formatProduct(updatedProduct);
    }

    async remove(id: string): Promise<void> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException(`Product not found with ID: ${id}`);
        }

        // Note: We might want to check if the product is in any orders/carts before deleting,
        // but for now we'll allow deletion (Prisma will handle cascade if configured, 
        // or throw error if restricted). 
        // Schema shows: onDelete: Cascade for OrderItem and CartItem is NOT specified, 
        // but relations exist. Actually schema shows onDelete: Cascade for OrderItem.order and CartItem.cart.
        // For Product, it's used in OrderItem and CartItem. We should probably restrict deletion 
        // if it has been ordered.

        await this.prisma.product.delete({
            where: { id },
        });
    }

    private formatProduct(product: any): ProductResponseDto {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            stock: product.stock,
            sku: product.sku,
            imageUrl: product.imageUrl,
            isActive: product.isActive,
            category: {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
            },
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
}
