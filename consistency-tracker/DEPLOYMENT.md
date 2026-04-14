# GoalTracker Deployment Guide (Vercel + Railway)

This repo is a monorepo:

- Web (Next.js): `apps/web`
- API (Express): `apps/api`

Recommended production setup:

1. Deploy web to Vercel
2. Deploy API to Railway
3. Use MongoDB Atlas for database
4. Use a custom domain with subdomains
   - Web: `app.goaltracker.tech`
   - API: `api.goaltracker.tech`

## 1) Push to GitHub

1. Create a GitHub repository
2. Push this project to `main`

## 2) Deploy API on Railway

1. Create a new Railway project from GitHub repo
2. Set root directory to `apps/api`
3. Railway should auto-detect Node
4. Add environment variables:

```bash
PORT=4000
NODE_ENV=production
MONGODB_URI=<your-atlas-uri>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d

# Allow your web domain to call the API
CLIENT_URLS=https://app.goaltracker.tech

# Cross-domain cookie-safe defaults
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
COOKIE_DOMAIN=.goaltracker.tech
```

5. Deploy and verify health endpoint:
   - `https://api.goaltracker.tech/api/health`

## 3) Deploy Web on Vercel

1. Import GitHub repo in Vercel
2. Set root directory to `apps/web`
3. Build command: default (`next build`)
4. Add environment variable:

```bash
NEXT_PUBLIC_API_URL=https://api.goaltracker.tech/api
```

5. Deploy

## 4) Domain Setup

1. Add custom domain in Vercel for web (`app.goaltracker.tech`)
2. Add custom domain in Railway for API (`api.goaltracker.tech`)
3. Point DNS records accordingly
4. Wait for SSL issuance (automatic)

## 5) Post-Deploy Checklist

1. Open `app.goaltracker.tech`
2. Sign up a new account
3. Log out and log in again
4. Create goal and save a stopwatch session
5. Open Analytics and verify charts load

## 6) Common Issues

### Login works locally but not in production

- Ensure `NEXT_PUBLIC_API_URL` includes `/api`
- Ensure `CLIENT_URLS` includes exact web origin
- Ensure `COOKIE_SECURE=true` in production
- Ensure `COOKIE_SAME_SITE=none` when using different subdomains/services

### CORS error in browser console

- Verify request origin is in `CLIENT_URLS`
- If multiple origins are needed, separate with commas

### API health endpoint fails

- Check MongoDB URI
- Check Railway logs for startup errors

## 7) Student Pack Notes

- Use GitHub Student Pack domain/credit benefits for hosting costs
- Keep first production simple (Vercel + Railway + Atlas)
- Add monitoring and staging only after production is stable