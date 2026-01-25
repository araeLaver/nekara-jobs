/**
 * Test Helpers for Request Creation
 *
 * Provides utilities for creating mock NextRequest objects and test tokens.
 */

import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';

const TEST_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-key-for-testing';

/**
 * Creates a mock NextRequest with the specified options
 */
export function createMockRequest(
  url: string = 'http://localhost:3000/api/test',
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = 'GET', headers = {}, body, searchParams = {} } = options;

  // Build URL with search params
  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers),
  };

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
    (requestInit.headers as Headers).set('Content-Type', 'application/json');
  }

  return new NextRequest(urlObj.toString(), requestInit);
}

/**
 * Creates a mock token for testing authentication
 */
export function createMockToken(userId: string, options: { expired?: boolean } = {}): string {
  const { expired = false } = options;

  // Calculate timestamp (expired tokens use a timestamp from 8 days ago)
  const timestamp = expired
    ? (Date.now() - 8 * 24 * 60 * 60 * 1000).toString()
    : Date.now().toString();

  const userIdB64 = Buffer.from(userId).toString('base64');
  const payload = `${userIdB64}.${timestamp}`;

  const signature = createHmac('sha256', TEST_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

/**
 * Creates a mock request with authentication header
 */
export function createAuthenticatedRequest(
  url: string = 'http://localhost:3000/api/test',
  userId: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    searchParams?: Record<string, string>;
    tokenExpired?: boolean;
  } = {}
): NextRequest {
  const { tokenExpired = false, ...restOptions } = options;
  const token = createMockToken(userId, { expired: tokenExpired });

  return createMockRequest(url, {
    ...restOptions,
    headers: {
      ...restOptions.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Creates a mock user object
 */
export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-user-id',
    username: 'testuser',
    nickname: 'Test User',
    email: null,
    avatar: null,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock job object
 */
export function createMockJob(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-job-id',
    title: 'Software Engineer',
    description: 'A great job opportunity',
    location: '서울',
    department: '개발',
    jobType: '정규직',
    experience: '경력 3년+',
    salary: '5000만원 ~ 7000만원',
    originalUrl: 'https://example.com/job/1',
    companyId: 'test-company-id',
    isActive: true,
    postedAt: new Date(),
    deadline: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock company object
 */
export function createMockCompany(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-company-id',
    name: 'Test Company',
    nameEn: 'Test Company Inc.',
    logo: 'https://example.com/logo.png',
    website: 'https://example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock job with company included
 */
export function createMockJobWithCompany(
  jobOverrides: Record<string, unknown> = {},
  companyOverrides: Record<string, unknown> = {}
) {
  const company = createMockCompany(companyOverrides);
  return {
    ...createMockJob(jobOverrides),
    company: {
      id: company.id,
      name: company.name,
      nameEn: company.nameEn,
      logo: company.logo,
    },
  };
}
