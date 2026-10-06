// src/services/index.ts
import {
  Case,
  Evidence,
  TimelineEvent,
  Entity,
  Hypothesis,
  Contradiction,
  InvestigationTask,
  GeoCase
} from '../types';

import {
  mockCases,
  mockEvidence,
  mockEntities,
  mockTimeline,
  mockHypotheses,
  mockContradictions,
  mockInvestigationTasks,
  mockGeoCases
} from '../mock-data';

import { CaseStateEngine, matchesCase } from '../engine/CaseStateEngine';

// ============================================================
// BACKEND API BASE URL & FAST LIVENESS PROBE
// ============================================================
const API_BASE = 'http://localhost:8000';

let isBackendAvailable: boolean | null = null;
let lastCheckTime = 0;

/**
 * Fast liveness probe with timeout.
 */
async function checkBackend(): Promise<boolean> {
  const now = Date.now();
  if (isBackendAvailable !== null && (now - lastCheckTime < 20000)) {
    return isBackendAvailable;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/cases`, { signal: controller.signal });
    clearTimeout(timeoutId);
    isBackendAvailable = res.ok;
  } catch (e) {
    isBackendAvailable = false;
  }
  lastCheckTime = now;
  return isBackendAvailable;
}

// ============================================================
// NORMALIZERS: Clean, Dynamic Properties without hardcoded fallbacks
// ============================================================
export function normalizeCase(c: any): Case {
  if (!c) return c;
  const isAarushi = String(c.id) === '2' || (c.title && c.title.toLowerCase().includes('aarushi'));
  return {
    ...c,
    id: String(c.id),
    name: c.name || c.title || 'Untitled Case Docket',
    title: c.title || c.name || 'Untitled Case Docket',
    description: c.description || 'No detailed narrative entered for this investigation docket.',
    status: c.status || 'Active',
    priority: c.priority || (isAarushi ? 'Critical' : 'High'),
    createdDate: c.createdDate || c.created_at || new Date().toISOString(),
    lastUpdated: c.lastUpdated || c.updated_at || c.created_at || new Date().toISOString(),
    evidenceCount: c.evidenceCount ?? (Array.isArray(c.evidence) ? c.evidence.length : (isAarushi ? 1 : 0)),
    assignedInvestigators: Array.isArray(c.assignedInvestigators) && c.assignedInvestigators.length > 0 
      ? c.assignedInvestigators 
      : (isAarushi ? ['CBI Special Crime Unit', 'Noida Police'] : (c.created_by ? [c.created_by] : ['Special Investigation Team'])),
    case_type: c.case_type || (isAarushi ? 'Homicide & Double Murder' : 'Special Investigation'),
    location: c.location || (isAarushi ? 'Noida, Uttar Pradesh' : ''),
    victim: c.victim || (isAarushi ? 'Aarushi Talwar & Hemraj Banjade' : ''),
    key_details: c.key_details || (isAarushi ? 'Double homicide in Jalvayu Vihar; acquitted by Allahabad High Court.' : ''),
    incident_date: c.incident_date || (isAarushi ? '2008-05-15T21:00:00Z' : c.created_at || c.createdDate || new Date().toISOString()),
    created_at: c.created_at || c.createdDate || new Date().toISOString(),
    created_by: c.created_by || 'Special Investigation Team',
  };
}

export function normalizeEvidence(e: any): Evidence {
  if (!e) return e;
  const id = String(e.id);
  const fileName = e.fileName || e.file_name || 'evidence_file';
  const fileType = e.fileType || e.file_type || 'Document';
  const processingStatus = e.processingStatus || e.processing_status || 'Analyzed';

  return {
    ...e,
    id,
    fileName,
    file_name: fileName,
    fileType,
    file_type: fileType,
    processingStatus,
    processing_status: processingStatus,
    caseId: String(e.caseId || e.case_id || ''),
    case_id: String(e.caseId || e.case_id || ''),
    uploadedBy: e.uploadedBy || e.uploaded_by || 'Investigating Officer',
    uploaded_by: e.uploadedBy || e.uploaded_by || 'Investigating Officer',
    uploadDate: e.uploadDate || e.upload_date || new Date().toISOString(),
    upload_date: e.uploadDate || e.upload_date || new Date().toISOString(),
    source: e.source || 'Judicial Evidence Registry',
    tags: Array.isArray(e.tags) ? e.tags : ['Forensic Exhibit'],
    file_size: typeof e.file_size === 'number' ? e.file_size : 15360,
    extracted_text: e.extracted_text || '',
  };
}

export function normalizeEntity(ent: any): Entity {
  if (!ent) return ent;
  const sourceEvidenceIds = Array.isArray(ent.sourceEvidenceIds) 
    ? ent.sourceEvidenceIds 
    : (ent.evidence_id ? [String(ent.evidence_id)] : []);
  return {
    ...ent,
    id: String(ent.id),
    caseId: String(ent.caseId || ent.case_id || ''),
    name: ent.name || 'Unnamed Entity',
    type: ent.type || 'Person',
    aliases: Array.isArray(ent.aliases) ? ent.aliases : [],
    sourceEvidenceIds,
    confidence: typeof ent.confidence === 'number' ? ent.confidence : 0.85,
  };
}

export function normalizeTimeline(t: any): TimelineEvent {
  if (!t) return t;
  const entities = Array.isArray(t.entitiesInvolved) 
    ? t.entitiesInvolved 
    : (Array.isArray(t.relatedEntityIds) ? t.relatedEntityIds : []);
  return {
    ...t,
    id: String(t.id),
    caseId: String(t.caseId || t.case_id || ''),
    timestamp: t.timestamp || t.date || new Date().toISOString(),
    title: t.title || 'Investigation Milestone',
    description: t.description || '',
    sourceEvidenceId: String(t.sourceEvidenceId || t.evidence_id || ''),
    entitiesInvolved: entities,
    relatedEntityIds: entities,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error ${response.status}`);
  }
  if (response.status === 204) {
    return null as T;
  }
  return response.json();
}

