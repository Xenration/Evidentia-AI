# backend/models.py
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class EvidenceStatus(str, enum.Enum):
    UPLOADED = "Uploaded"
    QUEUED = "Queued"
    PROCESSING = "Processing"
    ANALYZED = "Analyzed"
    FAILED = "Failed"

class AssessmentClassification(str, enum.Enum):
    STRONG_SUPPORT = "strong_support"
    MODERATE_SUPPORT = "moderate_support"
    WEAK_SUPPORT = "weak_support"
    NEUTRAL = "neutral"
    WEAK_CONTRADICTION = "weak_contradiction"
    MODERATE_CONTRADICTION = "moderate_contradiction"
    STRONG_CONTRADICTION = "strong_contradiction"

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

# ============================================================
# HYPOTHESIS & EVIDENCE ASSESSMENT MODELS
# ============================================================

class Hypothesis(Base):
    __tablename__ = "hypotheses"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="Active")  # Active, Proven, Discarded
    support_score = Column(Float, default=0.0)  # Normalized relative likelihood percentage (sums to 100.0)
    disconfirmation_penalty = Column(Float, default=0.0)  # ACH disconfirmation penalty
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    assessments = relationship("EvidenceAssessment", back_populates="hypothesis", cascade="all, delete-orphan")
    case = relationship("Case", backref="hypotheses")

class EvidenceAssessment(Base):
    __tablename__ = "evidence_assessments"
    id = Column(Integer, primary_key=True, index=True)
    hypothesis_id = Column(Integer, ForeignKey("hypotheses.id"), nullable=False)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False)
    classification = Column(String, nullable=False)  # strong_support, neutral, strong_contradiction, etc.
    original_classification = Column(String, nullable=True)  # AI's original classification before analyst override
    analyst_override = Column(Boolean, default=False)  # True if overridden by human investigator
    analyst_notes = Column(Text, nullable=True)  # Investigator's justification for override
    reason = Column(Text)
    llm_confidence = Column(Float, default=0.0)
    reliability = Column(Float, default=1.0)

    # Relationships
    hypothesis = relationship("Hypothesis", back_populates="assessments")
    evidence = relationship("Evidence", backref="assessments")


# ============================================================
# CONTRADICTION & INVESTIGATION TASK MODELS
# ============================================================

class Contradiction(Base):
    __tablename__ = "contradictions"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    statement_a = Column(Text, nullable=False)
    source_a_id = Column(String, nullable=True)
    statement_b = Column(Text, nullable=False)
    source_b_id = Column(String, nullable=True)
    conflict_type = Column(String, nullable=False)  # e.g., "Alibi Discrepancy", "Forensic Discrepancy", "Timeline Conflict", "Log Inconsistency"
    confidence = Column(Float, default=90.0)
    status = Column(String, default="Detected")  # Detected, Under Review, Resolved, Dismissed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", backref="contradictions")


class InvestigationTask(Base):
    __tablename__ = "investigation_tasks"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    task = Column(String, nullable=False)
    reason = Column(Text, nullable=True)
    related_hypothesis_id = Column(String, nullable=True)
    related_contradiction_id = Column(String, nullable=True)
    related_evidence_id = Column(String, nullable=True)
    priority = Column(String, default="High")  # High, Medium, Low
    status = Column(String, default="Pending")  # Pending, In Progress, Completed
    assigned_to = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", backref="investigation_tasks")

class Relationship(Base):
    __tablename__ = "relationships"
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    source_entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    target_entity_id = Column(Integer, ForeignKey("entities.id"), nullable=False)
    relation_type = Column(String, nullable=False)  # e.g. "called", "met", "visited", "drove", "accomplice_of", "threatened"
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=True)
    confidence = Column(Float, default=0.90)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case", backref="relationships")
    source_entity = relationship("Entity", foreign_keys=[source_entity_id], backref="outgoing_relationships")
    target_entity = relationship("Entity", foreign_keys=[target_entity_id], backref="incoming_relationships")
    evidence = relationship("Evidence", backref="relationships")