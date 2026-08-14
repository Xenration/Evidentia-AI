import React from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Topbar() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2 text-sm text-textMuted">
        <span className="capitalize">Evidentia</span>
        {pathnames.map((name, index) => (
          <React.Fragment key={name}>
            <ChevronRight className="w-4 h-4" />
            <span className={index === pathnames.length - 1 ? "text-text font-medium capitalize" : "capitalize"}>
              {name.replace('-', ' ')}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
          <input 
            type="text" 
            placeholder="Global search..." 
            className="bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary w-64 transition-all"
          />
        </div>
        
        <button className="relative text-textMuted hover:text-text transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
          JD
        </div>
      </div>
    </div>
  );
}
