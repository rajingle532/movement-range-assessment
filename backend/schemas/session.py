from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class MeasurementBase(BaseModel):
    joint_name: str
    angle: float
    status: str

class MeasurementCreate(MeasurementBase):
    session_id: int

class Measurement(MeasurementBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class SessionBase(BaseModel):
    patient_id: int
    notes: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: int
    date: datetime
    measurements: List[Measurement] = []

    class Config:
        from_attributes = True
