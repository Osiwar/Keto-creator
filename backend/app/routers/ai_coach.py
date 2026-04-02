import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User, UserProfile
from app.models.chat import ChatSession, ChatMessage
from app.middleware.auth_middleware import get_current_user
from app.services.ai_service import stream_chat

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
    profile_result = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()

    # Build message history
    history = [{"role": m.role, "content": m.content} for m in session.messages]
    history.append({"role": "user", "content": data.message})

    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=data.message)
    db.add(user_msg)
    await db.commit()

    async def generate():
        full_response = ""
        session_id_str = str(session.id)
        yield f"data: {{\"session_id\": {session.id}}}\n\n"

        async for chunk in stream_chat(history, profile):
            full_response += chunk
            escaped = chunk.replace('"', '\\"').replace('\n', '\\n')
            yield f"data: {{\"delta\": \"{escaped}\"}}\n\n"

        # Save assistant response
        async with db.__class__(db.bind) as save_db:
            pass

        yield f"data: [DONE]\n\n"

        # Save assistant message (fire and forget pattern — save outside stream)
        import asyncio
        async def save_response():
            from app.database import AsyncSessionLocal
            async with AsyncSessionLocal() as save_db:
                assistant_msg = ChatMessage(
                    session_id=session.id,
                    role="assistant",
                    content=full_response,
                )
                save_db.add(assistant_msg)
                await save_db.commit()

        asyncio.create_task(save_response())

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/sessions")
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.user_id == current_user.id)
    )
    sessions = result.scalars().all()
    return [{"id": s.id, "title": s.title, "created_at": s.created_at.isoformat()} for s in sessions]
