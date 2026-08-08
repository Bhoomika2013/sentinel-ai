import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  PlayCircle, 
  UserCheck, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSentinel, NavigationTab } from '../context/SentinelContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, humanReviewQueue, triggerPitchPreset } = useSentinel();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Agent Fleet', icon: Bot },
    { id: 'simulator', label: 'Request Simulator', icon: PlayCircle },
    { id: 'human_review', label: 'Human Review Queue', icon: UserCheck, badge: humanReviewQueue.length },
    { id: 'audit_log', label: 'Audit Log', icon: FileText },
    { id: 'analytics', label: 'Analytics & Metrics', icon: BarChart3 },
    { id: 'permissions', label: 'Permission Config', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#0E1421] border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="py-4 px-3 space-y-6">
        {/* Pitch Quick Launch Card */}
        <div className="bg-[#161C2D] border border-[#00D1FF]/30 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D1FF] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judge Demo Walkthrough</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight mb-2.5">
            Test the pattern-detection scenario ($45 fee reversal anomaly).
          </p>
          <button
            onClick={triggerPitchPreset}
            className="w-full bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-slate-950 font-bold text-xs py-1.5 px-2.5 rounded-lg transition flex items-center justify-between cursor-pointer"
          >
            <span>Run Walkthrough</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
            Command Center
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-[#00D1FF]/10 text-[#00D1FF] font-semibold border-l-2 border-[#00D1FF]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D1FF]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-amber-500/20 text-amber-500 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex flex-col gap-2 rounded-lg bg-[#161C2D] p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">System Latency</div>
          <div className="text-lg font-mono text-emerald-400 font-bold">12.4ms</div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-emerald-500"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, humanReviewQueue } = useSentinel();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet', icon: Bot },
    { id: 'simulator', label: 'Simulator', icon: PlayCircle },
    { id: 'human_review', label: 'Review', icon: UserCheck, badge: humanReviewQueue.length },
    { id: 'audit_log', label: 'Audit', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'permissions', label: 'Config', icon: ShieldCheck },
  ];

  return (
    <div className="md:hidden bg-slate-900 border-b border-slate-800 px-2 py-1.5 flex items-center justify-around overflow-x-auto text-xs sticky top-16 z-20">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap ${
              isActive ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-400'
            }`}
          >
            <div className="relative">
              <Icon className="w-4 h-4" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[9px] font-bold px-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
