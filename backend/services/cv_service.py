import cv2
import mediapipe as mp
import numpy as np
from datetime import datetime
from backend.cv.angle_calculator import calculate_angle
from backend.cv.rom_classifier import classify_rom
from backend.cv.smoother import MovingAverageSmoother
from backend.cv.frame_encoder import encode_frame_to_base64

class CVService:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Smoothers for different joints
        self.smoothers = {
            "elbow": MovingAverageSmoother(window_size=5),
            "knee": MovingAverageSmoother(window_size=5),
            "shoulder": MovingAverageSmoother(window_size=5)
        }

    def process_frame(self, frame):
        if frame is None:
            return None

        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(frame_rgb)

        angles = {"elbow": 0, "knee": 0, "shoulder": 0}
        status = {}
        annotated_base64 = None

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # 1. Draw Skeleton on Frame
            self.mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )

            # 2. Calculate Angles
            # Elbow (Shoulder -> Elbow -> Wrist)
            shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER].y]
            elbow = [landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW].y]
            wrist = [landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST].x, landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST].y]
            
            raw_elbow = calculate_angle(shoulder, elbow, wrist)
            angles["elbow"] = self.smoothers["elbow"].smooth(raw_elbow)
            status["elbow"] = classify_rom("elbow", angles["elbow"])[0]

            # Knee (Hip -> Knee -> Ankle)
            hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[self.mp_pose.PoseLandmark.LEFT_HIP].y]
            knee = [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE].y]
            ankle = [landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE].y]
            
            raw_knee = calculate_angle(hip, knee, ankle)
            angles["knee"] = self.smoothers["knee"].smooth(raw_knee)
            status["knee"] = classify_rom("knee", angles["knee"])[0]

            # Shoulder (Hip -> Shoulder -> Elbow)
            raw_shoulder = calculate_angle(hip, shoulder, elbow)
            angles["shoulder"] = self.smoothers["shoulder"].smooth(raw_shoulder)
            status["shoulder"] = classify_rom("shoulder", angles["shoulder"])[0]

            # 3. Encode Annotated Frame to Base64
            annotated_base64 = encode_frame_to_base64(frame)

        return {
            "angles": {
                "elbow": round(angles["elbow"], 1),
                "knee": round(angles["knee"], 1),
                "shoulder": round(angles["shoulder"], 1)
            },
            "status": status,
            "annotated_frame": annotated_base64,
            "timestamp": datetime.now().isoformat()
        }
