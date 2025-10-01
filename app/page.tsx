import { getLatestWeekData } from '@/lib/data';
import HeroSection from '@/components/HeroSection';
import RankingsTable from '@/components/RankingsTable';
import Footer from '@/components/Footer';

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function Home() {
  const weekData = await getLatestWeekData();

  if (!weekData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <HeroSection />
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              No Data Available
            </h2>
            <p className="text-gray-600">
              Rankings data will be available after Week 2 of the NFL season.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Check back soon for updated rankings!
            </p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <HeroSection lastUpdated={weekData.timestamp} week={weekData.week} />

        <main className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
              NFL Team Rankings
            </h2>
            <p className="text-gray-600 text-lg">
              Click any column header to sort. Click team name or "View" for detailed breakdown.
            </p>
          </div>
          <RankingsTable rankings={weekData.rankings} />
        </main>

        <Footer />
      </div>
    </div>
  );
}
