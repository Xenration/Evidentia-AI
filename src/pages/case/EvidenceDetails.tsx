import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { evidenceService } from '../../services';
import { Evidence } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { FileText, ArrowLeft, Loader2, Database, BrainCircuit, Scan, ShieldCheck, Tag, Users, Clock } from 'lucide-react';
import { cn } from '../../utils';

export function EvidenceDetails() {
  const { caseId, evidenceId } = useParams();
  const [evidence, setEvidence] = useState<Evidence | null>(null);

  useEffect(() => {
    if (evidenceId) {
      evidenceService.getEvidenceById(evidenceId).then(e => e && setEvidence(e));
    }
  }, [evidenceId]);

  if (!evidence) return <div className="flex items-center justify-center h-64 text-primary"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  const pipeline = [
    { step: 'Ingestion', status: 'complete', icon: Database },
    { step: 'Classification', status: 'complete', icon: Tag },
    { step: 'Text Extraction (OCR)', status: 'complete', icon: Scan },
    { step: 'Entity Recognition', status: evidence.processingStatus === 'Analyzed' ? 'complete' : 'processing', icon: BrainCircuit },
    { step: 'Analyst Review', status: 'pending', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 pb-20">
      <Link to={`/cases/${caseId}/evidence`} className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /> Back to Evidence List
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-white">{evidence.fileName}</h1>
          </div>
          <div className="text-sm text-text-muted flex gap-4 mt-2">
            <span>ID: <span className="text-text font-mono">{evidence.id}</span></span>
            <span>Type: <span className="text-text">{evidence.fileType}</span></span>
            <span>Source: <span className="text-text">{evidence.source}</span></span>
          </div>
        </div>
        <div className={cn(
          "px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest border shadow-lg",
          evidence.processingStatus === 'Analyzed' ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse"
        )}>
          {evidence.processingStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-border -z-10 -translate-y-1/2 rounded-full" />
                {pipeline.map((p, i) => (
                  <div key={p.step} className="flex flex-col items-center gap-3 relative bg-surface p-2 rounded-lg">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors z-10",
                      p.status === 'complete' ? "bg-green-500/20 border-green-500 text-green-400" :
                      p.status === 'processing' ? "bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse" :
                      "bg-surface border-border text-text-muted"
                    )}>
                      <p.icon className="w-5 h-5" />
                    </div>
                    <span className={cn("text-xs font-semibold whitespace-nowrap", p.status === 'complete' ? 'text-white' : 'text-text-muted')}>
                      {p.step}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Extracted Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {/* Mock data for the extraction view */}
                <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-md text-sm text-blue-400 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Dr. Arthur Chen
                </span>
                <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-md text-sm text-blue-400 flex items-center gap-2">
                  <Users className="w-4 h-4" /> James Smith
                </span>
                <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-md text-sm text-purple-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Aug 8, 2026 14:30
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-text-muted uppercase font-semibold mb-1">Uploaded By</div>
                <div className="text-sm text-white">{evidence.uploadedBy}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted uppercase font-semibold mb-1">Upload Date</div>
                <div className="text-sm text-white">{new Date(evidence.uploadDate).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted uppercase font-semibold mb-1">Tags</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {evidence.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-surface-hover rounded text-xs text-text-muted border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}