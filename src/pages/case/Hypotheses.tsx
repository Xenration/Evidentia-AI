import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { hypothesisService } from '../../services';
import { Hypothesis } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Lightbulb, CheckCircle2, XCircle, ChevronDown, Plus } from 'lucide-react';
import { cn } from '../../utils';
import { useCaseState } from '../../engine/useCaseState';
import { AnalysisEngine } from '../../engine/AnalysisEngine';

export function Hypotheses() {
  const { caseId } = useParams();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const stateTick = useCaseState();

  useEffect(() => {
    if (caseId) {
      hypothesisService.getHypothesesForCase(caseId).then(setHypotheses);
    }
  }, [caseId, stateTick]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#191410] mb-1">Competing Hypotheses</h1>
          <p className="text-sm text-text-muted">Track multiple theories and evaluate them against available evidence.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              if (caseId) {
                // Simulate processing delay for demo effect
                const btn = document.getElementById('run-ach-btn');
                if (btn) btn.innerHTML = '<span class="animate-pulse">Analyzing Dataset...</span>';
                await new Promise(r => setTimeout(r, 1500));
                await AnalysisEngine.runACHAnalysis(caseId);
                if (btn) btn.innerHTML = 'Run Dataset Analysis';
              }
            }}
            id="run-ach-btn"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors font-medium text-sm shadow-lg shadow-accent/20"
          >
            Run Dataset Analysis
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Hypothesis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {hypotheses.map(h => (
          <Card key={h.id} className={cn(
            "transition-all duration-300 border-t-4",
            h.status === 'Active' ? "border-t-primary shadow-[0_-4px_15px_-3px_rgba(14,165,233,0.15)]" : 
            h.status === 'Discarded' ? "border-t-border opacity-70" : "border-t-green-500"
          )}>
            <CardHeader className="pb-3 border-b-0">
              <div className="flex justify-between items-start w-full mb-3">
                <span className={cn(
                  "px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider border",
                  h.status === 'Active' ? "bg-primary/10 text-primary border-primary/20" : 
                  h.status === 'Discarded' ? "bg-surface-hover text-text-muted border-border" : 
                  "bg-green-500/10 text-green-400 border-green-500/20"
                )}>
                  {h.status}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#191410] bg-[#f5f0e6] px-2.5 py-1 rounded border border-border">
                  <Lightbulb className={cn("w-3.5 h-3.5", h.confidence > 70 ? "text-yellow-400" : "text-text-muted")} />
                  {h.confidence}% Conf
                </span>
              </div>
              <CardTitle className="text-xl text-[#191410] leading-tight">{h.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col h-[calc(100%-6rem)]">
              <p className="text-sm text-text-muted mb-6 leading-relaxed flex-1">
                {h.description}
              </p>

              <div className="space-y-4">
                {/* Supporting Evidence */}
                <div>
                  <div className="flex items-center justify-between text-xs uppercase font-bold text-green-400 mb-2 tracking-wider">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Supporting Evidence</span>
                    <span className="bg-green-400/10 px-2 py-0.5 rounded">{h.supportingEvidenceIds.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {h.supportingEvidenceIds.map(id => (
                      <div key={id} className="text-xs px-3 py-2 rounded bg-surface border border-border/50 text-text font-mono hover:border-green-500/30 transition-colors cursor-pointer flex justify-between group">
                        {id}
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-white -rotate-90" />
                      </div>
                    ))}
                    {h.supportingEvidenceIds.length === 0 && (
                      <div className="text-xs text-text-muted italic px-3 py-2">None identified</div>
                    )}
                  </div>
                </div>

                {/* Contradicting Evidence */}
                <div>
                  <div className="flex items-center justify-between text-xs uppercase font-bold text-red-400 mb-2 tracking-wider">
                    <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Contradicting Evidence</span>
                    <span className="bg-red-400/10 px-2 py-0.5 rounded">{h.contradictingEvidenceIds.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {h.contradictingEvidenceIds.map(id => (
                      <div key={id} className="text-xs px-3 py-2 rounded bg-surface border border-border/50 text-text font-mono hover:border-red-500/30 transition-colors cursor-pointer flex justify-between group">
                        {id}
                        <ChevronDown className="w-3.5 h-3.5 text-text-muted group-hover:text-white -rotate-90" />
                      </div>
                    ))}
                    {h.contradictingEvidenceIds.length === 0 && (
                      <div className="text-xs text-text-muted italic px-3 py-2">None identified</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}