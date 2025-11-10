// src/app/loading.tsx

const SkeletonCard = () => (
  <div className="bg-slate-800 p-4 rounded-lg shadow-md animate-pulse">
    <div className="flex items-center mb-3">
      <div className="w-10 h-10 bg-slate-700 rounded-full mr-3"></div>
      <div>
        <div className="h-4 bg-slate-700 rounded w-48 mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-32"></div>
      </div>
    </div>
    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
    <div className="flex justify-end mt-2">
      <div className="h-8 w-24 bg-slate-700 rounded"></div>
    </div>
  </div>
);

const Loading = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header is part of the layout, so it will be visible */}
      
      {/* Hero Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center animate-pulse">
        <div className="h-10 bg-slate-700 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-6 bg-slate-700 rounded w-1/2 mx-auto"></div>
      </div>

      {/* Company Tabs Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="flex space-x-4 border-b border-slate-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800 rounded-t-lg w-24"></div>
          ))}
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto container-mobile sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filter Bar Skeleton */}
        <div className="bg-slate-800 p-4 rounded-lg shadow-md mb-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
          </div>
        </div>

        {/* Job List Skeleton */}
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Loading;
