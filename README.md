# WeightedWins - NFL Team Rankings

A Next.js application that ranks NFL teams using a weighted wins methodology that considers the quality of opponents. The system automatically updates rankings 3x per week using GitHub Actions.

## 🏈 Methodology

### Weighted Wins (WW)
Sum of all wins from opponents this team has defeated. Beating stronger teams (with more wins) contributes more to this score.

### Weighted Losses (WL)
Negative sum of all losses from opponents this team has lost to. Losing to weaker teams (with more losses) hurts this score more.

### Total Score
**WW + WL** - Higher is better. This metric rewards beating good teams and penalizes losing to bad teams.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Python** 3.11+ (for data calculation script)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weighted-wins-nfl-cc.git
   cd weighted-wins-nfl-cc
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install

   # Python dependencies (for data generation)
   pip3 install -r requirements.txt
   ```

3. **Generate initial data** (Week 2+ only)
   ```bash
   python3 scripts/calculate_rankings.py
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
weighted-wins-nfl-cc/
├── app/                        # Next.js app directory
│   ├── page.tsx               # Homepage with rankings table
│   ├── loading.tsx            # Loading skeleton UI
│   ├── error.tsx              # Error boundary
│   ├── not-found.tsx          # 404 page
│   └── team/[slug]/           # Dynamic team pages
│       ├── page.tsx           # Team detail page
│       └── loading.tsx        # Team loading skeleton
├── components/                 # React components
│   ├── RankingsTable.tsx      # Sortable rankings table
│   ├── HeroSection.tsx        # Hero with timestamp
│   └── Footer.tsx             # Methodology explanation
├── lib/                        # Utility functions
│   ├── data.ts                # Data fetching utilities
│   └── types.ts               # TypeScript interfaces
├── scripts/                    # Python data generation
│   └── calculate_rankings.py  # Main calculation script
├── data/                       # Generated JSON files
│   └── week_*.json            # Weekly ranking snapshots
├── .github/workflows/          # GitHub Actions
│   └── update-rankings.yml    # Auto-update workflow
├── public/                     # Static assets
├── vercel.json                # Vercel configuration
└── DEPLOYMENT.md              # Deployment guide
```

## 🔧 Development

### Building for Production

```bash
npm run build
```

Generates static pages for:
- Homepage with ISR (revalidates every hour)
- All 32 NFL team detail pages
- Error and 404 pages

### Generating New Data

The Python script fetches live NFL data and calculates rankings:

```bash
python3 scripts/calculate_rankings.py
```

**Requirements:**
- Must be Week 2 or later (calculations require opponent records)
- Creates/updates `data/week_X.json` file
- Automatically backs up existing files

### Running Tests

```bash
# Frontend tests (when implemented)
npm test

# Python tests
python3 -m pytest tests/
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Configure settings:**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. **Deploy** - Automatic on every push to main

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Automatic Data Updates

GitHub Actions runs the Python script automatically:
- **Friday** 2 AM ET (after Thursday Night Football)
- **Monday** 2 AM ET (after Sunday/Monday games)
- **Tuesday** 2 AM ET (after Monday Night Football)

Workflow commits updated JSON files, triggering Vercel redeployment.

## 📊 Data Schema

### WeekData Interface

```typescript
interface WeekData {
  timestamp: string;  // ISO-8601 UTC timestamp
  week: number;       // NFL week number (1-18)
  season: number;     // NFL season year
  rankings: TeamRanking[];
}
```

### TeamRanking Interface

```typescript
interface TeamRanking {
  team: string;            // Team abbreviation (e.g., "KC")
  wins: number;            // Total wins
  losses: number;          // Total losses
  ties: number;            // Total ties
  win_pct: number;         // Win percentage (0-1)
  weighted_wins: number;   // Sum of opponents' wins
  weighted_losses: number; // Negative sum of opponents' losses
  total: number;           // WW + WL (total score)
}
```

### Example JSON Output

```json
{
  "timestamp": "2025-10-01T18:28:26.827944+00:00",
  "week": 4,
  "season": 2025,
  "rankings": [
    {
      "team": "KC",
      "wins": 4,
      "losses": 0,
      "ties": 0,
      "win_pct": 1.0,
      "weighted_wins": 8.0,
      "weighted_losses": 0.0,
      "total": 8.0
    }
    // ... 31 more teams
  ]
}
```

