from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.database.db import get_db
from backend.database import models
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
import io
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["Reports"])

# Status → colour mapping for the PDF
STATUS_COLORS = {
    "Normal": colors.HexColor("#22c55e"),
    "Mild Restriction": colors.HexColor("#f59e0b"),
    "Severe Restriction": colors.HexColor("#ef4444"),
}


def _draw_divider(c, y, width=170 * mm, x=20 * mm, color=colors.HexColor("#334155")):
    c.setStrokeColor(color)
    c.setLineWidth(0.4)
    c.line(x, y, x + width, y)


@router.get("/{patient_id}")
def download_report(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    sessions = (
        db.query(models.Session)
        .filter(models.Session.patient_id == patient_id)
        .order_by(models.Session.date)
        .all()
    )

    buffer = io.BytesIO()
    page_w, page_h = A4
    margin = 20 * mm

    c = canvas.Canvas(buffer, pagesize=A4)

    def new_page():
        c.showPage()
        return page_h - margin

    # ── Header Banner ────────────────────────────────────────────────────────
    c.setFillColor(colors.HexColor("#070d1a"))
    c.rect(0, page_h - 45 * mm, page_w, 45 * mm, fill=1, stroke=0)

    c.setFillColor(colors.HexColor("#00e5ff"))
    c.setFont("Helvetica-Bold", 20)
    c.drawString(margin, page_h - 22 * mm, "ROM Rehab AI")

    c.setFillColor(colors.white)
    c.setFont("Helvetica", 10)
    c.drawString(margin, page_h - 30 * mm, "Clinical Range of Motion Assessment Report")

    report_date = datetime.now().strftime("%B %d, %Y  %H:%M")
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawRightString(page_w - margin, page_h - 22 * mm, report_date)

    # ── Patient Info Box ─────────────────────────────────────────────────────
    y = page_h - 55 * mm

    c.setFillColor(colors.HexColor("#0f172a"))
    c.roundRect(margin, y - 28 * mm, page_w - 2 * margin, 28 * mm, 4 * mm, fill=1, stroke=0)

    c.setFillColor(colors.HexColor("#00e5ff"))
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin + 5 * mm, y - 7 * mm, "PATIENT PROFILE")

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(margin + 5 * mm, y - 14 * mm, patient.name)

    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#94a3b8"))
    c.drawString(margin + 5 * mm, y - 20 * mm, f"Age: {patient.age} yrs")
    c.drawString(margin + 40 * mm, y - 20 * mm, f"Condition: {patient.condition}")
    reg_date = patient.created_at.strftime("%b %d, %Y") if patient.created_at else "N/A"
    c.drawString(margin + 120 * mm, y - 20 * mm, f"Registered: {reg_date}")

    c.drawString(margin + 5 * mm, y - 26 * mm,
                 f"Total Sessions: {len(sessions)}")

    y -= 34 * mm

    # ── Sessions + Measurements ──────────────────────────────────────────────
    c.setFillColor(colors.HexColor("#00e5ff"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin, y, "SESSION HISTORY & ROM MEASUREMENTS")
    y -= 4 * mm
    _draw_divider(c, y)
    y -= 6 * mm

    if not sessions:
        c.setFillColor(colors.HexColor("#64748b"))
        c.setFont("Helvetica", 9)
        c.drawString(margin, y, "No sessions recorded for this patient yet.")
    else:
        for s_idx, session in enumerate(sessions):
            # Check page space
            if y < 50 * mm:
                y = new_page()

            session_date = session.date.strftime("%b %d, %Y  %H:%M") if session.date else "N/A"

            # Session row header
            c.setFillColor(colors.HexColor("#1e293b"))
            c.rect(margin, y - 8 * mm, page_w - 2 * margin, 8 * mm, fill=1, stroke=0)

            c.setFillColor(colors.HexColor("#00e5ff"))
            c.setFont("Helvetica-Bold", 8)
            c.drawString(margin + 3 * mm, y - 5.5 * mm, f"SESSION {s_idx + 1}")

            c.setFillColor(colors.HexColor("#94a3b8"))
            c.setFont("Helvetica", 8)
            c.drawString(margin + 25 * mm, y - 5.5 * mm, session_date)

            if session.notes:
                # Truncate notes to 80 chars
                note_text = session.notes[:90] + "…" if len(session.notes) > 90 else session.notes
                c.drawString(margin + 75 * mm, y - 5.5 * mm, f"Note: {note_text}")

            y -= 9 * mm

            # Measurements table header
            if session.measurements:
                col_joint = margin + 3 * mm
                col_angle = margin + 65 * mm
                col_status = margin + 105 * mm

                c.setFillColor(colors.HexColor("#475569"))
                c.setFont("Helvetica-Bold", 7)
                c.drawString(col_joint, y - 3 * mm, "JOINT")
                c.drawString(col_angle, y - 3 * mm, "ANGLE (°)")
                c.drawString(col_status, y - 3 * mm, "STATUS")
                y -= 5 * mm

                for m in session.measurements:
                    if y < 40 * mm:
                        y = new_page()

                    # Alternating row bg
                    row_color = colors.HexColor("#0f172a") if session.measurements.index(m) % 2 == 0 else colors.HexColor("#111827")
                    c.setFillColor(row_color)
                    c.rect(margin, y - 6 * mm, page_w - 2 * margin, 6 * mm, fill=1, stroke=0)

                    c.setFillColor(colors.white)
                    c.setFont("Helvetica", 8)
                    c.drawString(col_joint, y - 4 * mm, m.joint_name.capitalize())

                    c.setFillColor(colors.HexColor("#00e5ff"))
                    c.setFont("Helvetica-Bold", 8)
                    c.drawString(col_angle, y - 4 * mm, f"{m.angle:.1f}°")

                    status_color = STATUS_COLORS.get(m.status, colors.HexColor("#94a3b8"))
                    c.setFillColor(status_color)
                    c.setFont("Helvetica-Bold", 7)
                    c.drawString(col_status, y - 4 * mm, m.status or "—")

                    y -= 6.5 * mm
            else:
                c.setFillColor(colors.HexColor("#475569"))
                c.setFont("Helvetica-Oblique", 8)
                c.drawString(margin + 3 * mm, y - 4 * mm, "No measurements recorded for this session.")
                y -= 8 * mm

            y -= 3 * mm  # gap between sessions

    # ── Footer ───────────────────────────────────────────────────────────────
    _draw_divider(c, 18 * mm, color=colors.HexColor("#1e293b"))
    c.setFillColor(colors.HexColor("#475569"))
    c.setFont("Helvetica", 7)
    c.drawString(margin, 13 * mm, "Generated by ROM Rehab AI Platform  •  For clinical use only")
    c.drawRightString(page_w - margin, 13 * mm, f"Patient ID: {patient.id}")

    c.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=rom_report_{patient.id}_{patient.name.replace(' ', '_')}.pdf"}
    )
