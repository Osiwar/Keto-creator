from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings
from app.routers import auth, users, macros, meals, meal_plans, shopping, ai_coach


async def seed_meals():
    from sqlalchemy import select
    from app.database import AsyncSessionLocal
    from app.models.meal import Meal
    from app.utils.keto_data import MEALS_SEED
    import json

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Meal))
        existing = result.scalars().all()
        existing_names = {m.name: m for m in existing}

        added = 0
        updated = 0
        for data in MEALS_SEED:
            if data["name"] in existing_names:
                # Update ingredients and instructions if empty
                meal = existing_names[data["name"]]
                needs_update = False
                if not meal.ingredients or meal.ingredients == "[]":
                    meal.ingredients = data.get("ingredients", "[]")
                    needs_update = True
                if not meal.instructions or meal.instructions == "[]":
                    meal.instructions = data.get("instructions", "[]")
                    needs_update = True
                # Always refresh image URL
                if data.get("image_url"):
                    meal.image_url = data["image_url"]
                    needs_update = True
                if needs_update:
                    updated += 1
            else:
                meal = Meal(**data)
                db.add(meal)
                added += 1

        await db.commit()
        if added or updated:
            print(f"Seeds: {added} added, {updated} updated with recipes")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import all models so SQLAlchemy knows about them
    from app.models import user, meal, shopping, subscription, chat

    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        await seed_meals()
    except Exception as e:
        print(f"[WARNING] DB init failed: {e}")

    yield


app = FastAPI(
    title="KetoCoach API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(macros.router, prefix="/api/v1")
app.include_router(meals.router, prefix="/api/v1")
app.include_router(meal_plans.router, prefix="/api/v1")
app.include_router(shopping.router, prefix="/api/v1")
app.include_router(ai_coach.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"status": "KetoCoach API running"}
