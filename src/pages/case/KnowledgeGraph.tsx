import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { CaseStateEngine } from '../../engine/CaseStateEngine';
import type { Entity, Evidence, TimelineEvent, Hypothesis, InvestigationNode, InvestigationEdge } from '../../types';
import { InvestigationBoard } from '../../components/graph/InvestigationBoard';

/**
 * Derives graph nodes and edges from raw case data defensively.
 * Guaranteed never to throw on missing or non-iterable fields.
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
    if (!src || !tgt) return;
    const key = `${src}::${tgt}`;
    const revKey = `${tgt}::${src}`;
    if (edgeSet.has(key) || edgeSet.has(revKey)) return;
    edgeSet.add(key);
    edges.push({ id: `e-${edges.length}`, source: src, target: tgt, label, type });
  };

  // Entity nodes
  for (const entity of (entities || [])) {
    if (!entity) continue;
    nodes.push({ id: String(entity.id), label: entity.name || 'Entity', type: entity.type || 'Person' });
  }

  // Evidence nodes
  for (const ev of (evidence || [])) {
    if (!ev) continue;
    nodes.push({ id: String(ev.id), label: ev.fileName || (ev as any).file_name || 'Evidence', type: 'Evidence' });
  }

  // Timeline event nodes
  for (const event of (timeline || [])) {
    if (!event) continue;
    nodes.push({ id: String(event.id), label: event.title || 'Event', type: 'TimelineEvent' });
  }

  // Hypothesis nodes
  for (const h of (hypotheses || [])) {
    if (!h) continue;
    nodes.push({ id: String(h.id), label: h.title || 'Hypothesis', type: 'Hypothesis' });
  }

  // Edges: Entity -> Evidence (entity references evidence)
  for (const entity of (entities || [])) {
    if (!entity) continue;
    const srcEvs = Array.isArray(entity.sourceEvidenceIds)
      ? entity.sourceEvidenceIds
      : ((entity as any).evidence_id ? [String((entity as any).evidence_id)] : []);
    for (const evidenceId of srcEvs) {
      if (evidenceId) addEdge(String(entity.id), String(evidenceId), 'sourced from', 'sourced_from');
    }
  }

  // Edges: Entity <-> Entity (co-mentioned via shared evidence)
  for (const ev of (evidence || [])) {
    if (!ev) continue;
    const evId = String(ev.id);
    const connected = (entities || []).filter(e => {
      if (!e) return false;
      const ids = Array.isArray(e.sourceEvidenceIds) ? e.sourceEvidenceIds.map(String) : [];
      if ((e as any).evidence_id) ids.push(String((e as any).evidence_id));
      return ids.includes(evId);
    });
    for (let i = 0; i < connected.length; i++) {
      for (let j = i + 1; j < connected.length; j++) {
        addEdge(String(connected[i].id), String(connected[j].id), `shared: ${ev.fileName || evId}`, 'co_mentioned');
      }
    }
  }

  // Edges: TimelineEvent -> Entity (event involves entities)
  for (const event of (timeline || [])) {
    if (!event) continue;
    const entIds = Array.isArray(event.relatedEntityIds)
      ? event.relatedEntityIds
      : (Array.isArray((event as any).entitiesInvolved) ? (event as any).entitiesInvolved : []);
    for (const entityId of entIds) {
      if (entityId) addEdge(String(event.id), String(entityId), 'involves', 'involves');
    }
    // Also connect to source evidence
    const srcEv = event.sourceEvidenceId || (event as any).evidence_id;
    if (srcEv) {
      addEdge(String(event.id), String(srcEv), 'sourced from', 'sourced_from');
    }
  }

  // Edges: Hypothesis -> Entity (hypothesis references entities)
  for (const h of (hypotheses || [])) {
    if (!h) continue;
    const entIds = Array.isArray(h.relatedEntityIds) ? h.relatedEntityIds : [];
    for (const entityId of entIds) {
      if (entityId) addEdge(String(h.id), String(entityId), 'references', 'references');
    }
    const supIds = Array.isArray(h.supportingEvidenceIds) ? h.supportingEvidenceIds : [];
    for (const eid of supIds) {
      if (eid) addEdge(String(h.id), String(eid), 'supports', 'supports');
    }
    const conIds = Array.isArray(h.contradictingEvidenceIds) ? h.contradictingEvidenceIds : [];
    for (const eid of conIds) {
      if (eid) addEdge(String(h.id), String(eid), 'contradicts', 'contradicts');
    }
  }

  return { nodes, edges };
}

export function KnowledgeGraph() {
  const { caseId } = useParams();
  const engine = CaseStateEngine.getInstance();

  const [snapshot, setSnapshot] = useState(() => ({
    entities: caseId ? engine.getEntitiesForCase(caseId) : [],
    evidence: caseId ? engine.getEvidenceForCase(caseId) : [],
    timeline: caseId ? engine.getTimelineForCase(caseId) : [],
    hypotheses: caseId ? engine.getHypothesesForCase(caseId) : [],
    caseData: caseId ? engine.getCaseById(caseId) : null,
  }));

  useEffect(() => {
    if (!caseId) return;

    const updateState = () => {
      setSnapshot({
        entities: engine.getEntitiesForCase(caseId),
        evidence: engine.getEvidenceForCase(caseId),
        timeline: engine.getTimelineForCase(caseId),
        hypotheses: engine.getHypothesesForCase(caseId),
        caseData: engine.getCaseById(caseId) || null,
      });
    };

    // Initial load
    updateState();

    // Subscribe to engine changes
    return engine.subscribe(updateState);
  }, [caseId, engine]);

  const { entities, evidence, timeline, hypotheses, caseData } = snapshot;

  const { nodes, edges } = useMemo(
    () => deriveGraphData(entities, evidence, timeline, hypotheses),
    [entities, evidence, timeline, hypotheses],
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-2xl font-serif font-bold text-[#191410] mb-1">Investigation Board</h1>
        <p className="text-sm text-[#6e665d]">Interactive relationship graph of case entities, evidence, and hypotheses. Drag nodes to rearrange. Scroll to zoom. Click for details.</p>
      </div>

      <div className="flex-1 min-h-0">
        <InvestigationBoard
          nodes={nodes}
          edges={edges}
          entities={entities}
          evidenceItems={evidence}
          timelineEvents={timeline}
          hypotheses={hypotheses}
          caseId={caseId ?? ''}
          caseName={caseData?.title || caseData?.name || ''}
        />
      </div>
    </div>
  );
}
