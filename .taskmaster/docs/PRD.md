# Product Requirements Document (PRD) – WeightedWins MVP

## Overview
WeightedWins is a lightweight NFL power rankings site that evaluates teams based on the quality of their wins and losses.  
The MVP goal: deliver a clean, fast, free site hosted on Vercel Hobby that automatically updates each week.

---

## Goals
- Serve the rankings directly on the homepage.  
- Provide transparent, week-by-week explanations on team pages.  
- Automate weekly recalculations with no manual work.  
- Keep costs at $0 using Vercel Hobby + GitHub Actions.  
- Measure success via traffic and engagement (email/social tracked manually).  

---

## Core Features

### Homepage (`/`)
- **Hero strip**: placeholder logo, tagline, “Last updated: [timestamp in user’s local timezone]”.  
- **Rankings Table (6 columns)**:  
  1. Team Logo (custom badge from `/logos/`)  
  2. Win %  
  3. Weighted Wins  
  4. Weighted Losses  
  5. Total (WW + WL)  
  6. “See Calculations” (plain text link → team page)  
- Fully sortable by any column.  
- Footer: about + disclaimer.  
- Homepage is **indexed by search engines**.  

### Team Detail Pages (`/team/[slug]`)
- Week-by-week explanation of weighted calculations (text).  
- Simple chart (Recharts) showing **Total Weighted Score trend across season weeks**.  
- Shows only current recalculated values.  
- “Back to Rankings” link.  
- Pages marked **no-index** for search engines until polished.

---

## Ranking Calculations

### Metrics in MVP
1. **Win %** (raw record).  
2. **Weighted Wins**: opponent’s current win total.  
3. **Weighted Losses**: opponent’s current loss total (negative).  
4. **Total** = Weighted Wins + Weighted Losses.  

### Rules
- Start after Week 2.  
- Past games always recomputed using current opponent records.  
- Weekly snapshots saved for debugging, not displayed.

---

## Data Pipeline

- **Source**: `nfl_data_py`.  
- **Automation**: GitHub Actions runs Python script, outputs `/data/week_X.json`.  
- **Schedule**:  
  - Friday 2 AM ET (post-TNF)  
  - Monday 2 AM ET (post-SNF)  
  - Tuesday 2 AM ET (post-MNF)  
- **Storage**: JSON files committed to `/data/` in repo.  
- **Rendering**: Next.js uses static generation with ISR, reading JSON files as the data source.  

---

## Technical Stack

- **Frontend**: Next.js (App Router), using the **Vercel Platforms Starter Kit** as the base.  
  - Template includes Tailwind CSS for styling.  
  - **Shadcn components are optional**: add only if a missing component is needed.  
- **Charts**: Recharts (for simple team trend visuals).  
- **Hosting**: Vercel Hobby (free).  
- **Automation**: GitHub Actions for Python calc script.  
- **Assets**:  
  - Team badges (`.png`/`.svg`) in `/logos/`, named by team abbreviation (e.g., `PIT.png`).  
- **Database**: none in MVP. JSON files act as the “database.”  
- **Auth/Payments**: none in MVP.  

---

## Hosting Constraints
- Must run on Vercel Hobby free tier.  
- No persistent database.  
- All data precomputed via GitHub Actions → stored as JSON.  
- Pages generated statically with ISR for minimal runtime cost.  

---

## Success Metrics
- Weekly traffic (pageviews, visitors).  
- Email sign-ups (manual tracking only, not built-in).  
- Social follows/shares.  

---

## Out of Scope (MVP)
- Ads  
- Stripe/paywalls  
- Premium metrics  
- CSV export  
- Discord community  
- Automated email/social posting  

---

## Future Notes (Roadmap Only – Not in MVP)
- Advanced metrics (points, yards differentials).  
- AI-generated analysis.  
- Betting edge detection.  
- Historical archive access.  
- API tier.  
- Mobile app.  

---

## Taskmaster AI – Assigned Steps

### Step 1 – Environment Setup
- Install dependencies (Next.js, Tailwind, Recharts, Python for calc engine).  
- Configure environment variables for Vercel and GitHub Actions.  

### Step 2 – Data Schema Setup
- No external DB.  
- Define schema for JSON data (`/data/week_X.json`).  
- Treat JSON files as the database.  

### Step 3 – Code Review Checkpoints
- After completing major modules (Rankings Table, Team Detail Page, Automation), pause for review before proceeding.  

### Step 4 – Deployment Plan
- Deploy to **Vercel Hobby only**.  
- Validate ISR/static generation works with JSON updates.  

### Step 5 – Documentation
- Maintain `README.md` with setup + deploy instructions.  
- Write API docs for the Python calc script (input/output format).  

### Step 6 – Integration Testing
- Write tests for:  
  - Rankings table rendering.  
  - Sorting functionality.  
  - Team detail page rendering with mock JSON.  
- Validate automation updates correctly trigger rebuilds.  

### Step 7 – Error Handling & Logging
- Implement basic logging in Python calc script.  
- Add error boundaries in React components.  
- Show fallback UI if JSON data fails to load.  

### Step 8 – Version Control
- Use Git with frequent commits.  
- Commit incrementally after each step above.  

---