## 🏈 NFL Team Abbreviations

All 32 NFL teams are supported:

| AFC East | AFC North | AFC South | AFC West |
|----------|-----------|-----------|----------|
| BUF | BAL | HOU | DEN |
| MIA | CIN | IND | KC |
| NE | CLE | JAX | LV |
| NYJ | PIT | TEN | LAC |

| NFC East | NFC North | NFC South | NFC West |
|----------|-----------|-----------|----------|
| DAL | CHI | ATL | ARI |
| NYG | DET | CAR | LA |
| PHI | GB | NO | SF |
| WAS | MIN | TB | SEA |

## 🛠️ Troubleshooting

### No Data Available

**Symptom:** Homepage shows "No Data Available"

**Solutions:**
- Verify `data/week_*.json` files exist
- Ensure it's Week 2 or later in the NFL season
- Run `python3 scripts/calculate_rankings.py` manually
- Check Python script logs for errors

### Build Failures

**Symptom:** `npm run build` fails

**Solutions:**
- Delete `.next` directory: `rm -rf .next`
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check that at least one `data/week_*.json` file exists

### GitHub Actions Failures

**Symptom:** Workflow fails to update rankings

**Solutions:**
- Check Actions tab for error logs
- Verify Python script runs locally
- Check if `nfl_data_py` API is accessible
- Manually trigger workflow: Actions → Update NFL Rankings → Run workflow

### Stale Data

**Symptom:** Rankings not updating after games

**Solutions:**
- Check GitHub Actions ran successfully
- Verify Vercel deployment completed
- Wait up to 1 hour for ISR cache to refresh
- Manually redeploy from Vercel dashboard

## 🔄 Data Flow

```
┌─────────────────────┐
│  nfl_data_py API    │  ← Fetches live NFL data
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  scripts/calculate_rankings.py  │  ← Calculates weighted wins/losses
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────┐
│  data/week_X.json   │  ← Saves ranking snapshots
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌──────────┐
│ GitHub  │  │  Vercel  │  ← Commit triggers deployment
│ Actions │  │ (ISR)    │
└─────────┘  └────┬─────┘
                  │
                  ▼
          ┌───────────────┐
          │  Next.js App  │  ← Serves static/ISR pages
          └───────────────┘
```

## 📝 Modifying the Ranking Algorithm

Edit `scripts/calculate_rankings.py`:

### Weighted Wins Calculation
Located in `calculate_weighted_wins()` function (lines 191-224):
```python
def calculate_weighted_wins(schedule: pd.DataFrame, team: str) -> float:
    # Modify this function to change WW calculation
    # Current: sum of opponents' wins
    pass
```

### Weighted Losses Calculation
Located in `calculate_weighted_losses()` function (lines 227-260):
```python
def calculate_weighted_losses(schedule: pd.DataFrame, team: str) -> float:
    # Modify this function to change WL calculation
    # Current: negative sum of opponents' losses
    pass
```

### Total Score
Located in `calculate_total_score()` function (lines 263-274):
```python
def calculate_total_score(weighted_wins: float, weighted_losses: float) -> float:
    # Modify this to change final ranking formula
    # Current: WW + WL
    return weighted_wins + weighted_losses
```

After modifications:
1. Test locally: `python3 scripts/calculate_rankings.py`
2. Verify JSON output in `data/`
3. Rebuild frontend: `npm run build`
4. Commit and push changes

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Test locally (frontend and Python)
5. Commit: `git commit -m "Add new feature"`
6. Push: `git push origin feature/new-feature`
7. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **nfl_data_py** - NFL data API ([GitHub](https://github.com/nflverse/nfl_data_py))
- **Next.js** - React framework ([docs](https://nextjs.org))
- **Vercel** - Hosting platform ([vercel.com](https://vercel.com))

## 📧 Support

For issues or questions:
- Open a [GitHub Issue](https://github.com/yourusername/weighted-wins-nfl-cc/issues)
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- Review existing issues for solutions

---

**Note:** Rankings calculations begin Week 2 of the NFL season, as Week 1 doesn't provide enough opponent record data for meaningful weighted calculations.
