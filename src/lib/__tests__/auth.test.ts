/**
 * Auth Module Tests
 *
 * Tests for authentication functions: signToken, verifyToken,
 * authenticateRequest, sanitizeUserInput, withAuth
 */

import { signToken, verifyToken, authenticateRequest, sanitizeUserInput, withAuth } from '../auth';
import { prisma } from '../__mocks__/prisma';
import { createMockRequest, createMockToken, createMockUser } from '../../__tests__/helpers/request';
import { NextRequest } from 'next/server';

// Mock the prisma module
jest.mock('../prisma', () => require('../__mocks__/prisma'));

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signToken', () => {
    it('should return a token in the correct format (base64.timestamp.signature)', () => {
      const token = signToken('user-123');
      const parts = token.split('.');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBeTruthy(); // base64 encoded userId
      expect(parts[1]).toMatch(/^\d+$/); // timestamp
      expect(parts[2]).toBeTruthy(); // signature
    });

    it('should generate unique tokens for different userIds', () => {
      const token1 = signToken('user-1');
      const token2 = signToken('user-2');

      expect(token1).not.toEqual(token2);
    });

    it('should generate different tokens for the same userId at different times', async () => {
      const token1 = signToken('user-1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const token2 = signToken('user-1');

      expect(token1).not.toEqual(token2);
    });

    it('should encode userId in base64 correctly', () => {
      const userId = 'test-user-id-123';
      const token = signToken(userId);
      const userIdB64 = token.split('.')[0];
      const decodedUserId = Buffer.from(userIdB64, 'base64').toString('utf-8');

      expect(decodedUserId).toEqual(userId);
    });
  });

  describe('verifyToken', () => {
    it('should return userId for a valid token', () => {
      const userId = 'user-123';
      const token = createMockToken(userId);

      const result = verifyToken(token);
      expect(result).toEqual(userId);
    });

    it('should return null for an expired token', () => {
      const token = createMockToken('user-123', { expired: true });

      const result = verifyToken(token);
      expect(result).toBeNull();
    });

    it('should return null for a token with invalid signature', () => {
      const token = createMockToken('user-123');
      const parts = token.split('.');
      // Tamper with the signature
      const tamperedToken = `${parts[0]}.${parts[1]}.invalid-signature`;

      const result = verifyToken(tamperedToken);
      expect(result).toBeNull();
    });

    it('should return null for a token with wrong format (missing parts)', () => {
      const result = verifyToken('only-one-part');
      expect(result).toBeNull();
    });

    it('should return null for a token with too many parts', () => {
      const result = verifyToken('part1.part2.part3.part4');
      expect(result).toBeNull();
    });

    it('should return null for an empty string', () => {
      const result = verifyToken('');
      expect(result).toBeNull();
    });

    it('should return null for a token with invalid timestamp', () => {
      const userIdB64 = Buffer.from('user-123').toString('base64');
      const payload = `${userIdB64}.not-a-number`;
      // Create a valid signature for the invalid payload
      const { createHmac } = require('crypto');
      const signature = createHmac('sha256', process.env.NEXTAUTH_SECRET || 'test-secret-key-for-testing')
        .update(payload)
        .digest('base64url');

      const result = verifyToken(`${payload}.${signature}`);
      expect(result).toBeNull();
    });
  });

  describe('authenticateRequest', () => {
    it('should return null when Authorization header is missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/test');

      const result = await authenticateRequest(request);
      expect(result).toBeNull();
    });

    it('should return null when Authorization header does not start with Bearer', async () => {
      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { Authorization: 'Basic some-token' },
      });

      const result = await authenticateRequest(request);
      expect(result).toBeNull();
    });

    it('should return null for an invalid token', async () => {
      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { Authorization: 'Bearer invalid-token' },
      });

      const result = await authenticateRequest(request);
      expect(result).toBeNull();
    });

    it('should return null when user is not found in database', async () => {
      const token = createMockToken('non-existent-user');
      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { Authorization: `Bearer ${token}` },
      });

      prisma.user.findUnique.mockResolvedValue(null);

      const result = await authenticateRequest(request);
      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-user' },
      });
    });

    it('should return user when token is valid and user exists', async () => {
      const mockUser = createMockUser({ id: 'valid-user-id' });
      const token = createMockToken('valid-user-id');
      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { Authorization: `Bearer ${token}` },
      });

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authenticateRequest(request);
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'valid-user-id' },
      });
    });

    it('should return null when database throws an error', async () => {
      const token = createMockToken('user-id');
      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { Authorization: `Bearer ${token}` },
      });

      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await authenticateRequest(request);
      expect(result).toBeNull();
    });
  });

  describe('sanitizeUserInput', () => {
    it('should remove userId from input', () => {
      const input = { userId: 'malicious-user', content: 'test' };
      const result = sanitizeUserInput(input, 'authenticated-user');

      expect(result).not.toHaveProperty('userId');
      expect(result.authorId).toEqual('authenticated-user');
      expect(result.content).toEqual('test');
    });

    it('should remove authorId from input', () => {
      const input = { authorId: 'malicious-author', content: 'test' };
      const result = sanitizeUserInput(input, 'authenticated-user');

      expect(result.authorId).toEqual('authenticated-user');
      expect(result.content).toEqual('test');
    });

    it('should replace both userId and authorId with authenticated userId', () => {
      const input = {
        userId: 'fake-user',
        authorId: 'fake-author',
        title: 'Test Title',
        content: 'Test Content',
      };
      const result = sanitizeUserInput(input, 'real-authenticated-user');

      expect(result).not.toHaveProperty('userId');
      expect(result.authorId).toEqual('real-authenticated-user');
      expect(result.title).toEqual('Test Title');
      expect(result.content).toEqual('Test Content');
    });

    it('should preserve all other fields', () => {
      const input = {
        authorId: 'ignored',
        field1: 'value1',
        field2: 123,
        field3: { nested: true },
      };
      const result = sanitizeUserInput(input, 'authenticated-user');

      expect(result.field1).toEqual('value1');
      expect(result.field2).toEqual(123);
      expect(result.field3).toEqual({ nested: true });
    });
  });

  describe('withAuth', () => {
    it('should return 401 when user is not authenticated', async () => {
      const handler = jest.fn();
      const wrappedHandler = withAuth(handler);

      const request = createMockRequest('http://localhost:3000/api/test');
      const response = await wrappedHandler(request);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toEqual(401);

      const json = await response.json();
      expect(json.error).toEqual('인증이 필요합니다.');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler with user when authenticated', async () => {
      const mockUser = createMockUser({ id: 'authenticated-user-id' });
      const token = createMockToken('authenticated-user-id');

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      const handler = jest.fn().mockResolvedValue(mockResponse);

      const wrappedHandler = withAuth(handler);
      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await wrappedHandler(request);

      expect(handler).toHaveBeenCalledWith(request, mockUser);
      expect(response).toEqual(mockResponse);
    });

    it('should pass request context correctly to handler', async () => {
      const mockUser = createMockUser({ id: 'user-123' });
      const token = createMockToken('user-123');

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const handler = jest.fn().mockImplementation((req: NextRequest, user) => {
        return new Response(JSON.stringify({
          url: req.url,
          userId: user.id,
        }), { status: 200 });
      });

      const wrappedHandler = withAuth(handler);
      const request = createMockRequest('http://localhost:3000/api/protected', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await wrappedHandler(request);
      const json = await response.json();

      expect(json.url).toContain('/api/protected');
      expect(json.userId).toEqual('user-123');
    });
  });
});
