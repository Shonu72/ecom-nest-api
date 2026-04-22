import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
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
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}

    @Get()
    @ApiOperation({ summary: 'Get current user wishlist' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return wishlist',
        type: WishlistResponseDto,
    })
    getWishlist(@GetCurrentUser('id') userId: string): Promise<WishlistResponseDto> {
        return this.wishlistService.getWishlist(userId);
    }

    @Post(':productId')
    @ApiOperation({ summary: 'Add product to wishlist' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Product added successfully',
        type: WishlistResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
    addToWishlist(
        @GetCurrentUser('id') userId: string,
        @Param('productId') productId: string,
    ): Promise<WishlistResponseDto> {
        return this.wishlistService.addToWishlist(userId, productId);
    }

    @Delete(':productId')
    @ApiOperation({ summary: 'Remove product from wishlist' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Product removed successfully',
        type: WishlistResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item not found in wishlist' })
    removeFromWishlist(
        @GetCurrentUser('id') userId: string,
        @Param('productId') productId: string,
    ): Promise<WishlistResponseDto> {
        return this.wishlistService.removeFromWishlist(userId, productId);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Clear wishlist' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Wishlist cleared successfully',
    })
    clearWishlist(@GetCurrentUser('id') userId: string): Promise<void> {
        return this.wishlistService.clearWishlist(userId);
    }
}
