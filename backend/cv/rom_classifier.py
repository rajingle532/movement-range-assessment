# rom_classifier.py

ROM_STANDARDS = {
    "elbow": {
        "normal": (130, 180),
        "mild": (90, 130),
        "severe": (0, 90)
    },
    "knee": {
        "normal": (120, 180),
        "mild": (80, 120),
        "severe": (0, 80)
    },
    "shoulder": {
        "normal": (150, 180),
        "mild": (100, 150),
        "severe": (0, 100)
    }
}

def classify_rom(joint_name, angle):
    """
    Classifies the ROM status based on clinical standards.
    Returns (status, feedback, color)
    """
    joint = joint_name.lower()
    if joint not in ROM_STANDARDS:
        return "Unknown", "Joint not in database", (255, 255, 255)

    standards = ROM_STANDARDS[joint]
    
    if angle >= standards["normal"][0]:
        return "Normal", "Great movement!", (0, 255, 0) # Green
    elif angle >= standards["mild"][0]:
        return "Mild Restriction", "Keep pushing!", (0, 255, 255) # Yellow/Cyan
    else:
        return "Severe Restriction", "Consult therapist", (0, 0, 255) # Red
