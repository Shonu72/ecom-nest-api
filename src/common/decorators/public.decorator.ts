import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to mark routes as public.
 * Routes with this decorator will bypass the global JWT Guard.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
