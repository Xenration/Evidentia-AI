import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { caseService, evidenceService, entityService, timelineService, contradictionService, hypothesisService } from '../../services';
import type { Case } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { FileText, Clock, Users, AlertTriangle, Lightbulb, Download, Eye, BarChart2 } from 'lucide-react';
import { cn } from '../../utils';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  sections: string[];
}

export function CaseReports() {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [entityCount, setEntityCount] = useState(0);
  const [timelineCount, setTimelineCount] = useState(0);
  const [contradictionCount, setContradictionCount] = useState(0);
  const [hypothesisCount, setHypothesisCount] = useState(0);

  useEffect(() => {
    if (!caseId) return;
    Promise.all([
      caseService.getCaseById(caseId),
      evidenceService.getEvidenceForCase(caseId),
      entityService.getEntitiesForCase(caseId),
      timelineService.getTimelineForCase(caseId),
      contradictionService.getContradictionsForCase(caseId),
      hypothesisService.getHypothesesForCase(caseId),
    ]).then(([c, ev, ent, tl, con, hyp]) => {
      if (c) setCaseData(c);
      setEvidenceCount(ev.length);
      setEntityCount(ent.length);
      setTimelineCount(tl.length);
      setContradictionCount(con.length);
      setHypothesisCount(hyp.length);
    });
  }, [caseId]);

  const reports: ReportTemplate[] = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      description: 'High-level overview of the case status, key findings, and recommended next steps.',
      icon: BarChart2,
      color: 'text-primary',
      bgColor: 'bg-primary/10 border-primary/20',
      sections: ['Case Overview', 'Key Statistics', 'Leading Hypothesis', 'Critical Contradictions', 'Recommendations'],
    },
    {
      id: 'evidence-report',
      title: 'Evidence Inventory',
      description: 'Complete catalog of all evidence items, their processing status, and key extracted data.',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      sections: ['Evidence Summary', 'Processing Pipeline Status', 'Evidence by Type', 'Tag Analysis', 'Source Breakdown'],
    },
    {
      id: 'timeline-report',
      title: 'Chronological Timeline',
      description: 'Time-ordered reconstruction of all known events with evidence sourcing.',
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
      sections: ['Event Chronology', 'Time Gaps', 'Location Sequence', 'Confidence Assessment'],
    },
    {
      id: 'entity-report',
      title: 'Entity Analysis',
      description: 'All extracted persons, organizations, locations, vehicles, and events with relationship mapping.',
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      sections: ['Entity Summary by Type', 'Confidence Distribution', 'Cross-Reference Matrix', 'Alias Registry'],
    },
    {
      id: 'contradiction-report',
      title: 'Contradiction Analysis',
      description: 'All detected logical conflicts between evidence sources with resolution status.',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      sections: ['Conflict Summary', 'Resolution Status', 'Impact Assessment', 'Recommended Actions'],
    },
    {
      id: 'hypothesis-report',
      title: 'Hypothesis Evaluation',
      description: 'Competing hypothesis analysis with evidence support matrices and confidence scoring.',
      icon: Lightbulb,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20',
      sections: ['Hypothesis Comparison', 'Evidence Support Matrix', 'Confidence Trends', 'Analysis of Competing Theories'],
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Case Reports</h1>
        <p className="text-sm text-text-muted">Generate and view analytical reports for {caseData?.name ?? 'this case'}.</p>
      </div>

      {caseData && (
        <Card className="p-5 flex flex-wrap gap-6 items-center bg-surface/30">
          <div className="text-sm font-medium text-text-muted">Case Data Available:</div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">{evidenceCount} Evidence</span>
            <span className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-semibold">{entityCount} Entities</span>
            <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">{timelineCount} Timeline Events</span>
            <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">{contradictionCount} Contradictions</span>
            <span className="px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold">{hypothesisCount} Hypotheses</span>
          </div>
          <div className="text-xs text-text-muted">Last updated: {new Date(caseData.lastUpdated).toLocaleString()}</div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map(report => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center border', report.bgColor)}>
                    <Icon className={cn('w-5 h-5', report.color)} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">{report.title}</h3>
                <p className="text-sm text-text-muted mb-4 leading-relaxed">{report.description}</p>

                <div className="space-y-1.5 mb-5">
                  {report.sections.map(section => (
                    <div key={section} className="text-xs text-text-muted flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-border" />
                      {section}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-border/50">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary border border-primary/20 rounded-lg text-xs font-semibold transition-all">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface hover:bg-surface-hover border border-border text-text hover:text-white rounded-lg text-xs font-semibold transition-colors">
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
