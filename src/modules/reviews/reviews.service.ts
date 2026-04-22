import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
        const { productId, rating, comment } = createReviewDto;

        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException(`Product not found: ${productId}`);
        }

        // Check if user already reviewed this product
        const existingReview = await this.prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existingReview) {
            throw new BadRequestException('You have already reviewed this product');
        }

        const review = await this.prisma.review.create({
            data: {
                userId,
                productId,
                rating,
                comment,
            },
            include: {
                user: true,
            },
        });

        return this.formatReview(review);
    }

    async findAllByProduct(productId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where: { productId },
                include: { user: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.review.count({ where: { productId } }),
        ]);

        return {
            data: reviews.map((r) => this.formatReview(r)),
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async update(
        userId: string,
        id: string,
        updateReviewDto: UpdateReviewDto,
    ): Promise<ReviewResponseDto> {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            throw new NotFoundException(`Review not found: ${id}`);
        }

        if (review.userId !== userId) {
            throw new BadRequestException('Unauthorized to update this review');
        }

        const updatedReview = await this.prisma.review.update({
            where: { id },
            data: updateReviewDto,
            include: { user: true },
        });

        return this.formatReview(updatedReview);
    }

    async remove(userId: string, id: string): Promise<void> {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            throw new NotFoundException(`Review not found: ${id}`);
        }

        if (review.userId !== userId) {
            throw new BadRequestException('Unauthorized to delete this review');
        }

        await this.prisma.review.delete({
            where: { id },
        });
    }

    private formatReview(review: any): ReviewResponseDto {
        return {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            userId: review.userId,
            userName: `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || review.user.email,
            productId: review.productId,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        };
    }
}
