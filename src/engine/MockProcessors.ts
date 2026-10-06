import { Evidence, Entity, TimelineEvent, Contradiction, InvestigationTask } from '../types';
import { CaseStateEngine } from './CaseStateEngine';

export class MockProcessors {
  static extractEntities(evidence: Evidence): Entity[] {
    const newEntities: Entity[] = [];
    
    // Hardcoded logic to simulate entity extraction for specific new evidence
    if (evidence.fileName.includes('cctv') && evidence.fileName.includes('corridor')) {
      newEntities.push({
        id: `ENT-SIM-${Date.now()}`,
        caseId: evidence.caseId,
        type: 'Person',
        name: 'Unidentified Person (Blue Jacket)',
        aliases: ['Suspect 2'],
        sourceEvidenceIds: [evidence.id],
        confidence: 85
      });
    }

    if (evidence.fileName.includes('financial_transaction.csv')) {
      newEntities.push({
        id: `ENT-SIM-FIN-${Date.now()}`,
        caseId: evidence.caseId,
        type: 'Organization',
        name: 'Offshore Shell Corp XYZ',
        aliases: ['OSC-XYZ'],
        sourceEvidenceIds: [evidence.id],
        confidence: 95
      });
    }

    return newEntities;
  }

  static detectContradictions(evidence: Evidence, engine: CaseStateEngine): Contradiction[] {
    const contradictions: Contradiction[] = [];
    
    if (evidence.fileName.includes('access_log_secondary.csv')) {
      contradictions.push({
        id: `C-SIM-${Date.now()}`,
        caseId: evidence.caseId,
        statementA: 'Primary access logs show Dr. Chen entered Server Room B at 01:15 AM.',
        sourceAId: 'E-002',
        statementB: 'Secondary fire door logs show no entry at 01:15 AM for Dr. Chen.',
        sourceBId: evidence.id,
        conflictType: 'Log Discrepancy',
        confidence: 90,
        status: 'Detected'
      });
    }

    if (evidence.fileName.includes('financial_transaction.csv')) {
      contradictions.push({
        id: `C-SIM-FIN-${Date.now()}`,
        caseId: evidence.caseId,
        statementA: 'Nexus Global Holdings claimed no business with Dr. Chen.',
        sourceAId: 'E-007',
        statementB: 'Financial records show $500k transferred to Offshore Shell Corp XYZ, a known subsidiary of Nexus Global.',
        sourceBId: evidence.id,
        conflictType: 'Financial Discrepancy',
        confidence: 95,
        status: 'Detected'
      });
    }

    return contradictions;
  }

  static generateTasks(contradictions: Contradiction[], evidence: Evidence): InvestigationTask[] {
    const tasks: InvestigationTask[] = [];

    contradictions.forEach(c => {
      tasks.push({
        id: `TSK-SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        caseId: c.caseId,
        task: `Investigate contradiction: ${c.conflictType}`,
        reason: 'Automated task generated due to detected contradiction in new evidence.',
        relatedContradictionId: c.id,
        relatedEvidenceId: evidence.id,
        priority: 'High',
        status: 'Pending'
      });
    });

    return tasks;
  }

  static recalculateHypotheses(evidence: Evidence, engine: CaseStateEngine) {
    const hypotheses = engine.getHypothesesForCase(evidence.caseId);
    
    // Simulate AI modifying hypotheses
    hypotheses.forEach(h => {
      if (evidence.fileName.includes('financial_transaction.csv')) {
        if (h.id === 'H-01') {
          engine.updateHypothesisConfidence(h.id, Math.min(100, h.confidence + 15)); 
        }
      } else {
        // Default CCTV logic
        if (h.id === 'H-01') {
          engine.updateHypothesisConfidence(h.id, Math.max(0, h.confidence - 15)); 
        }
        if (h.id === 'H-02') {
          engine.updateHypothesisConfidence(h.id, Math.min(100, h.confidence + 20)); 
        }
      }
    });
  }
}
