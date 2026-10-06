import React from 'react';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Topbar() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <div className="h-16 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#eae4d9] flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2 text-xs font-medium text-[#70685e]">
        <span className="font-serif font-bold text-base text-[#191410] tracking-tight">Evidentia</span>
        {pathnames.map((name, index) => (
          <React.Fragment key={name}>
            <ChevronRight className="w-3.5 h-3.5 text-[#b0a89d]" />
            <span className={index === pathnames.length - 1 ? "text-[#d93829] font-semibold capitalize" : "capitalize text-[#70685e]"}>
              {name.replace('-', ' ')}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8276]" />
          <input 
            type="text" 
            placeholder="Search evidence, FIR, suspects..." 
            className="bg-white border border-[#eae4d9] rounded-full pl-9 pr-10 py-1.5 text-xs text-[#191410] placeholder:text-[#999084] focus:outline-none focus:border-[#d93829] focus:ring-2 focus:ring-[#d93829]/10 w-64 shadow-2xs transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#999084] bg-[#f5f0e6] px-1.5 py-0.5 rounded-full">
            ⌘K
          </div>
        </div>
        
        <button className="relative p-2 rounded-full text-[#70685e] hover:text-[#191410] hover:bg-[#f0ebe1] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d93829] rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[#eae4d9]">
          <div className="w-8 h-8 rounded-full bg-[#d93829] flex items-center justify-center text-white font-bold text-xs shadow-xs">
            AP
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-[#191410]">Special Director</div>
            <div className="text-[10px] text-[#8c8276]">Crime Branch SIT</div>
          </div>
        </div>
      </div>
    </div>
  );
}
