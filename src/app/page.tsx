import Header from '@/components/Header'
import JobSearchContainer from '@/components/JobSearchContainer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Re-usable function to fetch stats. Could be moved to a lib file.
async function getStats() {
  try {
    const totalJobs = await prisma.job.count({ where: { isActive: true } });
    const totalCompanies = await prisma.company.count();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentJobs = await prisma.job.count({
      where: { isActive: true, postedAt: { gte: sevenDaysAgo } },
    });
    const jobsByCompany = await prisma.job.groupBy({
      by: ['companyId'],
      _count: { id: true },
      where: { isActive: true },
    });
    const companies = await prisma.company.findMany({
      where: { id: { in: jobsByCompany.map(c => c.companyId) } },
      select: { id: true, name: true },
    });
    const companyIdToName = Object.fromEntries(companies.map(c => [c.id, c.name]));
    const formattedJobsByCompany = jobsByCompany.map(item => ({
      company: companyIdToName[item.companyId],
      count: item._count.id,
    })).sort((a, b) => b.count - a.count);

    return { totalJobs, totalCompanies, recentJobs, jobsByCompany: formattedJobsByCompany };
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return a default/empty state in case of error
    return { totalJobs: 0, totalCompanies: 0, recentJobs: 0, jobsByCompany: [] };
  }
}

// Re-usable function to fetch jobs. This logic is similar to the API route.
// For a real app, this should be consolidated into a single data access layer.
async function getJobs(page = 1, limit = 20) {
  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { isActive: true },
        include: {
          company: {
            select: { id: true, name: true, nameEn: true, logo: true }
          }
        },
        orderBy: { postedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.job.count({ where: { isActive: true } })
    ]);

    const formattedJobs = jobs.map(job => ({
      ...job,
      description: '', // Explicitly clear description for list view
      postedAt: job.postedAt.toISOString(),
      deadline: job.deadline ? job.deadline.toISOString() : null,
      tags: [] // Tags are not fetched in this initial query for performance
    }));

    return {
      jobs: formattedJobs,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching initial jobs:", error);
    return { jobs: [], totalPages: 1 };
  }
}


export default async function Home() {
  // Fetch initial data on the server
  const [statsData, jobsData] = await Promise.all([
    getStats(),
    getJobs()
  ]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <JobSearchContainer 
        initialJobs={jobsData.jobs}
        initialTotalPages={jobsData.totalPages}
        initialStats={statsData}
      />
    </div>
  )
}
