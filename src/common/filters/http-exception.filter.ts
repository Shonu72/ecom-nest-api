import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global Exception Filter to catch all HTTP exceptions and format the error response.
 * Format: { success: false, statusCode, message, error, timestamp, path }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Standardize the message format (it can be a string or an object with message property)
    const message =
      typeof exceptionResponse === 'object'
        ? exceptionResponse.message || exceptionResponse
        : exceptionResponse;

    // Standardize the error type name
    const error =
      typeof exceptionResponse === 'object'
        ? exceptionResponse.error || (exception instanceof HttpException ? exception.name : 'Internal Server Error')
        : (exception instanceof HttpException ? exception.name : 'Internal Server Error');

    response.status(status).json({
      success: false,
      statusCode: status,
      message: message,
      error: error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
