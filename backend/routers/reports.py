from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.database import models
from reportlab.pdfgen import canvas
import io

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{patient_id}")
def download_report(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer)
    c.drawString(100, 800, f"ROM Assessment Report")
    c.drawString(100, 780, f"Patient Name: {patient.name}")
    c.drawString(100, 760, f"Age: {patient.age}")
    c.drawString(100, 740, f"Condition: {patient.condition}")
    
    sessions = db.query(models.Session).filter(models.Session.patient_id == patient_id).all()
    y = 700
    for s in sessions:
        c.drawString(100, y, f"Session Date: {s.date.strftime('%Y-%m-%d %H:%M')}")
        y -= 20
        if y < 50:
            c.showPage()
            y = 800
            
    c.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{patient.id}.pdf"}
    )
