import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface Response<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Global Interceptor to wrap all successful responses into a standard object.
 * Format: { success: true, message: '...', data: T }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const responseMessage =
      this.reflector.get<string>(
        RESPONSE_MESSAGE_KEY,
        context.getHandler(),
      ) || '';

    return next.handle().pipe(
      map((data) => ({
        success: true,
        // Priority: data.message from controller > @ResponseMessage decorator > empty string
        message: data?.message || responseMessage,
        // If data is an object and has a custom message, extract it and remove from data
        data: (() => {
          if (data && typeof data === 'object' && 'message' in data) {
            const { message, ...rest } = data;
            return Object.keys(rest).length === 0 ? {} : rest;
          }
          return data;
        })(),
      })),
    );
  }
}
