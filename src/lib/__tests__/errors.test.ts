/**
 * Errors Module Tests
 *
 * Tests for custom error classes and handleApiError function
 */

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  handleApiError,
  withErrorHandler,
} from '../errors';

describe('Errors Module', () => {
  describe('Custom Error Classes', () => {
    describe('AppError', () => {
      it('should create an error with statusCode, message, and code', () => {
        const error = new AppError(500, 'Something went wrong', 'CUSTOM_CODE');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Something went wrong');
        expect(error.code).toBe('CUSTOM_CODE');
        expect(error.name).toBe('AppError');
      });

      it('should work without optional code', () => {
        const error = new AppError(400, 'Bad request');

        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Bad request');
        expect(error.code).toBeUndefined();
      });
    });

    describe('ValidationError', () => {
      it('should create a 400 error with VALIDATION_ERROR code', () => {
        const error = new ValidationError('Invalid input data');

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Invalid input data');
        expect(error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('UnauthorizedError', () => {
      it('should create a 401 error with default message', () => {
        const error = new UnauthorizedError();

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('인증이 필요합니다.');
        expect(error.code).toBe('UNAUTHORIZED');
      });

      it('should accept custom message', () => {
        const error = new UnauthorizedError('Custom auth message');

        expect(error.statusCode).toBe(401);
        expect(error.message).toBe('Custom auth message');
        expect(error.code).toBe('UNAUTHORIZED');
      });
    });

    describe('ForbiddenError', () => {
      it('should create a 403 error with default message', () => {
        const error = new ForbiddenError();

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('권한이 없습니다.');
        expect(error.code).toBe('FORBIDDEN');
      });

      it('should accept custom message', () => {
        const error = new ForbiddenError('No access allowed');

        expect(error.statusCode).toBe(403);
        expect(error.message).toBe('No access allowed');
      });
    });

    describe('NotFoundError', () => {
      it('should create a 404 error with default message', () => {
        const error = new NotFoundError();

        expect(error).toBeInstanceOf(AppError);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('리소스를 찾을 수 없습니다.');
        expect(error.code).toBe('NOT_FOUND');
      });

      it('should accept custom message', () => {
        const error = new NotFoundError('Job not found');

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Job not found');
      });
    });
  });

  describe('handleApiError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('AppError handling', () => {
      it('should return correct response for ValidationError', async () => {
        const error = new ValidationError('입력값이 잘못되었습니다.');
        const response = handleApiError(error);

        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(400);

        const json = await response.json();
        expect(json.error).toBe('입력값이 잘못되었습니다.');
        expect(json.code).toBe('VALIDATION_ERROR');
      });

      it('should return correct response for UnauthorizedError', async () => {
        const error = new UnauthorizedError();
        const response = handleApiError(error);

        expect(response.status).toBe(401);

        const json = await response.json();
        expect(json.error).toBe('인증이 필요합니다.');
        expect(json.code).toBe('UNAUTHORIZED');
      });

      it('should return correct response for ForbiddenError', async () => {
        const error = new ForbiddenError();
        const response = handleApiError(error);

        expect(response.status).toBe(403);

        const json = await response.json();
        expect(json.error).toBe('권한이 없습니다.');
        expect(json.code).toBe('FORBIDDEN');
      });

      it('should return correct response for NotFoundError', async () => {
        const error = new NotFoundError('채용공고를 찾을 수 없습니다.');
        const response = handleApiError(error);

        expect(response.status).toBe(404);

        const json = await response.json();
        expect(json.error).toBe('채용공고를 찾을 수 없습니다.');
        expect(json.code).toBe('NOT_FOUND');
      });

      it('should return correct response for custom AppError', async () => {
        const error = new AppError(418, "I'm a teapot", 'TEAPOT');
        const response = handleApiError(error);

        expect(response.status).toBe(418);

        const json = await response.json();
        expect(json.error).toBe("I'm a teapot");
        expect(json.code).toBe('TEAPOT');
      });
    });

    describe('Prisma error handling', () => {
      it('should handle P2002 (unique constraint violation)', async () => {
        const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '5.0.0',
        });
        const response = handleApiError(error);

        expect(response.status).toBe(409);

        const json = await response.json();
        expect(json.error).toBe('중복된 데이터가 존재합니다.');
        expect(json.code).toBe('DUPLICATE_ERROR');
      });

      it('should handle P2025 (record not found)', async () => {
        const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        });
        const response = handleApiError(error);

        expect(response.status).toBe(404);

        const json = await response.json();
        expect(json.error).toBe('데이터를 찾을 수 없습니다.');
        expect(json.code).toBe('NOT_FOUND');
      });

      it('should handle P2003 (foreign key constraint)', async () => {
        const error = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
          code: 'P2003',
          clientVersion: '5.0.0',
        });
        const response = handleApiError(error);

        expect(response.status).toBe(400);

        const json = await response.json();
        expect(json.error).toBe('잘못된 참조입니다.');
        expect(json.code).toBe('INVALID_REFERENCE');
      });

      it('should handle other Prisma errors with generic message', async () => {
        const error = new Prisma.PrismaClientKnownRequestError('Some other error', {
          code: 'P2000',
          clientVersion: '5.0.0',
        });
        const response = handleApiError(error);

        expect(response.status).toBe(500);

        const json = await response.json();
        expect(json.error).toBe('데이터베이스 오류가 발생했습니다.');
        expect(json.code).toBe('DATABASE_ERROR');
      });

      it('should handle PrismaClientValidationError', async () => {
        const error = new Prisma.PrismaClientValidationError('Invalid data', {
          clientVersion: '5.0.0',
        });
        const response = handleApiError(error);

        expect(response.status).toBe(400);

        const json = await response.json();
        expect(json.error).toBe('입력 데이터가 유효하지 않습니다.');
        expect(json.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('Generic error handling', () => {
      it('should handle standard Error in development mode', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const error = new Error('Something broke');
        const response = handleApiError(error);

        expect(response.status).toBe(500);

        const json = await response.json();
        expect(json.error).toBe('Something broke');
        expect(json.code).toBe('INTERNAL_ERROR');

        process.env.NODE_ENV = originalEnv;
      });

      it('should hide error details in production mode', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const error = new Error('Internal secret error');
        const response = handleApiError(error);

        expect(response.status).toBe(500);

        const json = await response.json();
        expect(json.error).toBe('서버 오류가 발생했습니다.');
        expect(json.code).toBe('INTERNAL_ERROR');

        process.env.NODE_ENV = originalEnv;
      });

      it('should handle unknown error types', async () => {
        const response = handleApiError('string error');

        expect(response.status).toBe(500);

        const json = await response.json();
        expect(json.error).toBe('알 수 없는 오류가 발생했습니다.');
        expect(json.code).toBe('UNKNOWN_ERROR');
      });

      it('should handle null/undefined errors', async () => {
        const response = handleApiError(null);

        expect(response.status).toBe(500);

        const json = await response.json();
        expect(json.code).toBe('UNKNOWN_ERROR');
      });
    });
  });

  describe('withErrorHandler', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should pass through successful responses', async () => {
      const successResponse = NextResponse.json({ success: true }, { status: 200 });
      const handler = jest.fn().mockResolvedValue(successResponse);

      const wrappedHandler = withErrorHandler(handler);
      const result = await wrappedHandler('arg1', 'arg2');

      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toBe(successResponse);
    });

    it('should catch and handle thrown errors', async () => {
      const handler = jest.fn().mockRejectedValue(new ValidationError('Invalid'));

      const wrappedHandler = withErrorHandler(handler);
      const result = await wrappedHandler();

      expect(result.status).toBe(400);

      const json = await result.json();
      expect(json.error).toBe('Invalid');
    });

    it('should pass all arguments to the handler', async () => {
      const successResponse = NextResponse.json({ ok: true });
      const handler = jest.fn().mockResolvedValue(successResponse);

      const wrappedHandler = withErrorHandler(handler);
      await wrappedHandler('a', 'b', 'c');

      expect(handler).toHaveBeenCalledWith('a', 'b', 'c');
    });
  });
});
