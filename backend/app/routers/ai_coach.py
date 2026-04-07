import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional
from app.database import get_db, AsyncSessionLocal
from app.models.user import User, UserProfile
from app.models.chat import ChatSession, ChatMessage
from app.middleware.auth_middleware import get_current_user
from app.services.ai_service import stream_chat
from app.config import settings

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None


@router.post("/chat")
async def chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check API key is configured
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="Anthropic API key not configured")

    # Get or create session
    if data.session_id:
        result = await db.execute(
            select(ChatSession)
            .where(ChatSession.id == data.session_id, ChatSession.user_id == current_user.id)
            .options(selectinload(ChatSession.messages))
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = ChatSession(user_id=current_user.id, title=data.message[:50])
        db.add(session)
        await db.flush()
        session.messages = []

    # Get profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    # Build message history
    history = [{"role": m.role, "content": m.content} for m in session.messages]
    history.append({"role": "user", "content": data.message})

    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=data.message)
    db.add(user_msg)
    await db.commit()

    session_id = session.id

    async def generate():
        full_response = ""
        yield f"data: {{\"session_id\": {session_id}}}\n\n"

        try:
            async for chunk in stream_chat(history, profile):
                full_response += chunk
                escaped = chunk.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
                yield f"data: {{\"delta\": \"{escaped}\"}}\n\n"
        except Exception as e:
            error_msg = str(e)[:200]
            yield f"data: {{\"error\": \"{error_msg}\"}}\n\n"
            yield "data: [DONE]\n\n"
            return

        yield "data: [DONE]\n\n"

        # Save assistant message asynchronously
        async def save_response():
            async with AsyncSessionLocal() as save_db:
                assistant_msg = ChatMessage(
                    session_id=session_id,
                    role="assistant",
                    content=full_response,
                )
                save_db.add(assistant_msg)
                await save_db.commit()

        asyncio.create_task(save_response())

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/health")
async def ai_health(current_user: User = Depends(get_current_user)):
    """Diagnostic: check Anthropic key + test a simple non-streaming call."""
    from anthropic import AsyncAnthropic
    key = settings.ANTHROPIC_API_KEY
    if not key:
        return {"status": "error", "reason": "ANTHROPIC_API_KEY not set"}
    try:
        client = AsyncAnthropic(api_key=key)
        msg = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=10,
            messages=[{"role": "user", "content": "Say hi"}],
        )
        return {"status": "ok", "key_prefix": key[:8] + "...", "response": msg.content[0].text}
    except Exception as e:
        return {"status": "error", "reason": str(e)[:300]}


@router.get("/sessions")
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == current_user.id)
    )
    sessions = result.scalars().all()
    return [
        {"id": s.id, "title": s.title, "created_at": s.created_at.isoformat()}
        for s in sessions
    ]
