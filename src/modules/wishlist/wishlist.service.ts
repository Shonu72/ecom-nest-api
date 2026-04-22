import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WishlistResponseDto } from './dto/wishlist-response.dto';

@Injectable()
export class WishlistService {
    constructor(private prisma: PrismaService) {}

    async getWishlist(userId: string): Promise<WishlistResponseDto> {
        const wishlist = await this.getOrCreateWishlist(userId);
        return this.formatWishlist(wishlist);
    }

    async addToWishlist(userId: string, productId: string): Promise<WishlistResponseDto> {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException(`Product not found: ${productId}`);
        }

        const wishlist = await this.getOrCreateWishlist(userId);

        const existingItem = await this.prisma.wishlistItem.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId,
                },
            },
        });

        if (!existingItem) {
            await this.prisma.wishlistItem.create({
                data: {
                    wishlistId: wishlist.id,
                    productId,
                },
            });
        }

        const updatedWishlist = await this.getOrCreateWishlist(userId);
        return this.formatWishlist(updatedWishlist);
    }

    async removeFromWishlist(userId: string, productId: string): Promise<WishlistResponseDto> {
        const wishlist = await this.getOrCreateWishlist(userId);

        const item = await this.prisma.wishlistItem.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId,
                },
            },
        });

        if (!item) {
            throw new NotFoundException('Item not found in wishlist');
        }

        await this.prisma.wishlistItem.delete({
            where: { id: item.id },
        });

        const updatedWishlist = await this.getOrCreateWishlist(userId);
        return this.formatWishlist(updatedWishlist);
    }

    async clearWishlist(userId: string): Promise<void> {
        const wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
        });

        if (wishlist) {
            await this.prisma.wishlistItem.deleteMany({
                where: { wishlistId: wishlist.id },
            });
        }
    }

    private async getOrCreateWishlist(userId: string) {
        let wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!wishlist) {
            wishlist = await this.prisma.wishlist.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        }

        return wishlist;
    }

    private formatWishlist(wishlist: any): WishlistResponseDto {
        const items = wishlist.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            productImageUrl: item.product.imageUrl,
            price: Number(item.product.price),
            isActive: item.product.isActive,
        }));

        return {
            id: wishlist.id,
            userId: wishlist.userId,
            items,
            createdAt: wishlist.createdAt,
            updatedAt: wishlist.updatedAt,
        };
    }
}
