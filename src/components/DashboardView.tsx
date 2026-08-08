import React from 'react';
import { 
  Users, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSentinel } from '../context/SentinelContext';

export const DashboardView: React.FC = () => {
  const { agents, auditLog, setActiveTab, triggerPitchPreset } = useSentinel();

  // Metrics computation
  const activeAgentsCount = agents.filter((a) => a.status === 'active').length;
  const totalAgents = agents.length;

  const totalActionsToday = auditLog.length;
  const autoExecutedCount = auditLog.filter((l) => l.decision === 'auto_executed' || l.decision === 'human_approved').length;
  const blockedCount = auditLog.filter((l) => l.decision === 'blocked' || l.decision === 'human_rejected').length;
  const humanReviewCount = auditLog.filter((l) => l.decision === 'human_review').length;

  const autoExecPct = totalActionsToday > 0 ? Math.round((autoExecutedCount / totalActionsToday) * 100) : 0;
  const blockedPct = totalActionsToday > 0 ? Math.round((blockedCount / totalActionsToday) * 100) : 0;
  const reviewPct = totalActionsToday > 0 ? Math.round((humanReviewCount / totalActionsToday) * 100) : 0;

  // Donut chart data
  const chartData = [
    { name: 'Auto-Executed', value: autoExecutedCount, color: '#10b981' }, // Emerald
    { name: 'Human Review', value: humanReviewCount, color: '#f59e0b' },   // Amber
    { name: 'Blocked', value: blockedCount, color: '#ef4444' },         // Red
  ];

  const recentLogs = auditLog.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Pitch scenario trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161C2D] p-5 rounded-xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            Command Center / Real-Time Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Multi-stage security checkpoint actively monitoring autonomous financial AI agents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={triggerPitchPreset}
            className="bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition cursor-pointer font-mono"
          >
            <span>Run Pitch Scenario ($45 Anomaly)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP STAT CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Agents */}
        <div className="rounded-xl border border-slate-800 bg-[#161C2D] p-4">
          <div className="text-[10px] uppercase text-slate-500 font-mono">Managed Agents</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {activeAgentsCount} <span className="text-xs font-normal text-slate-500">/ {totalAgents}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            {totalAgents - activeAgentsCount === 0 ? 'All Active' : `${activeAgentsCount} Active / ${totalAgents - activeAgentsCount} Idle`}
          </div>
        </div>

        {/* Actions Today */}
        <div className="rounded-xl border border-slate-800 bg-[#161C2D] p-4">
          <div className="text-[10px] uppercase text-slate-500 font-mono">Total Executions</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {totalActionsToday}
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-mono">
            24h Active Stream
          </div>
        </div>

        {/* % Auto Executed */}
        <div className="rounded-xl border border-slate-800 bg-[#161C2D] p-4">
          <div className="text-[10px] uppercase text-slate-500 font-mono">Auto-Approved</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {autoExecPct}%
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Low Risk Passed
          </div>
        </div>

        {/* % Blocked */}
        <div className="rounded-xl border border-slate-800 bg-[#161C2D] p-4">
          <div className="text-[10px] uppercase text-slate-500 font-mono">Blocked Interceptions</div>
          <div className="text-2xl font-bold text-red-400 font-mono mt-1">
            {blockedPct}%
          </div>
          <div className="mt-1 text-xs text-red-400 font-mono">
            High Risk Halted
          </div>
        </div>

        {/* % Human Review */}
        <div className="rounded-xl border border-slate-800 bg-[#161C2D] p-4">
          <div className="text-[10px] uppercase text-slate-500 font-mono">Manual Intervention</div>
          <div className="text-2xl font-bold text-amber-500 font-mono mt-1">
            {humanReviewCount}
          </div>
          <div className="mt-1 text-xs text-amber-500 font-mono">
            Awaiting Review
          </div>
        </div>

        {/* Latency */}
        <div className="rounded-xl border border-slate-800 bg-[#161C2D] p-4">
          <div className="text-[10px] uppercase text-slate-500 font-mono">System Latency</div>
          <div className="text-2xl font-bold text-purple-400 font-mono mt-1">
            118 ms
          </div>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            Avg SLA Latency
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: DONUT CHART + QUICK FLEET OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcome Breakdown Donut Chart */}
        <div className="rounded-xl border border-slate-800 bg-[#161C2D] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Decisions by Outcome
              </h3>
              <ShieldCheck className="w-4 h-4 text-[#00D1FF]" />
            </div>
            <p className="text-xs text-slate-400">
              Distribution of agent actions intercepted across safety tiers.
            </p>
          </div>

          <div className="h-48 my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0E1421', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total overlay */}
            <div className="absolute text-center">
              <div className="text-2xl font-black text-white font-mono">{totalActionsToday}</div>
              <div className="text-[10px] uppercase font-mono text-slate-500">Total</div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
            <div>
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {autoExecutedCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Auto-Exec</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-amber-500 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {humanReviewCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Review</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-red-500 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {blockedCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Blocked</div>
            </div>
          </div>
        </div>

        {/* Active Agents Snapshot */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#161C2D] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#00D1FF]" />
                Agent Fleet & Dynamic Spend Limit
              </h3>
              <button
                onClick={() => setActiveTab('fleet')}
                className="text-xs text-[#00D1FF] hover:underline font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>MANAGE FLEET</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {agents.slice(0, 4).map((agent) => {
                const pctUsed = Math.min(100, Math.round((agent.spentToday / agent.dynamicSpendCap) * 100));
                return (
                  <div key={agent.id} className="bg-[#0B0F19] p-3 rounded-lg border border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white truncate">{agent.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">({agent.type})</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pctUsed >= 90 ? 'bg-red-500' : pctUsed >= 70 ? 'bg-amber-500' : 'bg-[#00D1FF]'
                          }`}
                          style={{ width: `${pctUsed}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono text-xs">
                      <div className="text-white font-bold">
                        ${agent.spentToday} <span className="text-slate-500 text-[10px]">/ ${agent.dynamicSpendCap}</span>
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {agent.riskProfile === 'watch' ? (
                          <span className="text-red-400 font-semibold uppercase">Watchlist</span>
                        ) : agent.riskProfile === 'elevated' ? (
                          <span className="text-amber-500 font-semibold uppercase">Elevated</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold uppercase">Low Risk</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY FEED / LIVE ACTIVITY LEDGER */}
      <div className="rounded-xl border border-slate-800 bg-[#161C2D] overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white font-mono">
              Live Activity Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit log stream passing through Sentinel safety pipeline.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('audit_log')}
            className="text-xs text-[#00D1FF] hover:underline font-mono flex items-center gap-1 cursor-pointer font-bold"
          >
            <span>VIEW ALL AUDITS</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase bg-[#0E1421]">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Agent</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">AI Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs font-mono">
              {recentLogs.map((log) => {
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                return (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{timeStr}</td>
                    <td className="py-3 px-4 font-bold text-white">{log.agentName}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-[11px]">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">${log.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.riskScore >= 75
                          ? 'bg-red-500/10 text-red-500'
                          : log.riskScore >= 36
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {log.riskScore} / 100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.decision === 'auto_executed' || log.decision === 'human_approved' ? (
                        <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                          EXECUTED
                        </span>
                      ) : log.decision === 'human_review' ? (
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                          H-REVIEW
                        </span>
                      ) : (
                        <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                          BLOCKED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={log.reasoning}>
                      {log.reasoning}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
