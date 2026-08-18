# Lumiqs AI — AI-Powered Business Consultant SaaS

> From business question → intelligent insight → actionable decision.

Lumiqs AI is a full-stack SaaS platform that gives entrepreneurs, founders, and SMEs an AI business consultant that understands their specific business context.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend | NestJS 11, TypeScript, REST API |
| Database | MongoDB Atlas + Prisma ORM |
| Auth | Clerk (JWT-based, server-side verification) |
| AI | Ollama local models (Qwen3, streaming) |
| Storage | Supabase Storage |
| Monorepo | Turborepo |

---

## Project Structure

```
lumiqs-ai/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   └── api/          # NestJS backend (port 3001)
├── packages/
│   ├── ai/           # Shared AI prompt templates & types
│   ├── config/       # Shared configuration
│   ├── database/     # Prisma schema & seed data
│   ├── types/        # Shared TypeScript types
│   └── validation/   # Shared Zod schemas
└── docs/
```

---

## Prerequisites

- Node.js 20+
- MongoDB Atlas cluster (or MongoDB 7+ local replica set)
- pnpm (recommended) or npm

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd lumiqs-ai
npm install
```

### 2. Configure environment

Copy the example env file and fill in your credentials:

```bash
cp .env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

**Required environment variables:**

```env
# apps/api/.env
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/lumiqs_ai?retryWrites=true&w=majority"
AI_BASE_URL="http://localhost:11434/v1"
AI_API_KEY="ollama"
AI_MODEL="qwen3:4b"
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
SUPABASE_STORAGE_BUCKET="lumiqs-assets"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"

# apps/web/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Set up the database

```bash
cd apps/api

# Sync collections and indexes to MongoDB Atlas
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed with demo data
npx ts-node ../../packages/database/prisma/seed.ts
```

### 4. Start development servers

```bash
# From root — starts both frontend and backend
npm run dev

# Or individually:
cd apps/api && npm run dev    # Backend on :3001
cd apps/web && npm run dev    # Frontend on :3000
```

### 5. View API docs

Swagger UI is available at: http://localhost:3001/api/docs

---

## API Reference

### Authentication
All protected routes require a Clerk JWT in the `Authorization: Bearer <token>` header.

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/users/me` | Current user |
| GET | `/api/v1/users/dashboard` | Dashboard data |
| POST | `/api/v1/businesses` | Create business |
| GET | `/api/v1/businesses` | List businesses |
| GET | `/api/v1/businesses/:id` | Get business |
| PATCH | `/api/v1/businesses/:id` | Update business |
| DELETE | `/api/v1/businesses/:id` | Delete business |
| POST | `/api/v1/businesses/:id/ai/chat` | AI chat (streaming SSE) |
| GET | `/api/v1/businesses/:id/conversations` | List conversations |
| GET | `/api/v1/businesses/:id/conversations/:convId` | Get conversation with messages |
| POST | `/api/v1/businesses/:id/analysis` | Generate business analysis |
| POST | `/api/v1/businesses/:id/market-research` | Generate market research |
| POST | `/api/v1/businesses/:id/competitors/analyze` | Analyze competitor |
| POST | `/api/v1/businesses/:id/strategy` | Generate strategy |
| POST | `/api/v1/businesses/:id/execution-plan` | Generate execution plan |
| GET | `/api/v1/businesses/:id/reports` | List reports |
| GET | `/api/v1/reports/:id` | Get report |
| GET | `/api/v1/reports/:id/pdf` | Download PDF |
| DELETE | `/api/v1/reports/:id` | Delete report |
| POST | `/api/v1/businesses/:id/insights` | Save insight |
| GET | `/api/v1/businesses/:id/insights` | List insights |
| DELETE | `/api/v1/insights/:id` | Delete insight |
| GET | `/api/v1/businesses/:id/memory` | List business memory |
| POST | `/api/v1/businesses/:id/logo` | Upload logo |

---

