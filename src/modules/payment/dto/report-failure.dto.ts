import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReportFailureDto {
    @ApiProperty({ example: 'order_O7m4U4uY4uY4uY' })
    @IsString()
    @IsNotEmpty()
    razorpay_order_id: string;

    @ApiProperty({ example: 'BAD_REQUEST', required: false })
    @IsString()
    @IsOptional()
    error_code?: string;

    @ApiProperty({ example: 'Payment dismissed by user', required: false })
    @IsString()
    @IsOptional()
    error_description?: string;
}
