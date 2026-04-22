import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { AddressResponseDto } from './dto/address-response.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new address' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Address created successfully',
        type: AddressResponseDto,
    })
    create(
        @GetCurrentUser('id') userId: string,
        @Body() createAddressDto: CreateAddressDto,
    ): Promise<AddressResponseDto> {
        return this.addressesService.create(userId, createAddressDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user addresses' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return addresses',
        type: [AddressResponseDto],
    })
    findAll(@GetCurrentUser('id') userId: string): Promise<AddressResponseDto[]> {
        return this.addressesService.findAll(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific address' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return address',
        type: AddressResponseDto,
    })
    findOne(
        @GetCurrentUser('id') userId: string,
        @Param('id') id: string,
    ): Promise<AddressResponseDto> {
        return this.addressesService.findOne(userId, id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an address' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Address updated successfully',
        type: AddressResponseDto,
    })
    update(
        @GetCurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() updateAddressDto: UpdateAddressDto,
    ): Promise<AddressResponseDto> {
        return this.addressesService.update(userId, id, updateAddressDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an address' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Address deleted successfully',
    })
    remove(
        @GetCurrentUser('id') userId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.addressesService.remove(userId, id);
    }
}
