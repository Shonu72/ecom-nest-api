import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '.prisma/client';
import { PrismaService } from './prisma/prisma.service';

type CreateUserInput = {
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
};

type UpdateUserInput = {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
};

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      service: 'ecom-nest-api',
      database: 'connected',
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async createUser(input: CreateUserInput) {
    const email = input.email?.trim();

    if (!email) {
      throw new BadRequestException('email is required');
    }

    if (!input.password) {
      throw new BadRequestException('password is required');
    }

    try {
      return await this.prisma.user.create({
        data: {
          email,
          password: input.password,
          firstName: this.normalizeName(input.firstName),
          lastName: this.normalizeName(input.lastName),
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const data: Prisma.UserUpdateInput = {};

    if (input.email !== undefined) {
      const email = input.email.trim();

      if (!email) {
        throw new BadRequestException('email cannot be empty');
      }

      data.email = email;
    }

    if (input.firstName !== undefined) {
      data.firstName = this.normalizeName(input.firstName);
    }

    if (input.lastName !== undefined) {
      data.lastName = this.normalizeName(input.lastName);
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('provide at least one field to update');
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  private normalizeName(name: string | null | undefined) {
    if (name === undefined) {
      return undefined;
    }

    const trimmedName = name?.trim();
    return trimmedName ? trimmedName : null;
  }

  private handlePrismaError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('a user with this email already exists');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('user not found');
      }
    }
  }
}
