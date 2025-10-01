# Deployment Guide - Vercel

## Prerequisites

- Vercel account (Hobby tier is sufficient)
- GitHub repository connected to Vercel
- Node.js 18+ configured in Vercel project settings

## Environment Variables

This project does not require any environment variables for the frontend deployment. All data is served from static JSON files in the `/data` directory.

## Vercel Configuration

The project includes a `vercel.json` configuration file with:

### Build Settings
- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-configured)
- **Install Command**: `npm install`

### ISR (Incremental Static Regeneration)
- **Homepage**: Revalidates every 3600 seconds (1 hour)
- **Team Pages**: Revalidates every 3600 seconds (1 hour)
- **Cache Strategy**: `stale-while-revalidate` for optimal performance

### Security Headers
The following security headers are automatically applied:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Cache Headers
- `/data/*` files: Cached for 1 hour with 24-hour stale-while-revalidate

## Deployment Steps

### Initial Deployment

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the repository: `weighted-wins-nfl-cc`

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (auto-configured)
   - Output Directory: `.next` (auto-configured)

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live at `https://your-project.vercel.app`

### Continuous Deployment

Every push to the `main` branch will trigger an automatic deployment:
1. GitHub Actions runs and updates `/data/week_X.json` files
2. Changes are committed and pushed to main
3. Vercel detects the commit and starts a new deployment
4. ISR ensures pages are regenerated with new data

### Manual Redeployment

If needed, you can manually redeploy:
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment

## Optimization for Hobby Tier

The project is optimized for Vercel's Hobby tier limits:

### Static Generation
- All pages are statically generated at build time
- 32 team pages + homepage + metadata routes = ~36 static pages
- No serverless functions required for core functionality

### Build Time
- Typical build time: 60-90 seconds
- Well within Hobby tier limits

### Bandwidth
- Minimal bandwidth usage (static HTML/CSS/JS)
- JSON data files are small (~50KB per week file)

### Function Execution
- ISR uses minimal function execution time
- Only triggers on cache misses (once per hour max)

## Custom Domain (Optional)

To add a custom domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain (e.g., `weightedwins.com`)
4. Update your DNS records as instructed by Vercel
5. Vercel will automatically provision SSL certificate

## Monitoring

### Build Status
- Check deployment status in Vercel Dashboard
- GitHub Actions will create an issue if data updates fail

### Performance
- Monitor Core Web Vitals in Vercel Analytics (free on Hobby tier)
- Expected metrics:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1

### Data Freshness
- Rankings update automatically 3x per week (Friday, Monday, Tuesday)
- ISR ensures pages refresh hourly
- Check `/data/week_X.json` timestamp for last update

## Troubleshooting

### Build Failures
- Check Vercel build logs for errors
- Verify `package.json` dependencies are correct
- Ensure `/data` directory exists with at least one week file

### Stale Data
- ISR cache: Wait up to 1 hour for automatic revalidation
- Force refresh: Redeploy from Vercel Dashboard
- Check GitHub Actions ran successfully

### 404 Errors on Team Pages
- Verify all 32 team slugs are in `generateStaticParams()`
- Ensure team abbreviations match data files
- Check build logs for static generation errors

## Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] Homepage displays current week rankings
- [ ] All 32 team detail pages are accessible
- [ ] Data updates reflect after GitHub Actions runs
- [ ] Security headers are present (check browser dev tools)
- [ ] ISR is working (check page load times after cache expires)
- [ ] Mobile responsiveness works correctly
- [ ] Custom domain is configured (if applicable)

## Support

For Vercel-specific issues, consult:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
