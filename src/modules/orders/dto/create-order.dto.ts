import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';

class OrderItemDto {
    @ApiProperty({ example: 'product-uuid' })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({ example: '123 Main St, New York, NY 10001' })
    @IsString()
    @IsNotEmpty()
    shippingAddress: string;

    @ApiProperty({ example: 'SAVE20', required: false })
    @IsString()
    @IsOptional()
    couponCode?: string;
}
