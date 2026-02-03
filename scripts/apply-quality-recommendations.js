const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function applyRecommendations() {
  const enabled = process.env.AUTO_APPLY_RECOMMENDATIONS === 'true';
  if (!enabled) {
    return { skipped: true, reason: 'AUTO_APPLY_RECOMMENDATIONS=false' };
  }

  const margin = Number(process.env.RECOMMENDATION_MARGIN || 0.05);
  const minRuns = Number(process.env.RECOMMENDATION_MIN_RUNS || 6);
  const minRatio = Number(process.env.RECOMMENDATION_MIN_RATIO || 0.5);
  const maxRatio = Number(process.env.RECOMMENDATION_MAX_RATIO || 0.95);
  const days = Number(process.env.RECOMMENDATION_WINDOW_DAYS || 14);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await prisma.$queryRaw`
    SELECT
      company,
      AVG(valid_ratio) AS avg_valid_ratio,
      COUNT(*)::int AS runs
    FROM crawl_logs
    WHERE created_at >= ${since}
      AND valid_ratio IS NOT NULL
    GROUP BY company
    HAVING COUNT(*) >= ${minRuns}
  `;

  let updated = 0;
  let created = 0;

  for (const row of rows) {
    const avgRatio = Number(row.avg_valid_ratio || 0);
    const recommended = clamp(avgRatio - margin, minRatio, maxRatio);

    const existing = await prisma.companyQualityRule.findUnique({
      where: { company: row.company }
    });

    if (existing) {
      if (Number(existing.minValidRatio) !== Number(recommended)) {
        await prisma.companyQualityRule.update({
          where: { company: row.company },
          data: { minValidRatio: recommended }
        });
        updated += 1;
      }
    } else {
      await prisma.companyQualityRule.create({
        data: {
          company: row.company,
          minValidRatio: recommended,
          minDescriptionLength: Number(process.env.CRAWL_MIN_DESCRIPTION_LENGTH || 50)
        }
      });
      created += 1;
    }
  }

  return {
    skipped: false,
    windowDays: days,
    processed: rows.length,
    updated,
    created
  };
}

async function main() {
  try {
    const result = await applyRecommendations();
    console.log('? ?? ?? ?? ??:', result);
  } catch (error) {
    console.error('? ?? ?? ?? ??:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { applyRecommendations };
