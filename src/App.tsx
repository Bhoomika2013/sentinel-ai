import React from 'react';
import { SentinelProvider, useSentinel } from './context/SentinelContext';
import { Header } from './components/Header';
import { Sidebar, MobileNav } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AgentFleetView } from './components/AgentFleetView';
import { RequestSimulatorView } from './components/RequestSimulatorView';
import { HumanReviewView } from './components/HumanReviewView';
import { AuditLogView } from './components/AuditLogView';
import { AnalyticsView } from './components/AnalyticsView';
import { PermissionConfigView } from './components/PermissionConfigView';

const MainContent: React.FC = () => {
  const { activeTab } = useSentinel();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'fleet' && <AgentFleetView />}
      {activeTab === 'simulator' && <RequestSimulatorView />}
      {activeTab === 'human_review' && <HumanReviewView />}
      {activeTab === 'audit_log' && <AuditLogView />}
      {activeTab === 'analytics' && <AnalyticsView />}
      {activeTab === 'permissions' && <PermissionConfigView />}
    </main>
  );
};

export default function App() {
  return (
    <SentinelProvider>
      <div className="min-h-screen bg-[#0B0F19] text-slate-300 flex flex-col font-sans selection:bg-[#00D1FF] selection:text-slate-950">
        <Header />
        <MobileNav />
        <div className="flex flex-1">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </SentinelProvider>
  );
}
