import { mockCases, mockEvidence, mockTimeline, mockEntities, mockHypotheses, mockContradictions, mockInvestigationTasks } from '../mock-data';
import { Case, Evidence, TimelineEvent, Entity, Hypothesis, Contradiction, InvestigationTask } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const caseService = {
  getCases: async (): Promise<Case[]> => {
    await delay(500);
    return mockCases;
  },
  getCaseById: async (id: string): Promise<Case | undefined> => {
    await delay(300);
    return mockCases.find(c => c.id === id);
  }
};

export const evidenceService = {
  getEvidenceForCase: async (caseId: string): Promise<Evidence[]> => {
    await delay(600);
    return mockEvidence.filter(e => e.caseId === caseId);
  },
  getEvidenceById: async (id: string): Promise<Evidence | undefined> => {
    await delay(300);
    return mockEvidence.find(e => e.id === id);
  }
};

export const timelineService = {
  getTimelineForCase: async (caseId: string): Promise<TimelineEvent[]> => {
    await delay(700);
    return mockTimeline.filter(t => t.caseId === caseId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
};

export const entityService = {
  getEntitiesForCase: async (caseId: string): Promise<Entity[]> => {
    await delay(500);
    return mockEntities.filter(e => e.caseId === caseId);
  }
};

export const hypothesisService = {
  getHypothesesForCase: async (caseId: string): Promise<Hypothesis[]> => {
    await delay(400);
    return mockHypotheses.filter(h => h.caseId === caseId);
  }
};

export const contradictionService = {
  getContradictionsForCase: async (caseId: string): Promise<Contradiction[]> => {
    await delay(500);
    return mockContradictions.filter(c => c.caseId === caseId);
  }
};

export const investigationService = {
  getTasksForCase: async (caseId: string): Promise<InvestigationTask[]> => {
    await delay(400);
    return mockInvestigationTasks.filter(t => t.caseId === caseId);
  }
};
