import { useMap } from 'react-leaflet';
import { Plus, Minus, Maximize2, Minimize2, LocateFixed } from 'lucide-react';
import L from 'leaflet';
import { GeoCase } from '../../types';

interface MapControlsProps {
  cases: GeoCase[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function MapControls({ cases, isExpanded, onToggleExpand }: MapControlsProps) {
  const map = useMap();

  const handleFitBounds = () => {
    if (cases.length === 0) return;
    const bounds = L.latLngBounds(cases.map(c => [c.latitude, c.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  };

  return (
    <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2 glass-panel p-1.5 rounded-lg">
      <button
        onClick={() => map.zoomIn()}
        title="Zoom in"
        className="w-8 h-8 flex items-center justify-center hover:bg-surface-hover rounded text-text-muted hover:text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom out"
        className="w-8 h-8 flex items-center justify-center hover:bg-surface-hover rounded text-text-muted hover:text-white transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-full h-px bg-border my-0.5" />
      <button
        onClick={handleFitBounds}
        title="Fit to all visible cases"
        className="w-8 h-8 flex items-center justify-center hover:bg-surface-hover rounded text-primary transition-colors"
      >
        <LocateFixed className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleExpand}
        title={isExpanded ? 'Collapse map' : 'Expand map'}
        className="w-8 h-8 flex items-center justify-center hover:bg-surface-hover rounded text-text-muted hover:text-white transition-colors"
      >
        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
