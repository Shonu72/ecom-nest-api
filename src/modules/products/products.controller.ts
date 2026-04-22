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
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a new product (Admin only)' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Product created successfully',
        type: ProductResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'SKU already exists' })
    create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all products with filtering and pagination' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return all products matching criteria',
    })
    findAll(@Query() query: QueryProductDto) {
        return this.productsService.findAll(query);
    }

    @Get(':idOrSku')
    @ApiOperation({ summary: 'Get a product by ID or SKU' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return a product',
        type: ProductResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
    findOne(@Param('idOrSku') idOrSku: string): Promise<ProductResponseDto> {
        return this.productsService.findOne(idOrSku);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a product (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product updated successfully',
        type: ProductResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product or Category not found' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'SKU already exists' })
    update(
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<ProductResponseDto> {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a product (Admin only)' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Product deleted successfully',
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
    remove(@Param('id') id: string): Promise<void> {
        return this.productsService.remove(id);
    }
}