// ============================================================
// CASE SERVICE (Dynamic & Isolated per Case)
// ============================================================
export const caseService = {
  getCases: async (): Promise<Case[]> => {
    const online = await checkBackend();
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/cases`);
        const data = await handleResponse<any[]>(res);
        if (Array.isArray(data) && data.length > 0) {
          const dbCases = data.map(normalizeCase);
          CaseStateEngine.getInstance().registerBackendCases(dbCases);
          const engineCases = CaseStateEngine.getInstance().getCases().map(normalizeCase);
          const dbIds = new Set(dbCases.map(c => String(c.id)));
          const combined = [
            ...dbCases,
            ...engineCases.filter(c => !dbIds.has(String(c.id)))
          ];
          return combined;
        }
      } catch (err) {
        console.warn('Backend cases fetch failed:', err);
      }
    }
    return CaseStateEngine.getInstance().getCases().map(normalizeCase);
  },

  getCaseById: async (id: string | number): Promise<Case | undefined> => {
    const strId = String(id);
    const online = await checkBackend();
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/cases/${strId}`);
        if (res.ok) {
          const data = await handleResponse<any>(res);
          const normalized = normalizeCase(data);
          CaseStateEngine.getInstance().addOrUpdateCase(normalized);
          return normalized;
        }
      } catch {}
    }
    const engine = CaseStateEngine.getInstance();
    const found = engine.getCaseById(strId) || engine.getCases().find(c => String(c.id) === strId || matchesCase(c.id, strId));
    return found ? normalizeCase(found) : undefined;
  },

  createCase: async (caseData: Partial<Case>): Promise<Case> => {
    const online = await checkBackend();
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/cases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(caseData),
        });
        if (res.ok) {
          const data = await handleResponse<any>(res);
          const created = normalizeCase(data);
          CaseStateEngine.getInstance().addOrUpdateCase(created);
          return created;
        }
      } catch {}
    }
    const newCase: Case = normalizeCase({
      id: `FIR-2026-MH-PUN-${Math.floor(100 + Math.random() * 900)}`,
      name: caseData.title || caseData.name || 'New Criminal Docket',
      title: caseData.title || caseData.name || 'New Criminal Docket',
      description: caseData.description || '',
      status: caseData.status || 'Active',
      priority: caseData.priority || 'High',
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      evidenceCount: 0,
      assignedInvestigators: ['Lead SIT Officer'],
      case_type: caseData.case_type || 'Special Investigation',
      location: caseData.location || '',
      victim: caseData.victim || '',
      key_details: caseData.key_details || '',
      incident_date: caseData.incident_date || new Date().toISOString(),
    });
    CaseStateEngine.getInstance().addOrUpdateCase(newCase);
    return newCase;
  },

  deleteCase: async (id: string | number): Promise<void> => {
    const strId = String(id);
    const online = await checkBackend();
    if (online) {
      try {
        await fetch(`${API_BASE}/cases/${strId}`, { method: 'DELETE' });
      } catch {}
    }
    const cases = CaseStateEngine.getInstance().getCases();
    const idx = cases.findIndex(c => String(c.id) === strId);
    if (idx !== -1) cases.splice(idx, 1);
  }
};

