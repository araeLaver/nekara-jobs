/**
 * Health API Tests
 *
 * Tests for GET /api/health endpoint
 */

import { GET } from '../health/route';
import { prisma, resetAllMocks } from '../../../lib/__mocks__/prisma';

// Mock the prisma module
jest.mock('@/lib/prisma', () => require('../../../lib/__mocks__/prisma'));

describe('GET /api/health', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should return healthy status when database is connected', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    prisma.job.count.mockResolvedValue(100);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('healthy');
    expect(json.database).toBe('connected');
    expect(json.timestamp).toBeTruthy();
    expect(json.services.jobs).toBe('ok');
  });

  it('should return jobs service as warning when no active jobs', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    prisma.job.count.mockResolvedValue(0);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('healthy');
    expect(json.services.jobs).toBe('warning');
  });

  it('should return unhealthy status when database query fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.status).toBe('unhealthy');
    expect(json.database).toBe('disconnected');
    expect(json.timestamp).toBeTruthy();
  });

  it('should hide error details in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    prisma.$queryRaw.mockRejectedValue(new Error('Secret connection string exposed'));

    const response = await GET();
    const json = await response.json();

    expect(json.error).toBe('Database connection failed');
    expect(json.error).not.toContain('Secret');

    process.env.NODE_ENV = originalEnv;
  });

  it('should show error details in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    prisma.$queryRaw.mockRejectedValue(new Error('Connection timeout'));

    const response = await GET();
    const json = await response.json();

    expect(json.error).toBe('Connection timeout');

    process.env.NODE_ENV = originalEnv;
  });
});
