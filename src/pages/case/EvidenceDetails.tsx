// src/pages/case/EvidenceDetails.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, File, Image, Video, Music, FileText, Calendar, User, HardDrive } from 'lucide-react';
import { evidenceService } from '../../services';
import { Evidence } from '../../types';

const fileTypeIcons = {
  'Image': <Image className="w-5 h-5" />,
  'Video': <Video className="w-5 h-5" />,
  'Audio': <Music className="w-5 h-5" />,
  'Document': <FileText className="w-5 h-5" />,
  'Other': <File className="w-5 h-5" />
};

export function EvidenceDetails() {
  const { caseId, evidenceId } = useParams<{ caseId: string; evidenceId: string }>();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvidence = async () => {
      if (!evidenceId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await evidenceService.getEvidenceById(parseInt(evidenceId));
        if (data) {
          setEvidence(data);
        } else {
          setError('Evidence not found');
        }
      } catch (err) {
        setError('Failed to load evidence: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvidence();
  }, [evidenceId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-400">{error || 'Evidence not found'}</p>
          <Link to={`/cases/${caseId}/evidence`} className="text-primary hover:underline mt-4 inline-block">
            ← Back to Evidence
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back button */}
      <Link
        to={`/cases/${caseId}/evidence`}
        className="inline-flex items-center gap-2 text-text-muted hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Evidence
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          {fileTypeIcons[evidence.file_type as keyof typeof fileTypeIcons] || <File className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{evidence.file_name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mt-1">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {(evidence.file_size / 1024).toFixed(1)} KB
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(evidence.upload_date).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {evidence.uploaded_by || 'Unknown'}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          evidence.processing_status === 'Analyzed' ? 'bg-green-500/20 text-green-400' :
          evidence.processing_status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
          evidence.processing_status === 'Failed' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {evidence.processing_status || 'Uploaded'}
        </div>
      </div>

      {/* Extracted Text */}
      {evidence.extracted_text && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Extracted Text</h2>
          <div className="bg-surface border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-text-muted whitespace-pre-wrap font-mono">
              {evidence.extracted_text}
            </pre>
          </div>
        </div>
      )}

      {/* No extracted text */}
      {!evidence.extracted_text && evidence.processing_status !== 'Analyzed' && (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <p className="text-text-muted">No extracted text yet.</p>
          <p className="text-text-muted text-sm">Click "Analyze" to process this evidence.</p>
        </div>
      )}

      {/* No extracted text but analyzed */}
      {!evidence.extracted_text && evidence.processing_status === 'Analyzed' && (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <p className="text-text-muted">No text could be extracted from this file.</p>
        </div>
      )}
    </div>
  );
}