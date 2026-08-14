import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { caseService, evidenceService, timelineService, contradictionService, hypothesisService, investigationService } from '../../services';
import { Case, Evidence, TimelineEvent, Contradiction, Hypothesis, InvestigationTask } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { FileText, Clock, Users, AlertTriangle, Lightbulb, CheckSquare, ArrowRight } from 'lucide-react';
import { cn } from '../../utils';

export function CaseOverview() {
  const { caseId } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!caseId) return;
    Promise.all([
      caseService.getCaseById(caseId),
      evidenceService.getEvidenceForCase(caseId),
      timelineService.getTimelineForCase(caseId),
      contradictionService.getContradictionsForCase(caseId),
      hypothesisService.getHypothesesForCase(caseId),
      investigationService.getTasksForCase(caseId)
    ]).then(([c, e, t, con, h, tasks]) => {
      setData({ currentCase: c, evidence: e, timeline: t, contradictions: con, hypotheses: h, tasks });
    });
  }, [caseId]);

  if (!data || !data.currentCase) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-surface-hover rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-surface-hover rounded col-span-2"></div><div className="h-2 bg-surface-hover rounded col-span-1"></div></div><div className="h-2 bg-surface-hover rounded"></div></div></div></div>;

  const stats = [
    { label: 'Evidence', value: data.evidence.length, icon: FileText, color: 'text-blue-500' },
    { label: 'Timeline Events', value: data.timeline.length, icon: Clock, color: 'text-purple-500' },
    { label: 'Entities Found', value: 8, icon: Users, color: 'text-indigo-500' }, // Hardcoded for mockup
    { label: 'Contradictions', value: data.contradictions.length, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Hypotheses', value: data.hypotheses.length, icon: Lightbulb, color: 'text-yellow-500' },
    { label: 'Open Tasks', value: data.tasks.filter((t: any) => t.status !== 'Completed').length, icon: CheckSquare, color: 'text-green-500' }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{data.currentCase.name}</h1>
        <p className="text-text-muted leading-relaxed max-w-3xl">{data.currentCase.description}</p>
        <div className="flex gap-4 mt-4">
          <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full border border-primary/20">
            {data.currentCase.status}
          </span>
          <span className={cn(
            "px-3 py-1 text-xs font-medium rounded-full border",
            data.currentCase.priority === 'High' ? "bg-red-500/20 text-red-500 border-red-500/20" : "bg-yellow-500/20 text-yellow-500 border-yellow-500/20"
          )}>
            Priority: {data.currentCase.priority}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="flex flex-col items-center justify-center py-6 hover:-translate-y-1 transition-transform duration-300">
            <s.icon className={cn("w-6 h-6 mb-3", s.color)} />
            <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hypotheses Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Leading Hypotheses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.hypotheses.map((h: Hypothesis) => (
              <div key={h.id} className="p-4 rounded-lg bg-surface/50 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{h.title}</h4>
                  <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-400 rounded-md">
                    {h.confidence}% Conf.
                  </span>
                </div>
                <p className="text-sm text-text-muted">{h.description}</p>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-blue-400">{h.supportingEvidenceIds.length} Supporting</span>
                  <span className="text-red-400">{h.contradictingEvidenceIds.length} Contradicting</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contradictions Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Unresolved Contradictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.contradictions.map((c: Contradiction) => (
              <div key={c.id} className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-red-400 uppercase">{c.conflictType}</span>
                  <span className="text-xs text-text-muted">{c.status}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-surface rounded border border-border/50">
                    <span className="text-text-muted text-xs font-semibold mr-2 block mb-1">EVIDENCE A ({c.sourceAId})</span>
                    {c.statementA}
                  </div>
                  <div className="flex justify-center text-red-500/50 text-xs font-bold">VS</div>
                  <div className="p-2 bg-surface rounded border border-border/50">
                    <span className="text-text-muted text-xs font-semibold mr-2 block mb-1">EVIDENCE B ({c.sourceBId})</span>
                    {c.statementB}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      {/* Recommended Investigation Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-green-500" />
            Recommended Investigation Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.tasks.slice(0, 4).map((t: InvestigationTask) => (
              <div key={t.id} className="flex gap-4 p-4 rounded-lg bg-surface/30 border border-border/50 group cursor-pointer hover:bg-surface/60 transition-colors">
                <div className={cn(
                  "w-1 h-full rounded-full",
                  t.priority === 'High' ? "bg-red-500" : "bg-yellow-500"
                )} />
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">{t.task}</h4>
                  <p className="text-xs text-text-muted line-clamp-2 mb-2">{t.reason}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-primary/70">{t.relatedHypothesisId || t.relatedContradictionId || t.relatedEvidenceId}</span>
                    <span className="flex items-center gap-1 text-text-muted group-hover:text-primary">
                      Action <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}