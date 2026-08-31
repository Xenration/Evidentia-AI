import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import {
  caseService, evidenceService, entityService, timelineService,
  hypothesisService, contradictionService, investigationService,
} from '../../services';
import type { Case, Evidence, Entity, TimelineEvent, Hypothesis, Contradiction, InvestigationTask } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Activity, FileText, Users, Clock, Lightbulb, AlertTriangle, CheckSquare, Plus,
} from 'lucide-react';
import { cn } from '../../utils';

interface LogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  targetId: string;
  icon: typeof Activity;
  color: string;
}

function deriveActivityLog(
  currentCase: Case | undefined,
  evidence: Evidence[],
  entities: Entity[],
  timeline: TimelineEvent[],
  hypotheses: Hypothesis[],
  contradictions: Contradiction[],
  tasks: InvestigationTask[],
): LogEntry[] {
  if (!currentCase) return [];

  const entries: LogEntry[] = [];
  let seq = 0;

  // Case creation
  entries.push({
    id: `log-${seq++}`,
    timestamp: currentCase.createdDate,
    actor: 'System',
    action: 'created Case',
    target: currentCase.name,
    targetId: currentCase.id,
    icon: Plus,
    color: 'text-primary',
  });

  // Evidence uploads
  for (const ev of evidence) {
    entries.push({
      id: `log-${seq++}`,
      timestamp: ev.uploadDate,
      actor: ev.uploadedBy,
      action: 'uploaded Evidence',
      target: ev.fileName,
      targetId: ev.id,
      icon: FileText,
      color: 'text-blue-400',
    });
  }

  // Timeline events extracted
  for (const event of timeline) {
    entries.push({
      id: `log-${seq++}`,
      timestamp: event.timestamp,
      actor: 'System AI',
      action: 'extracted Timeline Event',
      target: event.title,
      targetId: event.id,
      icon: Clock,
      color: 'text-indigo-400',
    });
  }

  // Entity extractions
  for (const entity of entities) {
    entries.push({
      id: `log-${seq++}`,
      timestamp: currentCase.createdDate,
      actor: 'System AI',
      action: 'extracted Entity',
      target: `${entity.name} (${entity.type})`,
      targetId: entity.id,
      icon: Users,
      color: 'text-green-400',
    });
  }

  // Contradiction detections
  for (const c of contradictions) {
    entries.push({
      id: `log-${seq++}`,
      timestamp: currentCase.lastUpdated,
      actor: 'System AI',
      action: 'detected Contradiction',
      target: `${c.conflictType}: ${c.id}`,
      targetId: c.id,
      icon: AlertTriangle,
      color: 'text-red-400',
    });
  }

  // Hypothesis creation
  for (const h of hypotheses) {
    entries.push({
      id: `log-${seq++}`,
      timestamp: currentCase.lastUpdated,
      actor: 'Investigator',
      action: 'created Hypothesis',
      target: h.title,
      targetId: h.id,
      icon: Lightbulb,
      color: 'text-yellow-400',
    });
  }

  // Tasks
  for (const t of tasks) {
    entries.push({
      id: `log-${seq++}`,
      timestamp: currentCase.lastUpdated,
      actor: 'System AI',
      action: 'generated Investigation Task',
      target: t.task,
      targetId: t.id,
      icon: CheckSquare,
      color: 'text-green-400',
    });
  }

  // Sort by timestamp descending
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return entries;
}

export function ActivityLog() {
  const { caseId } = useParams();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId) return;
    Promise.all([
      caseService.getCaseById(caseId),
      evidenceService.getEvidenceForCase(caseId),
      entityService.getEntitiesForCase(caseId),
      timelineService.getTimelineForCase(caseId),
      hypothesisService.getHypothesesForCase(caseId),
      contradictionService.getContradictionsForCase(caseId),
      investigationService.getTasksForCase(caseId),
    ]).then(([c, ev, ent, tl, hyp, con, tasks]) => {
      setEntries(deriveActivityLog(c, ev, ent, tl, hyp, con, tasks));
      setLoading(false);
    });
  }, [caseId]);

  const [filter, setFilter] = useState('All');
  const actionTypes = useMemo(() => {
    const set = new Set(entries.map(e => e.action));
    return ['All', ...Array.from(set)];
  }, [entries]);

  const filtered = useMemo(() => {
 if (filter === 'All') return entries;
   return entries.filter(e => e.action === filter);
 }, [entries, filter]);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Activity Log</h1>
        <p className="text-sm text-text-muted">Chronological record of all actions, uploads, and automated analysis for this case.</p>
      </div>

      <Card className="p-3 flex flex-wrap gap-2 items-center">
        <Activity className="w-4 h-4 text-text-muted" />
        {actionTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              'px-3 py-1 rounded-md text-[11px] font-semibold border transition-all',
              filter === type
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-surface border-border text-text-muted hover:text-white'
            )}
          >
            {type}
          </button>
        ))}
      </Card>

      {loading ? (
        <div className="animate-pulse h-64 bg-surface-hover rounded-xl" />
      ) : (
        <div className="relative border-l-2 border-border ml-6 space-y-0">
          {filtered.map((entry) => {
            const Icon = entry.icon;
            return (
              <div key={entry.id} className="relative flex items-start gap-4 group py-4">
                <div className="absolute -left-[25px] w-10 h-10 bg-surface border-2 border-border rounded-full flex items-center justify-center group-hover:border-primary/50 group-hover:scale-110 transition-all z-10">
                  <Icon className={cn('w-4 h-4', entry.color)} />
                </div>
                <Card className="flex-1 ml-4">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold text-white">{entry.actor}</span>{' '}
                        <span className="text-text-muted">{entry.action}</span>{' '}
                        <span className="font-medium text-primary">{entry.target}</span>
                      </p>
                      <div className="text-[10px] text-text-muted mt-1 font-mono">{entry.targetId}</div>
                    </div>
                    <div className="text-xs text-text-muted whitespace-nowrap shrink-0">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
