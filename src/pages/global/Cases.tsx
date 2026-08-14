import { useEffect, useState } from 'react';
import { caseService } from '../../services';
import { Case } from '../../types';
import { Card } from '../../components/ui/Card';
import { Briefcase, Search, Plus, Filter, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils';

export function Cases() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    caseService.getCases().then(setCases);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Investigation Cases</h1>
          <p className="text-sm text-text-muted">Manage active and archived intelligence operations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Create New Case
        </button>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search cases by name, ID, or tag..." 
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 text-white transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-text-muted hover:text-white hover:border-text-muted transition-colors">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cases.map(c => (
          <Card key={c.id} className="flex flex-col group hover:border-primary/50 transition-colors">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                    c.priority === 'High' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  )}>
                    {c.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-primary/10 text-primary border-primary/20">
                    {c.status}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{c.name}</h2>
              <div className="text-xs font-mono text-text-muted mb-4">{c.id}</div>
              
              <p className="text-sm text-text-muted line-clamp-2 mb-6">
                {c.description}
              </p>

              <div className="flex items-center gap-4 text-xs font-medium text-text">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-text-muted" />
                  {c.evidenceCount} Evidence
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-text-muted" />
                  {c.assignedInvestigators.length} Agents
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border/50 bg-surface/50 flex justify-between items-center">
              <div className="text-xs text-text-muted">
                Updated: {new Date(c.lastUpdated).toLocaleDateString()}
              </div>
              <Link 
                to={`/cases/${c.id}`}
                className="px-4 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded text-sm font-medium text-white transition-colors"
              >
                Open Workspace
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}