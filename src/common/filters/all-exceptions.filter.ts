import {
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { ArgumentsHost } from '@nestjs/common';
import type { Response } from 'express';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      // Handle both string and object responses (e.g. from ValidationPipe)
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : ((exceptionResponse as any).message ?? exception.message);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `[${statusCode}] ${Array.isArray(message) ? message.join(', ') : message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    Sentry.captureException(exception);

    response.status(statusCode).json({
      statusCode,
      message,
      error: HttpStatus[statusCode],
      timestamp: new Date().toISOString(),
    });
  }
}
