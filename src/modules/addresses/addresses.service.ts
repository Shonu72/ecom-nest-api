import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressResponseDto } from './dto/address-response.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, createAddressDto: CreateAddressDto): Promise<AddressResponseDto> {
        return await this.prisma.$transaction(async (tx) => {
            // If this is the first address, make it default regardless
            const addressCount = await tx.address.count({ where: { userId } });
            const isDefault = addressCount === 0 ? true : createAddressDto.isDefault;

            if (isDefault) {
                await tx.address.updateMany({
                    where: { userId, isDefault: true },
                    data: { isDefault: false },
                });
            }

            return tx.address.create({
                data: {
                    ...createAddressDto,
                    userId,
                    isDefault: !!isDefault,
                },
            });
        });
    }

    async findAll(userId: string): Promise<AddressResponseDto[]> {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
    }

    async findOne(userId: string, id: string): Promise<AddressResponseDto> {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });

        if (!address) {
            throw new NotFoundException(`Address not found: ${id}`);
        }

        if (address.userId !== userId) {
            throw new BadRequestException('Unauthorized access to address');
        }

        return address;
    }

    async update(
        userId: string,
        id: string,
        updateAddressDto: UpdateAddressDto,
    ): Promise<AddressResponseDto> {
        return await this.prisma.$transaction(async (tx) => {
            const address = await tx.address.findUnique({
                where: { id },
            });

            if (!address || address.userId !== userId) {
                throw new NotFoundException('Address not found');
            }

            if (updateAddressDto.isDefault) {
                await tx.address.updateMany({
                    where: { userId, isDefault: true },
                    data: { isDefault: false },
                });
            }

            return tx.address.update({
                where: { id },
                data: updateAddressDto,
            });
        });
    }

    async remove(userId: string, id: string): Promise<void> {
        const address = await this.prisma.address.findUnique({
            where: { id },
        });

        if (!address || address.userId !== userId) {
            throw new NotFoundException('Address not found');
        }

        if (address.isDefault) {
            throw new BadRequestException('Cannot delete default address. Set another default first.');
        }

        await this.prisma.address.delete({
            where: { id },
        });
    }
}
