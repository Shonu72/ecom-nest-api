import { ApiProperty } from '@nestjs/swagger';

class SimpleCategoryDto {
    @ApiProperty({ example: 'uuid-123' })
    id: string;

    @ApiProperty({ example: 'Electronics' })
    name: string;

    @ApiProperty({ example: 'electronics' })
    slug: string;
}

export class ProductResponseDto {
    @ApiProperty({ example: 'uuid-456' })
    id: string;

    @ApiProperty({ example: 'Wireless Headphones' })
    name: string;

    @ApiProperty({ example: 'High-quality headphones', nullable: true })
    description: string | null;

    @ApiProperty({ example: 99.99 })
    price: number;

    @ApiProperty({ example: 100 })
    stock: number;

    @ApiProperty({ example: 'WH-001' })
    sku: string;

    @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
    imageUrl: string | null;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ type: SimpleCategoryDto })
    category: SimpleCategoryDto;

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T12:00:00Z' })
    updatedAt: Date;
}
