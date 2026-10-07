import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { hypothesisService, evidenceService } from '../../services';
import { Hypothesis, EvidenceAssessment, Evidence, SensitivityAnalysisResult, SensitivityImpact } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { 
  Lightbulb, CheckCircle2, XCircle, ChevronDown, ChevronRight, 
  Plus, Sparkles, Loader2, ShieldCheck, AlertTriangle, 
  HelpCircle, Scale, FileText, Database, X, Cpu, ExternalLink,
  GitBranch, ArrowUpRight, Video, Mic, Compass, Sliders, RotateCcw,
  SlidersHorizontal, Check, AlertOctagon, Info
} from 'lucide-react';
import { cn } from '../../utils';
import { useCaseState } from '../../engine/useCaseState';

export function Hypotheses() {
  const { caseId } = useParams<{ caseId: string }>();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [caseEvidence, setCaseEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState<string | null>(null);
  const [expandedHypothesis, setExpandedHypothesis] = useState<string | null>(null);
  
  // Creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  const [creating, setCreating] = useState(false);

  // Sensitivity Analysis (Heuer Step 6) state
  const [isSensitivityOpen, setIsSensitivityOpen] = useState(false);
  const [sensitivityData, setSensitivityData] = useState<SensitivityAnalysisResult | null>(null);
  const [loadingSensitivity, setLoadingSensitivity] = useState(false);
  const [excludedExhibitIds, setExcludedExhibitIds] = useState<number[]>([]);
  const [simulatedScores, setSimulatedScores] = useState<Record<string, any> | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Analyst Override notifications
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const stateTick = useCaseState();

  const loadData = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const [hyps, evs] = await Promise.all([
        hypothesisService.getHypothesesForCase(caseId),
        evidenceService.getEvidenceForCase(caseId)
      ]);
      setHypotheses(hyps);
      setCaseEvidence(evs);
      if (hyps.length > 0 && !expandedHypothesis) {
        setExpandedHypothesis(hyps[0].id);
      }
    } catch (err) {
      console.error('Failed to load hypotheses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId, stateTick]);

  const handleEvaluate = async (hypothesisId: string) => {
    setEvaluating(hypothesisId);
    try {
      const updated = await hypothesisService.evaluateHypothesis(hypothesisId);
      if (updated) {
        await loadData();
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluating(null);
    }
  };

  const handleEvaluateAll = async () => {
    setEvaluating('ALL');
    try {
      for (const h of hypotheses) {
        await hypothesisService.evaluateHypothesis(h.id);
      }
      await loadData();
    } catch (err) {
      console.error('Batch evaluation failed:', err);
    } finally {
      setEvaluating(null);
    }
  };

  const handleRunACHAnalysis = async () => {
    if (!caseId) return;
    setEvaluating('ACH');
    try {
      const results = await hypothesisService.analyzeHypotheses(caseId);
      if (results && results.length > 0) {
        setHypotheses(results);
        if (!expandedHypothesis) setExpandedHypothesis(results[0].id);
        setNotificationMsg({ text: 'True ACH Matrix generated: disconfirmation-first ranking and normalized 100% scores computed.', type: 'success' });
        setTimeout(() => setNotificationMsg(null), 5000);
      } else {
        await loadData();
      }
    } catch (err) {
      console.error('ACH Analysis failed:', err);
    } finally {
      setEvaluating(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId || !newTitle.trim()) return;
    setCreating(true);
    try {
      const created = await hypothesisService.createHypothesis(caseId, {
        title: newTitle.trim(),
        description: newDesc.trim(),
        status: newStatus
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      await loadData();
      handleEvaluate(created.id);
    } catch (err) {
      console.error('Failed to create hypothesis:', err);
    } finally {
      setCreating(false);
    }
  };

  // Analyst Override handler
  const handleOverrideClassification = async (hypothesisId: string | number, evidenceId: string | number, newClassification: string) => {
    if (!caseId) return;
    try {
      await hypothesisService.overrideAssessment(caseId, {
        hypothesis_id: hypothesisId,
        evidence_id: evidenceId,
        classification: newClassification,
        analyst_notes: `Analyst analytical adjustment to ${newClassification.replace('_', ' ')}`
      });
      setNotificationMsg({ 
        text: `Analyst override applied to Exhibit #${evidenceId}. True ACH scores recomputed across all hypotheses.`, 
        type: 'success' 
      });
      setTimeout(() => setNotificationMsg(null), 4000);
      await loadData();
    } catch (err) {
      console.error('Override error:', err);
    }
  };

  // Analyst Reset handler
  const handleResetClassification = async (hypothesisId: string | number, evidenceId: string | number) => {
    if (!caseId) return;
    try {
      await hypothesisService.resetAssessment(caseId, hypothesisId, evidenceId);
      setNotificationMsg({ 
        text: `Exhibit #${evidenceId} restored to AI baseline classification.`, 
        type: 'info' 
      });
      setTimeout(() => setNotificationMsg(null), 4000);
      await loadData();
    } catch (err) {
      console.error('Reset override error:', err);
    }
  };

  // Sensitivity Analysis Open
  const handleOpenSensitivity = async () => {
    if (!caseId) return;
    setIsSensitivityOpen(true);
    setLoadingSensitivity(true);
    try {
      const res = await hypothesisService.getSensitivityAnalysis(caseId);
      setSensitivityData(res);
      setExcludedExhibitIds([]);
      setSimulatedScores(null);
    } catch (err) {
      console.error('Sensitivity analysis error:', err);
    } finally {
      setLoadingSensitivity(false);
    }
  };

  // Sensitivity Interactive Toggle
  const handleToggleExcludeExhibit = async (evId: number | string) => {
    if (!caseId) return;
    const numId = Number(String(evId).replace(/\D/g, ''));
    const nextExcluded = excludedExhibitIds.includes(numId)
      ? excludedExhibitIds.filter(id => id !== numId)
      : [...excludedExhibitIds, numId];
    
    setExcludedExhibitIds(nextExcluded);
    setSimulating(true);
    try {
      const res = await hypothesisService.calculateACHWithExclusions(caseId, nextExcluded);
      if (res && res.hypotheses) {
        setSimulatedScores(res.hypotheses);
      }
    } catch (err) {
      console.error('Interactive exclusion calculation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const getEvidenceIcon = (fileType: string) => {
    const ft = (fileType || '').toLowerCase();
    if (ft.includes('video') || ft.includes('cctv') || ft.includes('mp4')) {
      return <Video className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (ft.includes('audio') || ft.includes('call') || ft.includes('voice')) {
      return <Mic className="w-3.5 h-3.5 text-purple-600" />;
    }
    return <FileText className="w-3.5 h-3.5 text-amber-600" />;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 text-[#191410]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#eae4d9]">
        <div>
          <div className="text-[11px] font-mono tracking-widest text-[#d93829] uppercase font-bold mb-1 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#d93829]" />
            <span>True Heuer ACH Engine • Disconfirmation-First • Diagnosticity Weighted</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#191410]">
            Analysis of Competing Hypotheses (ACH)
          </h1>
          <p className="text-xs text-[#6e665d] mt-1 max-w-3xl">
            Richards J. Heuer's methodology: hypotheses are ranked by the elimination of inconsistencies (disconfirmation), with evidence weighted by diagnosticity. Relative likelihoods are strictly normalized to sum to 100%.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenSensitivity}
            className="flex items-center gap-2 px-4 py-2 bg-[#faf7f2] hover:bg-[#191410] hover:text-white text-[#191410] rounded-full text-xs font-bold transition-all border border-[#d8d0c5] cursor-pointer shadow-xs"
            title="Evaluate how single exhibits influence the overall conclusion (Heuer Step 6)"
          >
            <Sliders className="w-3.5 h-3.5 text-[#d93829]" />
            <span>Sensitivity Analysis</span>
          </button>
          
          <button
            onClick={handleRunACHAnalysis}
            disabled={evaluating !== null}
            className="flex items-center gap-2 px-4 py-2 bg-[#191410] hover:bg-[#2e261f] text-white rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs border border-[#3d332a]"
          >
            {evaluating === 'ACH' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d93829]" /> : <Cpu className="w-3.5 h-3.5 text-[#d93829]" />}
            <span>{evaluating === 'ACH' ? 'Computing ACH Matrix...' : 'Run Dataset Analysis'}</span>
          </button>

          <button
            onClick={handleEvaluateAll}
            disabled={evaluating !== null}
            className="flex items-center gap-2 px-4 py-2 bg-[#fdeee9] hover:bg-[#d93829] text-[#d93829] hover:text-white rounded-full text-xs font-bold transition-all border border-[#f6d0c7] disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {evaluating === 'ALL' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{evaluating === 'ALL' ? 'Evaluating Exhibits...' : 'AI Re-Evaluate All'}</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#d93829] hover:bg-[#bf2b1d] text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Hypothesis</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notificationMsg && (
        <div className={cn(
          "p-3.5 rounded-2xl text-xs font-mono font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-2 border shadow-xs",
          notificationMsg.type === 'success' ? "bg-emerald-50 text-emerald-900 border-emerald-300" : "bg-blue-50 text-blue-900 border-blue-300"
        )}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-stone-400 hover:text-stone-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Heuer ACH Methodology Summary Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#eae4d9] flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[#191410]">ACH Model:</span>
            <span className="text-[#6e665d]">Disconfirmation Dominant ($\exp(-\lambda I)$)</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[#6e665d]">
            <span className="font-bold text-[#191410]">Diagnosticity:</span>
            <span>Uniform evidence counts for little (0.2x); High-variance exhibits weighted up to 2.0x</span>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono font-bold text-[#d93829]">
          <span>Normalized Likelihoods: $\sum = 100\%$</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#d93829] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#8c8276] font-mono">Computing True Heuer ACH Matrix & Diagnosticity Weights...</p>
        </div>
      )}

      {/* Hypotheses List */}
      {!loading && hypotheses.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#eae4d9] bg-white rounded-3xl">
          <Lightbulb className="w-12 h-12 text-[#b0a89d] mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-[#191410]">No Hypotheses Defined Yet</h3>
          <p className="text-xs text-[#6e665d] mt-1">Add a new investigative hypothesis or click "Run Dataset Analysis" above to generate competing theories with Gemini.</p>
        </div>
      )}

      {!loading && hypotheses.length > 0 && (
        <div className="space-y-6">
          {hypotheses.map((h, idx) => {
            const score = h.support_score ?? h.confidence ?? 50;
            const penalty = h.disconfirmation_penalty ?? (h as any).disconfirmationPenalty ?? 0.0;
            const isProven = h.status === 'Proven' || score >= 55;
            const isDiscarded = h.status === 'Discarded' || penalty >= 4.0;
            const isExpanded = expandedHypothesis === h.id;

            // Enrich assessments with caseEvidence metadata & diagnosticity
            const rawAssessments: EvidenceAssessment[] = (h.assessments && h.assessments.length > 0)
              ? h.assessments
              : [
                  ...h.supportingEvidenceIds.map((eid, i) => ({
                    id: `sup-${eid}-${i}`,
                    hypothesis_id: h.id,
                    evidence_id: eid,
                    classification: 'strong_support',
                    reason: 'Forensic exhibit provides direct affirmative corroboration for this hypothesis.',
                    llm_confidence: 0.94
                  } as unknown as EvidenceAssessment)),
                  ...h.contradictingEvidenceIds.map((eid, i) => ({
                    id: `con-${eid}-${i}`,
                    hypothesis_id: h.id,
                    evidence_id: eid,
                    classification: 'strong_contradiction',
                    reason: 'Forensic exhibit presents contradictory alibi or forensic physical discrepancy.',
                    llm_confidence: 0.89
                  } as unknown as EvidenceAssessment))
                ];

            const enriched = rawAssessments.map(a => {
              const strId = String(a.evidence_id || '').replace(/^E-/, '').trim();
              const found = caseEvidence.find(e => 
                String(e.id) === strId || 
                String(e.id) === String(a.evidence_id) ||
                (a.evidence_file_name && (e.fileName === a.evidence_file_name || (e as any).file_name === a.evidence_file_name))
              );
              return {
                ...a,
                evidenceId: found ? String(found.id) : String(a.evidence_id),
                fileName: a.evidence_file_name || found?.fileName || (found as any)?.file_name || `Exhibit #${a.evidence_id}`,
                fileType: found?.fileType || (found as any)?.file_type || 'Document'
              };
            });

            const supporting = enriched.filter(a => (a.classification || '').toLowerCase().includes('support'));
            const contradicting = enriched.filter(a => (a.classification || '').toLowerCase().includes('contradiction'));
            const neutral = enriched.filter(a => 
              !(a.classification || '').toLowerCase().includes('support') && 
              !(a.classification || '').toLowerCase().includes('contradiction')
            );

            return (
              <div 
                key={`${h.id}-${idx}`}
                className={cn(
                  "rounded-3xl bg-white border transition-all overflow-hidden shadow-xs",
                  isProven && "border-emerald-300 ring-1 ring-emerald-400/20",
                  isDiscarded && "border-[#e0d9cf] opacity-85",
                  !isProven && !isDiscarded && "border-[#eae4d9]"
                )}
              >
                {/* Header Card */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white bg-[#191410] px-3 py-1 rounded-full shrink-0">
                        Rank #{idx + 1} • H{idx + 1}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-[#191410]">
                        {h.title}
                      </h3>
                      <span className={cn(
                        "px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0",
                        isProven && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        isDiscarded && "bg-stone-100 text-stone-600 border-stone-200",
                        !isProven && !isDiscarded && "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {h.status || 'Active'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Normalized Relative Likelihood & Disconfirmation Penalty */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-[#8c8276] uppercase tracking-wider font-semibold">
                            <span>Relative Likelihood</span>
                          </div>
                          <div className={cn(
                            "text-lg font-mono font-bold",
                            score >= 40 && "text-emerald-700",
                            score < 40 && score > 10 && "text-amber-700",
                            score <= 10 && "text-rose-700"
                          )}>
                            {score.toFixed(1)}%
                          </div>
                          <div className="text-[10px] font-mono font-semibold text-rose-700">
                            Inconsistency: {penalty.toFixed(1)}
                          </div>
                        </div>

                        <div className="w-20 bg-[#f0ebe1] h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              score >= 40 && "bg-emerald-500",
                              score < 40 && score > 10 && "bg-amber-500",
                              score <= 10 && "bg-rose-500"
                            )}
                            style={{ width: `${Math.max(4, score)}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleEvaluate(h.id)}
                        disabled={evaluating === h.id}
                        className="px-3 py-1.5 rounded-full bg-[#faf7f2] hover:bg-[#d93829] text-[#191410] hover:text-white text-xs font-bold border border-[#eae4d9] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Run AI Neural Evaluation against all case exhibits"
                      >
                        {evaluating === h.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{evaluating === h.id ? 'Evaluating...' : 'AI Evaluate'}</span>
                      </button>

                      <button
                        onClick={() => setExpandedHypothesis(isExpanded ? null : h.id)}
                        className="p-1.5 rounded-full hover:bg-[#faf7f2] text-[#8c8276] hover:text-[#191410] transition-colors cursor-pointer"
                        title="Toggle evidence provenance breakdown"
                      >
                        <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isExpanded && "rotate-180")} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#6e665d] leading-relaxed max-w-4xl mb-3">
                    {h.description}
                  </p>

                  {/* Summary Provenance Bar */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-[#8c8276]">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {supporting.length} Supporting Exhibits
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-rose-700 font-semibold">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      {contradicting.length} Disconfirming / Contradicting
                    </span>
                    {neutral.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-stone-600">
                          {neutral.length} Non-Diagnostic / Neutral
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Evidence Assessment Hierarchy / Provenance Tree */}
                {isExpanded && (
                  <div className="bg-[#faf7f2] border-t border-[#eae4d9] p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-[11px] font-mono tracking-wider text-[#191410] uppercase font-bold flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-[#d93829]" />
                        <span>True ACH Evidence Provenance & Verification Matrix</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8c8276] bg-white px-2.5 py-1 rounded-md border border-[#eae4d9]">
                        Investigators may adjust classifications via dropdown (Analyst Override)
                      </span>
                    </div>

                    {enriched.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#8c8276] bg-white rounded-2xl border border-dashed border-[#eae4d9]">
                        No evidence assessments recorded yet. Click <strong className="text-[#d93829]">AI Evaluate</strong> above to evaluate case exhibits against this hypothesis.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* 1. SUPPORTING EVIDENCE TREE */}
                        <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-emerald-900 tracking-wide uppercase font-mono">
                                Supporting Evidence ({supporting.length})
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-700 font-semibold">Affirmative Corroboration</span>
                          </div>

                          {supporting.length === 0 ? (
                            <p className="text-xs text-[#8c8276] italic pl-8">No positive corroborating exhibits identified in dossier.</p>
                          ) : (
                            <div className="space-y-2.5">
                              {supporting.map((a, i) => (
                                <div
                                  key={a.id || i}
                                  className="group flex flex-col gap-2 p-3.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-500 hover:shadow-xs transition-all"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs text-emerald-600 font-bold shrink-0">
                                        {i === supporting.length - 1 ? '└──' : '├──'}
                                      </span>
                                      <span className="p-1 rounded bg-[#faf7f2] border border-[#eae4d9] shrink-0">
                                        {getEvidenceIcon(a.fileType)}
                                      </span>
                                      <Link
                                        to={`/cases/${caseId}/evidence/${a.evidenceId}`}
                                        className="font-serif font-bold text-sm text-[#191410] hover:text-[#d93829] flex items-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <span>{a.fileName}</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-[#8c8276] hover:text-[#d93829]" />
                                      </Link>
                                    </div>

                                    {/* ACH Controls: Diagnosticity + Analyst Override */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                      {/* Diagnosticity Weighting Badge */}
                                      <span className={cn(
                                        "text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border",
                                        a.diagnosticity_category === 'High' ? "bg-purple-50 text-purple-800 border-purple-200" :
                                        a.diagnosticity_category === 'Low' ? "bg-stone-100 text-stone-600 border-stone-200" :
                                        "bg-blue-50 text-blue-800 border-blue-200"
                                      )}>
                                        {a.diagnosticity_category || 'Medium'} Diagnosticity ({a.diagnosticity_weight?.toFixed(1) || '1.0'}x)
                                      </span>

                                      {/* Classification Dropdown (Analyst Override) */}
                                      <select
                                        value={a.classification}
                                        onChange={(e) => handleOverrideClassification(h.id, a.evidenceId, e.target.value)}
                                        className={cn(
                                          "text-[11px] font-mono font-bold rounded-md px-2 py-1 cursor-pointer border transition-colors",
                                          a.analyst_override 
                                            ? "bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300"
                                            : "bg-[#faf7f2] text-[#191410] border-[#d8d0c5] hover:border-[#d93829]"
                                        )}
                                        title="Investigator classification selector (Analyst Override)"
                                      >
                                        <option value="strong_support">++ Strong Support</option>
                                        <option value="moderate_support">+ Moderate Support</option>
                                        <option value="weak_support">+ Weak Support</option>
                                        <option value="neutral">0 Neutral</option>
                                        <option value="weak_contradiction">- Weak Contradiction</option>
                                        <option value="moderate_contradiction">- Moderate Contradiction</option>
                                        <option value="strong_contradiction">-- Strong Contradiction</option>
                                      </select>

                                      {a.analyst_override && (
                                        <button
                                          onClick={() => handleResetClassification(h.id, a.evidenceId)}
                                          className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 flex items-center gap-1 cursor-pointer"
                                          title={`Reset back to AI baseline judgment (${a.original_classification})`}
                                        >
                                          <RotateCcw className="w-2.5 h-2.5" />
                                          <span>Reset (AI: {a.original_classification?.replace('_', ' ')})</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <p className="text-xs text-[#524b43] pl-6 border-l-2 border-emerald-300 ml-3.5 italic leading-relaxed">
                                    "{a.reason || 'Evidence corroboration analyzed by neural forensic model.'}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 2. CONTRADICTING EVIDENCE TREE (DISCONFIRMATION FOCUS) */}
                        <div className="bg-rose-500/5 rounded-2xl p-4 border border-rose-500/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-rose-500/20 flex items-center justify-center text-rose-700">
                                <XCircle className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-rose-900 tracking-wide uppercase font-mono">
                                Disconfirming / Contradicting Evidence ({contradicting.length})
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-rose-700 font-semibold">Primary Rejection Metric (Heuer ACH)</span>
                          </div>

                          {contradicting.length === 0 ? (
                            <p className="text-xs text-[#8c8276] italic pl-8">No evidentiary contradictions detected for this hypothesis.</p>
                          ) : (
                            <div className="space-y-2.5">
                              {contradicting.map((a, i) => (
                                <div
                                  key={a.id || i}
                                  className="group flex flex-col gap-2 p-3.5 rounded-xl bg-white border border-rose-200 hover:border-rose-500 hover:shadow-xs transition-all"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs text-rose-600 font-bold shrink-0">
                                        {i === contradicting.length - 1 ? '└──' : '├──'}
                                      </span>
                                      <span className="p-1 rounded bg-[#faf7f2] border border-[#eae4d9] shrink-0">
                                        {getEvidenceIcon(a.fileType)}
                                      </span>
                                      <Link
                                        to={`/cases/${caseId}/evidence/${a.evidenceId}`}
                                        className="font-serif font-bold text-sm text-[#191410] hover:text-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <span>{a.fileName}</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-[#8c8276] hover:text-rose-700" />
                                      </Link>
                                    </div>

                                    {/* ACH Controls: Diagnosticity + Analyst Override */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                      {/* Diagnosticity Weighting Badge */}
                                      <span className={cn(
                                        "text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border",
                                        a.diagnosticity_category === 'High' ? "bg-purple-50 text-purple-800 border-purple-200" :
                                        a.diagnosticity_category === 'Low' ? "bg-stone-100 text-stone-600 border-stone-200" :
                                        "bg-blue-50 text-blue-800 border-blue-200"
                                      )}>
                                        {a.diagnosticity_category || 'Medium'} Diagnosticity ({a.diagnosticity_weight?.toFixed(1) || '1.0'}x)
                                      </span>

                                      {/* Classification Dropdown (Analyst Override) */}
                                      <select
                                        value={a.classification}
                                        onChange={(e) => handleOverrideClassification(h.id, a.evidenceId, e.target.value)}
                                        className={cn(
                                          "text-[11px] font-mono font-bold rounded-md px-2 py-1 cursor-pointer border transition-colors",
                                          a.analyst_override 
                                            ? "bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300"
                                            : "bg-[#faf7f2] text-[#191410] border-[#d8d0c5] hover:border-[#d93829]"
                                        )}
                                        title="Investigator classification selector (Analyst Override)"
                                      >
                                        <option value="strong_support">++ Strong Support</option>
                                        <option value="moderate_support">+ Moderate Support</option>
                                        <option value="weak_support">+ Weak Support</option>
                                        <option value="neutral">0 Neutral</option>
                                        <option value="weak_contradiction">- Weak Contradiction</option>
                                        <option value="moderate_contradiction">- Moderate Contradiction</option>
                                        <option value="strong_contradiction">-- Strong Contradiction</option>
                                      </select>

                                      {a.analyst_override && (
                                        <button
                                          onClick={() => handleResetClassification(h.id, a.evidenceId)}
                                          className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 flex items-center gap-1 cursor-pointer"
                                          title={`Reset back to AI baseline judgment (${a.original_classification})`}
                                        >
                                          <RotateCcw className="w-2.5 h-2.5" />
                                          <span>Reset (AI: {a.original_classification?.replace('_', ' ')})</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <p className="text-xs text-[#524b43] pl-6 border-l-2 border-rose-300 ml-3.5 italic leading-relaxed">
                                    "{a.reason || 'Evidence conflict analyzed by neural forensic model.'}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 3. NEUTRAL / NON-DIAGNOSTIC EXHIBITS */}
                        {neutral.length > 0 && (
                          <div className="bg-stone-500/5 rounded-2xl p-4 border border-stone-300/60">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-stone-500/20 flex items-center justify-center text-stone-700">
                                  <HelpCircle className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-xs font-bold text-stone-800 tracking-wide uppercase font-mono">
                                  Neutral / Low Diagnosticity Exhibits ({neutral.length})
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-stone-600 font-semibold">Fits Theories Equally (Counts for Little)</span>
                            </div>

                            <div className="space-y-2.5">
                              {neutral.map((a, i) => (
                                <div
                                  key={a.id || i}
                                  className="group flex flex-col gap-2 p-3.5 rounded-xl bg-white border border-stone-200 hover:border-stone-400 hover:shadow-xs transition-all"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs text-stone-500 font-bold shrink-0">
                                        {i === neutral.length - 1 ? '└──' : '├──'}
                                      </span>
                                      <span className="p-1 rounded bg-[#faf7f2] border border-[#eae4d9] shrink-0">
                                        {getEvidenceIcon(a.fileType)}
                                      </span>
                                      <Link
                                        to={`/cases/${caseId}/evidence/${a.evidenceId}`}
                                        className="font-serif font-bold text-sm text-[#191410] hover:text-[#191410] flex items-center gap-1.5 transition-colors cursor-pointer"
                                      >
                                        <span>{a.fileName}</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-[#8c8276]" />
                                      </Link>
                                    </div>

                                    {/* ACH Controls */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border bg-stone-100 text-stone-600 border-stone-200">
                                        Low Diagnosticity (0.2x)
                                      </span>

                                      <select
                                        value={a.classification}
                                        onChange={(e) => handleOverrideClassification(h.id, a.evidenceId, e.target.value)}
                                        className={cn(
                                          "text-[11px] font-mono font-bold rounded-md px-2 py-1 cursor-pointer border transition-colors",
                                          a.analyst_override 
                                            ? "bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300"
                                            : "bg-[#faf7f2] text-[#191410] border-[#d8d0c5] hover:border-[#d93829]"
                                        )}
                                        title="Investigator classification selector (Analyst Override)"
                                      >
                                        <option value="strong_support">++ Strong Support</option>
                                        <option value="moderate_support">+ Moderate Support</option>
                                        <option value="weak_support">+ Weak Support</option>
                                        <option value="neutral">0 Neutral</option>
                                        <option value="weak_contradiction">- Weak Contradiction</option>
                                        <option value="moderate_contradiction">- Moderate Contradiction</option>
                                        <option value="strong_contradiction">-- Strong Contradiction</option>
                                      </select>

                                      {a.analyst_override && (
                                        <button
                                          onClick={() => handleResetClassification(h.id, a.evidenceId)}
                                          className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 flex items-center gap-1 cursor-pointer"
                                          title={`Reset back to AI baseline judgment (${a.original_classification})`}
                                        >
                                          <RotateCcw className="w-2.5 h-2.5" />
                                          <span>Reset (AI: {a.original_classification?.replace('_', ' ')})</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <p className="text-xs text-[#6e665d] pl-6 border-l-2 border-stone-300 ml-3.5 italic leading-relaxed">
                                    "{a.reason || 'Exhibit does not provide decisive discriminative corroboration or contradiction.'}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SENSITIVITY ANALYSIS (HEUER STEP 6) MODAL / DRAWER */}
      {isSensitivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#eae4d9] space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#eae4d9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#fdeee9] flex items-center justify-center text-[#d93829]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#191410]">Heuer Sensitivity Analysis (Step 6)</h3>
                  <p className="text-xs text-[#6e665d]">
                    Evaluate which single piece of evidence the investigative conclusion hinges upon. If an exhibit's removal flips the #1 hypothesis, it is flagged as a <strong>Critical Pivot</strong>.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSensitivityOpen(false)}
                className="text-[#8c8276] hover:text-[#191410] p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingSensitivity ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#d93829] mx-auto mb-2" />
                <p className="text-xs font-mono text-[#8c8276]">Computing sensitivity matrix across all exhibits...</p>
              </div>
            ) : sensitivityData ? (
              <div className="space-y-5">
                {/* Critical Pivot Banner */}
                {sensitivityData.most_critical_evidence_name ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold font-mono uppercase text-amber-900">
                        Critical Pivot Exhibit Identified
                      </div>
                      <p className="text-xs text-amber-900 mt-0.5">
                        The current top-ranked theory depends critically on exhibit <strong>"{sensitivityData.most_critical_evidence_name}"</strong>. If this single exhibit is excluded or proven deceptive/unreliable, the top hypothesis ranking flips!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold font-mono uppercase text-emerald-900">
                        Robust Investigative Conclusion
                      </div>
                      <p className="text-xs text-emerald-900 mt-0.5">
                        No single exhibit flips the #1 hypothesis if removed. The top theory is corroborated across multiple independent physical, testimonial, and technical exhibits.
                      </p>
                    </div>
                  </div>
                )}

                {/* Simulated Real-Time Scores Banner (if investigator has checked exclusions) */}
                {excludedExhibitIds.length > 0 && simulatedScores && (
                  <div className="p-4 rounded-2xl bg-[#191410] text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Simulated Relative Likelihoods ({excludedExhibitIds.length} Exhibit(s) Excluded)
                      </span>
                      {simulating && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {hypotheses.map(h => {
                        const sim = simulatedScores[h.id] || {};
                        const simScore = sim.support_score ?? 0;
                        return (
                          <div key={h.id} className="p-2.5 rounded-xl bg-[#2e261f] border border-[#4a3f35]">
                            <div className="text-[11px] font-serif font-bold text-white truncate">{h.title}</div>
                            <div className="flex items-center justify-between mt-1 text-xs font-mono">
                              <span className="text-stone-400">Simulated:</span>
                              <span className="font-bold text-amber-400">{simScore.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sensitivity Table */}
                <div className="overflow-x-auto rounded-2xl border border-[#eae4d9]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf7f2] border-b border-[#eae4d9] font-mono text-[11px] text-[#6e665d] uppercase">
                      <tr>
                        <th className="p-3.5">Exclude</th>
                        <th className="p-3.5">Exhibit</th>
                        <th className="p-3.5">Diagnosticity</th>
                        <th className="p-3.5">Sensitivity Impact</th>
                        <th className="p-3.5">Top Hypothesis Without It</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eae4d9]">
                      {sensitivityData.exhibit_impacts.map(imp => {
                        const isExcluded = excludedExhibitIds.includes(Number(imp.evidence_id));
                        return (
                          <tr key={imp.evidence_id} className={cn(
                            "hover:bg-[#faf7f2] transition-colors",
                            isExcluded && "bg-amber-50/50"
                          )}>
                            <td className="p-3.5">
                              <input
                                type="checkbox"
                                checked={isExcluded}
                                onChange={() => handleToggleExcludeExhibit(imp.evidence_id)}
                                className="w-4 h-4 rounded text-[#d93829] cursor-pointer"
                                title="Check to exclude this exhibit and see live score recomputation"
                              />
                            </td>
                            <td className="p-3.5">
                              <div className="font-serif font-bold text-[#191410]">{imp.file_name}</div>
                              <div className="text-[10px] font-mono text-[#8c8276]">{imp.file_type}</div>
                            </td>
                            <td className="p-3.5 font-mono">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                                imp.diagnosticity_category === 'High' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                imp.diagnosticity_category === 'Low' ? "bg-stone-100 text-stone-600 border-stone-200" :
                                "bg-blue-50 text-blue-700 border-blue-200"
                              )}>
                                {imp.diagnosticity_category} ({imp.diagnosticity_score.toFixed(1)}x)
                              </span>
                            </td>
                            <td className="p-3.5">
                              {imp.is_critical_pivot ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 uppercase font-mono">
                                  <AlertOctagon className="w-3 h-3 text-rose-700" /> Critical Pivot
                                </span>
                              ) : imp.impact_level === 'HIGH_IMPACT' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase font-mono">
                                  High Impact (&gt;15% Shift)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-300 uppercase font-mono">
                                  Robust / Insensitive
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 font-serif text-[#524b43]">
                              {imp.top_hypothesis_without}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end pt-3 border-t border-[#eae4d9]">
              <button
                onClick={() => setIsSensitivityOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#191410] hover:bg-[#2e261f] transition-colors cursor-pointer"
              >
                Close Sensitivity View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Hypothesis Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#eae4d9] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#eae4d9]">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#d93829]" />
                <h3 className="font-serif font-bold text-lg text-[#191410]">Create Investigative Hypothesis</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#8c8276] hover:text-[#191410] p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#191410] uppercase mb-1">
                  Hypothesis Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Accused acted under external coercion"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#eae4d9] bg-[#faf7f2] text-sm text-[#191410] focus:outline-hidden focus:ring-2 focus:ring-[#d93829]/20 focus:border-[#d93829]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#191410] uppercase mb-1">
                  Theory Description & Probative Reasoning
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the investigative proposition and how it correlates with known physical/digital exhibits..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#eae4d9] bg-[#faf7f2] text-sm text-[#191410] focus:outline-hidden focus:ring-2 focus:ring-[#d93829]/20 focus:border-[#d93829]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#191410] uppercase mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#eae4d9] bg-[#faf7f2] text-sm text-[#191410] focus:outline-hidden focus:ring-2 focus:ring-[#d93829]/20 focus:border-[#d93829]"
                >
                  <option value="Active">Active Investigation</option>
                  <option value="Proven">Proven / Substantiated</option>
                  <option value="Discarded">Discarded / Disproven</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eae4d9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#8c8276] hover:bg-[#faf7f2] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#d93829] hover:bg-[#bf2b1d] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save & Evaluate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}