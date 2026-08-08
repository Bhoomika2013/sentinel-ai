import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Zap, 
  AlertOctagon,
  Bot
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useSentinel } from '../context/SentinelContext';

export const AnalyticsView: React.FC = () => {
  const { auditLog, agents } = useSentinel();

  // 1. Decisions over time (Last 7 Days)
  const timeDataMap: Record<string, { date: string; auto: number; review: number; blocked: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    timeDataMap[dateStr] = { date: dateStr, auto: 0, review: 0, blocked: 0 };
  }

  auditLog.forEach((log) => {
    const dateStr = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    if (timeDataMap[dateStr]) {
      if (log.decision === 'auto_executed' || log.decision === 'human_approved') {
        timeDataMap[dateStr].auto += 1;
      } else if (log.decision === 'human_review') {
        timeDataMap[dateStr].review += 1;
      } else {
        timeDataMap[dateStr].blocked += 1;
      }
    }
  });

  const decisionsOverTime = Object.values(timeDataMap);

  // 2. Risk Level Distribution
  const lowRiskCount = auditLog.filter((l) => l.riskLevel === 'low').length;
  const medRiskCount = auditLog.filter((l) => l.riskLevel === 'medium').length;
  const highRiskCount = auditLog.filter((l) => l.riskLevel === 'high').length;

  const riskDistribution = [
    { name: 'Low Risk (0-35)', count: lowRiskCount, fill: '#10b981' },
    { name: 'Medium Risk (36-74)', count: medRiskCount, fill: '#f59e0b' },
    { name: 'High Risk (75-100)', count: highRiskCount, fill: '#ef4444' },
  ];

  // 3. Decisions by Agent
  const decisionsByAgent = agents.map((agent) => {
    const agentLogs = auditLog.filter((l) => l.agentId === agent.id);
    const passed = agentLogs.filter((l) => l.decision === 'auto_executed' || l.decision === 'human_approved').length;
    const review = agentLogs.filter((l) => l.decision === 'human_review').length;
    const blocked = agentLogs.filter((l) => l.decision === 'blocked' || l.decision === 'human_rejected').length;

    return {
      agentName: agent.name.replace('Agent ', ''),
      passed,
      review,
      blocked,
    };
  });

  // Success Metrics Calculations
  const total = auditLog.length || 1;
  const passedPct = Math.round((auditLog.filter((l) => l.decision === 'auto_executed' || l.decision === 'human_approved').length / total) * 100);
  const blockedPct = Math.round((auditLog.filter((l) => l.decision === 'blocked' || l.decision === 'human_rejected').length / total) * 100);
  const reviewPct = Math.round((auditLog.filter((l) => l.decision === 'human_review').length / total) * 100);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00D1FF]" />
          Governance Analytics & Performance Metrics
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Quantitative telemetry on agent behavior, risk interception velocity, and safety pipeline SLA.
        </p>
      </div>

      {/* SUCCESS METRICS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 uppercase text-[10px] font-mono">
            <span>Automation Throughput</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {passedPct}% <span className="text-xs font-normal text-slate-400">Auto-Pass</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            {blockedPct}% blocked, {reviewPct}% escalated to human supervisors.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 uppercase text-[10px] font-mono">
            <span>Agent Halting Time</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            &lt; 250 ms
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Avg time to freeze rogue agent on anomaly detection.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 uppercase text-[10px] font-mono">
            <span>Pipeline Latency</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            118 ms
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Permission + Spend Cap + AI Risk evaluation SLA.
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-500 uppercase text-[10px] font-mono">
            <span>False Escalation Rate</span>
            <TrendingUp className="w-4 h-4 text-[#00D1FF]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#00D1FF]">
            1.8%
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Low false-positive rate on pattern detection.
          </p>
        </div>
      </div>

      {/* RECHARTS SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Decisions Over Time Line Chart */}
        <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00D1FF]" />
            Decision Outcomes Over Time (7 Days)
          </h3>

          <div className="h-64 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={decisionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend />
                <Line type="monotone" dataKey="auto" name="Auto-Executed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="review" name="Human Review" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="blocked" name="Blocked" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Risk Level Distribution Bar Chart */}
        <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Risk Level Distribution Tiering
          </h3>

          <div className="h-64 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="count" name="Evaluations" radius={[4, 4, 0, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Bar key={`bar-${index}`} dataKey="count" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Decisions by Agent Bar Chart */}
        <div className="lg:col-span-2 bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00D1FF]" />
            Decision Outcome Distribution by Individual Agent
          </h3>

          <div className="h-64 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decisionsByAgent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="agentName" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="passed" name="Auto-Pass" fill="#10b981" stackId="a" />
                <Bar dataKey="review" name="Human Review" fill="#f59e0b" stackId="a" />
                <Bar dataKey="blocked" name="Blocked" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
