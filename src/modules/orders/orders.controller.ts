import {
    Body,
    Controller,
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
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @ApiOperation({ summary: 'Place a new order' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Order placed successfully',
        type: OrderResponseDto,
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Insufficient stock or inactive product' })
    create(
        @GetCurrentUser('id') userId: string,
        @Body() createOrderDto: CreateOrderDto,
    ): Promise<OrderResponseDto> {
        return this.ordersService.create(userId, createOrderDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get orders (Admin sees all, Users see their own)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return orders',
    })
    findAll(
        @GetCurrentUser() user: { id: string; role: Role },
        @Query() query: QueryOrderDto,
    ) {
        return this.ordersService.findAll(user, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order details by ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Return order details',
        type: OrderResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Access denied' })
    findOne(
        @Param('id') id: string,
        @GetCurrentUser() user: { id: string; role: Role },
    ): Promise<OrderResponseDto> {
        return this.ordersService.findOne(id, user);
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update order status (Admin only)' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Status updated successfully',
        type: OrderResponseDto,
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    updateStatus(
        @Param('id') id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    ): Promise<OrderResponseDto> {
        return this.ordersService.updateStatus(id, updateOrderStatusDto);
    }

    @Patch(':id/cancel')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Cancel an order' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Order cancelled successfully',
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot cancel order' })
    cancel(
        @Param('id') id: string,
        @GetCurrentUser() user: { id: string; role: Role },
    ): Promise<void> {
        return this.ordersService.cancel(id, user);
    }
}
