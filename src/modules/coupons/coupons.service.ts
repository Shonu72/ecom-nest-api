import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class CouponsService {
    constructor(private prisma: PrismaService) {}

    async create(createCouponDto: any) {
        const { code } = createCouponDto;

        const existing = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (existing) {
            throw new BadRequestException('Coupon code already exists');
        }

        return this.prisma.coupon.create({
            data: {
                ...createCouponDto,
                code: code.toUpperCase(),
                expiryDate: new Date(createCouponDto.expiryDate),
            },
        });
    }

    async findAll() {
        return this.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
        });

        if (!coupon) {
            throw new NotFoundException(`Coupon not found: ${id}`);
        }

        return coupon;
    }

    async validate(validateDto: ValidateCouponDto) {
        const { code, orderAmount } = validateDto;

        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            throw new NotFoundException('Invalid coupon code');
        }

        if (!coupon.isActive) {
            throw new BadRequestException('Coupon is inactive');
        }

        if (new Date() > coupon.expiryDate) {
            throw new BadRequestException('Coupon has expired');
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new BadRequestException('Coupon usage limit reached');
        }

        if (orderAmount && coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
            throw new BadRequestException(`Minimum order amount of ${coupon.minOrderAmount} required`);
        }

        // Calculate discount
        let discount = 0;
        if (orderAmount) {
            if (coupon.discountType === 'PERCENTAGE') {
                discount = (orderAmount * Number(coupon.discountValue)) / 100;
                if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
                    discount = Number(coupon.maxDiscount);
                }
            } else {
                discount = Number(coupon.discountValue);
            }

            if (discount > orderAmount) {
                discount = orderAmount;
            }
        }

        return {
            valid: true,
            coupon,
            discountAmount: discount,
        };
    }

    async update(id: string, updateCouponDto: any) {
        await this.findOne(id);

        if (updateCouponDto.code) {
            updateCouponDto.code = updateCouponDto.code.toUpperCase();
        }

        if (updateCouponDto.expiryDate) {
            updateCouponDto.expiryDate = new Date(updateCouponDto.expiryDate);
        }

        return this.prisma.coupon.update({
            where: { id },
            data: updateCouponDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.coupon.delete({ where: { id } });
    }
}
