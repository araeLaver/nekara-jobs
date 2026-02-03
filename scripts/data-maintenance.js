const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deactivateExpiredJobs() {
  const now = new Date();
  const result = await prisma.job.updateMany({
    where: {
      isActive: true,
      deadline: { not: null, lt: now }
    },
    data: { isActive: false, updatedAt: new Date() }
  });

  return result.count;
}

async function removeInactiveOldJobs() {
  const days = Number(process.env.DATA_CLEANUP_INACTIVE_DAYS || 90);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const result = await prisma.job.deleteMany({
    where: {
      isActive: false,
      updatedAt: { lt: cutoff }
    }
  });

  return result.count;
}

async function normalizeCompanyNames() {
  const mapping = {
    'naver': 'NAVER',
    'kakao': 'Kakao',
    'line': 'LINE',
    'toss': 'Toss',
    'baemin': 'Woowa Brothers',
    'nexon': 'NEXON',
    'coupang': 'Coupang',
    'krafton': 'KRAFTON',
    'zigbang': 'Zigbang',
    'bucketplace': 'Bucketplace',
    'carrot': 'Karrot'
  };

  const companies = await prisma.company.findMany();
  let updated = 0;

  for (const company of companies) {
    const key = company.name.toLowerCase();
    const normalized = mapping[key];
    if (normalized && normalized !== company.name) {
      await prisma.company.update({
        where: { id: company.id },
        data: { name: normalized }
      });
      updated += 1;
    }
  }

  return updated;
}

async function main() {
  try {
    console.log('?? ??? ??? ?? ??');

    const expiredCount = await deactivateExpiredJobs();
    console.log(`? ?? ?? ????: ${expiredCount}?`);

    const removedCount = await removeInactiveOldJobs();
    console.log(`? ??? ??? ?? ??: ${removedCount}?`);

    const companyUpdated = await normalizeCompanyNames();
    console.log(`? ??? ???: ${companyUpdated}?`);

    console.log('?? ??? ??? ?? ??');
  } catch (error) {
    console.error('? ??? ??? ?? ??:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  deactivateExpiredJobs,
  removeInactiveOldJobs,
  normalizeCompanyNames
};
