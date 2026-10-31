import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from app.core.config import settings
from app.core.logging import logger

connect_args = {}
pool_kwargs = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args = {"check_same_thread": False}
    pool_kwargs = {"poolclass": NullPool}

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    future=True,
    **pool_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()

async def init_db():
    """Initializes database tables if they do not exist."""
    async with engine.begin() as conn:
        # For SQLite or PostgreSQL table creation
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully.")

async def reset_db():
    """Drops and re-creates all tables fresh."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema dropped and recreated successfully.")
