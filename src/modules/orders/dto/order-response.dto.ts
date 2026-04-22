import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

class OrderItemResponseDto {
    @ApiProperty({ example: 'item-uuid' })
    id: string;

    @ApiProperty({ example: 'product-uuid' })
    productId: string;

    @ApiProperty({ example: 'Wireless Headphones' })
    productName: string;

    @ApiProperty({ example: 2 })
    quantity: number;

    @ApiProperty({ example: 99.99 })
    price: number;
}

export class OrderResponseDto {
    @ApiProperty({ example: 'order-uuid' })
    id: string;

    @ApiProperty({ example: 'clv123abc' })
    orderNumber: string;

    @ApiProperty({ enum: OrderStatus })
    status: OrderStatus;

    @ApiProperty({ example: 199.98 })
    totalAmount: number;

    @ApiProperty({ example: 'user-uuid' })
    userId: string;

    @ApiProperty({ example: '123 Main St, New York, NY 10001', nullable: true })
    shippingAddress: string | null;

    @ApiProperty({ example: 'SAVE20', required: false })
    couponCode?: string;

    @ApiProperty({ type: [OrderItemResponseDto] })
    items: OrderItemResponseDto[];

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    updatedAt: Date;
}
