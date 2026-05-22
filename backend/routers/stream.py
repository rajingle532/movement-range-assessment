from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.cv.frame_encoder import decode_base64_frame
from backend.services.cv_service import CVService
import json
import asyncio

router = APIRouter()
cv_service = CVService()

@router.websocket("/ws/stream")
async def stream_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected to live stream")
    
    frame_count = 0
    
    try:
        while True:
            # Receive message from frontend
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                base64_frame = message.get("frame")
            except Exception as e:
                print(f"Error receiving data: {e}")
                break

            if not base64_frame:
                continue

            # Process every 2nd frame to reduce server load
            frame_count += 1
            if frame_count % 2 != 0:
                continue

            # Decode and Process
            try:
                frame = decode_base64_frame(base64_frame)
                if frame is not None:
                    # Run CV Pipeline
                    result = cv_service.process_frame(frame)
                    
                    # Prepare response
                    response = {
                        "angles": result.get("angles", {"elbow": 0, "knee": 0, "shoulder": 0}),
                        "status": result.get("status", {}),
                        "annotated_frame": result.get("annotated_frame"),
                        "timestamp": result.get("timestamp")
                    }
                    
                    await websocket.send_json(response)
            except Exception as e:
                print(f"CV Processing Error: {e}")
                # Don't break the loop on CV error, just continue
                continue
                
    except WebSocketDisconnect:
        print("Client disconnected gracefully")
    except Exception as e:
        print(f"Unexpected WebSocket Error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass
