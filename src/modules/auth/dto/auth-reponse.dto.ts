// Auth response DTO 

import { Role } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for the Authentication Response.
 * user field contains non-sensitive data about the user.
 */
export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...' })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: 'uuid-123',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  })
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    role: string;
  };
}