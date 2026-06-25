# XORAL — Supabase Setup

Production site: **https://xoral-iota.vercel.app**

## Step 1 — Create Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in
2. **New project** → name it `xoral` (or similar)
3. Choose a region close to your users
4. Set a strong database password and wait for the project to finish provisioning

## Step 2 — Run the database schema (required)

Your Supabase project: **jgopulswoleqsvjegllb**

1. Open the [SQL Editor](https://supabase.com/dashboard/project/jgopulswoleqsvjegllb/sql/new)
2. Copy the entire contents of [`schema.sql`](./schema.sql) and paste it in
3. Click **Run**

Verify: visit `/api/health/auth` — should return `"databaseReady": true`.

Without this step, users can sign up in Auth but watchlist/profile data will not save.

## Step 3 — Configure Auth URLs

In **Authentication → URL Configuration**:

| Field | Value |
|-------|-------|
| **Site URL** | `https://xoral-iota.vercel.app` |
| **Redirect URLs** | `https://xoral-iota.vercel.app/**` |
| | `http://localhost:3000/**` |

For local dev, keep `localhost:3000` in the list.

### Email confirmation (required for real users today)

Your project currently requires email verification (`mailer_autoconfirm: false`).

1. User signs up at `/signup`
2. Supabase sends a verification email
3. User clicks the link → `/auth/callback` → logged in
4. User can also sign in manually at `/login` after verifying

**Optional for testing:** disable **Confirm email** under Authentication → Providers → Email so signups work instantly without email.

## Step 4 — Get API keys

**Project Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never commit the `service_role` key to the app or GitHub.

## Step 5 — Local environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Restart the dev server (`npm run dev`).

## Step 6 — Vercel environment variables

For **https://xoral-iota.vercel.app**, add in [Vercel project settings](https://vercel.com):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jgopulswoleqsvjegllb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | your publishable key |

Then **Redeploy**.

Or via CLI from the app folder:

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel --prod
```

## Step 7 — Verify

1. Open https://xoral-iota.vercel.app/signup and create an account
2. **Sign In** should appear in the header when logged out; your initial when logged in
3. Add a title to **My List** — refresh; it should persist
4. Visit **Profile** — your email and welcome notifications should show
5. `/library` and `/profile` should redirect to login when logged out

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Supabase is not configured" on login | Env vars missing or redeploy needed |
| Signup succeeds but can't sign in | Disable email confirmation or confirm via email |
| RLS errors in browser console | Re-run full `schema.sql` |
| Session lost after refresh | Check Site URL matches `https://xoral-iota.vercel.app` |

## Optional — Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

Project ref is in the dashboard URL: `supabase.com/dashboard/project/<project-ref>`.
