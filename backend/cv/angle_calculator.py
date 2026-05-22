import numpy as np

def calculate_angle(a, b, c):
    """
    Calculates the angle at point 'b' given three points a, b, and c.
    Points are expected as [x, y] coordinates.
    Returns the angle in degrees.
    """
    a = np.array(a) # First point (e.g., Shoulder)
    b = np.array(b) # Mid point (e.g., Elbow)
    c = np.array(c) # End point (e.g., Wrist)

    # Calculate vectors
    ba = a - b
    bc = c - b

    # Calculate cosine of the angle using dot product and magnitudes
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    
    # Clip the value to be within [-1.0, 1.0] to avoid errors due to precision
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    
    # Calculate angle in radians and then convert to degrees
    angle = np.arccos(cosine_angle)
    angle_degrees = np.degrees(angle)
    
    return angle_degrees

def get_landmark_coords(landmark):
    """ Helper to extract x, y from a MediaPipe landmark object """
    return [landmark.x, landmark.y]
