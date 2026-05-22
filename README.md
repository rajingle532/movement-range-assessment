# Movement Range Assessment (ROM) System

An AI-powered Rehabilitation Therapy system designed to assess the Range of Motion (ROM) of patients using Computer Vision and Real-time data streaming.

## 🚀 Overview
This system allows therapists to monitor patient movements in real-time. Using **MediaPipe Pose Estimation**, the application calculates joint angles (e.g., Elbow, Knee, Shoulder) and provides immediate feedback on whether the movement falls within normal or restricted ranges.

## 🏗️ Architecture
- **Frontend**: React 18 (Vite) + Tailwind CSS for a premium, responsive UI.
- **Backend**: FastAPI (Python) handling logic, data persistence, and CV processing.
- **CV Engine**: MediaPipe + OpenCV for real-time skeleton tracking and angle calculation.
- **Streaming**: WebSocket (WS) for low-latency video frame and data exchange.
- **Database**: SQLite with SQLAlchemy ORM.

## 📁 Project Structure
```text
backend/     - FastAPI server, CV engine, and database logic
frontend/    - React application with Tailwind CSS
docs/        - Project documentation and diagrams
```

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📡 WebSocket API
The system uses a WebSocket connection at `ws://localhost:8000/ws/stream` to stream base64 encoded video frames from the frontend to the backend and receive annotated frames with joint data back.

## 📝 API Overview
- `GET /`: Health check
- `POST /api/auth/login`: User authentication
- `GET /api/patients`: List all patients
- `POST /api/sessions/start`: Initialize a new assessment session
- `GET /api/reports/{id}`: Download PDF report
