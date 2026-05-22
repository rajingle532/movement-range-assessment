import cv2
import base64
import numpy as np

def decode_base64_frame(base64_string):
    """ Converts a base64 encoded string back to an OpenCV image (numpy array). """
    try:
        # Remove header if present (e.g., data:image/jpeg;base64,)
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
            
        encoded_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(encoded_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Error decoding frame: {e}")
        return None

def encode_frame_to_base64(frame):
    """ Converts an OpenCV image back to a base64 string. """
    _, buffer = cv2.imencode('.jpg', frame)
    base64_string = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{base64_string}"
