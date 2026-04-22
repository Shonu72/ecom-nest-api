import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ValidateCouponDto {
    @ApiProperty({ example: 'SAVE20' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 1000, required: false })
    @IsNumber()
    @IsOptional()
    @Min(0)
    orderAmount?: number;
}
