import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-reponse.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';


/**
 * AuthController defines the API endpoints for authentication.
 * Routes are protected globally by JwtAuthGuard, unless marked with @Public().
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * Register a new user.
   * POST /auth/register
   */
  @Public() // This route can be accessed without a token
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("Registration successful")
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponseDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  /**
   * Login an existing user.
   * POST /auth/login
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Login successful")
  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in', type: AuthResponseDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  /**
   * Logout the current user.
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage("Logged out successfully")
  @ApiOperation({ summary: 'Logout the current user' })
  async logout(@GetCurrentUser('sub') userId: string) {
    return await this.authService.logout(userId);
  }

  /**
   * Refresh tokens using the refresh token.
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("Tokens refreshed successfully")
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens successfully refreshed' })
  async refreshTokens(@Body() refreshDto: RefreshDto) {
    return await this.authService.refreshTokens(refreshDto.userId, refreshDto.refreshToken);
  }
}