## Frontend Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |
| `/dashboard` | Main dashboard |
| `/businesses` | Business list |
| `/businesses/new` | Create business |
| `/businesses/[id]/ai` | AI Consultant chat |
| `/businesses/[id]/analysis` | Business analysis |
| `/businesses/[id]/market-research` | Market research |
| `/businesses/[id]/competitors` | Competitor analysis |
| `/businesses/[id]/strategy` | Strategy |
| `/businesses/[id]/execution` | Execution plan |
| `/businesses/[id]/reports` | Reports list |
| `/businesses/[id]/insights` | Saved insights |
| `/businesses/[id]/settings` | Business settings |
| `/reports/[id]` | Report viewer |
| `/settings` | Account settings |

---

## Architecture

```
Next.js Frontend
      │
      │ HTTPS / REST + SSE (streaming)
      ▼
NestJS Backend API (port 3001)
      │
      ├── MongoDB Atlas (Prisma ORM)
      ├── OpenAI API (server-side only)
      └── Supabase Storage

AI Pipeline:
Controller → AIOrchestrator → BusinessContextService
         → MemoryService → PromptBuilder → OpenAIService
         → Response → Persistence
```

### Security Model

- All API routes require Clerk JWT verification
- User ID is **never** trusted from the client — always extracted from the verified token
- Every business-scoped resource is verified: `authenticatedUser → owns business → owns resource`
- OpenAI API key is server-side only, never exposed to the browser
- Rate limiting on all AI endpoints (20 req/min)
- Input validation via class-validator on all DTOs
- Helmet + CORS configured

---

## AI Features

### AI Consultant (Streaming)
Real-time streaming chat with full business context. The AI knows your:
- Business profile, stage, and model
- Goals and challenges
- Previous conversation history
- Saved business memories

### Business Analysis
SWOT analysis with strengths, weaknesses, opportunities, risks, recommendations, and priority actions.

### Market Research
Industry overview, market size estimates, customer personas, pain points, trends, and opportunities.

### Competitor Analysis
Full competitive intelligence: business model, pricing, features, SWOT, competitive advantages, and strategic recommendations.

### Strategy Generation
Revenue, pricing, marketing, sales, and growth strategies — each with recommendation, reason, priority, expected impact, and implementation notes.

### Execution Planning
4-week roadmap with specific tasks, priorities, milestones, and success metrics. Tasks are persisted and status can be updated.

### PDF Reports
Professional branded PDF export for any report using PDFKit — real document generation, not screenshots.

### Business Memory
Key facts, decisions, and recommendations are automatically extracted and stored as business memory, making the AI smarter over time.

---

## Testing

```bash
# Unit tests
cd apps/api && npm test

# Watch mode
cd apps/api && npm run test:watch

# Coverage
cd apps/api && npm run test:cov

# E2E tests
cd apps/api && npm run test:e2e
```

---

## Deployment

### Frontend → Vercel

```bash
cd apps/web
vercel deploy
```

Set environment variables in Vercel dashboard.

### Backend → Railway / Render / Fly.io

```bash
cd apps/api
npm run build
npm run start:prod
```

Required env vars: `DATABASE_URL`, `AI_BASE_URL`, `AI_MODEL`, `CLERK_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

### Database → MongoDB Atlas

```bash
DATABASE_URL="mongodb+srv://..." npx prisma db push
```

---

## Development Commands

```bash
# Root
npm run dev          # Start all apps
npm run build        # Build all apps
npm run lint         # Lint all apps

# API
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run test         # Run tests
npx prisma studio    # Open Prisma Studio (DB GUI)
npx prisma db push      # Sync the Prisma schema and indexes

# Web
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB Atlas connection string |
| `AI_BASE_URL` | ✅ | Ollama-compatible endpoint (default: `http://localhost:11434/v1`) |
| `AI_MODEL` | ✅ | Local model name (default: `qwen3:4b`) |
| `CLERK_SECRET_KEY` | ✅ | Clerk backend secret |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk webhook verification |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk frontend key |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `SUPABASE_STORAGE_BUCKET` | ✅ | Storage bucket name |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL |
| `PORT` | ❌ | API port (default: 3001) |
| `CORS_ORIGIN` | ❌ | Allowed CORS origin |
| `THROTTLE_TTL` | ❌ | Rate limit window in seconds |
| `THROTTLE_LIMIT` | ❌ | Max requests per window |
| `AI_THROTTLE_LIMIT` | ❌ | Max AI requests per window |

---

## License

Private — All rights reserved.
