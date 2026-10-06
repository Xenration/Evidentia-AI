import { Evidence } from '../types';
import { CaseStateEngine } from './CaseStateEngine';
import { MockProcessors } from './MockProcessors';

export class IntelligencePipeline {
  
  static async processNewEvidence(evidence: Evidence) {
    const engine = CaseStateEngine.getInstance();
    
    // 1. Add Evidence to State
    engine.addEvidence(evidence);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    engine.updateEvidenceStatus(evidence.id, 'Processing');
    
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 2. Entity Extraction
    const newEntities = MockProcessors.extractEntities(evidence);
    newEntities.forEach(e => engine.addEntity(e));

    // 3. Contradiction Detection
    const newContradictions = MockProcessors.detectContradictions(evidence, engine);
    newContradictions.forEach(c => engine.addContradiction(c));

    // 4. Hypothesis Re-evaluation
    MockProcessors.recalculateHypotheses(evidence, engine);

    // 5. Task Generation
    if (newContradictions.length > 0) {
      const newTasks = MockProcessors.generateTasks(newContradictions, evidence);
      newTasks.forEach(t => engine.addTask(t));
    }

    // Mark as Analyzed
    engine.updateEvidenceStatus(evidence.id, 'Analyzed');
  }
}
