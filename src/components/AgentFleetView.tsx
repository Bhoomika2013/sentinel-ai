import React, { useState } from 'react';
import { 
  Bot, 
  ToggleLeft, 
  ToggleRight, 
  Sliders, 
  ShieldCheck, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  History,
  DollarSign
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { Agent } from '../types';

export const AgentFleetView: React.FC = () => {
  const { agents, toggleAgentStatus, updateAgentBaseCap, auditLog } = useSentinel();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editingCap, setEditingCap] = useState<number | null>(null);

  const handleOpenDetail = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditingCap(agent.baseSpendCap);
  };

  const handleSaveCap = () => {
    if (selectedAgent && editingCap !== null && editingCap >= 0) {
      updateAgentBaseCap(selectedAgent.id, editingCap);
      // Update local state to reflect instantly in detail modal
      setSelectedAgent((prev) => prev ? {
        ...prev,
        baseSpendCap: editingCap,
        dynamicSpendCap: Math.round(editingCap * (prev.riskProfile === 'watch' ? 0.75 : prev.riskProfile === 'elevated' ? 0.85 : 1.0))
      } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#00D1FF]" />
            Autonomous Agent Fleet ({agents.length} Registered)
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Monitor agent statuses, action-level permission chips, and adaptive dynamic spend caps.
          </p>
        </div>
      </div>

      {/* AGENT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const pctUsed = Math.min(100, Math.round((agent.spentToday / agent.dynamicSpendCap) * 100));
          const isCapExceeded = agent.spentToday >= agent.dynamicSpendCap;

          return (
            <div
              key={agent.id}
              className={`bg-[#161C2D] border rounded-xl p-5 shadow-lg flex flex-col justify-between transition relative overflow-hidden ${
                agent.status === 'disabled'
                  ? 'border-red-900/40 bg-slate-950/80 opacity-75'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        agent.riskProfile === 'watch'
                          ? 'bg-red-500/10 text-red-500'
                          : agent.riskProfile === 'elevated'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {agent.riskProfile}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{agent.type}</p>
                  </div>

                  {/* Toggle Agent Status Switch */}
                  <button
                    onClick={() => toggleAgentStatus(agent.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono font-bold transition cursor-pointer ${
                      agent.status === 'active'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    }`}
                    title={agent.status === 'active' ? 'Click to Disable Agent' : 'Click to Enable Agent'}
                  >
                    {agent.status === 'active' ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                        <span>ACTIVE</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-red-400" />
                        <span>OFF</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Spend Cap Progress Bar */}
                <div className="bg-[#0B0F19] p-3 rounded-lg border border-slate-800 mb-4">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-500 uppercase text-[10px]">Dynamic Limit</span>
                    <span className="font-bold text-white">
                      ${agent.spentToday} / <span className="text-[#00D1FF]">${agent.dynamicSpendCap}</span>
                      <span className="text-[10px] text-slate-500 ml-1">(Base: ${agent.baseSpendCap})</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCapExceeded ? 'bg-red-500 animate-pulse' : pctUsed >= 80 ? 'bg-amber-500' : 'bg-[#00D1FF]'
                      }`}
                      style={{ width: `${pctUsed}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                    <span>Used Today: {pctUsed}%</span>
                    <span>24h Actions: {agent.recentActionCount}</span>
                  </div>
                </div>

                {/* Permissions List Chips */}
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00D1FF]" /> Action Permissions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="bg-slate-800/80 text-slate-300 border border-slate-700/60 text-[10px] font-mono px-2 py-0.5 rounded"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Bottom CTA */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  ID: {agent.id}
                </span>
                <button
                  onClick={() => handleOpenDetail(agent)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#00D1FF]" />
                  <span>Config & Audit History</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedAgent.name}
                    <span className="text-xs font-mono text-slate-500">({selectedAgent.type})</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Agent ID: {selectedAgent.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editable Base Spend Cap Config */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#00D1FF]" />
                Manage Base Spend Cap Configuration
              </h4>
              <p className="text-xs text-slate-400">
                Adjusting the base cap automatically re-calculates the dynamic adaptive limit based on risk profile (Watch: 75%, Elevated: 85%, Low: 100%).
              </p>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-sm">$</span>
                  <input
                    type="number"
                    value={editingCap ?? selectedAgent.baseSpendCap}
                    onChange={(e) => setEditingCap(Number(e.target.value))}
                    className="w-full bg-[#161C2D] border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>
                <button
                  onClick={handleSaveCap}
                  className="bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-slate-950 font-bold text-xs font-mono px-4 py-2.5 rounded-lg transition cursor-pointer"
                >
                  Save & Apply Cap
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-300">
                <div>Current Dynamic Limit: <span className="font-bold text-[#00D1FF]">${selectedAgent.dynamicSpendCap}</span></div>
                <div>Spent Today: <span className="font-bold text-white">${selectedAgent.spentToday}</span></div>
              </div>
            </div>

            {/* Full Permission List */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00D1FF]" />
                Granted Action Permissions
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="bg-slate-800/80 text-slate-200 border border-slate-700 text-xs font-mono px-3 py-1 rounded-lg"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Agent Specific Audit History */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                Recent Interception History ({selectedAgent.name})
              </h4>

              <div className="bg-[#0B0F19] rounded-xl border border-slate-800 overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px] bg-[#0E1421]">
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Action</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Risk</th>
                      <th className="py-2 px-3">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {auditLog
                      .filter((l) => l.agentId === selectedAgent.id)
                      .slice(0, 5)
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/40">
                          <td className="py-2 px-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="py-2 px-3 text-slate-200">{log.actionType}</td>
                          <td className="py-2 px-3 font-bold text-white">${log.amount}</td>
                          <td className="py-2 px-3">
                            <span className={log.riskScore >= 75 ? 'text-red-500 font-bold' : log.riskScore >= 36 ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>
                              {log.riskScore}
                            </span>
                          </td>
                          <td className="py-2 px-3 capitalize text-slate-300">{log.decision.replace('_', ' ')}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
