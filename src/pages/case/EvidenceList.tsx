import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { evidenceService } from '../../services';
import { Evidence } from '../../types';
import { Card } from '../../components/ui/Card';
import { FileText, Image, Video, Music, Upload, Search, Filter, ArrowRight } from 'lucide-react';
import { cn } from '../../utils';

export function EvidenceList() {
  const { caseId } = useParams();
  const [evidence, setEvidence] = useState<Evidence[]>([]);

  useEffect(() => {
    if (caseId) {
      evidenceService.getEvidenceForCase(caseId).then(setEvidence);
    }
  }, [caseId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Document': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'Image': return <Image className="w-5 h-5 text-purple-400" />;
      case 'Video': return <Video className="w-5 h-5 text-red-400" />;
      case 'Audio': return <Music className="w-5 h-5 text-green-400" />;
      default: return <FileText className="w-5 h-5 text-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Analyzed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20 animate-pulse';
      case 'Queued': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Uploaded': return 'text-text-muted bg-surface-hover border-border';
      default: return 'text-red-400 bg-red-400/10 border-red-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Evidence Management</h1>
          <p className="text-sm text-text-muted">Upload and manage case files, documents, and media.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm shadow-lg shadow-primary/20">
          <Upload className="w-4 h-4" />
          Upload Evidence
        </button>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search evidence..." 
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 text-white transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-muted hover:text-white hover:border-text-muted transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {evidence.map((item) => (
          <Link key={item.id} to={`/cases/${caseId}/evidence/${item.id}`}>
            <Card className="p-5 hover:border-primary/50 transition-colors cursor-pointer group h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border shadow-inner">
                  {getIcon(item.fileType)}
                </div>
                <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border", getStatusColor(item.processingStatus))}>
                  {item.processingStatus}
                </span>
              </div>
              
              <h3 className="text-white font-medium truncate mb-1 group-hover:text-primary transition-colors" title={item.fileName}>
                {item.fileName}
              </h3>
              <div className="flex items-center justify-between text-xs text-text-muted mt-auto pt-4 border-t border-border/50">
                <span>{item.id}</span>
                <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                  Analyze <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}