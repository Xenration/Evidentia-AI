import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { entityService, evidenceService, timelineService, hypothesisService, caseService } from '../../services';
import type { Entity, Evidence, TimelineEvent, Hypothesis, Case, InvestigationNode, InvestigationEdge } from '../../types';
import { InvestigationBoard } from '../../components/graph/InvestigationBoard';
import { Loader2 } from 'lucide-react';

/**
 * Derives graph nodes and edges from raw case data.
 *
 * This function is case-agnostic: it works with any set of entities,
 * evidence, timeline events, and hypotheses for any case.
 */
function deriveGraphData(
  entities: Entity[],
  evidence: Evidence[],
  timeline: TimelineEvent[],
  hypotheses: Hypothesis[],
): { nodes: InvestigationNode[]; edges: InvestigationEdge[] } {
  const nodes: InvestigationNode[] = [];
  const edges: InvestigationEdge[] = [];
  const edgeSet = new Set<string>();

  const addEdge = (src: string, tgt: string, label: string, type: InvestigationEdge['type']) => {
    const key = `${src}::${tgt}`;
    const revKey = `${tgt}::${src}`;
    if (edgeSet.has(key) || edgeSet.has(revKey)) return;
    edgeSet.add(key);
    edges.push({ id: `e-${edges.length}`, source: src, target: tgt, label, type });
  };

  // Entity nodes
  for (const entity of entities) {
    nodes.push({ id: entity.id, label: entity.name, type: entity.type });
  }

  // Evidence nodes
  for (const ev of evidence) {
    nodes.push({ id: ev.id, label: ev.fileName, type: 'Evidence' });
  }

  // Timeline event nodes
  for (const event of timeline) {
    nodes.push({ id: event.id, label: event.title, type: 'TimelineEvent' });
  }

  // Hypothesis nodes
  for (const h of hypotheses) {
    nodes.push({ id: h.id, label: h.title, type: 'Hypothesis' });
  }

  // Edges: Entity -> Evidence (entity references evidence)
  for (const entity of entities) {
    for (const evidenceId of entity.sourceEvidenceIds) {
      addEdge(entity.id, evidenceId, 'sourced from', 'sourced_from');
    }
  }

  // Edges: Entity <-> Entity (co-mentioned via shared evidence)
  for (const ev of evidence) {
    const connected = entities.filter(e => e.sourceEvidenceIds.includes(ev.id));
    for (let i = 0; i < connected.length; i++) {
      for (let j = i + 1; j < connected.length; j++) {
        addEdge(connected[i].id, connected[j].id, `shared: ${ev.id}`, 'co_mentioned');
      }
    }
  }

  // Edges: TimelineEvent -> Entity (event involves entities)
  for (const event of timeline) {
    for (const entityId of event.relatedEntityIds) {
      addEdge(event.id, entityId, 'involves', 'involves');
    }
    // Also connect to source evidence
    addEdge(event.id, event.sourceEvidenceId, 'sourced from', 'sourced_from');
  }

  // Edges: Hypothesis -> Entity (hypothesis references entities)
  for (const h of hypotheses) {
    for (const entityId of h.relatedEntityIds) {
      addEdge(h.id, entityId, 'references', 'references');
    }
    // Connect to supporting/contradicting evidence
    for (const eid of h.supportingEvidenceIds) {
      addEdge(h.id, eid, 'supports', 'supports');
    }
    for (const eid of h.contradictingEvidenceIds) {
      addEdge(h.id, eid, 'contradicts', 'contradicts');
    }
  }

  return { nodes, edges };
}

export function KnowledgeGraph() {
  const { caseId } = useParams();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId) return;
    setLoading(true);
    Promise.all([
      entityService.getEntitiesForCase(caseId),
      evidenceService.getEvidenceForCase(caseId),
      timelineService.getTimelineForCase(caseId),
      hypothesisService.getHypothesesForCase(caseId),
      caseService.getCaseById(caseId),
    ]).then(([ent, ev, tl, hyp, caseInfo]) => {
      setEntities(ent);
      setEvidence(ev);
      setTimeline(tl);
      setHypotheses(hyp);
      if (caseInfo) setCaseData(caseInfo);
      setLoading(false);
    });
  }, [caseId]);

  const { nodes, edges } = useMemo(
    () => deriveGraphData(entities, evidence, timeline, hypotheses),
    [entities, evidence, timeline, hypotheses],
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-white mb-1">Investigation Board</h1>
        <p className="text-sm text-text-muted">Interactive relationship graph of case entities, evidence, and hypotheses. Drag nodes to rearrange. Scroll to zoom. Click for details.</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center glass-panel rounded-xl border border-border/50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-text-muted">Loading investigation data...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <InvestigationBoard
            nodes={nodes}
            edges={edges}
            entities={entities}
            evidenceItems={evidence}
            timelineEvents={timeline}
            hypotheses={hypotheses}
            caseId={caseId ?? ''}
            caseName={caseData?.name ?? ''}
          />
        </div>
      )}
    </div>
  );
}
