import { Card } from '../../components/ui/Card';
import { Network, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export function KnowledgeGraph() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Knowledge Graph</h1>
        <p className="text-sm text-text-muted">Interactive relationship mapping of all case entities and evidence.</p>
      </div>

      <Card className="flex-1 relative overflow-hidden flex items-center justify-center bg-surface/50">
        {/* Mock visual representation of a node graph */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="text-center z-10 p-8 glass-panel rounded-xl border border-primary/20 shadow-2xl shadow-primary/10 max-w-md">
          <Network className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2">Interactive Graph Visualization</h2>
          <p className="text-sm text-text-muted mb-6">
            The knowledge graph module uses React Flow to render complex entity relationships extracted from case evidence.
          </p>
          <div className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold inline-block">
            Connected to 8 Entities and 10 Evidence items
          </div>
        </div>

        {/* Floating controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 glass-panel p-2 rounded-lg">
          <button className="p-2 hover:bg-surface-hover rounded text-text-muted hover:text-white transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-surface-hover rounded text-text-muted hover:text-white transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="w-full h-px bg-border my-1" />
          <button className="p-2 hover:bg-surface-hover rounded text-text-muted hover:text-white transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}