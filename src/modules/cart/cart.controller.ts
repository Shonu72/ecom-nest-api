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
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    @ApiOperation({ summary: 'Get current user cart' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return current cart',
        type: CartResponseDto,
    })
    getCart(@GetCurrentUser('id') userId: string): Promise<CartResponseDto> {
        return this.cartService.getCart(userId);
    }

    @Post('items')
    @ApiOperation({ summary: 'Add item to cart' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Item added successfully',
        type: CartResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
    addItem(
        @GetCurrentUser('id') userId: string,
        @Body() addToCartDto: AddToCartDto,
    ): Promise<CartResponseDto> {
        return this.cartService.addItem(userId, addToCartDto);
    }

    @Patch('items/:productId')
    @ApiOperation({ summary: 'Update item quantity in cart' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Quantity updated successfully',
        type: CartResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item not found in cart' })
    updateItem(
        @GetCurrentUser('id') userId: string,
        @Param('productId') productId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ): Promise<CartResponseDto> {
        return this.cartService.updateItem(userId, productId, updateCartItemDto);
    }

    @Delete('items/:productId')
    @ApiOperation({ summary: 'Remove item from cart' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Item removed successfully',
        type: CartResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item not found in cart' })
    removeItem(
        @GetCurrentUser('id') userId: string,
        @Param('productId') productId: string,
    ): Promise<CartResponseDto> {
        return this.cartService.removeItem(userId, productId);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Clear cart' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Cart cleared successfully',
    })
    clearCart(@GetCurrentUser('id') userId: string): Promise<void> {
        return this.cartService.clearCart(userId);
    }
}
