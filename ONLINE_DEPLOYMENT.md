# Online Deployment Guide - Vercel + Neon

This guide will help you deploy the Al Fath Kayu costing system to the cloud for online access from anywhere.

## Architecture

- **Frontend & Backend:** Vercel (Next.js hosting)
- **Database:** Neon (Serverless PostgreSQL)
- **Cost:** Free tier available for both services

## Step-by-Step Deployment

### Part 1: Set Up Neon Database (5 minutes)

1. **Create a Neon account:**
   - Go to https://neon.tech
   - Sign up with GitHub or email
   - Verify your email

2. **Create a new project:**
   - Click "Create a project"
   - Project name: `alfathkayu-db`
   - Region: Choose closest to your users (e.g., Singapore for Asia)
   - PostgreSQL version: 16 (latest)
   - Click "Create project"

3. **Get your database connection string:**
   - After project creation, you'll see a connection string like:
     ```
     postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
     ```
   - **IMPORTANT:** Copy this entire string and save it securely
   - You can always find it later in: Project Settings → Connection Details

4. **Initialize the database:**
   - Go to the SQL Editor in Neon dashboard
   - Or use the connection string with any PostgreSQL client
   - We'll run migrations after deploying to Vercel

### Part 2: Deploy to Vercel (10 minutes)

#### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Create a Vercel account:**
   - Go to https://vercel.com
   - Sign up with GitHub (recommended)
   - This will connect your GitHub repositories

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `369-RWT/Trial-Kayu-2`
   - Click "Import"

3. **Configure the project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)

4. **Add environment variables:**
   Click "Environment Variables" and add these:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Neon connection string from Part 1 |
   | `NEXTAUTH_URL` | `https://your-project-name.vercel.app` (you'll update this after deployment) |
   | `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - You'll get a URL like: `https://trial-kayu-2.vercel.app`

6. **Update NEXTAUTH_URL:**
   - Go to Project Settings → Environment Variables
   - Edit `NEXTAUTH_URL` and replace with your actual Vercel URL
   - Redeploy: Deployments → Click "..." → "Redeploy"

#### Option B: Deploy via Vercel CLI (Advanced)

1. **Login to Vercel:**
   ```bash
   vercel login
   ```
   - Follow the prompts to authenticate

2. **Deploy the project:**
   ```bash
   cd /path/to/Trial-Kayu-2
   vercel
   ```

3. **Answer the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `alfathkayu-costing`
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

4. **Add environment variables:**
   ```bash
   vercel env add DATABASE_URL production
   # Paste your Neon connection string when prompted
   
   vercel env add NEXTAUTH_URL production
   # Enter: https://your-project-name.vercel.app
   
   vercel env add NEXTAUTH_SECRET production
   # Generate and paste: openssl rand -base64 32
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Part 3: Initialize Database (5 minutes)

After your app is deployed, you need to run database migrations:

#### Method 1: Using Vercel CLI (Recommended)

```bash
# Install dependencies locally
npm install

# Set the DATABASE_URL environment variable
export DATABASE_URL="your-neon-connection-string"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed
```

#### Method 2: Using Neon SQL Editor

1. Go to your Neon dashboard → SQL Editor
2. Copy the entire schema from `prisma/schema.prisma`
3. Generate SQL using: `npx prisma migrate diff --to-schema-datamodel prisma/schema.prisma --script`
4. Run the generated SQL in Neon SQL Editor

### Part 4: Verify Deployment

1. **Visit your application:**
   - Open `https://your-project-name.vercel.app`
   - You should see the login page

2. **Test login:**
   - Email: `admin@alfathkayu.com`
   - Password: `Admin123!`

3. **Check all features:**
   - Dashboard
   - Inventory management
   - Production batches
   - Reports

## Automatic Deployments

Once set up, every push to your GitHub repository will automatically deploy to Vercel:

- **Push to `main` branch** → Deploys to production
- **Push to other branches** → Creates preview deployments

## Custom Domain (Optional)

To use your own domain (e.g., `alfathkayu.com`):

1. Go to Vercel Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed by Vercel
4. Update `NEXTAUTH_URL` environment variable to your custom domain

## Monitoring & Logs

- **View logs:** Vercel Dashboard → Your Project → Logs
- **Monitor performance:** Vercel Dashboard → Analytics
- **Database metrics:** Neon Dashboard → Monitoring

## Troubleshooting

### Build Fails

**Error:** "Module not found" or dependency issues
- **Solution:** Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error:** "Prisma Client not generated"
- **Solution:** Add postinstall script to `package.json`:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```

### Database Connection Fails

**Error:** "Can't reach database server"
- **Solution:** Check `DATABASE_URL` environment variable
- Ensure it includes `?sslmode=require` at the end
- Verify Neon database is active (not paused)

### Authentication Issues

**Error:** "Invalid callback URL"
- **Solution:** Ensure `NEXTAUTH_URL` matches your Vercel deployment URL exactly
- Include `https://` protocol
- No trailing slash

### Application Loads But No Data

- **Solution:** Run database migrations and seed:
  ```bash
  npx prisma migrate deploy
  npx prisma db seed
  ```

## Costs & Limits

### Neon Free Tier
- ✅ 0.5 GB storage
- ✅ 1 project
- ✅ Unlimited queries
- ⚠️ Database pauses after 5 minutes of inactivity (auto-resumes on next query)

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments

**For production use with more traffic, consider upgrading:**
- Neon Pro: $19/month (always-on database, 10GB storage)
- Vercel Pro: $20/month (higher limits, team features)

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Rotate secrets regularly** - Update `NEXTAUTH_SECRET` every 90 days
3. **Use strong passwords** - Change default admin password after first login
4. **Enable 2FA** - On both Vercel and Neon accounts
5. **Monitor access logs** - Check Vercel logs regularly

## Backup & Recovery

### Database Backups (Neon)
- Neon automatically backs up your database
- Free tier: 7-day point-in-time recovery
- Manual backup: Use `pg_dump` with your connection string

### Application Backup
- Code is backed up in GitHub
- Vercel keeps deployment history
- Can rollback to any previous deployment instantly

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Deployment Checklist:**

- [ ] Neon account created
- [ ] Database project created
- [ ] Connection string saved
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Environment variables configured
- [ ] Initial deployment successful
- [ ] Database migrations run
- [ ] Database seeded (optional)
- [ ] Login tested
- [ ] All features verified
- [ ] Custom domain configured (optional)

**Estimated Total Time:** 20-30 minutes

**Your application will be live at:** `https://your-project-name.vercel.app`
