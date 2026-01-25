// Node environment setup for API and service tests

// Mock console.error to suppress expected test errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString?.() || '';
  // Suppress expected errors in tests
  if (
    message.includes('Token verification failed') ||
    message.includes('API Error') ||
    message.includes('Authentication error') ||
    message.includes('Failed to record job view') ||
    message.includes('Failed to increment view count')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Mock Next.js environment
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing';

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
