import { Outlet } from 'react-router-dom';
import { GlobalSidebar } from './GlobalSidebar';
import { Topbar } from './Topbar';

export function GlobalLayout() {
  return (
    <div className="h-screen w-full flex bg-background overflow-hidden">
      <GlobalSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-background pointer-events-none -z-10" />
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
