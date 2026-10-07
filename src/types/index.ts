export interface Case {
  id: string;
  name: string;
  title?: string;
  description: string;
  status: 'New' | 'Active' | 'Under Investigation' | 'Pending Review' | 'Closed' | 'Archived' | string;
  priority: 'High' | 'Medium' | 'Low' | string;
  createdDate: string;
  lastUpdated: string;
  evidenceCount: number;
  assignedInvestigators: string[];
  case_type?: string;
  location?: string;
  victim?: string;
  key_details?: string;
  incident_date?: string;
  created_at?: string;
  created_by?: string;
}

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  caseId: string;
  uploadedBy: string;
  uploadDate: string;
  processingStatus: 'Uploaded' | 'Queued' | 'Processing' | 'Analyzed' | 'Failed' | string;
  source: string;
  tags: string[];
  file_name?: string;
  file_type?: string;
  file_size?: number;
  case_id?: string | number;
  uploaded_by?: string;
  upload_date?: string;
  processing_status?: 'Uploaded' | 'Queued' | 'Processing' | 'Analyzed' | 'Failed' | string;
  extracted_text?: string;
}

export interface Entity {
  id: string;
  caseId: string;
  type: 'Person' | 'Organization' | 'Location' | 'Vehicle' | 'Event' | 'Other';
  name: string;
  aliases: string[];
  sourceEvidenceIds: string[];
  confidence: number;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  title: string;
  description: string;
  sourceEvidenceId?: string;
  relatedEntityIds?: string[];
  entitiesInvolved?: string[];
  location?: string;
  confidence?: number;
}

export interface Contradiction {
  id: string;
  caseId: string;
  statementA: string;
  sourceAId: string;
  statementB: string;
  sourceBId: string;
  conflictType: string;
  confidence: number;
  status: 'Detected' | 'Under Review' | 'Resolved' | 'Dismissed';
}

export type AssessmentClassificationType =
  | 'strong_support'
  | 'moderate_support'
  | 'weak_support'
  | 'neutral'
  | 'weak_contradiction'
  | 'moderate_contradiction'
  | 'strong_contradiction';

export interface EvidenceAssessment {
  id: string | number;
  hypothesis_id?: number;
  hypothesisId?: string | number;
  evidence_id: number;
  evidenceId?: string | number;
  classification: AssessmentClassificationType | string;
  original_classification?: string;
  originalClassification?: string;
  analyst_override?: boolean;
  analystOverride?: boolean;
  analyst_notes?: string;
  analystNotes?: string;
  diagnosticity_weight?: number;
  diagnosticityWeight?: number;
  diagnosticity_category?: 'High' | 'Medium' | 'Low' | string;
  diagnosticityCategory?: 'High' | 'Medium' | 'Low' | string;
  reason?: string;
  llm_confidence?: number;
  llmConfidence?: number;
  reliability?: number;
  evidence_file_name?: string;
  evidenceFileName?: string;
  evidence_file_type?: string;
  evidenceFileType?: string;
}

export interface Hypothesis {
  id: string;
  caseId: string;
  case_id?: number;
  title: string;
  description: string;
  status: 'Active' | 'Discarded' | 'Proven' | string;
  confidence: number;
  support_score?: number;
  disconfirmation_penalty?: number;
  disconfirmationPenalty?: number;
  relative_likelihood?: number;
  relativeLikelihood?: number;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  relatedEntityIds?: string[];
  assessments?: EvidenceAssessment[];
  assessment_count?: number;
  created_at?: string;
}

export interface SensitivityImpact {
  evidence_id: number | string;
  file_name: string;
  file_type: string;
  diagnosticity_score: number;
  diagnosticity_category: 'High' | 'Medium' | 'Low' | string;
  is_critical_pivot: boolean;
  top_hypothesis_with: string;
  top_hypothesis_without: string;
  impact_level: 'CRITICAL_PIVOT' | 'HIGH_IMPACT' | 'MODERATE_IMPACT' | 'ROBUST_INSENSITIVE' | string;
  score_shifts: Record<string, number>;
}

export interface SensitivityAnalysisResult {
  case_id: number | string;
  baseline_ranking: Hypothesis[];
  exhibit_impacts: SensitivityImpact[];
  most_critical_evidence_id?: number | string | null;
  most_critical_evidence_name?: string | null;
}
// --- Geographic Case Map ---

export type CrimeType =
  'Murder' |
  'Theft' |
  'Robbery' |
  'Cybercrime' |
  'Missing Person' |
  'Fraud' |
  'Other';

export type GeoCaseStatus =
  'Active' |
  'Investigating' |
  'Solved' |
  'Closed';

export type Severity =
  'Low' |
  'Medium' |
  'High' |
  'Critical';

export interface GeoCase {
  id: string;
  title: string;
  crimeType: CrimeType;
  location: string;
  latitude: number;
  longitude: number;
  status: GeoCaseStatus;
  severity: Severity;
  evidenceCount: number;
  suspectCount: number;
  witnessCount: number;
}

export type GeoEntityType =
  | 'Case'
  | 'Crime Scene'
  | 'Evidence Location'
  | 'Witness Location'
  | 'Suspect Last Seen'
  | 'CCTV Location'
  | 'Vehicle Location';
  
export interface InvestigationTask {
  id: string;
  caseId: string;
  task: string;
  reason: string;
  relatedHypothesisId?: string;
  relatedContradictionId?: string;
  relatedEvidenceId?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo?: string;
}

// --- Investigation Board / Knowledge Graph ---

export type GraphNodeType =
  | 'Person'
  | 'Organization'
  | 'Location'
  | 'Vehicle'
  | 'Event'
  | 'Other'
  | 'Evidence'
  | 'TimelineEvent'
  | 'Hypothesis';

export interface InvestigationNode {
  id: string;
  label: string;
  type: GraphNodeType;
}

export type EdgeType =
  | 'sourced_from'
  | 'co_mentioned'
  | 'involves'
  | 'references'
  | 'supports'
  | 'contradicts'
  | 'semantic_relation'
  | 'called'
  | 'met'
  | 'visited'
  | 'drove'
  | 'accomplice_of'
  | 'threatened'
  | 'withdrew_funds_at'
  | 'passenger_in'
  | string;

export interface InvestigationEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: EdgeType;
  confidence?: number;
  reason?: string;
}

export interface Relationship {
  id: string;
  caseId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  evidenceId?: string;
  confidence: number;
  reason?: string;
  sourceEntityName?: string;
  targetEntityName?: string;
  createdAt?: string;
}
