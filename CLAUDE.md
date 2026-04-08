# Keto Creator — Project Guide

## Architecture

- **Frontend**: Next.js 14 (App Router) — deployed on **Vercel** at `keto-creator.vercel.app`
- **Backend**: FastAPI (Python 3.12) + SQLAlchemy async — deployed on **Railway**
- **Database**: PostgreSQL (Railway managed)
- **API base URL**: `https://keto-creator-production.up.railway.app/api/v1`

## Key Environment Variables

### Railway (backend)
- `DATABASE_URL` — PostgreSQL connection string
- `ANTHROPIC_API_KEY` — for AI Coach (Claude)
- `SECRET_KEY` — JWT signing key

### Vercel (frontend)
- `NEXT_PUBLIC_API_URL` — must be set to Railway URL above; **baked at build time**, requires redeploy after changes

## Important Technical Notes

### SQLAlchemy Async
- Never use `db.__class__(db.bind)` or `db.bind` — invalid in async context
- Always use `AsyncSessionLocal()` for new sessions inside background tasks
- Use `selectinload()` for eager-loading relationships to avoid lazy-load `MissingGreenlet` errors

### Anthropic / AI Coach
- **This account only has access to Claude 4 models** — claude-3-x models return `not_found_error`
- Current model: `claude-haiku-4-5-20251001`
- AI Coach uses SSE streaming via `StreamingResponse` in `backend/app/routers/ai_coach.py`
- AI service logic in `backend/app/services/ai_service.py`

### Meal Images
- Generated with DALL-E 3, stored in `frontend/public/meals/{slug}.jpg`
- Served via Vercel CDN at `https://keto-creator.vercel.app/meals/{slug}.jpg`
- Image URLs defined in `backend/app/utils/keto_data.py`
- `seed_meals()` in `main.py` updates image URLs on every deploy

### Frontend API calls
- All API calls use `api` axios instance from `frontend/lib/api.ts`
- Token stored in `localStorage` as `keto_token`

## Project Structure

```
keto-planner/
├── backend/
│   └── app/
│       ├── main.py              # FastAPI app + seed_meals()
│       ├── config.py            # Settings (env vars)
│       ├── models/              # SQLAlchemy models
│       ├── routers/             # API routes
│       │   ├── ai_coach.py      # AI chat + /ai/health diagnostic
│       │   ├── meals.py         # Meal CRUD + alternatives
│       │   ├── users.py         # Profile + allergies
│       │   └── meal_plans.py    # Weekly meal planning
│       ├── services/
│       │   └── ai_service.py    # Anthropic streaming
│       └── utils/
│           └── keto_data.py     # 22 hardcoded meals with image URLs
├── frontend/
│   ├── app/(app)/
│   │   ├── coach/page.tsx       # AI Coach chat UI
│   │   ├── meal-plan/page.tsx   # Meal plan + allergy panel
│   │   └── shopping/page.tsx    # Shopping list (Full Week + By Meal tabs)
│   └── public/meals/            # 22 DALL-E generated meal images
└── scripts/
    └── generate_meal_images.py  # DALL-E 3 image generation script
```

## Deploy Workflow

1. `git push origin master` → triggers Railway redeploy (~2 min) and Vercel redeploy (~1 min)
2. For frontend env var changes: update in Vercel dashboard → redeploy manually
3. For Railway env var changes: update in Railway dashboard → service auto-restarts
