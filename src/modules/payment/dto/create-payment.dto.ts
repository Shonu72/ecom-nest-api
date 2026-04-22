import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaymentDto {
    @ApiProperty({ example: 'order-uuid' })
    @IsUUID()
    @IsNotEmpty()
    orderId: string;
}
