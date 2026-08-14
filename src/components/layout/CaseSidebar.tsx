import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { caseService } from '../../services';
import { Case } from '../../types';
import { 
  LayoutDashboard, FileText, Network, Clock, 
  Users, AlertTriangle, Lightbulb, CheckSquare, 
  Mic, Map, Bot, BarChart2, Activity, ArrowLeft
} from 'lucide-react';
import { cn } from '../../utils';

export function CaseSidebar() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [currentCase, setCurrentCase] = useState<Case | null>(null);

  useEffect(() => {
    if (caseId) {
      caseService.getCaseById(caseId).then(data => {
        if (data) setCurrentCase(data);
      });
    }
  }, [caseId]);

  const caseNavItems = [
    { path: `/cases/${caseId}/overview`, icon: LayoutDashboard, label: 'Overview' },
    { path: `/cases/${caseId}/evidence`, icon: FileText, label: 'Evidence' },
    { path: `/cases/${caseId}/analysis`, icon: Network, label: 'Analysis Workspace' },
    { path: `/cases/${caseId}/timeline`, icon: Clock, label: 'Timeline' },
    { path: `/cases/${caseId}/entities`, icon: Users, label: 'Entities' },
    { path: `/cases/${caseId}/graph`, icon: Network, label: 'Knowledge Graph' },
    { path: `/cases/${caseId}/contradictions`, icon: AlertTriangle, label: 'Contradictions' },
    { path: `/cases/${caseId}/hypotheses`, icon: Lightbulb, label: 'Hypotheses' },
    { path: `/cases/${caseId}/investigation-plan`, icon: CheckSquare, label: 'Investigation Plan' },
    { path: `/cases/${caseId}/interviews`, icon: Mic, label: 'Interviews' },
    { path: `/cases/${caseId}/map`, icon: Map, label: 'Case Map' },
    { path: `/cases/${caseId}/assistant`, icon: Bot, label: 'AI Assistant' },
    { path: `/cases/${caseId}/reports`, icon: BarChart2, label: 'Reports' },
    { path: `/cases/${caseId}/activity`, icon: Activity, label: 'Activity Log' },
  ];

  return (
    <aside className="w-64 bg-surface/90 backdrop-blur-md border-r border-border h-full flex flex-col shrink-0 shadow-xl">
      <div className="p-4 border-b border-border/50 bg-surface/50">
        <button 
          onClick={() => navigate('/cases')}
          className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text uppercase tracking-wider mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Global Workspace
        </button>
        
        {currentCase ? (
          <div>
            <div className="text-[10px] text-primary uppercase tracking-widest font-bold mb-1">Active Case</div>
            <h2 className="text-sm font-bold text-text truncate" title={currentCase.name}>
              {currentCase.name}
            </h2>
            <div className="text-xs text-text-muted mt-1">{currentCase.id}</div>
          </div>
        ) : (
          <div className="animate-pulse h-12 bg-surface-hover rounded" />
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-3 px-3">
        <nav className="space-y-0.5">
          {caseNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group',
                  isActive 
                    ? 'bg-primary/15 text-primary' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                )
              }
            >
              <item.icon className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
