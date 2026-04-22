import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
    @ApiProperty({ example: 'review-uuid' })
    id: string;

    @ApiProperty({ example: 5 })
    rating: number;

    @ApiProperty({ example: 'Great product!' })
    comment: string | null;

    @ApiProperty({ example: 'user-uuid' })
    userId: string;

    @ApiProperty({ example: 'John Doe' })
    userName: string;

    @ApiProperty({ example: 'product-uuid' })
    productId: string;

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    updatedAt: Date;
}
