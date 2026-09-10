# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class EvidenceStatus(str, enum.Enum):
    UPLOADED = "Uploaded"
    QUEUED = "Queued"
    PROCESSING = "Processing"
    ANALYZED = "Analyzed"
    FAILED = "Failed"

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="Active")
    created_by = Column(String, default="current_user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    file_name = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    storage_path = Column(String)
    uploaded_by = Column(String, default="current_user")
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    processing_status = Column(Enum(EvidenceStatus), default=EvidenceStatus.UPLOADED)
    extracted_text = Column(Text, nullable=True)
    source = Column(String, nullable=True)

class Entity(Base):
    __tablename__ = "entities"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    evidence_id = Column(Integer, ForeignKey("evidence.id"))
    type = Column(String)
    name = Column(String, nullable=False)
    confidence = Column(Float, default=0.0)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    evidence_id = Column(Integer, ForeignKey("evidence.id"))
    timestamp = Column(DateTime(timezone=True), nullable=True)
    title = Column(String)
    description = Column(Text)
    location = Column(String, nullable=True)
    confidence = Column(Float, default=0.0)