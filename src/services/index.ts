// src/services/index.ts

// ============================================================
// BACKEND API BASE URL
// ============================================================
const API_BASE = 'http://localhost:8000';

// ============================================================
// HELPER: Handle API responses
// ============================================================
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error ${response.status}`);
  }
  // If the response is empty (204 No Content), return null
  if (response.status === 204) {
    return null as T;
  }
  return response.json();
}

// ============================================================
// CASE SERVICE
// ============================================================
export const caseService = {
  getCases: async (): Promise<Case[]> => {
    const res = await fetch(`${API_BASE}/cases`);
    return handleResponse(res);
  },
  
  getCaseById: async (id: string): Promise<Case | undefined> => {
    const res = await fetch(`${API_BASE}/cases/${id}`);
    if (res.status === 404) return undefined;
    return handleResponse(res);
  },
  
  createCase: async (data: Partial<Case>): Promise<Case> => {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  
  updateCase: async (id: string, data: Partial<Case>): Promise<Case> => {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  
  deleteCase: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  }
};

// ============================================================
// EVIDENCE SERVICE - CONNECTED TO BACKEND
// ============================================================
export const evidenceService = {
  // Upload a file to the backend
  uploadEvidence: async (caseId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  // Get all evidence for a specific case
  getEvidenceForCase: async (caseId: string): Promise<Evidence[]> => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`);
    return handleResponse(res);
  },

  // Get a single evidence item by ID
  getEvidenceById: async (id: string): Promise<Evidence | undefined> => {
    const res = await fetch(`${API_BASE}/evidence/${id}`);
    if (res.status === 404) return undefined;
    return handleResponse(res);
  },

  // Trigger AI analysis on an evidence item
  analyzeEvidence: async (evidenceId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}/analyze`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Delete an evidence item
  deleteEvidence: async (evidenceId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  }
};

// ============================================================
// ENTITY SERVICE - FETCHES FROM BACKEND
// ============================================================
export const entityService = {
  getEntitiesForCase: async (caseId: string): Promise<Entity[]> => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/entities`);
    return handleResponse(res);
  },
  
  getEntitiesByEvidence: async (evidenceId: string): Promise<Entity[]> => {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}/entities`);
    return handleResponse(res);
  }
};

// ============================================================
// EVENT / TIMELINE SERVICE - FETCHES FROM BACKEND
// ============================================================
export const timelineService = {
  getTimelineForCase: async (caseId: string): Promise<TimelineEvent[]> => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/events`);
    return handleResponse(res);
  }
};

export const eventService = {
  getEventsForCase: async (caseId: string): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/cases/${caseId}/events`);
    return handleResponse(res);
  }
};

// ============================================================
// HYPOTHESIS SERVICE - TO BE CONNECTED LATER
// ============================================================
// Person B will implement these endpoints. For now, returns mock data.
import { mockHypotheses } from '../mock-data';

export const hypothesisService = {
  getHypothesesForCase: async (caseId: string): Promise<Hypothesis[]> => {
    // TODO: Replace with real API call when Person B builds it
    // const res = await fetch(`${API_BASE}/cases/${caseId}/hypotheses`);
    // return handleResponse(res);
    
    // MOCK DATA FOR NOW
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockHypotheses.filter(h => h.caseId === caseId);
  }
};

// ============================================================
// CONTRADICTION SERVICE - TO BE CONNECTED LATER
// ============================================================
// Person B will implement these endpoints. For now, returns mock data.
import { mockContradictions } from '../mock-data';

export const contradictionService = {
  getContradictionsForCase: async (caseId: string): Promise<Contradiction[]> => {
    // TODO: Replace with real API call when Person B builds it
    // const res = await fetch(`${API_BASE}/cases/${caseId}/contradictions`);
    // return handleResponse(res);
    
    // MOCK DATA FOR NOW
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockContradictions.filter(c => c.caseId === caseId);
  }
};

// ============================================================
// INVESTIGATION TASK SERVICE - TO BE CONNECTED LATER
// ============================================================
import { mockInvestigationTasks } from '../mock-data';

export const investigationService = {
  getTasksForCase: async (caseId: string): Promise<InvestigationTask[]> => {
    // TODO: Replace with real API call
    // const res = await fetch(`${API_BASE}/cases/${caseId}/tasks`);
    // return handleResponse(res);
    
    // MOCK DATA FOR NOW
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockInvestigationTasks.filter(t => t.caseId === caseId);
  }
};

// ============================================================
// GEOGRAPHIC CASE SERVICE - FETCHES FROM BACKEND
// ============================================================
import { mockGeoCases } from '../mock-data';

export const geoCaseService = {
  getGeoCases: async (): Promise<GeoCase[]> => {
    // TODO: Replace with real API call when location endpoints are ready
    // const res = await fetch(`${API_BASE}/cases/geo`);
    // return handleResponse(res);
    
    // MOCK DATA FOR NOW
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockGeoCases;
  },
  
  getGeoCasesForCase: async (caseId: string): Promise<GeoCase[]> => {
    // TODO: Replace with real API call
    // const res = await fetch(`${API_BASE}/cases/${caseId}/locations`);
    // return handleResponse(res);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockGeoCases.filter(g => g.id === caseId);
  }
};

// ============================================================
// OSINT SERVICE - PLACEHOLDER
// ============================================================
export const osintService = {
  searchPerson: async (query: string): Promise<any[]> => {
    // TODO: Implement when OSINT module is ready
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      { id: '1', name: 'John Doe', source: 'Social Media', confidence: 0.75 },
      { id: '2', name: 'Johnathan Doe', source: 'Public Records', confidence: 0.60 },
    ];
  },
  
  searchEmail: async (email: string): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  }
};

// ============================================================
// AI ASSISTANT SERVICE - PLACEHOLDER
// ============================================================
export const aiService = {
  askAssistant: async (caseId: string, question: string): Promise<any> => {
    // TODO: Implement when Assistant module is ready
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      answer: `This is a mock response for: "${question}". The AI Assistant will be connected to the backend soon.`,
      sources: ['Evidence #1', 'Timeline Event #3']
    };
  }
};

// ============================================================
// IMPORT TYPES (must be at the bottom to avoid circular deps)
// ============================================================
import { Case, Evidence, TimelineEvent, Entity, Hypothesis, Contradiction, InvestigationTask, GeoCase } from '../types';