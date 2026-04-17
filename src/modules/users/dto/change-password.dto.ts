import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for changing a user's password.
 */
export class ChangePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: 'The current password of the user' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword456', description: 'The new password (min 8 characters)' })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;
}
