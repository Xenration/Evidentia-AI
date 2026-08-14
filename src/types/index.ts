export interface Case {
  id: string;
  name: string;
  description: string;
  status: 'New' | 'Active' | 'Under Investigation' | 'Pending Review' | 'Closed' | 'Archived';
  priority: 'High' | 'Medium' | 'Low';
  createdDate: string;
  lastUpdated: string;
  evidenceCount: number;
  assignedInvestigators: string[];
}

export interface Evidence {
  id: string;
  fileName: string;
  fileType: string;
  caseId: string;
  uploadedBy: string;
  uploadDate: string;
  processingStatus: 'Uploaded' | 'Queued' | 'Processing' | 'Analyzed' | 'Failed';
  source: string;
  tags: string[];
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
  sourceEvidenceId: string;
  relatedEntityIds: string[];
  location: string;
  confidence: number;
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

export interface Hypothesis {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: 'Active' | 'Discarded' | 'Proven';
  confidence: number;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  relatedEntityIds: string[];
}

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
}
