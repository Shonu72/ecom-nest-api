import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersController handles administrative and profile-related actions for users.
 * Routes are protected by default via JwtAuthGuard.
 */
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Returns all users.
   */
  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Returns a specific user by ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Creates a new user (usually for admin manual creation).
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Updates an existing user's information.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Deletes a user.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
