import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
    @ApiProperty({ example: 'address-uuid' })
    id: string;

    @ApiProperty({ example: '123 Main St' })
    street: string;

    @ApiProperty({ example: 'New York' })
    city: string;

    @ApiProperty({ example: 'NY' })
    state: string;

    @ApiProperty({ example: '10001' })
    zip: string;

    @ApiProperty({ example: 'India' })
    country: string;

    @ApiProperty({ example: true })
    isDefault: boolean;

    @ApiProperty({ example: 'user-uuid' })
    userId: string;
}
