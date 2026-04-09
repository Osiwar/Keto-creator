import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.newsletter import NewsletterSubscriber
from app.services.email_service import send_newsletter_confirmation
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

ADMIN_EMAIL = "othmanesiwar@gmail.com"


class SubscribeRequest(BaseModel):
    email: EmailStr


@router.post("/subscribe", status_code=200)
async def subscribe(data: SubscribeRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == data.email)
    )
    existing = result.scalar_one_or_none()

    if existing:
        if existing.is_active:
            return {"message": "Already subscribed"}
        # Re-subscribe
        existing.is_active = True
        existing.unsubscribed_at = None
        await db.commit()
    else:
        sub = NewsletterSubscriber(email=data.email)
        db.add(sub)
        await db.commit()

    asyncio.create_task(send_newsletter_confirmation(data.email))
    return {"message": "Subscribed successfully"}


@router.post("/unsubscribe", status_code=200)
async def unsubscribe(data: SubscribeRequest, db: AsyncSession = Depends(get_db)):
    from datetime import datetime
    result = await db.execute(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == data.email)
    )
    sub = result.scalar_one_or_none()
    if sub and sub.is_active:
        sub.is_active = False
        sub.unsubscribed_at = datetime.utcnow()
        await db.commit()
    return {"message": "Unsubscribed"}


@router.get("/subscribers")
async def list_subscribers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin only — list all newsletter subscribers."""
    if current_user.email != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await db.execute(
        select(NewsletterSubscriber).order_by(NewsletterSubscriber.subscribed_at.desc())
    )
    subs = result.scalars().all()

    count_result = await db.execute(
        select(func.count()).where(NewsletterSubscriber.is_active == True)
    )
    active_count = count_result.scalar()

    return {
        "total": len(subs),
        "active": active_count,
        "subscribers": [
            {
                "email": s.email,
                "subscribed_at": s.subscribed_at,
                "is_active": s.is_active,
            }
            for s in subs
        ],
    }
