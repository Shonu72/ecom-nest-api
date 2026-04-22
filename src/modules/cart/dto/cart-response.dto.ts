import { ApiProperty } from '@nestjs/swagger';

class CartItemResponseDto {
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

    @ApiProperty({ example: 2 })
    quantity: number;

    @ApiProperty({ example: 199.98 })
    subTotal: number;
}

export class CartResponseDto {
    @ApiProperty({ example: 'cart-uuid' })
    id: string;

    @ApiProperty({ example: 'user-uuid' })
    userId: string;

    @ApiProperty({ type: [CartItemResponseDto] })
    items: CartItemResponseDto[];

    @ApiProperty({ example: 199.98 })
    totalAmount: number;

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    updatedAt: Date;
}
