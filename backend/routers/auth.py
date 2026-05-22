from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(request: LoginRequest):
    if request.email == "therapist@rom.com" and request.password == "password123":
        return {
            "name": "Dr. Rahul Ingle",
            "role": "Chief Therapist",
            "email": request.email,
            "avatar": "RI",
            "token": "fake-jwt-token"
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")
