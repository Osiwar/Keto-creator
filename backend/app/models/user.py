from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow)

    profile: Mapped[Optional["UserProfile"]] = relationship("UserProfile", back_populates="user", uselist=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)
    diet_type: Mapped[Optional[str]] = mapped_column(String(50))  # keto, carnivore, ketovore
    goal: Mapped[Optional[str]] = mapped_column(String(50))  # fat_loss, maintenance, muscle_gain
    activity_level: Mapped[Optional[str]] = mapped_column(String(50))
    age: Mapped[Optional[int]] = mapped_column(Integer)
    weight_kg: Mapped[Optional[float]] = mapped_column(Float)
    height_cm: Mapped[Optional[float]] = mapped_column(Float)
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    target_calories: Mapped[Optional[int]] = mapped_column(Integer)
    target_fat_g: Mapped[Optional[int]] = mapped_column(Integer)
    target_protein_g: Mapped[Optional[int]] = mapped_column(Integer)
    target_carbs_g: Mapped[Optional[int]] = mapped_column(Integer, default=20)
    weekly_budget: Mapped[Optional[float]] = mapped_column(Float)
    allergies: Mapped[Optional[str]] = mapped_column(Text, default="[]")
    onboarding_done: Mapped[bool] = mapped_column(Boolean, default=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="profile")
