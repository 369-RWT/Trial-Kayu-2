# Netlify Deployment Guide - PostgreSQL Setup

## Quick Start (15 minutes)

Your application is now configured for PostgreSQL. Follow these steps to deploy to Netlify.

---

## Step 1: Create Neon PostgreSQL Database (5 min)

1. **Sign up for Neon** (free tier):
   - Go to: https://neon.tech
   - Sign up with GitHub or email
   - Verify your email

2. **Create a database project**:
   - Click "Create a project"
   - Project name: `alfathkayu-db`
   - Region: Choose closest to you (e.g., Singapore for Asia)
   - PostgreSQL version: 16
   - Click "Create project"

3. **Copy your connection string**:
   - After creation, you'll see a connection string like:
     ```
     postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
     ```
   - **SAVE THIS** - you'll need it for Netlify and local setup

---

## Step 2: Configure Netlify Environment Variables (3 min)

1. **Go to your Netlify site**:
   - Dashboard → Your Site → Site Settings → Environment Variables

2. **Add these variables**:

   | Variable Name | Value | Example |
   |---------------|-------|---------|
   | `DATABASE_URL` | Your Neon connection string | `postgresql://user:pass@host/db?sslmode=require` |
   | `NEXTAUTH_URL` | Your Netlify site URL | `https://your-site.netlify.app` |
   | `NEXTAUTH_SECRET` | Generate with command below | Random 32-char string |
   | `NODE_ENV` | `production` | `production` |

3. **Generate NEXTAUTH_SECRET**:
   ```bash
   # On Windows PowerShell:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   
   # Or use online generator:
   # https://generate-secret.vercel.app/32
   ```

---

## Step 3: Initialize Database (5 min)

Run these commands locally to set up your production database:

```bash
# 1. Update your local .env file with Neon connection string
# Edit .env and replace DATABASE_URL with your Neon string

# 2. Generate Prisma Client for PostgreSQL
npx prisma generate

# 3. Push schema to database (creates all tables)
npx prisma db push

# 4. Seed database with initial data (optional)
npm run db:seed
```

**Alternative**: If you prefer migrations:
```bash
npx prisma migrate dev --name init_postgresql
npx prisma migrate deploy
```

---

## Step 4: Deploy to Netlify (2 min)

1. **Push your changes to GitHub**:
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL for Netlify deployment"
   git push origin main
   ```

2. **Netlify will automatically deploy**:
   - Go to Netlify Dashboard → Deploys
   - Watch the build progress
   - Should complete in 2-3 minutes

3. **If build fails**, check:
   - Environment variables are set correctly
   - DATABASE_URL includes `?sslmode=require`
   - All variables are in "Production" scope

---

## Step 5: Verify Deployment (2 min)

1. **Visit your site**: `https://your-site.netlify.app`

2. **Test login**:
   - Email: `admin@alfathkayu.com`
   - Password: `Admin123!`
   - (These are created by the seed script)

3. **Test features**:
   - ✅ Dashboard loads
   - ✅ View inventory
   - ✅ Create log purchase
   - ✅ Create production batch
   - ✅ View reports

---

## Troubleshooting

### Build Error: "Prisma Client not generated"
**Solution**: The `postinstall` script in `package.json` should handle this automatically. If not, check that it exists:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Runtime Error: "Can't reach database server"
**Solution**: 
1. Check DATABASE_URL in Netlify environment variables
2. Ensure it includes `?sslmode=require` at the end
3. Verify Neon database is active (not paused)

### Error: "Invalid callback URL"
**Solution**: 
1. Ensure NEXTAUTH_URL matches your Netlify URL exactly
2. Include `https://` protocol
3. No trailing slash

### Database Connection Works Locally But Not on Netlify
**Solution**:
1. Verify environment variables are set in Netlify (not just locally)
2. Check they're in "Production" scope, not just "Preview"
3. Redeploy after setting variables

---

## Local Development

You can still use SQLite for local development if you prefer:

1. **Create a `.env.local` file**:
   ```bash
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="local-dev-secret"
   ```

2. **Switch between databases**:
   - Local dev: Uses `.env.local` (SQLite)
   - Production: Uses Netlify environment variables (PostgreSQL)

---

## Costs

### Neon Free Tier
- ✅ 0.5 GB storage
- ✅ Unlimited queries
- ✅ 1 project
- ⚠️ Database pauses after 5 min inactivity (auto-resumes)

### Netlify Free Tier
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Auto-deploy from Git

**Total Cost**: $0/month for small-medium usage

---

## Next Steps

After successful deployment:

1. **Change default password**:
   - Login as admin
   - Go to user settings
   - Update password

2. **Add your data**:
   - Add wood types
   - Add suppliers
   - Add products
   - Start recording inventory

3. **Set up custom domain** (optional):
   - Netlify: Site Settings → Domain Management
   - Add your domain and update DNS

---

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Neon Docs**: https://neon.tech/docs
- **Prisma Docs**: https://www.prisma.io/docs

**Deployment Checklist:**
- [ ] Neon account created
- [ ] Database project created  
- [ ] Connection string saved
- [ ] Netlify environment variables set
- [ ] Database schema pushed
- [ ] Database seeded
- [ ] Code pushed to GitHub
- [ ] Netlify build successful
- [ ] Site accessible
- [ ] Login tested
- [ ] Features verified
