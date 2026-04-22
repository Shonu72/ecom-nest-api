import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class QueryOrderDto {
    @ApiPropertyOptional({ enum: OrderStatus })
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus;

    @ApiPropertyOptional({ example: 1, default: 1 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page = 1;

    @ApiPropertyOptional({ example: 10, default: 10 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit = 10;
}
