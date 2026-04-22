import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
    @ApiProperty({ example: 'order_O7m4U4uY4uY4uY' })
    @IsString()
    @IsNotEmpty()
    razorpay_order_id: string;

    @ApiProperty({ example: 'pay_O7m4U4uY4uY4uY' })
    @IsString()
    @IsNotEmpty()
    razorpay_payment_id: string;

    @ApiProperty({ example: 'signature_O7m4U4uY4uY4uY' })
    @IsString()
    @IsNotEmpty()
    razorpay_signature: string;
}
