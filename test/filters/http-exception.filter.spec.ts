import { HttpExceptionFilter } from 'src/filter/http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces';
import { GqlContextType } from '@nestjs/graphql';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => ({ url: '/test' }),
      }),
      getType: jest.fn(),
    } as any;
  });

  it('should return the exception directly for GraphQL context', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    (mockHost.getType as jest.Mock).mockReturnValue(
      'graphql' as GqlContextType,
    );

    const result = filter.catch(exception, mockHost);

    expect(result).toBe(exception);
    expect(mockStatus).not.toHaveBeenCalled();
    expect(mockJson).not.toHaveBeenCalled();
  });

  it('should format HTTP exception correctly', () => {
    const message = 'Test error';
    const exception = new HttpException(message, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: '/test',
      message: [message],
    });
  });

  it('should handle validation errors with array messages', () => {
    const messages = ['error1', 'error2'];
    const exception = new HttpException(
      { message: messages },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      path: '/test',
      message: messages,
    });
  });

  it('should handle non-HTTP errors', () => {
    const error = new Error('Test error');

    filter.catch(error, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      path: '/test',
      message: ['Test error'],
    });
  });
});
