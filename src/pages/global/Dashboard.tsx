import { useEffect, useState } from 'react';
import { caseService } from '../../services';
import { Case } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Briefcase, AlertTriangle, FileText, CheckSquare, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils';

export function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    caseService.getCases().then(setCases);
  }, []);

  const activeCases = cases.filter(c => c.status === 'Active' || c.status === 'Under Investigation');

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Global Intelligence Dashboard</h1>
        <p className="text-sm text-text-muted">Overview of all active investigations and system processing queues.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Cases', value: activeCases.length, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Pending Analysis', value: 12, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Open Contradictions', value: 8, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Investigation Tasks', value: 15, icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' }
        ].map((stat, i) => (
          <Card key={i} className="flex items-center p-5 gap-4 hover:-translate-y-1 transition-transform">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center border", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Active Cases</span>
                <Link to="/cases" className="text-xs font-semibold text-primary flex items-center gap-1 hover:text-primary-hover">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-text-muted">
                  <thead className="text-xs text-text uppercase bg-surface-hover/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-3">Case ID & Name</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3 text-right">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCases.map((c) => (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-surface-hover/30 transition-colors group">
                        <td className="px-6 py-4">
                          <Link to={`/cases/${c.id}`} className="block">
                            <div className="font-bold text-white group-hover:text-primary transition-colors">{c.name}</div>
                            <div className="text-xs font-mono mt-0.5">{c.id}</div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded">
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded",
                            c.priority === 'High' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          )}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          <div className="flex items-center justify-end gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            {c.evidenceCount}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Global Investigation Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '10 mins ago', user: 'Alex Vance', action: 'uploaded Evidence', target: 'cctv_server_room.mp4', case: 'CASE-2026-001' },
                  { time: '45 mins ago', user: 'System AI', action: 'detected Contradiction', target: 'C-04 (Location Conflict)', case: 'CASE-2026-001' },
                  { time: '2 hours ago', user: 'Sarah Jenkins', action: 'created Hypothesis', target: 'H-01 (Voluntary Espionage)', case: 'CASE-2026-001' },
                  { time: '5 hours ago', user: 'System AI', action: 'extracted Entity', target: 'Nexus Global Holdings (Org)', case: 'CASE-2026-001' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 w-2 h-2 rounded-full bg-primary/50 ring-4 ring-primary/10" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-white">{act.user}</span>{' '}
                        <span className="text-text-muted">{act.action}</span>{' '}
                        <span className="font-medium text-primary">{act.target}</span>
                      </p>
                      <div className="text-xs text-text-muted mt-0.5 flex gap-2">
                        <span>{act.time}</span>
                        <span>•</span>
                        <span className="font-mono">{act.case}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evidence Processing Queue */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Evidence Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                  <span className="text-blue-400">Processing</span>
                  <span className="text-white">45%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[45%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                  <span className="text-yellow-400">Queued</span>
                  <span className="text-white">12 items</span>
                </div>
                <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[20%]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-text-muted">
                <span className="text-white font-semibold block mb-1">Encrypted USB Image Analysis Failed</span>
                File is heavily encrypted. Requires manual intervention or secondary decryption pass.
                <button className="mt-3 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-xs font-bold uppercase transition-colors">
                  View Error Log
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}