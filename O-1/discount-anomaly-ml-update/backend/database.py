import logging
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

try:
    from backend.config import settings
except ImportError:
    from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dealflow360_db")

Base = declarative_base()

# Attempt PostgreSQL initialization first; fallback to SQLite if connection fails
try:
    logger.info(f"Connecting to PostgreSQL database at {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("Successfully connected to PostgreSQL database!")
except Exception as e:
    logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite local database...")
    engine = create_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False}
    )
    logger.info("Successfully initialized SQLite fallback database!")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
