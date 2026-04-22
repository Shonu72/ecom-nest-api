import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Headers,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReportFailureDto } from './dto/report-failure.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payment')
@Controller('payment')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post('initiate')
    @ApiOperation({ summary: 'Initiate a payment for an order' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Razorpay order created successfully',
    })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    initiate(
        @GetCurrentUser('id') userId: string,
        @Body() createPaymentDto: CreatePaymentDto,
    ) {
        return this.paymentService.initiatePayment(userId, createPaymentDto);
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify the payment signature' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Payment verified successfully',
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid signature' })
    verify(
        @GetCurrentUser('id') userId: string,
        @Body() verifyPaymentDto: VerifyPaymentDto,
    ) {
        return this.paymentService.verifyPayment(userId, verifyPaymentDto);
    }

    @Post('failure')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Report a failed payment' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Failure reported successfully',
    })
    reportFailure(
        @GetCurrentUser('id') userId: string,
        @Body() reportFailureDto: ReportFailureDto,
    ) {
        return this.paymentService.reportFailure(userId, reportFailureDto);
    }

    @Public()
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Razorpay Webhook handler' })
    handleWebhook(
        @Body() body: any,
        @Headers('x-razorpay-signature') signature: string,
    ) {
        return this.paymentService.handleWebhook(body, signature);
    }
}
