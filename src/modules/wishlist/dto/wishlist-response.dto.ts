import { ApiProperty } from '@nestjs/swagger';

class WishlistItemResponseDto {
    @ApiProperty({ example: 'item-uuid' })
    id: string;

    @ApiProperty({ example: 'product-uuid' })
    productId: string;

    @ApiProperty({ example: 'Wireless Headphones' })
    productName: string;

    @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
    productImageUrl: string | null;

    @ApiProperty({ example: 99.99 })
    price: number;

    @ApiProperty({ example: true })
    isActive: boolean;
}

export class WishlistResponseDto {
    @ApiProperty({ example: 'wishlist-uuid' })
    id: string;

    @ApiProperty({ example: 'user-uuid' })
    userId: string;

    @ApiProperty({ type: [WishlistItemResponseDto] })
    items: WishlistItemResponseDto[];

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    updatedAt: Date;
}
