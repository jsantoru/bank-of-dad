# Deploying Bank of Dad to Railway

## Quick Setup (5-10 minutes)

### 1. Push Your Changes to GitHub

```bash
git add .
git commit -m "Add production Dockerfile and Railway config"
git push
```

### 2. Sign Up for Railway

1. Go to https://railway.app
2. Sign up with your GitHub account (free)
3. You get $5/month credit free

### 3. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `bank-of-dad` repository
4. Railway will auto-detect the Dockerfile and deploy

### 4. Add a Volume for SQLite Persistence

**IMPORTANT**: Without this step, your database will reset on every deploy!

1. In your Railway project, click on your service
2. Go to "Variables" tab
3. Click "New Variable" and add:
   - `NODE_ENV` = `production`
4. Go to "Settings" tab
5. Scroll to "Volumes"
6. Click "New Volume"
   - **Mount Path**: `/app/data`
   - This ensures your SQLite database persists across deploys

### 5. Get Your URL

1. Go to "Settings" tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. You'll get a URL like `bank-of-dad-production.up.railway.app`
5. Share this URL with your kids!

## Cost

- **Free tier**: $5/month credit
- **After free credit**: ~$5-8/month for a small app like this
- You can set spending limits in Railway settings

## Important Notes

1. **Database Backup**: Your SQLite database is persisted in the Railway volume. To back it up:
   - Railway CLI: `railway run bash` then copy the database file
   - Or keep your local copy and periodically export/import

2. **Updates**: Every time you push to GitHub, Railway will auto-deploy

3. **Environment**: The app runs in production mode, not dev mode

## Alternative: Fly.io (If You Want Free Hosting)

Fly.io has a more generous free tier. If Railway costs are a concern:

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Run `fly launch` in your project directory
3. Add a volume: `fly volumes create data --size 1`
4. Update fly.toml to mount volume at `/app/data`

Fly.io is free for small apps within their limits (3 shared CPUs, 3GB RAM).
