import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateCouponDto {
    @ApiProperty({ example: 'SAVE20' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
    @IsEnum(DiscountType)
    @IsNotEmpty()
    discountType: DiscountType;

    @ApiProperty({ example: 20 })
    @IsNumber()
    @Min(0)
    discountValue: number;

    @ApiProperty({ example: 500, required: false })
    @IsNumber()
    @IsOptional()
    @Min(0)
    minOrderAmount?: number;

    @ApiProperty({ example: 100, required: false })
    @IsNumber()
    @IsOptional()
    @Min(0)
    maxDiscount?: number;

    @ApiProperty({ example: '2025-12-31T23:59:59Z' })
    @IsDateString()
    @IsNotEmpty()
    expiryDate: string;

    @ApiProperty({ example: 100, required: false })
    @IsNumber()
    @IsOptional()
    @Min(1)
    usageLimit?: number;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
