import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * Data Transfer Object for updating a user.
 * PartialType makes all fields from CreateUserDto optional.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
