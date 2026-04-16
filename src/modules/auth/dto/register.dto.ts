// data transfer object (DTO) for user registration

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class RegisterDto {

    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({ example: 'Password123!', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' })
    password: string;

    @ApiProperty({ example: 'John', description: 'The first name of the user' })
    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    lastName: string;

    @IsString()
    @IsNotEmpty({ message: 'Role is required' })
    role: string;







}