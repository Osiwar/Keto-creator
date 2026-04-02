from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Integer, Float, Text, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    diet_type: Mapped[str] = mapped_column(String(50), default="keto")  # keto, carnivore, both
    meal_type: Mapped[str] = mapped_column(String(50))  # breakfast, lunch, dinner, snack
    prep_time_mins: Mapped[int] = mapped_column(Integer, default=10)
    cook_time_mins: Mapped[int] = mapped_column(Integer, default=20)
    servings: Mapped[int] = mapped_column(Integer, default=1)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    fat_g: Mapped[float] = mapped_column(Float, nullable=False)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False)
    carbs_g: Mapped[float] = mapped_column(Float, nullable=False)
    fiber_g: Mapped[float] = mapped_column(Float, default=0)
    ingredients: Mapped[str] = mapped_column(Text, default="[]")  # JSON
    instructions: Mapped[str] = mapped_column(Text, default="[]")  # JSON
    tags: Mapped[str] = mapped_column(Text, default="[]")  # JSON
    allergens: Mapped[str] = mapped_column(Text, default="[]")  # JSON
    cost_estimate: Mapped[Optional[float]] = mapped_column(Float)
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    slots: Mapped[list["MealPlanSlot"]] = relationship("MealPlanSlot", back_populates="meal_plan", cascade="all, delete-orphan")


class MealPlanSlot(Base):
    __tablename__ = "meal_plan_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meal_plan_id: Mapped[int] = mapped_column(Integer, ForeignKey("meal_plans.id"))
    day_of_week: Mapped[int] = mapped_column(Integer)  # 0=Mon, 6=Sun
    meal_type: Mapped[str] = mapped_column(String(50))
    meal_id: Mapped[int] = mapped_column(Integer, ForeignKey("meals.id"))
    is_eaten: Mapped[bool] = mapped_column(Boolean, default=False)
    eaten_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    meal_plan: Mapped["MealPlan"] = relationship("MealPlan", back_populates="slots")
    meal: Mapped["Meal"] = relationship("Meal")
