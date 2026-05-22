from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from typing import List
from backend.database import models
from backend.database.db import get_db
from backend.schemas import patient as schemas

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.post("/", response_model=schemas.Patient)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/", response_model=List[schemas.Patient])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Patient).offset(skip).limit(limit).all()

@router.get("/export/csv")
def export_patients_csv(db: Session = Depends(get_db)):
    patients = db.query(models.Patient).all()
    
    # Create an in-memory string buffer for the CSV data
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Patient ID", "Name", "Age", "Condition", "Registration Date"])
    
    # Write data rows
    for p in patients:
        writer.writerow([p.id, p.name, p.age, p.condition, p.created_at.strftime("%Y-%m-%d")])
    
    # Reset buffer pointer to the beginning
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=patients_directory.csv"}
    )

@router.get("/{patient_id}", response_model=schemas.Patient)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient
