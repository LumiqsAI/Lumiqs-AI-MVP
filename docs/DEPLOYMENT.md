# Lumiqs AI — Deployment Guide

## Stack
- **Frontend** → Vercel
- **Backend API** → Render
- **Database** → Render PostgreSQL (or Supabase)
- **Storage** → Supabase Storage
- **Auth** → Clerk

---

## 1. Database — Render PostgreSQL

1. Go to [render.com](https://render.com) → **New** → **PostgreSQL**
2. Name: `lumiqs-ai-db`
3. Plan: Free
4. Click **Create Database**
5. Copy the **Internal Database URL** (use this for `DATABASE_URL` in the API service)

---

## 2. Backend API — Render Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name:** `lumiqs-ai-api`
   - **Root Directory:** `apps/api`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `node dist/main`
   - **Plan:** Free

4. Add these **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | *(from Render PostgreSQL — Internal URL)* |
| `AI_BASE_URL` | `https://api.groq.com/openai/v1` *(or OpenAI)* |
| `AI_API_KEY` | *(your Groq or OpenAI key)* |
| `AI_MODEL` | `llama-3.3-70b-versatile` *(or gpt-4o)* |
| `AI_MAX_TOKENS` | `4096` |
| `AI_TEMPERATURE` | `0.7` |
| `CLERK_SECRET_KEY` | *(from Clerk dashboard)* |
| `CLERK_PUBLISHABLE_KEY` | *(from Clerk dashboard)* |
| `SUPABASE_URL` | *(from Supabase project)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from Supabase project)* |
| `SUPABASE_STORAGE_BUCKET` | `lumiqs-assets` |
| `CORS_ORIGIN` | *(your Vercel frontend URL, e.g. https://lumiqs-ai.vercel.app)* |

5. Click **Create Web Service**

> After first deploy, run the DB migration manually via Render Shell:
> ```
> npx prisma migrate deploy
> ```

---

## 3. Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
4. Add these **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | *(from Clerk dashboard)* |
| `CLERK_SECRET_KEY` | *(from Clerk dashboard)* |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `NEXT_PUBLIC_API_URL` | *(your Render API URL, e.g. https://lumiqs-ai-api.onrender.com)* |

5. Click **Deploy**

---

## 4. Clerk — Add Production URLs

1. Go to [clerk.com](https://dashboard.clerk.com) → your app
2. **Domains** → Add your Vercel URL (e.g. `https://lumiqs-ai.vercel.app`)
3. **API Keys** → copy keys for both Vercel and Render env vars

---

## 5. Post-Deploy Checklist

- [ ] Render PostgreSQL created and URL copied
- [ ] Render API deployed and healthy (`/api/v1/health` returns 200)
- [ ] Prisma migrations run (`npx prisma migrate deploy`)
- [ ] Vercel frontend deployed
- [ ] Clerk domain added for production URL
- [ ] `CORS_ORIGIN` on Render set to Vercel URL
- [ ] `NEXT_PUBLIC_API_URL` on Vercel set to Render URL

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
# Fill in your keys

# Run database migrations
cd apps/api && npx prisma migrate dev

# Start API (terminal 1)
cd apps/api && npm run dev

# Start frontend (terminal 2)
cd apps/web && npm run dev
```
