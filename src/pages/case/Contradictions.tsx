import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { contradictionService } from '../../services';
import { Contradiction } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../utils';

export function Contradictions() {
  const { caseId } = useParams();
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);

  useEffect(() => {
    if (caseId) {
      contradictionService.getContradictionsForCase(caseId).then(setContradictions);
    }
  }, [caseId]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Contradiction Detection</h1>
        <p className="text-sm text-text-muted">AI-detected logical conflicts between different pieces of evidence.</p>
      </div>

      <div className="grid gap-6">
        {contradictions.map(c => (
          <Card key={c.id} className="border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)] overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-red-500/50 to-orange-500/50" />
            <CardHeader className="bg-red-500/5 border-b border-red-500/10">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{c.conflictType}</CardTitle>
                    <div className="text-xs text-text-muted mt-0.5">ID: {c.id}</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold border border-border bg-surface text-text-muted">
                    {c.confidence}% Confidence
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5",
                    c.status === 'Detected' ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  )}>
                    {c.status === 'Detected' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {c.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
                {/* Evidence A */}
                <div className="md:col-span-2 bg-surface p-4 rounded-lg border border-border relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex justify-between">
                    Statement A
                    <span className="text-text-muted font-mono">{c.sourceAId}</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed">{c.statementA}</p>
                </div>

                {/* VS Badge */}
                <div className="md:col-span-1 flex flex-col items-center justify-center py-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <span className="text-red-500 font-bold text-xs">VS</span>
                  </div>
                  <div className="h-full w-px bg-red-500/20 my-2 hidden md:block" />
                </div>

                {/* Evidence B */}
                <div className="md:col-span-2 bg-surface p-4 rounded-lg border border-border relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50" />
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex justify-between">
                    Statement B
                    <span className="text-text-muted font-mono">{c.sourceBId}</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed">{c.statementB}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border/50 flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-text hover:text-white bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors">
                  Dismiss
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-lg shadow-primary/20 transition-colors">
                  Create Investigation Task
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}