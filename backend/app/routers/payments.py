from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import stripe
import json
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription, StripeEvent
from app.config import settings
from app.routers.auth import get_current_user

stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    body = await request.json()
    plan = body.get("plan", "pro")

    price_id = settings.STRIPE_PRICE_PRO if plan == "pro" else settings.STRIPE_PRICE_ELITE
    if not price_id:
        raise HTTPException(status_code=400, detail="Price ID not configured")

    # Get existing subscription for customer_id
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    sub = result.scalar_one_or_none()
    customer_id = sub.stripe_customer_id if sub else None

    # Create Stripe customer if not exists
    if not customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            name=current_user.full_name or "",
            metadata={"user_id": str(current_user.id)},
        )
        customer_id = customer.id

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        allow_promotion_codes=True,
        success_url=f"{settings.FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.FRONTEND_URL}/pricing",
        metadata={"user_id": str(current_user.id), "plan": plan},
    )

    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Idempotency
    result = await db.execute(select(StripeEvent).where(StripeEvent.stripe_event_id == event["id"]))
    if result.scalar_one_or_none():
        return {"status": "already processed"}

    stripe_evt = StripeEvent(
        stripe_event_id=event["id"],
        event_type=event["type"],
        payload=json.dumps(dict(event["data"]["object"]), default=str),
    )
    db.add(stripe_evt)

    obj = event["data"]["object"]

    if event["type"] == "checkout.session.completed":
        user_id = int(obj.get("metadata", {}).get("user_id", 0))
        plan = obj.get("metadata", {}).get("plan", "pro")
        customer_id = obj.get("customer")
        subscription_id = obj.get("subscription")

        result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
        sub = result.scalar_one_or_none()
        if sub:
            sub.stripe_customer_id = customer_id
            sub.stripe_subscription_id = subscription_id
            sub.plan_tier = plan
            sub.status = "active"
        else:
            db.add(Subscription(
                user_id=user_id,
                stripe_customer_id=customer_id,
                stripe_subscription_id=subscription_id,
                plan_tier=plan,
                status="active",
            ))

    elif event["type"] == "customer.subscription.updated":
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == obj["id"])
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.status = obj.get("status", sub.status)
            sub.cancel_at_period_end = obj.get("cancel_at_period_end", False)
            period_end = obj.get("current_period_end")
            if period_end:
                sub.current_period_end = datetime.fromtimestamp(period_end)

    elif event["type"] == "customer.subscription.deleted":
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_subscription_id == obj["id"])
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.plan_tier = "free"
            sub.status = "canceled"
            sub.stripe_subscription_id = None

    elif event["type"] == "invoice.payment_failed":
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == obj.get("customer"))
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.status = "past_due"

    stripe_evt.processed = True
    await db.commit()
    return {"status": "ok"}


@router.get("/portal")
async def customer_portal(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    sub = result.scalar_one_or_none()

    if not sub or not sub.stripe_customer_id:
        raise HTTPException(status_code=404, detail="No subscription found")

    session = stripe.billing_portal.Session.create(
        customer=sub.stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/dashboard",
    )
    return {"portal_url": session.url}


@router.get("/subscription")
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Subscription).where(Subscription.user_id == current_user.id))
    sub = result.scalar_one_or_none()

    if not sub:
        return {"plan_tier": "free", "status": "active", "cancel_at_period_end": False, "current_period_end": None}

    return {
        "plan_tier": sub.plan_tier,
        "status": sub.status,
        "cancel_at_period_end": sub.cancel_at_period_end,
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
    }
