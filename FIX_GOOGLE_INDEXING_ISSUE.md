# Fix Google Search Console Indexing Issue

## Problem Summary

Google Search Console reports "Page is not indexed: Redirect error" because your Clerk authentication is running in **development mode** on production domain `choducid.basnetsameer.com.np`.

**Root Cause**: Using test keys (`pk_test_...`, `sk_test_...`) triggers Clerk's dev-browser detection flow, causing auth redirects that confuse Google's crawler.

## ✅ Code Changes Completed

- [x] Updated `proxy.ts` middleware to properly exclude public routes from auth protection
- [x] Fixed middleware to use modern Clerk v7+ API (removed deprecated `createRouteMatcher`)
- [x] Created `.env.production` template with proper environment variables
- [x] Homepage `/`, game `/game`, and other public routes now return clean 200 responses

## 🚀 Next Steps (Action Required)

### 1. Create Clerk Production Instance

1. **Go to [Clerk Dashboard](https://dashboard.clerk.com/)**
2. **Create New Application** → Select "Production" instance type
3. **Add Production Domain**: `choducid.basnetsameer.com.np`
4. **Get Production Keys** (they'll start with `pk_live_...` and `sk_live_...`)

### 2. Set DNS Records for Clerk Production

Add these CNAME records in your domain provider (where you manage choducid.basnetsameer.com.np):

```dns
clerk.choducid.basnetsameer.com.np    → CNAME → clerk.clerk.dev
accounts.choducid.basnetsameer.com.np → CNAME → accounts.clerk.dev
```

**Wait 24-48 hours** for DNS propagation before proceeding to step 3.

### 3. Update Vercel Environment Variables

In your **Vercel Dashboard** → Project Settings → Environment Variables:

**Replace these variables:**

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PRODUCTION_KEY
CLERK_SECRET_KEY=sk_live_YOUR_ACTUAL_PRODUCTION_SECRET_KEY
NODE_ENV=production
```

**Keep these the same:**

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/game
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/game
```

### 4. Deploy Changes

```bash
# Push the middleware changes to trigger a Vercel deployment
git add .
git commit -m "Fix Google indexing: update Clerk middleware for production"
git push origin main
```

### 5. Verify the Fix

After DNS propagation (24-48 hours) and Vercel deployment:

```bash
# Test homepage returns clean 200 (no redirects)
curl -IL https://choducid.basnetsameer.com.np/

# Should show:
# HTTP/2 200
# X-Robots-Tag: index, follow
# (NO X-Clerk-Auth-Reason: dev-browser-missing)
```

### 6. Request Google Re-indexing

1. **Google Search Console** → URL Inspection
2. **Enter**: `https://choducid.basnetsameer.com.np/`
3. **Click**: "Request Indexing"

## 🔍 Current Route Protection Summary

**Public Routes** (accessible to bots, no auth required):

- `/` - Homepage
- `/game` - Game page
- `/pink-coins` - Store page (browsing)
- `/login`, `/sign-up` - Auth pages
- `/success`, `/failure` - Payment result pages

**Protected Routes** (require authentication):

- `/character` - Character selection (redirects to /login)
- `/api/profile` - User profile API
- `/api/checkout` - Purchase API
- `/api/select-character` - Character management API
- `/api/unlock-character` - Character unlocking API
- `/api/continue-run` - Game continuation API

## 🚨 Security Notes

- Never commit production keys to git
- Use Vercel environment variables for sensitive data
- Test auth flows after switching to production keys
- Monitor Clerk dashboard for any authentication issues

## 📊 Expected Results

After completing these steps:

- Google crawler gets clean HTTP 200 on homepage (no auth redirects)
- `X-Clerk-Auth-Reason: dev-browser-missing` disappears
- Homepage gets indexed in Google Search Console
- Public marketing pages remain crawlable
- Protected user features still require login
