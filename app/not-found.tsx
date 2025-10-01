import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Page Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The page you're looking for doesn't exist or may have been moved.
            </p>
          </div>

          <div className="mb-8">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Looking for a specific team? Try one of these:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['KC', 'SF', 'BUF', 'PHI', 'DAL', 'BAL'].map((team) => (
                <Link
                  key={team}
                  href={`/team/${team.toLowerCase()}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  {team}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
