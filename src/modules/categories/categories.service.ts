import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(
        createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const { name, slug, ...rest } = createCategoryDto;
        const categorySlug =
            slug ??
            name
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');

        const existingCategory = await this.prisma.category.findUnique({
            where: { slug: categorySlug },
        });

        if (existingCategory) {
            throw new ConflictException(
                'Category with this slug already exists: ' + categorySlug,
            );
        }

        const category = await this.prisma.category.create({
            data: {
                name,
                slug: categorySlug,
                ...rest,
            },
        });

        return this.formatCategory(category, 0);
    }

    async findAll(query: QueryCategoryDto) {
        const { isActive, search, page, limit } = query;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [categories, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { products: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.category.count({ where }),
        ]);

        return {
            data: categories.map((cat) =>
                this.formatCategory(cat, cat._count.products),
            ),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(idOrSlug: string): Promise<CategoryResponseDto> {
        const isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                idOrSlug,
            );

        const category = await this.prisma.category.findUnique({
            where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category not found: ${idOrSlug}`);
        }

        return this.formatCategory(category, category._count.products);
    }

    async update(
        id: string,
        updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException(`Category not found: ${id}`);
        }

        if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
            const existingSlug = await this.prisma.category.findUnique({
                where: { slug: updateCategoryDto.slug },
            });

            if (existingSlug) {
                throw new ConflictException(
                    'Category with this slug already exists: ' +
                    updateCategoryDto.slug,
                );
            }
        }

        const updatedCategory = await this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return this.formatCategory(
            updatedCategory,
            updatedCategory._count.products,
        );
    }

    async remove(id: string): Promise<void> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category not found: ${id}`);
        }

        if (category._count.products > 0) {
            throw new ConflictException(
                'Cannot delete category with associated products. Move or delete products first.',
            );
        }

        await this.prisma.category.delete({
            where: { id },
        });
    }

    private formatCategory(
        category: Category,
        productCount: number,
    ): CategoryResponseDto {
        return {
            id: category.id,
            name: category.name,
            description: category.description,
            slug: category.slug,
            imageUrl: category.imageUrl,
            isActive: category.isActive,
            productCount,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
}
