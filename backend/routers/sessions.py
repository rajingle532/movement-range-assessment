from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import models
from backend.database.db import get_db
from backend.schemas import session as schemas

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

@router.post("/", response_model=schemas.Session)
def create_session(session: schemas.SessionCreate, db: Session = Depends(get_db)):
    db_session = models.Session(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

# FIX: /details/{session_id} must be registered BEFORE /{patient_id}
# otherwise FastAPI matches "details" as a patient_id integer and returns 422
@router.get("/details/{session_id}", response_model=schemas.Session)
def read_session(session_id: int, db: Session = Depends(get_db)):
    db_session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session

@router.get("/{patient_id}", response_model=List[schemas.Session])
def read_sessions(patient_id: int, db: Session = Depends(get_db)):
    return db.query(models.Session).filter(models.Session.patient_id == patient_id).all()
