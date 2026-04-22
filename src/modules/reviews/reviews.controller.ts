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
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Create a new review' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Review created successfully',
        type: ReviewResponseDto,
    })
    create(
        @GetCurrentUser('id') userId: string,
        @Body() createReviewDto: CreateReviewDto,
    ): Promise<ReviewResponseDto> {
        return this.reviewsService.create(userId, createReviewDto);
    }

    @Public()
    @Get('product/:productId')
    @ApiOperation({ summary: 'Get all reviews for a product' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: HttpStatus.OK, description: 'Return reviews' })
    findAllByProduct(
        @Param('productId') productId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.reviewsService.findAllByProduct(productId, page, limit);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a review' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Review updated successfully',
        type: ReviewResponseDto,
    })
    update(
        @GetCurrentUser('id') userId: string,
        @Param('id') id: string,
        @Body() updateReviewDto: UpdateReviewDto,
    ): Promise<ReviewResponseDto> {
        return this.reviewsService.update(userId, id, updateReviewDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a review' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Review deleted successfully',
    })
    remove(
        @GetCurrentUser('id') userId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.reviewsService.remove(userId, id);
    }
}
