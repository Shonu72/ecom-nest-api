// Auth response DTO 

import { Role } from "@prisma/client";

/**
 * Data Transfer Object for the Authentication Response.
 * user field contains non-sensitive data about the user.
 */
export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: Role;
    };
}