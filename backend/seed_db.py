import sqlite3
from datetime import datetime, timedelta
import random

def seed_database():
    conn = sqlite3.connect('rehab_app.db')
    cursor = conn.cursor()

    # Clear existing tables to reset cleanly
    cursor.execute("DELETE FROM measurements")
    cursor.execute("DELETE FROM sessions")
    cursor.execute("DELETE FROM patients")
    conn.commit()

    # Define professional patient profiles with clinical conditions
    patients_data = [
        ("Karan Malhotra", 42, "Anterior Cruciate Ligament (ACL) Reconstruction"),
        ("Anjali Mehta", 29, "Adhesive Capsulitis (Frozen Shoulder)"),
        ("Rohan Sen", 61, "Post-Stroke Shoulder Subluxation"),
        ("Dr. Shalini Kapoor", 35, "Lateral Epicondylitis (Tennis Elbow)"),
        ("Vikramaditya Rao", 50, "Knee Osteoarthritis - Osteotomy Recovery")
    ]

    patient_ids = []
    # Insert patients
    for name, age, condition in patients_data:
        created_at = datetime.utcnow() - timedelta(days=random.randint(15, 60))
        cursor.execute(
            "INSERT INTO patients (name, age, condition, created_at) VALUES (?, ?, ?, ?)",
            (name, age, condition, created_at.strftime('%Y-%m-%d %H:%M:%S'))
        )
        patient_ids.append(cursor.lastrowid)

    # Insert historical sessions and measurements for each patient to build beautiful recovery trends
    joints = ["elbow", "knee", "shoulder"]
    
    for idx, p_id in enumerate(patient_ids):
        # Create 4 to 6 historical therapy sessions per patient
        num_sessions = random.randint(4, 6)
        
        # Base ranges of motion depending on joint name
        for s_idx in range(num_sessions):
            session_date = datetime.utcnow() - timedelta(days=(num_sessions - s_idx) * 7)
            notes = f"Progressing session {s_idx + 1}. Patient shows improved compliance and tolerance."
            
            cursor.execute(
                "INSERT INTO sessions (patient_id, date, notes) VALUES (?, ?, ?)",
                (p_id, session_date.strftime('%Y-%m-%d %H:%M:%S'), notes)
            )
            session_id = cursor.lastrowid
            
            # Add measurements for this session
            # Recovery trend: as s_idx increases, range of motion angle increases towards normal range
            for joint in joints:
                if joint == "elbow":
                    # Elbow Flexion normal: ~140-150 degrees
                    base_angle = 80 + (s_idx * 12) + random.randint(-4, 4)
                    angle = min(base_angle, 145)
                    status = "Normal" if angle >= 130 else "Mild Restriction" if angle >= 105 else "Severe Restriction"
                elif joint == "knee":
                    # Knee Flexion normal: ~130-140 degrees
                    base_angle = 75 + (s_idx * 11) + random.randint(-5, 5)
                    angle = min(base_angle, 135)
                    status = "Normal" if angle >= 120 else "Mild Restriction" if angle >= 95 else "Severe Restriction"
                else:
                    # Shoulder Abduction normal: ~170-180 degrees
                    base_angle = 65 + (s_idx * 18) + random.randint(-6, 6)
                    angle = min(base_angle, 175)
                    status = "Normal" if angle >= 150 else "Mild Restriction" if angle >= 110 else "Severe Restriction"
                
                cursor.execute(
                    "INSERT INTO measurements (session_id, joint_name, angle, status, timestamp) VALUES (?, ?, ?, ?, ?)",
                    (session_id, joint, float(angle), status, session_date.strftime('%Y-%m-%d %H:%M:%S'))
                )

    conn.commit()
    
    # Verify seeding
    cursor.execute("SELECT COUNT(*) FROM patients")
    patients_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM sessions")
    sessions_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM measurements")
    measurements_count = cursor.fetchone()[0]
    
    print(f"[SUCCESS] Database seeded successfully!")
    print(f"Total Patients: {patients_count}")
    print(f"Total Sessions: {sessions_count}")
    print(f"Total Measurements: {measurements_count}")
    
    conn.close()

if __name__ == "__main__":
    seed_database()
