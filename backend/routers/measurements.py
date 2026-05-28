from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import models
from backend.database.db import get_db
from backend.schemas.session import Measurement, MeasurementCreate

router = APIRouter(prefix="/api/measurements", tags=["Measurements"])


@router.post("/", response_model=List[Measurement])
def save_measurements(measurements: List[MeasurementCreate], db: Session = Depends(get_db)):
    """
    Save a batch of joint measurements for a session.
    Called after a live ROM session completes.
    """
    saved = []
    for m in measurements:
        # Verify the session exists
        session = db.query(models.Session).filter(models.Session.id == m.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {m.session_id} not found")

        db_measurement = models.Measurement(**m.model_dump())
        db.add(db_measurement)
        saved.append(db_measurement)

    db.commit()
    for m in saved:
        db.refresh(m)
    return saved


@router.get("/{session_id}", response_model=List[Measurement])
def get_measurements(session_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all joint measurements for a specific session.
    """
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return db.query(models.Measurement).filter(
        models.Measurement.session_id == session_id
    ).all()
