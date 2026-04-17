import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'response_message';

/**
 * Decorator to set a custom message for the standard success response.
 * Usage: @ResponseMessage('User created successfully')
 */
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);
