/**
 * Rate Limit Module Tests
 *
 * Tests for rate limiting functionality
 */

import { rateLimit, defaultRateLimit, apiRateLimits, RateLimitConfig } from '../rate-limit';
import { createMockRequest } from '../../__tests__/helpers/request';

describe('Rate Limit Module', () => {
  // Clear the rate limit store between tests by using unique IPs
  let testCounter = 0;
  const getUniqueIp = () => `test-ip-${Date.now()}-${++testCounter}`;

  describe('rateLimit function', () => {
    it('should allow the first request', async () => {
      const limiter = rateLimit({ interval: 60000, limit: 10 });
      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': getUniqueIp() },
      });

      const result = await limiter(request);
      expect(result).toBeNull();
    });

    it('should allow requests within the limit', async () => {
      const ip = getUniqueIp();
      const limiter = rateLimit({ interval: 60000, limit: 5 });

      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        const request = createMockRequest('http://localhost:3000/api/test', {
          headers: { 'x-forwarded-for': ip },
        });
        const result = await limiter(request);
        expect(result).toBeNull();
      }
    });

    it('should block requests exceeding the limit', async () => {
      const ip = getUniqueIp();
      const limiter = rateLimit({ interval: 60000, limit: 3 });

      // Make 3 requests (the limit)
      for (let i = 0; i < 3; i++) {
        const request = createMockRequest('http://localhost:3000/api/test', {
          headers: { 'x-forwarded-for': ip },
        });
        await limiter(request);
      }

      // 4th request should be blocked
      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip },
      });
      const result = await limiter(request);

      expect(result).not.toBeNull();
      expect(result!.status).toBe(429);

      const json = await result!.json();
      expect(json.error).toBe('Too many requests');
    });

    it('should include rate limit headers in 429 response', async () => {
      const ip = getUniqueIp();
      const limiter = rateLimit({ interval: 60000, limit: 1 });

      // First request passes
      const request1 = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip },
      });
      await limiter(request1);

      // Second request blocked
      const request2 = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip },
      });
      const result = await limiter(request2);

      expect(result!.headers.get('Retry-After')).toBeTruthy();
      expect(result!.headers.get('X-RateLimit-Limit')).toBe('1');
      expect(result!.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result!.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should reset counter after the interval', async () => {
      const ip = getUniqueIp();
      // Very short interval for testing
      const limiter = rateLimit({ interval: 50, limit: 1 });

      // First request passes
      const request1 = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip },
      });
      await limiter(request1);

      // Second request blocked immediately
      const request2 = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip },
      });
      const blocked = await limiter(request2);
      expect(blocked).not.toBeNull();
      expect(blocked!.status).toBe(429);

      // Wait for interval to pass
      await new Promise(resolve => setTimeout(resolve, 60));

      // Third request should pass after reset
      const request3 = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': ip },
      });
      const result = await limiter(request3);
      expect(result).toBeNull();
    });

    it('should track different paths separately', async () => {
      const ip = getUniqueIp();
      const limiter = rateLimit({ interval: 60000, limit: 1 });

      // Request to /api/jobs
      const request1 = createMockRequest('http://localhost:3000/api/jobs', {
        headers: { 'x-forwarded-for': ip },
      });
      const result1 = await limiter(request1);
      expect(result1).toBeNull();

      // Request to /api/stats (different path)
      const request2 = createMockRequest('http://localhost:3000/api/stats', {
        headers: { 'x-forwarded-for': ip },
      });
      const result2 = await limiter(request2);
      expect(result2).toBeNull();
    });

    it('should track different IPs separately', async () => {
      const limiter = rateLimit({ interval: 60000, limit: 1 });

      // Request from IP1
      const request1 = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': getUniqueIp() },
      });
      const result1 = await limiter(request1);
      expect(result1).toBeNull();

      // Request from IP2
      const request2 = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': getUniqueIp() },
      });
      const result2 = await limiter(request2);
      expect(result2).toBeNull();
    });

    it('should use x-real-ip header as fallback', async () => {
      const limiter = rateLimit({ interval: 60000, limit: 1 });
      const ip = getUniqueIp();

      const request = createMockRequest('http://localhost:3000/api/test', {
        headers: { 'x-real-ip': ip },
      });
      const result = await limiter(request);
      expect(result).toBeNull();
    });

    it('should use "unknown" when no IP header is present', async () => {
      const limiter = rateLimit({ interval: 60000, limit: 1 });

      const request1 = createMockRequest('http://localhost:3000/api/test');
      const result1 = await limiter(request1);
      expect(result1).toBeNull();

      // Second request from "unknown" IP should be tracked
      const request2 = createMockRequest('http://localhost:3000/api/test');
      const result2 = await limiter(request2);
      expect(result2).not.toBeNull();
    });
  });

  describe('apiRateLimits configuration', () => {
    it('should have jobs limit of 100 requests per minute', () => {
      expect(apiRateLimits.jobs.limit).toBe(100);
      expect(apiRateLimits.jobs.interval).toBe(60 * 1000);
    });

    it('should have community limit of 30 requests per minute', () => {
      expect(apiRateLimits.community.limit).toBe(30);
      expect(apiRateLimits.community.interval).toBe(60 * 1000);
    });

    it('should have cron limit of 1 request per minute', () => {
      expect(apiRateLimits.cron.limit).toBe(1);
      expect(apiRateLimits.cron.interval).toBe(60 * 1000);
    });
  });

  describe('defaultRateLimit configuration', () => {
    it('should have default limit of 60 requests per minute', () => {
      expect(defaultRateLimit.limit).toBe(60);
      expect(defaultRateLimit.interval).toBe(60 * 1000);
    });
  });

  describe('rateLimit with default config', () => {
    it('should use default config when no config provided', async () => {
      const limiter = rateLimit();
      const request = createMockRequest('http://localhost:3000/api/default', {
        headers: { 'x-forwarded-for': getUniqueIp() },
      });

      const result = await limiter(request);
      expect(result).toBeNull();
    });
  });
});
