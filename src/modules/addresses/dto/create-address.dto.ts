import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
    @ApiProperty({ example: '123 Main St' })
    @IsString()
    @IsNotEmpty()
    street: string;

    @ApiProperty({ example: 'New York' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: 'NY' })
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty({ example: '10001' })
    @IsString()
    @IsNotEmpty()
    zip: string;

    @ApiProperty({ example: 'India', required: false })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
