export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-1/3 mx-auto"></div>
        </div>

        {/* Table Header Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded-lg w-2/3"></div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <div className="min-w-full bg-white">
            {/* Table Header */}
            <div className="bg-gray-800 animate-pulse">
              <div className="flex px-6 py-4 gap-6">
                <div className="h-5 bg-gray-700 rounded w-16"></div>
                <div className="h-5 bg-gray-700 rounded w-24"></div>
                <div className="h-5 bg-gray-700 rounded w-20"></div>
                <div className="h-5 bg-gray-700 rounded w-16"></div>
                <div className="h-5 bg-gray-700 rounded w-16"></div>
                <div className="h-5 bg-gray-700 rounded w-20"></div>
                <div className="h-5 bg-gray-700 rounded w-20"></div>
              </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="divide-y divide-gray-200">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="flex items-center gap-6">
                    <div className="h-5 bg-gray-200 rounded w-8"></div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-12 animate-pulse">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
