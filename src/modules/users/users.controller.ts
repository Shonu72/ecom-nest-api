import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser } from '../../common/decorators/get-current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * UsersController handles administrative and profile-related actions for users.
 * Routes are protected by default via JwtAuthGuard.
 */
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ─── Current User (Me) Routes ───────────────────────────────────────────────

  /**
   * Returns the authenticated user's own profile.
   * GET /users/me
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user\'s profile (no sensitive data)' })
  async getMe(@GetCurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * Deletes the currently authenticated user's own account.
   * DELETE /users/me
   */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'Current user account deleted successfully' })
  async deleteMe(@GetCurrentUser('sub') userId: string) {
    await this.usersService.remove(userId);
    return { message: 'Your account has been deleted successfully' };
  }

  /**
   * Changes the authenticated user's password.
   * PATCH /users/me/change-password
   */
  @Patch('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @GetCurrentUser('sub') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  // ─── Admin / Generic User Routes ────────────────────────────────────────────

  /**
   * Returns all users.
   * GET /users
   */
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all users (Admin only)' })
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Returns a specific user by ID.
   * GET /users/:id
   */
  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a user by ID (Admin only)' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Updates an existing user's information.
   * PATCH /users/:id
   *
   * Note: User creation is handled by POST /auth/register
   */
  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a user by ID (Admin only)' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user by ID (admin action).
   * DELETE /users/:id
   */
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
