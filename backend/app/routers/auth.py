import secrets
import smtplib
import asyncio
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.user import User, UserProfile
from app.models.subscription import Subscription
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.services.email_service import send_welcome_email
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory store: token -> {"email": str, "expires": datetime}
_reset_tokens: dict[str, dict] = {}


def _send_reset_email(to_email: str, reset_link: str):
    """Blocking SMTP send — called via executor."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "KetoCoach — Reset your password"
    msg["From"] = settings.SMTP_EMAIL
    msg["To"] = to_email

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:linear-gradient(135deg,#E8620A,#C4500A);
                    border-radius:16px;padding:16px;margin-bottom:12px;">
          <span style="font-size:32px;">🔥</span>
        </div>
        <h1 style="color:#1A1A1A;font-size:24px;margin:0;">Reset your password</h1>
      </div>
      <p style="color:#6B7280;">Click the button below to set a new password.
         This link expires in <strong>30 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{reset_link}" style="background:#E8620A;color:#fff;padding:14px 32px;
           border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;">
          Reset Password
        </a>
      </div>
      <p style="color:#9CA3AF;font-size:13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_EMAIL, to_email, msg.as_string())


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
    )
    db.add(user)
    await db.flush()

    # Create empty profile and free subscription
    profile = UserProfile(user_id=user.id)
    subscription = Subscription(user_id=user.id, plan_tier="free")
    db.add(profile)
    db.add(subscription)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "full_name": user.full_name},
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})

    print(f"[REGISTER] Adding welcome email task for {user.email}", flush=True)
    background_tasks.add_task(send_welcome_email, user.email, user.full_name or "")
    print(f"[REGISTER] Task added", flush=True)

    return AuthResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "full_name": user.full_name},
    )


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password", status_code=200)
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Send a password reset link. Always returns 200 to avoid email enumeration."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if user and settings.SMTP_EMAIL:
        token = secrets.token_urlsafe(32)
        _reset_tokens[token] = {
            "email": data.email,
            "expires": datetime.utcnow() + timedelta(minutes=30),
        }
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send_reset_email, data.email, reset_link)

    return {"message": "If this email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=200)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    entry = _reset_tokens.get(data.token)
    if not entry or datetime.utcnow() > entry["expires"]:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    result = await db.execute(select(User).where(User.email == entry["email"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(data.new_password)
    await db.commit()

    # Invalidate token after use
    del _reset_tokens[data.token]

    return {"message": "Password updated successfully"}
