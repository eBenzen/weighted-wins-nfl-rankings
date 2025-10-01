import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getLatestWeekData } from '@/lib/data';
import type { Metadata } from 'next';

function getTeamLogoUrl(teamAbbr: string): string {
  const espnMapping: Record<string, string> = { 'LA': 'LAR' };
  const espnAbbr = espnMapping[teamAbbr] || teamAbbr;
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${espnAbbr.toLowerCase()}.png`;
}

const teamNames: Record<string, string> = {
  'ARI': 'Arizona Cardinals', 'ATL': 'Atlanta Falcons', 'BAL': 'Baltimore Ravens',
  'BUF': 'Buffalo Bills', 'CAR': 'Carolina Panthers', 'CHI': 'Chicago Bears',
  'CIN': 'Cincinnati Bengals', 'CLE': 'Cleveland Browns', 'DAL': 'Dallas Cowboys',
  'DEN': 'Denver Broncos', 'DET': 'Detroit Lions', 'GB': 'Green Bay Packers',
  'HOU': 'Houston Texans', 'IND': 'Indianapolis Colts', 'JAX': 'Jacksonville Jaguars',
  'KC': 'Kansas City Chiefs', 'LA': 'Los Angeles Rams', 'LAC': 'Los Angeles Chargers',
  'LV': 'Las Vegas Raiders', 'MIA': 'Miami Dolphins', 'MIN': 'Minnesota Vikings',
  'NE': 'New England Patriots', 'NO': 'New Orleans Saints', 'NYG': 'New York Giants',
  'NYJ': 'New York Jets', 'PHI': 'Philadelphia Eagles', 'PIT': 'Pittsburgh Steelers',
  'SEA': 'Seattle Seahawks', 'SF': 'San Francisco 49ers', 'TB': 'Tampa Bay Buccaneers',
  'TEN': 'Tennessee Titans', 'WAS': 'Washington Commanders'
};

export const revalidate = 3600; // Revalidate every hour

interface TeamPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  // Generate params for all 32 NFL teams
  const teams = [
    'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
    'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC',
    'LA', 'LAC', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG',
    'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS'
  ];

  return teams.map((team) => ({
    slug: team.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teamAbbr = slug.toUpperCase();

  return {
    title: `${teamAbbr} - WeightedWins`,
    description: `Weighted wins rankings and statistics for ${teamAbbr}`,
    robots: 'noindex', // Don't index team pages until fully polished
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const teamAbbr = slug.toUpperCase();

  const weekData = await getLatestWeekData();

  if (!weekData) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-8 inline-block"
          >
            ← Back to Rankings
          </Link>
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              No Data Available
            </h1>
            <p className="text-gray-600">
              Team statistics will be available after Week 2 of the NFL season.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const teamRanking = weekData.rankings.find(
    (ranking) => ranking.team === teamAbbr
  );

  if (!teamRanking) {
    notFound();
  }

  const rank = weekData.rankings.findIndex((r) => r.team === teamAbbr) + 1;
  const teamName = teamNames[teamAbbr] || teamAbbr;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-8 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Rankings
        </Link>

        {/* Team Header */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 relative">
                <Image
                  src={getTeamLogoUrl(teamAbbr)}
                  alt={`${teamAbbr} logo`}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {teamName}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    #{rank} Overall
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {teamRanking.total.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 font-semibold mt-1">Total Score</div>
            </div>
          </div>
        </div>

        {/* Season Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Week {weekData.week} Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {teamRanking.wins}-{teamRanking.losses}-{teamRanking.ties}
              </div>
              <div className="text-sm text-gray-600 mt-1">Record</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {(teamRanking.win_pct * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Win Percentage</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {teamRanking.weighted_wins.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Weighted Wins</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {teamRanking.weighted_losses.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Weighted Losses</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {teamRanking.total.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Score</div>
            </div>
          </div>
        </div>

        {/* Methodology Explanation */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong className="text-blue-600">Weighted Wins ({teamRanking.weighted_wins.toFixed(1)}):</strong> The sum of
              wins from all opponents this team has defeated. Beating stronger teams
              (with more wins) contributes more to this score.
            </p>
            <p>
              <strong className="text-red-600">Weighted Losses ({teamRanking.weighted_losses.toFixed(1)}):</strong> The
              negative sum of losses from all opponents this team has lost to. Losing to
              weaker teams (with more losses) hurts this score more.
            </p>
            <p>
              <strong className="text-green-600">Total Score ({teamRanking.total.toFixed(1)}):</strong> Weighted Wins +
              Weighted Losses. Higher is better. This metric rewards beating good teams
              and penalizes losing to bad teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
