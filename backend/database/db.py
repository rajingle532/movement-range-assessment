from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite database file path
SQLALCHEMY_DATABASE_URL = "sqlite:///./rehab_app.db"

# Engine: Database se connect karne wala core component
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal: Har request ke liye ek naya database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: Isse inherit karke hum models banayenge
Base = declarative_base()

# Dependency: API routes mein DB session use karne ke liye
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
