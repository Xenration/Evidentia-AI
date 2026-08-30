import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { MapPinned, Filter, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { geoCaseService } from '../../services';
import { GeoCase } from '../../types';
import { cn } from '../../utils';
import { useMarkerClusters } from './useMarkerClusters';
import { CaseMarker } from './CaseMarker';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { MapFilters, MapFilterState } from './MapFilters';

// India-wide default view so all mock cases are visible on first load.
const INDIA_CENTER: [number, number] = [22.9734, 78.6569];
const INDIA_DEFAULT_ZOOM = 5;

interface GeographicCaseMapProps {
  /** When set, the map filters to only this case and adjusts the view. */
  caseId?: string;
  /** Optional class name for the outer wrapper. */
  className?: string;
  /** Whether this map is embedded inside a case workspace (changes header behaviour). */
  embedded?: boolean;
}

function ClusteredMarkers({ cases }: { cases: GeoCase[] }) {
  const clusters = useMarkerClusters(cases);
  return (
    <>
      {clusters.map(item => (
        <CaseMarker key={item.type === 'cluster' ? item.id : item.case.id} item={item} />
      ))}
    </>
  );
}

// Leaflet needs an explicit nudge whenever its container is resized by
// something outside its own control (here: the expand/collapse toggle),
// otherwise tiles render into a stale-sized canvas until the next pan/zoom.
function MapResizeHandler({ trigger }: { trigger: unknown }) {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 260);
    return () => window.clearTimeout(id);
  }, [map, trigger]);
  return null;
}

export function GeographicCaseMap({ caseId, className, embedded }: GeographicCaseMapProps) {
  const [allCases, setAllCases] = useState<GeoCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<MapFilterState>({
    search: '',
    status: 'All',
    crimeType: 'All',
    severity: 'All',
  });

  useEffect(() => {
    geoCaseService.getGeoCases().then(data => {
      setAllCases(data);
      setLoading(false);
    });
  }, []);

  // When a caseId is provided, pre-filter to just that case.
  const caseScopedCases = useMemo(() => {
    if (!caseId) return allCases;
    return allCases.filter(c => c.id === caseId);
  }, [allCases, caseId]);

  // Derive map center/zoom for single-case view.
  const mapDefaults = useMemo(() => {
    if (caseId && caseScopedCases.length > 0) {
      const c = caseScopedCases[0];
      return {
        center: [c.latitude, c.longitude] as [number, number],
        zoom: 12,
      };
    }
    return { center: INDIA_CENTER, zoom: INDIA_DEFAULT_ZOOM };
  }, [caseId, caseScopedCases]);

  const filteredCases = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return caseScopedCases.filter(c => {
      if (filters.status !== 'All' && c.status !== filters.status) return false;
      if (filters.crimeType !== 'All' && c.crimeType !== filters.crimeType) return false;
      if (filters.severity !== 'All' && c.severity !== filters.severity) return false;
      if (q) {
        const haystack = `${c.id} ${c.title} ${c.location} ${c.crimeType}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [caseScopedCases, filters]);

  const stats = useMemo(() => ({
    total: filteredCases.length,
    active: filteredCases.filter(c => c.status === 'Active').length,
    highRisk: filteredCases.filter(c => c.severity === 'High' || c.severity === 'Critical').length,
  }), [filteredCases]);

  return (
    <>
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}
      <Card className={cn(
        isExpanded && 'fixed inset-4 z-50 flex flex-col',
        embedded && 'flex-1 flex flex-col min-h-0',
        className,
      )}>
        <CardHeader className={cn(
          'flex-col sm:flex-row items-start sm:items-center gap-3',
          embedded && 'py-3',
        )}>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="w-5 h-5 text-primary" />
            {embedded ? 'Geospatial Intelligence' : 'Geographic Case Map'}
          </CardTitle>
          {!embedded && (
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0',
                filtersOpen ? 'bg-primary/10 text-primary border-primary/30' : 'bg-surface border-border text-text-muted hover:text-white'
              )}
            >
              <Filter className="w-3.5 h-3.5" /> Filters
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', filtersOpen && 'rotate-180')} />
            </button>
          )}
        </CardHeader>

        {filtersOpen && (
          <div className="px-6 py-3 border-b border-border bg-surface/40">
            <MapFilters filters={filters} onChange={setFilters} />
          </div>
        )}

        <CardContent className={cn('p-0 flex flex-col', (isExpanded || embedded) && 'flex-1 min-h-0')}>
          <div className={cn('relative w-full', (isExpanded || embedded) ? 'flex-1 min-h-0' : 'h-[420px] md:h-[480px]')}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a1526]">
                <div className="text-center animate-pulse">
                  <MapPinned className="w-10 h-10 text-primary/40 mx-auto mb-2" />
                  <p className="text-xs text-text-muted">Loading case locations...</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={mapDefaults.center}
                zoom={mapDefaults.zoom}
                zoomControl={false}
                className="w-full h-full evidentia-map"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className="evidentia-map-tiles"
                />
                <ClusteredMarkers cases={filteredCases} />
                <MapControls cases={filteredCases} isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(e => !e)} />
                <MapResizeHandler trigger={isExpanded} />
              </MapContainer>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
            <MapLegend />
            <div className="flex items-center gap-4 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">{stats.total}</span>
                <span className="text-text-muted uppercase tracking-wider font-semibold">Total Cases</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-blue-400 text-sm">{stats.active}</span>
                <span className="text-text-muted uppercase tracking-wider font-semibold">Active</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-danger text-sm">{stats.highRisk}</span>
                <span className="text-text-muted uppercase tracking-wider font-semibold">High Risk</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
