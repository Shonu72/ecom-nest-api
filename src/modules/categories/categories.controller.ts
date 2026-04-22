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
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a new category (Admin only)' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Category created successfully',
        type: CategoryResponseDto,
    })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Slug already exists' })
    create(
        @Body() createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories with pagination and filtering' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return all categories',
    })
    findAll(@Query() query: QueryCategoryDto) {
        return this.categoriesService.findAll(query);
    }

    @Get(':idOrSlug')
    @ApiOperation({ summary: 'Get a category by ID or Slug' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return a category',
        type: CategoryResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
    findOne(@Param('idOrSlug') idOrSlug: string): Promise<CategoryResponseDto> {
        return this.categoriesService.findOne(idOrSlug);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a category (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Category updated successfully',
        type: CategoryResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Slug already exists' })
    update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a category (Admin only)' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Category deleted successfully',
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Cannot delete category with associated products',
    })
    remove(@Param('id') id: string): Promise<void> {
        return this.categoriesService.remove(id);
    }
}
