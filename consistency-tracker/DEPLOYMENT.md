# GoalTracker Deployment Guide (Vercel + Railway)

This repo is a monorepo:

- Web (Next.js): `apps/web`
- API (Express): `apps/api`

Production setup:

1. Deploy web to Vercel
2. Deploy API to Railway
3. Use MongoDB Atlas for database (existing cluster — do NOT create a new one)
4. Use a custom domain with subdomains
   - Web: `goaltracker.tech` (primary) + `www.goaltracker.tech` (alias → redirects to root)
   - API: `api.goaltracker.tech`
   - Email: `mail.goaltracker.tech` (Resend sending domain — already verified)

## 1) Push to GitHub

1. Ensure repository is up to date on `main`

## 2) Deploy API on Railway

1. Create a new Railway project from GitHub repo
2. Set root directory to `apps/api`
3. Railway auto-detects Node via `.nvmrc` (Node 24)
4. Add environment variables (see Section D below for the full list):

```bash
NODE_ENV=production
PORT=4000

MONGODB_URI=<your-existing-atlas-uri>

JWT_SECRET=<same-secret-as-before-do-not-change>
JWT_EXPIRES_IN=7d

# Allow both root and www origins
CLIENT_URLS=https://goaltracker.tech,https://www.goaltracker.tech

# Cross-domain cookie settings (frontend on goaltracker.tech, API on api.goaltracker.tech)
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
COOKIE_DOMAIN=.goaltracker.tech

# Resend email
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=noreply@mail.goaltracker.tech

# Email verification / password reset links (point to production frontend)
VERIFY_EMAIL_URL=https://goaltracker.tech/verify-email
RESET_PASSWORD_URL=https://goaltracker.tech/reset-password

# Token expiry in ms (default: 1 hour = 3600000)
TOKEN_EXPIRY_MS=3600000
```

5. Deploy and verify health endpoint:
   - `https://api.goaltracker.tech/api/health`

## 3) Deploy Web on Vercel

1. Import GitHub repo in Vercel
2. Set root directory to `apps/web`
3. Build command: default (`next build`)
4. Node.js version: 24.x (set in Vercel project settings)
5. Add environment variable:

```bash
NEXT_PUBLIC_API_URL=https://api.goaltracker.tech/api
```

6. Deploy

## 4) Domain Setup

### Vercel (frontend)
- Add `goaltracker.tech` as primary domain
- Add `www.goaltracker.tech` as additional domain
- The `next.config.js` already redirects `www → goaltracker.tech`

### Railway (API)
- Add `api.goaltracker.tech` as custom domain

### DNS Records Required

| Type  | Name             | Value                         | Notes                    |
|-------|------------------|-------------------------------|--------------------------|
| A     | @                | Vercel IP                     | Frontend root            |
| CNAME | www              | cname.vercel-dns.com          | www alias                |
| CNAME | api              | your-railway-service.up.railway.app | API subdomain      |
| TXT   | mail             | (Resend verification record)  | Already verified         |
| MX    | mail             | (Resend MX records)           | Already verified         |

## 5) Post-Deploy Checklist

1. Open `https://goaltracker.tech`
2. Sign up a new test account
3. Check that verification email arrives from `noreply@mail.goaltracker.tech`
4. Click verification link — should redirect to `https://goaltracker.tech/verify-email/<token>`
5. Log in with verified account
6. Create a goal and save a stopwatch session
7. Open Analytics and verify charts load
8. Test forgot password flow end to end
9. Log out

## 6) Common Issues

### Login works locally but not in production

- Ensure `NEXT_PUBLIC_API_URL` is `https://api.goaltracker.tech/api` (with `/api` suffix)
- Ensure `CLIENT_URLS` includes both `https://goaltracker.tech` and `https://www.goaltracker.tech`
- Ensure `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` in production
- Ensure `COOKIE_DOMAIN=.goaltracker.tech` (note the leading dot)

### CORS error in browser console

- Verify the request origin matches one of the values in `CLIENT_URLS` exactly
- Separate multiple origins with commas (no spaces)

### API health endpoint fails

- Check MongoDB URI is pointing to the existing Atlas cluster
- Check Railway logs for startup errors
- Do NOT use `scripts/reset-credentials.js` in production — it deletes all data

## 7) ⚠️ CRITICAL — Database Safety

The script `apps/api/scripts/reset-credentials.js` performs `deleteMany` on all collections.

**Never run this script against the production MongoDB URI.**

This script is for local development only. It is not part of the deployment pipeline.

## 8) Rollback Plan

If the new Railway deployment fails:

1. Check Railway logs immediately
2. If MongoDB cannot connect → verify `MONGODB_URI` env var in Railway dashboard
3. If CORS errors → verify `CLIENT_URLS` env var
4. If cookies not working → verify `COOKIE_DOMAIN`, `COOKIE_SAME_SITE`, `COOKIE_SECURE`
5. To revert to previous Railway service: redeploy the previous deployment from Railway's deployment history tab
6. The existing Vercel frontend is unaffected by a Railway failure — it will simply show API errors