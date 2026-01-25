module.exports = {
  projects: [
    // Browser environment (React components)
    {
      displayName: 'dom',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/components/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/.jest/setup.js'],
      moduleNameMapper: {
        '\\.css$': 'identity-obj-proxy',
        '^@/components/(.*)$': '<rootDir>/src/components/$1',
        '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
      },
      transformIgnorePatterns: ['/node_modules/'],
    },
    // Node environment (API routes, services, lib)
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/lib/__tests__/**/*.test.{ts,tsx}',
        '<rootDir>/src/services/__tests__/**/*.test.{ts,tsx}',
        '<rootDir>/src/app/api/__tests__/**/*.test.{ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/.jest/setup-node.js'],
      moduleNameMapper: {
        '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
        '^@/lib/prisma$': '<rootDir>/src/lib/__mocks__/prisma.ts',
        '^@/services/(.*)$': '<rootDir>/src/services/$1',
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
      },
      transformIgnorePatterns: ['/node_modules/'],
    },
    // Crawler tests (plain JS)
    {
      displayName: 'crawler',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/crawler/__tests__/**/*.test.js'],
      transform: {},
    },
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/services/**/*.{ts,tsx}',
    'src/app/api/**/*.{ts,tsx}',
    'src/components/StatsCard.tsx',
    'crawler/validators.js',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/types.ts',
    '!src/lib/__mocks__/**',
    '!**/node_modules/**',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 30,
      functions: 35,
      lines: 40,
    },
  },
};
