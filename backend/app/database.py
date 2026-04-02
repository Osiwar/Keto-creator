from urllib.parse import urlparse, urlunparse, urlencode, parse_qs
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings


def _build_db_url(url: str):
    """Convert any postgres:// URL to postgresql+asyncpg://, strip libpq params."""
    if url.startswith("sqlite"):
        return url, {}

    # Fix scheme
    url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Strip libpq-specific query params asyncpg doesn't understand (e.g. sslmode)
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    params.pop("sslmode", None)
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    clean_url = urlunparse(parsed._replace(query=clean_query))

    # asyncpg needs ssl=True for remote hosts
    is_local = any(h in url for h in ("localhost", "127.0.0.1"))
    connect_args = {"ssl": True} if not is_local else {}

    return clean_url, connect_args


_db_url, _connect_args = _build_db_url(settings.DATABASE_URL)
engine = create_async_engine(_db_url, echo=False, connect_args=_connect_args)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