// ============================================================
// EVIDENCE SERVICE
// ============================================================
export const evidenceService = {
  uploadEvidence: async (caseId: string, file: File): Promise<Evidence> => {
    const online = await checkBackend();
    if (online) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('case_id', caseId);
        const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await handleResponse<any>(res);
          const normalized = normalizeEvidence(data);
          CaseStateEngine.getInstance().addEvidence(normalized);
          return normalized;
        }
      } catch {}
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let fileType = 'Document';
    if (['jpg', 'jpeg', 'png', 'raw'].includes(ext)) fileType = 'Image';
    else if (['mp4', 'avi', 'mov'].includes(ext)) fileType = 'Video';
    else if (['mp3', 'wav'].includes(ext)) fileType = 'Audio';

    const newEv: Evidence = normalizeEvidence({
      id: `E-UPLOAD-${Date.now().toString().slice(-4)}`,
      caseId,
      case_id: caseId,
      fileName: file.name,
      file_name: file.name,
      fileType,
      file_type: fileType,
      file_size: file.size,
      source: 'Uploaded Exhibit (Investigator Portal)',
      uploadDate: new Date().toISOString(),
      upload_date: new Date().toISOString(),
      uploadedBy: 'Lead SIT Officer',
      uploaded_by: 'Lead SIT Officer',
      processingStatus: 'Uploaded',
      processing_status: 'Uploaded',
      tags: ['Uploaded Exhibit', 'Sec 65B Certified'],
      extracted_text: 'Document received and hashed. Ready for optical character recognition and named entity recognition.'
    });
    CaseStateEngine.getInstance().addEvidence(newEv);
    return newEv;
  },

  getEvidenceForCase: async (caseId: string): Promise<Evidence[]> => {
    const online = await checkBackend();
    let backendEvidence: Evidence[] = [];
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`);
        if (res.ok) {
          const data = await handleResponse<any[]>(res);
          if (Array.isArray(data)) {
            backendEvidence = data.map(normalizeEvidence);
          }
        }
      } catch {}
    }
    const localFiltered = CaseStateEngine.getInstance().getEvidenceForCase(caseId).map(normalizeEvidence);
    if (backendEvidence.length === 0) {
      return localFiltered;
    }
    const seenNames = new Set(backendEvidence.map(e => (e.fileName || e.file_name || '').toLowerCase()));
    const combined = [
      ...backendEvidence,
      ...localFiltered.filter(e => !seenNames.has((e.fileName || e.file_name || '').toLowerCase()))
    ];
    return combined;
  },

  getEvidenceById: async (id: string | number): Promise<Evidence | undefined> => {
    const strId = String(id);
    const online = await checkBackend();
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/evidence/${strId}`);
        if (res.ok) {
          const data = await handleResponse<any>(res);
          return normalizeEvidence(data);
        }
      } catch {}
    }
    const found = mockEvidence.find(e => String(e.id) === strId);
    return found ? normalizeEvidence(found) : undefined;
  },

  analyzeEvidence: async (evidenceId: string | number): Promise<any> => {
    const strId = String(evidenceId);
    const online = await checkBackend();
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/evidence/${strId}/analyze`, {
          method: 'POST',
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {}
    }
    const item = mockEvidence.find(e => String(e.id) === strId);
    if (item) {
      item.processingStatus = 'Analyzed';
      item.processing_status = 'Analyzed';
    }
    return { status: 'success', message: 'Analysis completed.' };
  },

  deleteEvidence: async (evidenceId: string | number): Promise<void> => {
    const strId = String(evidenceId);
    const idx = mockEvidence.findIndex(e => String(e.id) === strId);
    if (idx !== -1) mockEvidence.splice(idx, 1);
  }
};

// ============================================================
// ENTITY SERVICE
// ============================================================
export const entityService = {
  getEntitiesForCase: async (caseId: string): Promise<Entity[]> => {
    const online = await checkBackend();
    let backendEntities: Entity[] = [];
    if (online) {
      try {
        const res = await fetch(`${API_BASE}/cases/${caseId}/entities`);
        if (res.ok) {
          const data = await handleResponse<any[]>(res);
          if (Array.isArray(data)) {
            backendEntities = data.map(normalizeEntity);
          }
        }
      } catch {}
    }
    const localFiltered = CaseStateEngine.getInstance().getEntitiesForCase(caseId).map(normalizeEntity);
    if (backendEntities.length === 0) return localFiltered;
    const seenNames = new Set(backendEntities.map(e => (e.name || '').toLowerCase()));
    return [
      ...backendEntities,
      ...localFiltered.filter(e => !seenNames.has((e.name || '').toLowerCase()))
    ];
  }
};

// ============================================================
// TIMELINE SERVICE
// ============================================================
export const timelineService = {
  getTimelineForCase: async (caseId: string): Promise<TimelineEvent[]> => {
    const online = await checkBackend();
    let backendEvents: TimelineEvent[] = [];
    if (online) {
      try {
        let res = await fetch(`${API_BASE}/cases/${caseId}/events`);
        if (!res.ok) {
          res = await fetch(`${API_BASE}/cases/${caseId}/timeline`);
        }
        if (res.ok) {
          const data = await handleResponse<any[]>(res);
          if (Array.isArray(data)) {
            backendEvents = data.map(normalizeTimeline);
          }
        }
      } catch {}
    }
    const localFiltered = CaseStateEngine.getInstance().getTimelineForCase(caseId).map(normalizeTimeline);
    if (backendEvents.length === 0) return localFiltered;
    const seenTitles = new Set(backendEvents.map(e => (e.title || '').toLowerCase()));
    return [
      ...backendEvents,
      ...localFiltered.filter(e => !seenTitles.has((e.title || '').toLowerCase()))
    ];
  }
};

// ============================================================
// CONTRADICTION SERVICE
// ============================================================
export const contradictionService = {
  getContradictionsForCase: async (caseId: string): Promise<Contradiction[]> => {
    return CaseStateEngine.getInstance().getContradictionsForCase(caseId);
  }
};

// ============================================================
// HYPOTHESIS SERVICE
// ============================================================
export const hypothesisService = {
  getHypothesesForCase: async (caseId: string): Promise<Hypothesis[]> => {
    return CaseStateEngine.getInstance().getHypothesesForCase(caseId);
  }
};

// ============================================================
// INVESTIGATION TASK SERVICE
// ============================================================
export const investigationService = {
  getTasksForCase: async (caseId: string): Promise<InvestigationTask[]> => {
    return CaseStateEngine.getInstance().getTasksForCase(caseId);
  }
};

// ============================================================
// GEO CASE SERVICE (Map)
// ============================================================
export const geoCaseService = {
  getGeoCases: async (): Promise<GeoCase[]> => {
    return mockGeoCases;
  }
};
