import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-reponse.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * AuthService handles the core logic for authentication.
 */
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  /**
   * Registers a new user using the UsersService.
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, role } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      });

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new ConflictException('Registration failed. Please try again.');
    }
  }

  /**
   * Logs in a user after validating credentials.
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Logs out a user by clearing their refresh token.
   */
  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: { not: null },
      },
      data: { refreshToken: null },
    });
  }

  /**
   * Refreshes the access token using a valid refresh token.
   */
  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    const user = await this.usersService.findByIdWithSecrets(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied: No session found');
    }

    try {
      const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access Denied: Invalid session');
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      // Catch bcrypt specific errors or other runtime issues
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Authentication failed during token refresh');
    }
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  private async getTokens(userId: string, email: string, role: string) {
    const jwtAccessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const jwtRefreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const jwtAccessExp = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRATION');
    const jwtRefreshExp = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: jwtAccessSecret,
          expiresIn: jwtAccessExp as any,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: jwtRefreshSecret,
          expiresIn: jwtRefreshExp as any,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
