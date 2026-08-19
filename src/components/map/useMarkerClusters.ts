import { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';
import { GeoCase } from '../../types';

export interface CasePoint {
  type: 'point';
  case: GeoCase;
  lat: number;
  lng: number;
}

export interface CaseCluster {
  type: 'cluster';
  id: string;
  lat: number;
  lng: number;
  count: number;
  cases: GeoCase[];
}

export type ClusterItem = CasePoint | CaseCluster;

const CLUSTER_PIXEL_RADIUS = 44;

/**
 * Lightweight, dependency-free marker clustering.
 *
 * Rather than pull in leaflet.markercluster (a large, UMD-first package
 * that historically fights React's DOM ownership when Marker layers are
 * mounted/unmounted by React instead of Leaflet itself), this groups
 * points by on-screen pixel distance at the current zoom/pan, recomputed
 * on 'zoomend' / 'moveend'. It's a simple greedy grouping — good enough
 * for a few hundred markers, which is the scale this dashboard needs.
 */
export function useMarkerClusters(cases: GeoCase[]): ClusterItem[] {
  const map = useMap();
  const [items, setItems] = useState<ClusterItem[]>([]);

  const recompute = useCallback(() => {
    if (!map) return;

    const points = cases.map(c => ({
      case: c,
      containerPoint: map.latLngToContainerPoint(L.latLng(c.latitude, c.longitude)),
    }));

    const visited = new Set<number>();
    const result: ClusterItem[] = [];

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;
      visited.add(i);
      const group = [points[i]];

      for (let j = i + 1; j < points.length; j++) {
        if (visited.has(j)) continue;
        const dx = points[i].containerPoint.x - points[j].containerPoint.x;
        const dy = points[i].containerPoint.y - points[j].containerPoint.y;
        if (Math.sqrt(dx * dx + dy * dy) <= CLUSTER_PIXEL_RADIUS) {
          visited.add(j);
          group.push(points[j]);
        }
      }

      if (group.length === 1) {
        result.push({ type: 'point', case: group[0].case, lat: group[0].case.latitude, lng: group[0].case.longitude });
      } else {
        const avgLat = group.reduce((s, p) => s + p.case.latitude, 0) / group.length;
        const avgLng = group.reduce((s, p) => s + p.case.longitude, 0) / group.length;
        result.push({
          type: 'cluster',
          id: `cluster-${group.map(p => p.case.id).join('-')}`,
          lat: avgLat,
          lng: avgLng,
          count: group.length,
          cases: group.map(p => p.case),
        });
      }
    }

    setItems(result);
  }, [map, cases]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  useMapEvents({
    zoomend: recompute,
    moveend: recompute,
  });

  return items;
}
