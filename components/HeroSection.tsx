'use client';

interface HeroSectionProps {
  lastUpdated?: string;
  week?: number;
}

export default function HeroSection({ lastUpdated, week }: HeroSectionProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(date);
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-xl mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          WeightedWins
        </h1>
        <p className="text-xl md:text-2xl mb-6 text-blue-100">
          NFL Rankings by Strength of Schedule
        </p>
        <p className="text-sm md:text-base text-blue-200">
          Ranking teams based on the quality of opponents they've beaten and lost to
        </p>
        {lastUpdated && (
          <div className="mt-6 pt-6 border-t border-blue-500">
            <p className="text-sm text-blue-100">
              {week && <span className="font-semibold">Week {week} • </span>}
              Last updated: {formatTimestamp(lastUpdated)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
