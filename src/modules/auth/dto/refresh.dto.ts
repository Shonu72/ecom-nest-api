import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object for refreshing tokens.
 */
export class RefreshDto {
  @ApiProperty({ example: 'uuid-123', description: 'The ID of the user' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...', description: 'The current refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
