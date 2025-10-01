'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { TeamRanking } from '@/lib/types';
import { getTeamLogoUrl, getTeamData } from '@/lib/teams';

type SortField = keyof TeamRanking;
type SortDirection = 'asc' | 'desc';

interface RankingsTableProps {
  rankings: TeamRanking[];
}

export default function RankingsTable({ rankings }: RankingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking same field
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      // Default to descending for new field (except team name)
      setSortField(field);
      setSortDirection(field === 'team' ? 'asc' : 'desc');
    }
  };

  // Client-side sorting implementation
  const sortedRankings = [...rankings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'desc'
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    }

    return 0;
  });

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'desc' ? ' ▼' : ' ▲';
  };

  return (
    <div className="overflow-x-auto shadow-2xl rounded-xl border border-gray-200">
      <table className="min-w-full bg-white">
        <thead className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold">Rank</th>
            <th
              className="px-6 py-4 text-left text-sm font-bold cursor-pointer hover:bg-gray-700 transition-all duration-200"
              onClick={() => handleSort('team')}
            >
              Team{getSortIndicator('team')}
            </th>
            <th
              className="px-6 py-4 text-center text-sm font-bold cursor-pointer hover:bg-gray-700 transition-all duration-200"
              onClick={() => handleSort('win_pct')}
            >
              Win %{getSortIndicator('win_pct')}
            </th>
            <th
              className="px-6 py-4 text-center text-sm font-bold cursor-pointer hover:bg-gray-700 transition-all duration-200"
              onClick={() => handleSort('weighted_wins')}
            >
              WW{getSortIndicator('weighted_wins')}
            </th>
            <th
              className="px-6 py-4 text-center text-sm font-bold cursor-pointer hover:bg-gray-700 transition-all duration-200"
              onClick={() => handleSort('weighted_losses')}
            >
              WL{getSortIndicator('weighted_losses')}
            </th>
            <th
              className="px-6 py-4 text-center text-sm font-bold cursor-pointer hover:bg-gray-700 transition-all duration-200"
              onClick={() => handleSort('total')}
            >
              Total{getSortIndicator('total')}
            </th>
            <th className="px-6 py-4 text-center text-sm font-bold">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedRankings.map((team, index) => (
            <tr
              key={team.team}
              className="hover:bg-blue-50 transition-all duration-200 hover:shadow-md"
            >
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {index + 1}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 relative">
                    <Image
                      src={getTeamLogoUrl(team.team)}
                      alt={`${team.team} logo`}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getTeamData(team.team)?.fullName || team.team}
                    </div>
                    <div className="text-xs text-gray-500">
                      {team.team}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-900">
                {(team.win_pct * 100).toFixed(1)}%
                <div className="text-xs text-gray-500">
                  {team.wins}-{team.losses}-{team.ties}
                </div>
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-900">
                {team.weighted_wins.toFixed(1)}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-900">
                {team.weighted_losses.toFixed(1)}
              </td>
              <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                {team.total.toFixed(1)}
              </td>
              <td className="px-6 py-4 text-center text-sm">
                <Link
                  href={`/team/${team.team.toLowerCase()}`}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
