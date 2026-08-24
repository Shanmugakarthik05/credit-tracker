import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Get the URL from Vercel's environment
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# If we are on Vercel but missing the URL, throw a clear error
if os.getenv("VERCEL") and not SQLALCHEMY_DATABASE_URL:
    raise ValueError("CRITICAL ERROR: DATABASE_URL environment variable is missing in Vercel Settings!")

# Fallback for local development
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./credit_tracker.db"

# Fix old postgres:// strings if necessary
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # check_same_thread is only needed for sqlite
    connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
