// src/pages/case/EvidenceList.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, File, Image, Video, Music, FileText,
  CheckCircle, Clock, AlertCircle, Loader2, Upload
} from 'lucide-react';
import { evidenceService } from '../../services';
import { Evidence } from '../../types';

const statusIcons = {
  'Uploaded': <Clock className="w-4 h-4 text-yellow-400" />,
  'Queued': <Clock className="w-4 h-4 text-blue-400" />,
  'Processing': <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  'Analyzed': <CheckCircle className="w-4 h-4 text-green-400" />,
  'Failed': <AlertCircle className="w-4 h-4 text-red-400" />
};

const fileTypeIcons = {
  'Image': <Image className="w-4 h-4" />,
  'Video': <Video className="w-4 h-4" />,
  'Audio': <Music className="w-4 h-4" />,
  'Document': <FileText className="w-4 h-4" />,
  'Other': <File className="w-4 h-4" />
};

export function EvidenceList() {
  const { caseId } = useParams<{ caseId: string }>();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEvidence = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const data = await evidenceService.getEvidenceForCase(caseId);
      setEvidence(data);
    } catch (error) {
      console.error('Failed to fetch evidence:', error);
      alert('Failed to load evidence. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, [caseId]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !caseId) return;

    setUploading(true);
    try {
      await evidenceService.uploadEvidence(caseId, file);
      alert('File uploaded successfully!');
      fetchEvidence();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (evidenceId: number) => {
    setAnalyzing(evidenceId);
    try {
      await evidenceService.analyzeEvidence(evidenceId.toString());
      alert('Analysis started! Check back in a moment.');
      setTimeout(fetchEvidence, 2000);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed: ' + (error as Error).message);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (evidenceId: number, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;

    try {
      await evidenceService.deleteEvidence(evidenceId.toString());
      alert('Evidence deleted successfully.');
      fetchEvidence();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed: ' + (error as Error).message);
    }
  };

  const filteredEvidence = evidence.filter(e =>
    e.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Evidence</h1>
          <p className="text-text-muted text-sm">
            {evidence.length} items uploaded
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload Evidence'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: 'none' }}
            multiple={false}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search evidence..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#111d2d] border border-[#294057] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && evidence.length === 0 && (
        <div className="text-center py-12 border border-dashed border-[#294057] rounded-lg">
          <File className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No evidence uploaded yet.</p>
          <p className="text-text-muted text-sm">Click "Upload Evidence" to add files.</p>
        </div>
      )}

      {/* Evidence Grid */}
      {!loading && evidence.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((item) => (
            <div
              key={item.id}
              className="group bg-[#111d2d] border border-[#294057] hover:border-cyan-500/30 rounded-lg p-5 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
            >
              {/* File Icon + Name */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                    {fileTypeIcons[item.file_type as keyof typeof fileTypeIcons] || <File className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate" title={item.file_name}>
                      {item.file_name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {((item.file_size || 0) / 1024).toFixed(1)} KB • {item.file_type || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-sm mb-3">
                {statusIcons[item.processing_status as keyof typeof statusIcons] || <Clock className="w-4 h-4" />}
                <span className={`text-sm ${
                  item.processing_status === 'Analyzed' ? 'text-green-400' :
                  item.processing_status === 'Failed' ? 'text-red-400' :
                  item.processing_status === 'Processing' ? 'text-blue-400' :
                  'text-text-muted'
                }`}>
                  {item.processing_status || 'Uploaded'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/cases/${caseId}/evidence/${item.id}`}
                  className="flex-1 text-center px-3 py-1.5 border border-[#294057] hover:border-cyan-500/50 rounded-lg text-xs font-medium transition-colors"
                >
                  View Details
                </Link>
                {item.processing_status !== 'Processing' && (
                  <button
                    onClick={() => handleAnalyze(item.id)}
                    disabled={analyzing === item.id}
                    className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {analyzing === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Analyze'
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id, item.file_name)}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
                  title="Delete evidence"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}