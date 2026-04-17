import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';

/**
 * UsersService handles the database interactions for the User resource.
 */
@Injectable()
export class UsersService {
  private readonly userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Returns all users from the database.
   */
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'desc' },
      where: {
        role: Role.USER
      },
      select: this.userSelect,
    });
  }

  /**
   * Finds a single user by their ID.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Finds a single user by their ID including sensitive fields.
   * Internal use only (e.g., authentication).
   */
  async findByIdWithSecrets(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Finds a single user by their Email.
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Creates a new user.
   */
  async create(data: Prisma.UserCreateInput) {
    try {
      return await this.prisma.user.create({
        data,
        select: this.userSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  /**
   * Updates an existing user.
   */
  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: this.userSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  /**
   * Returns the current user's profile.
   */
  async getProfile(id: string) {
    return this.findOne(id);
  }

  /**
   * Changes the password for the given user.
   */
  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const SALT_ROUNDS = 12;
    const hashedPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Removes a user from the database.
   */
  async remove(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  /**
   * Standard error handler for Prisma specific errors.
   */
  private handlePrismaError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('A user with this email already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
    }
  }
}
