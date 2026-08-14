import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Globe, BarChart2, Settings, User, Search } from 'lucide-react';
import { cn } from '../../utils';

const globalNavItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/cases', icon: Briefcase, label: 'Cases' },
  { path: '/osint', icon: Globe, label: 'OSINT Intelligence' },
  { path: '/search', icon: Search, label: 'Global Search' },
  { path: '/reports', icon: BarChart2, label: 'Reports' },
];

export function GlobalSidebar() {
  return (
    <aside className="w-64 bg-surface/80 backdrop-blur-md border-r border-border h-full flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-wider">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
            <span className="text-primary">E</span>
          </div>
          EVIDENTIA
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-text-muted mb-4 uppercase tracking-wider px-3">
          Global Workspace
        </div>
        <nav className="space-y-1">
          {globalNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-[inset_2px_0_0_0_var(--color-primary)]' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                )
              }
            >
              <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border/50 space-y-1">
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors">
          <Settings className="w-5 h-5 opacity-70" />
          Settings
        </NavLink>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors text-left">
          <User className="w-5 h-5 opacity-70" />
          User Profile
        </button>
      </div>
    </aside>
  );
}
