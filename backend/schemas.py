# backend/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ---------- CASE SCHEMAS ----------
class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Active"
    created_by: Optional[str] = "current_user"

class CaseOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# ---------- EVIDENCE SCHEMAS ----------
class EvidenceCreate(BaseModel):
    case_id: int
    file_name: str
    file_type: str
    file_size: int
    storage_path: str
    uploaded_by: str = "current_user"

class EvidenceOut(BaseModel):
    id: int
    case_id: int
    file_name: str
    file_type: str
    file_size: int
    upload_date: datetime
    processing_status: str
    extracted_text: Optional[str] = None
    source: Optional[str] = None

    class Config:
        from_attributes = True

# ---------- ENTITY SCHEMAS ----------
class EntityOut(BaseModel):
    id: int
    type: str
    name: str
    confidence: float
    evidence_id: int

# ---------- EVENT SCHEMAS ----------
class EventOut(BaseModel):
    id: int
    timestamp: Optional[datetime]
    title: str
    description: str
    location: Optional[str]
    confidence: float
    evidence_id: int