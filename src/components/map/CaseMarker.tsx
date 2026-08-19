import { Marker, Popup, useMap } from 'react-leaflet';
import { ClusterItem } from './useMarkerClusters';
import { createCaseIcon, createClusterIcon } from './mapConfig';
import { CasePopup } from './CasePopup';

interface CaseMarkerProps {
  item: ClusterItem;
}

export function CaseMarker({ item }: CaseMarkerProps) {
  const map = useMap();

  if (item.type === 'cluster') {
    return (
      <Marker
        position={[item.lat, item.lng]}
        icon={createClusterIcon(item.count)}
        eventHandlers={{
          click: () => {
            // Zoom in toward the cluster; at the tighter zoom the
            // clustering hook will re-split it into individual cases.
            map.setView([item.lat, item.lng], Math.min(map.getZoom() + 2, 16), { animate: true });
          },
        }}
      />
    );
  }

  return (
    <Marker position={[item.lat, item.lng]} icon={createCaseIcon(item.case.crimeType, item.case.severity)}>
      <Popup className="evidentia-popup" closeButton minWidth={240} maxWidth={280}>
        <CasePopup geoCase={item.case} />
      </Popup>
    </Marker>
  );
}
