import { useParams } from 'react-router-dom';
import { GeographicCaseMap } from '../../components/map/GeographicCaseMap';

export function CaseMap() {
  const { caseId } = useParams();

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Geospatial Intelligence</h1>
        <p className="text-sm text-text-muted">Map of extracted locations and physical evidence trails for this case.</p>
      </div>

      <GeographicCaseMap caseId={caseId} embedded />
    </div>
  );
}
