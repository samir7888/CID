# OTP Email Sending - Troubleshooting Guide

## Problem
OTP emails are not being sent when users try to log in.

## Root Cause
The application code is correct, but **Supabase environment variables are not configured**. Without valid Supabase credentials, the `signInWithOtp()` call cannot communicate with Supabase's authentication service.

## Solution Steps

### 1. Create Your `.env.local` File

Copy the example file and fill in your actual values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your Supabase project credentials.

### 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **Project Settings** → **API**
3. Copy these values to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 3. Configure Email Settings in Supabase Dashboard

#### A. Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Set "Confirm email" if you want email confirmation required

#### B. Configure Site URLs
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000`
   - `http://localhost:3000/login`
   - `http://localhost:3000/auth/callback`

#### C. Customize Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link** template
3. Customize the email subject and body if desired
4. Ensure the template includes the `{{ .ConfirmationURL }}` variable

### 4. Development vs Production Email

#### Development (Localhost)
- Supabase sends test emails to **only the first 5 confirmed users** by default
- Check your Supabase dashboard **Authentication** → **Logs** to see email delivery status
- Emails may go to spam folder

#### Production
- Configure custom SMTP in Supabase:
  1. Go to **Project Settings** → **Auth** → **SMTP Settings**
  2. Add your email provider credentials (SendGrid, Postmark, etc.)
  3. Set custom "From" email address

### 5. Test the Flow

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Enter an email address
4. Click "EMAIL ME A LOGIN LINK"
5. Check your email inbox (and spam folder)
6. Click the magic link in the email
7. You should be redirected back to the app and logged in

### 6. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No email received | Check Supabase Auth logs, verify email provider setup |
| "Invalid redirect URI" | Add your localhost URL to Redirect URLs in Supabase |
| "Email not confirmed" | Enable email confirmation in Auth providers |
| Link expired | Magic links expire after a set time (default: 1 hour) |
| Only works for first 5 users | Configure custom SMTP for production |

## Code Flow Reference

```
User enters email
    ↓
login/page.tsx calls supabase.auth.signInWithOtp()
    ↓
Supabase sends email with magic link
    ↓
User clicks link → /auth/confirm?token_hash=xxx&type=magiclink
    ↓
auth/confirm/route.ts verifies OTP via supabase.auth.verifyOtp()
    ↓
Session created, redirect to /auth/callback
    ↓
auth/callback/route.ts exchanges code for session
    ↓
User logged in, redirected to app
```

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (public key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (secret key - never expose to client)
```

## Additional Resources

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- SSR Auth Guide: https://supabase.com/docs/guides/auth/auth-nextjs/using-ssr-with-supabase-auth-client
