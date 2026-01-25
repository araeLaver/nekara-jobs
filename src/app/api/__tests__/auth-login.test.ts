/**
 * Auth Login API Tests
 *
 * Tests for POST /api/auth/login endpoint
 */

import { POST } from '../auth/login/route';
import { prisma, resetAllMocks } from '../../../lib/__mocks__/prisma';
import { createMockRequest } from '../../../__tests__/helpers/request';

// Mock the prisma module
jest.mock('@/lib/prisma', () => require('../../../lib/__mocks__/prisma'));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should create a new user with nickname', async () => {
    const mockUser = {
      id: 'user-123',
      nickname: 'TestUser',
      username: 'user_1234567890_0001',
      avatar: null,
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.user.create.mockResolvedValue(mockUser);

    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: 'TestUser' },
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.user.id).toBe('user-123');
    expect(json.user.nickname).toBe('TestUser');
    expect(json.token).toBeTruthy();
  });

  it('should return 400 when nickname is missing', async () => {
    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: {},
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('닉네임을 입력해주세요.');
    expect(json.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when nickname is empty string', async () => {
    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: '' },
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('닉네임을 입력해주세요.');
  });

  it('should return 400 when nickname is whitespace only', async () => {
    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: '   ' },
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('닉네임을 입력해주세요.');
  });

  it('should return 400 when nickname is not a string', async () => {
    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: 12345 },
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('닉네임을 입력해주세요.');
  });

  it('should return 400 when nickname exceeds 20 characters', async () => {
    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: 'a'.repeat(21) },
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('닉네임은 20자를 초과할 수 없습니다.');
  });

  it('should accept nickname with exactly 20 characters', async () => {
    const mockUser = {
      id: 'user-123',
      nickname: 'a'.repeat(20),
      username: 'user_1234567890_0001',
      avatar: null,
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.user.create.mockResolvedValue(mockUser);

    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: 'a'.repeat(20) },
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  it('should return token in correct format', async () => {
    const mockUser = {
      id: 'user-abc-123',
      nickname: 'TestUser',
      username: 'user_1234567890_0001',
      avatar: null,
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.user.create.mockResolvedValue(mockUser);

    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: 'TestUser' },
    });
    const response = await POST(request);
    const json = await response.json();

    // Token format: base64(userId).timestamp.signature
    const tokenParts = json.token.split('.');
    expect(tokenParts).toHaveLength(3);

    // Verify userId is encoded in token
    const decodedUserId = Buffer.from(tokenParts[0], 'base64').toString('utf-8');
    expect(decodedUserId).toBe('user-abc-123');
  });

  it('should create user with unique username', async () => {
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user-123',
      nickname: data.nickname,
      username: data.username,
      avatar: null,
      isOnline: data.isOnline,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: 'TestUser' },
    });
    await POST(request);

    const createCall = prisma.user.create.mock.calls[0][0];
    expect(createCall.data.username).toMatch(/^user_\d+_\d{4}$/);
    expect(createCall.data.nickname).toBe('TestUser');
    expect(createCall.data.isOnline).toBe(true);
  });

  it('should handle database errors', async () => {
    prisma.user.create.mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: 'TestUser' },
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBeTruthy();
  });

  it('should include avatar in response', async () => {
    const mockUser = {
      id: 'user-123',
      nickname: 'TestUser',
      username: 'user_1234567890_0001',
      avatar: 'https://example.com/avatar.png',
      isOnline: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.user.create.mockResolvedValue(mockUser);

    const request = createMockRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: { nickname: 'TestUser' },
    });
    const response = await POST(request);
    const json = await response.json();

    expect(json.user.avatar).toBe('https://example.com/avatar.png');
  });
});
