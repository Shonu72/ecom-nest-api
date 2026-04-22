import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ReportFailureDto } from './dto/report-failure.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

// Use require because Razorpay doesn't have official types or ES imports might be tricky
const Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
    private razorpay: any;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

        if (keyId && keySecret) {
            this.razorpay = new Razorpay({
                key_id: keyId,
                key_secret: keySecret,
            });
        }
    }

    private verifyRazorpayConfig() {
        if (!this.razorpay) {
            throw new InternalServerErrorException(
                'Razorpay is not configured. Please provide RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
            );
        }
    }

    async initiatePayment(userId: string, createPaymentDto: CreatePaymentDto) {
        this.verifyRazorpayConfig();
        const { orderId } = createPaymentDto;

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException(`Order not found: ${orderId}`);
        }

        if (order.userId !== userId) {
            throw new BadRequestException('Order does not belong to the user');
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Cannot pay for a cancelled order');
        }

        // Razorpay amount is in paise
        const amountInPaise = Math.round(Number(order.totalAmount) * 100);

        try {
            const razorpayOrder = await this.razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: order.orderNumber,
            });

            // Create or update payment record
            await this.prisma.payment.upsert({
                where: { orderId },
                update: {
                    transactionId: razorpayOrder.id,
                    amount: order.totalAmount,
                    status: PaymentStatus.PENDING,
                    currency: 'INR',
                },
                create: {
                    userId,
                    orderId,
                    amount: order.totalAmount,
                    transactionId: razorpayOrder.id,
                    status: PaymentStatus.PENDING,
                    currency: 'INR',
                },
            });

            return {
                razorpayOrderId: razorpayOrder.id,
                amount: amountInPaise,
                currency: 'INR',
                orderNumber: order.orderNumber,
            };
        } catch (error) {
            throw new InternalServerErrorException('Error creating Razorpay order');
        }
    }

    async verifyPayment(userId: string, verifyPaymentDto: VerifyPaymentDto) {
        this.verifyRazorpayConfig();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            verifyPaymentDto;

        const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
        if (!secret) {
            throw new InternalServerErrorException('Razorpay secret not configured');
        }

        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            // Update payment status to failed
            await this.prisma.payment.update({
                where: { transactionId: razorpay_order_id },
                data: { status: PaymentStatus.FAILED },
            });
            throw new BadRequestException('Invalid payment signature');
        }

        // Update payment and order status
        return this.completePayment(razorpay_order_id);
    }

    async reportFailure(userId: string, reportFailureDto: ReportFailureDto) {
        const { razorpay_order_id } = reportFailureDto;

        const payment = await this.prisma.payment.findUnique({
            where: { transactionId: razorpay_order_id },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.userId !== userId) {
            throw new BadRequestException('Unauthorized');
        }

        await this.prisma.payment.update({
            where: { transactionId: razorpay_order_id },
            data: { status: PaymentStatus.FAILED },
        });

        return { message: 'Failure reported successfully' };
    }

    async handleWebhook(body: any, signature: string) {
        const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new InternalServerErrorException('Webhook secret not configured');
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(body))
            .digest('hex');

        // Note: Standard JSON.stringify might slightly differ from raw body
        // If this fails, we might need to enable rawBody in main.ts
        if (expectedSignature !== signature) {
            throw new BadRequestException('Invalid webhook signature');
        }

        const event = body.event;
        const payload = body.payload;

        if (event === 'payment.captured') {
            const razorpayOrderId = payload.payment.entity.order_id;
            await this.completePayment(razorpayOrderId);
        } else if (event === 'payment.failed') {
            const razorpayOrderId = payload.payment.entity.order_id;
            await this.prisma.payment.update({
                where: { transactionId: razorpayOrderId },
                data: { status: PaymentStatus.FAILED },
            });
        }

        return { status: 'ok' };
    }

    private async completePayment(razorpayOrderId: string) {
        return await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.findUnique({
                where: { transactionId: razorpayOrderId },
            });

            if (!payment || payment.status === PaymentStatus.COMPLETED) {
                return { message: 'Already processed or not found' };
            }

            const order = await tx.order.findUnique({
                where: { id: payment.orderId },
                include: { coupon: true },
            });

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            // Handle Coupon Finalization
            if (order.couponId) {
                // Check if already used for this order (idempotency)
                const existingUsage = await tx.couponUsage.findUnique({
                    where: { orderId: order.id },
                });

                if (!existingUsage) {
                    // Create usage record
                    await tx.couponUsage.create({
                        data: {
                            couponId: order.couponId,
                            userId: order.userId,
                            orderId: order.id,
                        },
                    });

                    // Increment global used count
                    await tx.coupon.update({
                        where: { id: order.couponId },
                        data: { usedCount: { increment: 1 } },
                    });
                }
            }

            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.COMPLETED,
                    paymentMethod: 'razorpay',
                },
            });

            await tx.order.update({
                where: { id: payment.orderId },
                data: { status: OrderStatus.PROCESSING },
            });

            return { message: 'Payment completed successfully' };
        });
    }
}
