export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Team Header Skeleton */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-9 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-9 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>

        {/* Statistics Section Skeleton */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Section Skeleton */}
        <div className="bg-white rounded-lg shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-11/12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
