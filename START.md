# KetoCoach — How to Run

## 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API runs at: http://localhost:8000
Swagger docs: http://localhost:8000/docs

## 2. Frontend (Next.js)

```bash
cd frontend
npm run dev
```

Site runs at: http://localhost:3000

## 3. Add your API keys

Edit `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...   ← Get from console.anthropic.com
STRIPE_SECRET_KEY=sk_test_...  ← Get from stripe.com (optional for now)
```

## Pages

- `/` — Landing page
- `/register` — Sign up
- `/login` — Sign in
- `/onboarding` — Setup wizard (5 steps)
- `/dashboard` — Home with macros
- `/meal-plan` — Weekly calendar
- `/shopping` — Grocery list
- `/coach` — AI chat
