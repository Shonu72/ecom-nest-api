import { IsEmail, IsOptional, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a user.
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
