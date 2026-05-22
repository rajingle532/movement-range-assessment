import cv2
import mediapipe as mp
import numpy as np
from cv.angle_calculator import calculate_angle, get_landmark_coords
from cv.smoother import MovingAverageSmoother
from cv.rom_classifier import classify_rom

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Initialize Smoothers for each joint
elbow_smoother = MovingAverageSmoother(window_size=10)
knee_smoother = MovingAverageSmoother(window_size=10)
shoulder_smoother = MovingAverageSmoother(window_size=10)

def run_rehab_test():
    cap = cv2.VideoCapture(0)
    print("Rehab ROM Assessment started. Press 'q' to quit.")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        try:
            landmarks = results.pose_landmarks.landmark

            # 1. ELBOW
            s = get_landmark_coords(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value])
            e = get_landmark_coords(landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value])
            w = get_landmark_coords(landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value])
            raw_elbow = calculate_angle(s, e, w)
            smooth_elbow = elbow_smoother.smooth(raw_elbow)
            elbow_status, elbow_msg, elbow_color = classify_rom("elbow", smooth_elbow)

            # 2. KNEE
            h = get_landmark_coords(landmarks[mp_pose.PoseLandmark.LEFT_HIP.value])
            k = get_landmark_coords(landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value])
            a = get_landmark_coords(landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value])
            raw_knee = calculate_angle(h, k, a)
            smooth_knee = knee_smoother.smooth(raw_knee)
            knee_status, knee_msg, knee_color = classify_rom("knee", smooth_knee)

            # --- Visualization ---
            # Header Dashboard
            cv2.rectangle(image, (0,0), (400, 150), (30, 30, 30), -1)
            
            # Elbow Stats
            cv2.putText(image, f"ELBOW: {int(smooth_elbow)} deg", (10, 30), 1, 1.2, (255, 255, 255), 1)
            cv2.putText(image, f"STATUS: {elbow_status}", (10, 55), 1, 1.2, elbow_color, 2)
            
            # Knee Stats
            cv2.putText(image, f"KNEE: {int(smooth_knee)} deg", (10, 90), 1, 1.2, (255, 255, 255), 1)
            cv2.putText(image, f"STATUS: {knee_status}", (10, 115), 1, 1.2, knee_color, 2)

            # Overlay on joints
            elbow_px = tuple(np.multiply(e, [640, 480]).astype(int))
            cv2.circle(image, elbow_px, 10, elbow_color, -1)
            
            knee_px = tuple(np.multiply(k, [640, 480]).astype(int))
            cv2.circle(image, knee_px, 10, knee_color, -1)

            # Draw Skeleton
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        except Exception:
            pass

        cv2.imshow('Rehab Intelligence - Phase 3', image)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_rehab_test()
