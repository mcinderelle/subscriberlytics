# Deploy Subscriblytics to Vercel

This guide will walk you through deploying your Subscriblytics app to Vercel.

## Prerequisites

- GitHub account (your code is already on GitHub)
- Vercel account (free tier is sufficient)

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push Your Code to GitHub
Make sure all your changes are committed and pushed:

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with your GitHub account
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository: **mcinderelle/subscriberlytics**
5. Vercel will auto-detect the project settings
6. Click **"Deploy"**

### Step 3: Configure Settings (if needed)

Vercel will auto-detect these settings:
- **Framework Preset**: Other
- **Build Command**: Leave empty (static site)
- **Output Directory**: Leave empty (root directory)

### Step 4: Wait for Deployment

- Deployment typically takes 1-2 minutes
- You'll get a live URL like: `https://subscriblytics.vercel.app`

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N** (for first deployment)
- Project name: **subscriblytics** (or press Enter for default)
- Directory: **.** (current directory)

### Step 4: Deploy to Production

```bash
vercel --prod
```

## Important Notes

### Service Worker Configuration

The Service Worker (`sw.js`) will work properly on Vercel because:
- ✅ Vercel serves over HTTPS
- ✅ The URL is on a proper domain
- ✅ CORS will work correctly

### API Calls

External API calls will now work correctly:
- ✅ Currency detection (ipapi.co)
- ✅ Exchange rate fetching
- ✅ All external resources

### Environment Variables (if needed)

If you need to add environment variables:
1. Go to your project on Vercel dashboard
2. Settings → Environment Variables
3. Add variables if needed

## Post-Deployment

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

### Monitoring

- Check deployment logs on Vercel dashboard
- View Analytics (available on paid plans)
- Check real-time logs

## Quick Deploy Command

For future updates, simply push to GitHub:

```bash
git push origin main
```

Vercel will automatically redeploy!

## Troubleshooting

### Service Worker Not Working?
- Check if HTTPS is enabled (Vercel provides this automatically)
- Verify sw.js is in the root directory

### Icons Not Showing?
- Ensure all icon files are committed
- Check that paths are correct in manifest.json

### CORS Errors?
- These should be resolved when deployed to Vercel
- API calls from https:// domains work correctly

## Your Live URL

After deployment, you'll get a URL like:
- `https://subscriblytics-[hash].vercel.app`
- Or your custom domain if configured

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- Check deployment logs in Vercel dashboard

