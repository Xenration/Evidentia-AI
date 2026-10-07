# backend/schemas.py
from pydantic import BaseModel
from typing import Optional, List, Union, Any, Dict
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

# ---------- EVIDENCE ASSESSMENT SCHEMAS ----------
class EvidenceAssessmentCreate(BaseModel):
    evidence_id: int
    classification: str  # strong_support, moderate_support, weak_support, neutral, weak_contradiction, moderate_contradiction, strong_contradiction
    reason: Optional[str] = None
    llm_confidence: Optional[float] = 0.0
    reliability: Optional[float] = 1.0
    original_classification: Optional[str] = None
    analyst_override: Optional[bool] = False
    analyst_notes: Optional[str] = None

class EvidenceAssessmentOut(BaseModel):
    id: int
    hypothesis_id: int
    evidence_id: int
    classification: str
    original_classification: Optional[str] = None
    analyst_override: bool = False
    analyst_notes: Optional[str] = None
    reason: Optional[str] = None
    llm_confidence: float = 0.0
    reliability: float = 1.0
    diagnosticity_weight: Optional[float] = 1.0
    diagnosticity_category: Optional[str] = "Medium"
    evidence_file_name: Optional[str] = None
    evidence_file_type: Optional[str] = None

    class Config:
        from_attributes = True

class AssessmentOverrideRequest(BaseModel):
    assessment_id: Optional[int] = None
    hypothesis_id: int
    evidence_id: int
    classification: str
    analyst_notes: Optional[str] = "Investigator analytical adjustment"

# ---------- HYPOTHESIS SCHEMAS ----------
class HypothesisCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Active"
    support_score: Optional[float] = 0.0

class HypothesisOut(BaseModel):
    id: int
    case_id: int
    title: str
    description: Optional[str]
    status: str
    support_score: float
    disconfirmation_penalty: Optional[float] = 0.0
    relative_likelihood: Optional[float] = 0.0
    created_at: Optional[datetime]
    assessment_count: Optional[int] = 0

    class Config:
        from_attributes = True

class HypothesisDetailOut(BaseModel):
    id: int
    case_id: int
    title: str
    description: Optional[str]
    status: str
    support_score: float
    disconfirmation_penalty: Optional[float] = 0.0
    relative_likelihood: Optional[float] = 0.0
    created_at: Optional[datetime]
    assessments: List[EvidenceAssessmentOut] = []

    class Config:
        from_attributes = True

class SensitivityImpactOut(BaseModel):
    evidence_id: int
    file_name: str
    file_type: str
    diagnosticity_score: float
    diagnosticity_category: str  # High, Medium, Low
    is_critical_pivot: bool  # True if excluding this flips top-ranked hypothesis
    top_hypothesis_with: str
    top_hypothesis_without: str
    impact_level: str  # CRITICAL_PIVOT, HIGH_IMPACT, MODERATE_IMPACT, ROBUST_INSENSITIVE
    score_shifts: Dict[str, float] = {}

class SensitivityAnalysisResponse(BaseModel):
    case_id: int
    baseline_ranking: List[HypothesisOut]
    exhibit_impacts: List[SensitivityImpactOut]
    most_critical_evidence_id: Optional[int] = None
    most_critical_evidence_name: Optional[str] = None

# ---------- CONTRADICTION SCHEMAS ----------
class ContradictionCreate(BaseModel):
    statement_a: str
    source_a_id: Optional[Union[str, int]] = None
    statement_b: str
    source_b_id: Optional[Union[str, int]] = None
    conflict_type: str
    confidence: Optional[float] = 90.0
    status: Optional[str] = "Detected"

class ContradictionOut(BaseModel):
    id: int
    case_id: int
    statement_a: str
    source_a_id: Optional[Union[str, int]] = None
    statement_b: str
    source_b_id: Optional[Union[str, int]] = None
    conflict_type: str
    confidence: float
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ---------- INVESTIGATION TASK SCHEMAS ----------
class InvestigationTaskCreate(BaseModel):
    task: str
    reason: Optional[str] = None
    related_hypothesis_id: Optional[Union[str, int]] = None
    related_contradiction_id: Optional[Union[str, int]] = None
    related_evidence_id: Optional[Union[str, int]] = None
    priority: Optional[str] = "High"
    status: Optional[str] = "Pending"
    assigned_to: Optional[str] = None

class InvestigationTaskOut(BaseModel):
    id: int
    case_id: int
    task: str
    reason: Optional[str] = None
    related_hypothesis_id: Optional[Union[str, int]] = None
    related_contradiction_id: Optional[Union[str, int]] = None
    related_evidence_id: Optional[Union[str, int]] = None
    priority: str
    status: str
    assigned_to: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ---------- RELATIONSHIP (SEMANTIC GRAPH) SCHEMAS ----------
class RelationshipCreate(BaseModel):
    source_entity_id: int
    target_entity_id: int
    relation_type: str
    evidence_id: Optional[int] = None
    confidence: Optional[float] = 0.90
    reason: Optional[str] = None

class RelationshipOut(BaseModel):
    id: int
    case_id: int
    source_entity_id: int
    target_entity_id: int
    relation_type: str
    evidence_id: Optional[int] = None
    confidence: float
    reason: Optional[str] = None
    created_at: Optional[datetime] = None

    source_entity_name: Optional[str] = None
    target_entity_name: Optional[str] = None

    class Config:
        from_attributes = True