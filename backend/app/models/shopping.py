from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class ShoppingList(Base):
    __tablename__ = "shopping_lists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    meal_plan_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("meal_plans.id"))
    title: Mapped[str] = mapped_column(String(255), default="Shopping List")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    items: Mapped[list["ShoppingItem"]] = relationship("ShoppingItem", back_populates="shopping_list", cascade="all, delete-orphan")


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    shopping_list_id: Mapped[int] = mapped_column(Integer, ForeignKey("shopping_lists.id"))
    ingredient_name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[Optional[str]] = mapped_column(String(100))
    unit: Mapped[Optional[str]] = mapped_column(String(50))
    store_section: Mapped[str] = mapped_column(String(50), default="other")
    is_checked: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    shopping_list: Mapped["ShoppingList"] = relationship("ShoppingList", back_populates="items")
