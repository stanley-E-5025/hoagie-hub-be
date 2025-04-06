import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

@Catch(HttpException, MongoError, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | MongoError | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object') {
        message =
          (errorResponse as any).message ||
          exception.message ||
          'Unknown error';
        error = (errorResponse as any).error || 'Error';
      } else {
        message = exception.message || 'Unknown error';
        error = 'Error';
      }
    } else if (exception instanceof MongoError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message || 'Database error';
      error = 'Database Error';

      // Handle duplicate key error
      if (exception.code === 11000) {
        message = 'Duplicate key error';
        error = 'Validation Error';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Server Error';
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status}: ${message}`,
      exception.stack,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
