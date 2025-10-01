export default function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              About WeightedWins
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              WeightedWins provides an alternative NFL ranking system that factors in the strength
              of opponents. Teams earn weighted wins based on their opponents' win totals, and
              weighted losses based on opponents' loss totals. This creates a more nuanced view
              of team performance beyond simple win-loss records.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Methodology
            </h3>
            <ul className="text-gray-600 text-sm space-y-2">
              <li>
                <strong>Weighted Wins (WW):</strong> Sum of opponents' current win totals for all games won
              </li>
              <li>
                <strong>Weighted Losses (WL):</strong> Negative sum of opponents' current loss totals for all games lost
              </li>
              <li>
                <strong>Total Score:</strong> WW + WL (higher is better)
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            <strong>Disclaimer:</strong> This is an experimental ranking system for entertainment purposes.
            Rankings update automatically as games are played. Data sourced from nfl-data-py.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © {new Date().getFullYear()} WeightedWins. All team names and logos are property of the NFL and respective teams.
          </p>
        </div>
      </div>
    </footer>
  );
}
