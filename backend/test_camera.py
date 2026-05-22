import cv2

def test_camera():
    # 0 is usually the default webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("Webcam opened successfully. Press 'q' to quit.")

    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()

        if not ret:
            print("Error: Can't receive frame. Exiting...")
            break

        # Display the resulting frame
        cv2.imshow('Webcam Test', frame)

        # 'q' key to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Release the capture and close windows
    cap.release()
    cv2.destroyAllWindows()
    print("Webcam test finished.")

if __name__ == "__main__":
    test_camera()
