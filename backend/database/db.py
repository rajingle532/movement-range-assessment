from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Resolve DB path relative to THIS file's directory, not the working directory.
# This eliminates the ambiguity when uvicorn is launched from different directories.
_HERE = os.path.dirname(os.path.abspath(__file__))
_DB_PATH = os.path.join(_HERE, "..", "rehab_app.db")  # backend/../rehab_app.db (project root)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.normpath(_DB_PATH)}"

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
