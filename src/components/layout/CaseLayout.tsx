import { Outlet } from 'react-router-dom';
import { CaseSidebar } from './CaseSidebar';
import { Topbar } from './Topbar';

export function CaseLayout() {
  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      <CaseSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle case background glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
