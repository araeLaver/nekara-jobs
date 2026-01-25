/**
 * Prisma Client Mock for Testing
 *
 * Provides mock implementations for all Prisma methods used in the application.
 */

export const mockPrismaUser = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

export const mockPrismaJob = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  groupBy: jest.fn(),
};

export const mockPrismaCompany = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

export const mockPrismaJobView = {
  create: jest.fn(),
  findMany: jest.fn(),
  count: jest.fn(),
};

export const mockPrismaTag = {
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockPrismaJobTag = {
  findMany: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

export const prisma = {
  user: mockPrismaUser,
  job: mockPrismaJob,
  company: mockPrismaCompany,
  jobView: mockPrismaJobView,
  tag: mockPrismaTag,
  jobTag: mockPrismaJobTag,
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// Reset all mocks helper
export const resetAllMocks = () => {
  Object.values(mockPrismaUser).forEach(fn => fn.mockReset());
  Object.values(mockPrismaJob).forEach(fn => fn.mockReset());
  Object.values(mockPrismaCompany).forEach(fn => fn.mockReset());
  Object.values(mockPrismaJobView).forEach(fn => fn.mockReset());
  Object.values(mockPrismaTag).forEach(fn => fn.mockReset());
  Object.values(mockPrismaJobTag).forEach(fn => fn.mockReset());
  prisma.$queryRaw.mockReset();
  prisma.$executeRaw.mockReset();
};

export default prisma;
