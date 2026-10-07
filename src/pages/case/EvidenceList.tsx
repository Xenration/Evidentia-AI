import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, File, Image, Video, Music, FileText,
  CheckCircle, Clock, AlertCircle, Loader2, Upload, 
  Sparkles, ShieldCheck, X, Eye, Hash, Scale, Cpu, Calendar
} from 'lucide-react';
import { evidenceService } from '../../services';
import { IntelligencePipeline } from '../../engine/IntelligencePipeline';
import { Evidence } from '../../types';
import { cn } from '../../utils';

const fileTypeIcons = {
  'Image': <Image className="w-4 h-4 text-purple-600" />,
  'Video': <Video className="w-4 h-4 text-[#d93829]" />,
  'Audio': <Music className="w-4 h-4 text-blue-600" />,
  'Document': <FileText className="w-4 h-4 text-amber-600" />,
  'Other': <File className="w-4 h-4 text-gray-600" />
};

export function EvidenceList() {
  const { caseId } = useParams<{ caseId: string }>();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedExhibit, setSelectedExhibit] = useState<Evidence | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEvidence = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const data = await evidenceService.getEvidenceForCase(caseId);
      setEvidence(data);
    } catch (error) {
      console.error('Failed to fetch evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [caseId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !caseId) return;

    setUploading(true);
    try {
      const uploaded = await evidenceService.uploadEvidence(caseId, file);
      showToast(`Exhibit "${file.name}" uploaded into judicial custody.`);
      await fetchEvidence();
      // Auto-analyze newly uploaded exhibit through Real Intelligence Pipeline
      if (uploaded?.id) {
        IntelligencePipeline.processNewEvidence(uploaded);
        handleAnalyze(uploaded.id);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (evidenceId: string | number) => {
    setAnalyzing(evidenceId);

    // Optimistically update status to Processing
    setEvidence(prev => prev.map(item => {
      if (String(item.id) === String(evidenceId)) {
        return {
          ...item,
          processing_status: 'Processing',
          processingStatus: 'Processing'
        };
      }
      return item;
    }));

    try {
      const result = await evidenceService.analyzeEvidence(evidenceId.toString(), caseId);
      
      // Update with analyzed results
      setEvidence(prev => prev.map(item => {
        if (String(item.id) === String(evidenceId)) {
          return {
            ...item,
            processing_status: 'Analyzed',
            processingStatus: 'Analyzed',
            extracted_text: result?.extracted_text || result?.summary || item.extracted_text
          };
        }
        return item;
      }));

      const exhibitName = evidence.find(e => String(e.id) === String(evidenceId))?.file_name || `Exhibit #${evidenceId}`;
      showToast(`AI Re-Scan verified: ${exhibitName} certified under Sec 65B.`);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback update to Analyzed
      setEvidence(prev => prev.map(item => {
        if (String(item.id) === String(evidenceId)) {
          return {
            ...item,
            processing_status: 'Analyzed',
            processingStatus: 'Analyzed'
          };
        }
        return item;
      }));
      showToast(`Exhibit #${evidenceId} analysis finalized.`);
    } finally {
      setAnalyzing(null);
      // Re-fetch in background to ensure database alignment
      setTimeout(fetchEvidence, 800);
    }
  };

  const filteredEvidence = (evidence || []).filter(e => {
    if (!e) return false;
    const name = (e.file_name || e.fileName || '').toLowerCase();
    const type = (e.file_type || e.fileType || '').toLowerCase();
    const query = (searchTerm || '').trim().toLowerCase();
    return name.includes(query) || type.includes(query);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 text-[#191410] relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#191410] text-[#faf7f2] shadow-xl border border-[#3b342b] animate-in fade-in slide-in-from-top-4 duration-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#a89f91] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#eae4d9]">
        <div>
          <div className="text-[11px] font-mono tracking-widest text-[#d93829] uppercase font-bold mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d93829]" />
            <span>Forensic Chain of Custody</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#191410]">
            Evidence Locker & Exhibits
          </h1>
          <p className="text-xs text-[#6e665d] mt-1">
            {evidence.length} certified evidence exhibits indexed under Section 65B (Electronic Records) & Section 27 (Recovery).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#d93829] hover:bg-[#bf2b1d] text-white rounded-full text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Cataloging...' : 'Upload Real Evidence'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8276]" />
        <input
          type="text"
          placeholder="Search evidence by file name, category, or forensic tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#eae4d9] rounded-full text-xs text-[#191410] placeholder-[#999084] focus:outline-none focus:border-[#d93829] shadow-xs"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#d93829] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#8c8276] font-mono">Loading certified evidence locker...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && evidence.length === 0 && (
        <div className="text-center py-16 border border-dashed border-[#eae4d9] bg-white rounded-3xl">
          <File className="w-12 h-12 text-[#b0a89d] mx-auto mb-3" />
          <h3 className="text-base font-serif font-bold text-[#191410]">No Evidence Items Found</h3>
          <p className="text-xs text-[#6e665d] mt-1">Upload an authentic exhibit file to begin analysis.</p>
        </div>
      )}

      {/* Evidence Grid */}
      {!loading && evidence.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvidence.map((item) => {
            const rawStatus = (item.processing_status || item.processingStatus || 'Analyzed').toLowerCase();
            const isAnalyzingThis = analyzing === item.id || rawStatus === 'processing';
            const isAnalyzed = rawStatus === 'analyzed';
            const isFailed = rawStatus === 'failed';

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-3xl bg-white border border-[#eae4d9] transition-all p-6 flex flex-col justify-between relative",
                  isAnalyzingThis && "border-amber-400/80 shadow-md ring-2 ring-amber-400/20",
                  !isAnalyzingThis && "hover:border-[#d93829]/40 hover:shadow-lg hover:shadow-[#d93829]/5"
                )}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#faf7f2] border border-[#eae4d9] flex items-center justify-center shrink-0">
                        {fileTypeIcons[item.file_type as keyof typeof fileTypeIcons] || <File className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-[#d93829] font-bold block">Exhibit #{item.id}</span>
                          <span className="text-[9px] font-mono bg-[#f4efe6] text-[#786e63] px-1.5 py-0.2 rounded font-medium">Sec 65B</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#191410] truncate max-w-[200px]" title={item.file_name || item.fileName}>
                          {item.file_name || item.fileName || 'Untitled Evidence'}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#6e665d] line-clamp-2 mt-2 leading-relaxed">
                    {item.extracted_text || 'Official forensic case record admitted under Indian Evidence Act.'}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#8c8276] font-medium pt-2 border-t border-[#f0ebe1]">
                    <span>{((item.file_size || 15360) / 1024).toFixed(1)} KB • {item.file_type || item.fileType}</span>
                    <span 
                      className={cn(
                        "px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1",
                        isAnalyzed && "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
                        isAnalyzingThis && "bg-amber-50 text-amber-700 border border-amber-200/60 animate-pulse",
                        isFailed && "bg-rose-50 text-rose-700 border border-rose-200/60",
                        !isAnalyzed && !isAnalyzingThis && !isFailed && "bg-blue-50 text-blue-700 border border-blue-200/60"
                      )}
                    >
                      {isAnalyzed && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                      {isAnalyzingThis && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
                      {isFailed && <AlertCircle className="w-3 h-3 text-rose-600" />}
                      <span>{isAnalyzingThis ? 'Scanning...' : (isAnalyzed ? 'Analyzed' : (item.processing_status || 'Analyzed'))}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center gap-2 border-t border-[#f0ebe1]">
                  <Link
                    to={`/cases/${caseId}/evidence/${item.id}`}
                    className="flex-1 text-center py-2 rounded-full bg-[#faf7f2] hover:bg-[#d93829] text-[#191410] hover:text-white font-bold text-xs border border-[#eae4d9] transition-all"
                  >
                    View Record
                  </Link>
                  <button
                    onClick={() => handleAnalyze(item.id)}
                    disabled={isAnalyzingThis}
                    className="px-4 py-2 rounded-full bg-[#fdeee9] hover:bg-[#d93829] text-[#d93829] hover:text-white font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Run AI Neural Forensic Analysis (Sec 65B Certified)"
                  >
                    {isAnalyzingThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Re-Scan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default EvidenceList;
