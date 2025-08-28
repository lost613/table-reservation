import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Request, Response } from 'express';

@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | Error, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() === 'graphql') {
      return exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      message:
        exceptionResponse &&
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse &&
        Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
          : [exception.message],
    });
  }
}
