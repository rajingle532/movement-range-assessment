from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class PatientBase(BaseModel):
    name: str
    age: int
    condition: str

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
