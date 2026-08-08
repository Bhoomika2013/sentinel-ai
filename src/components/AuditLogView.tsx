import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Bot
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { AuditLogEntry } from '../types';

export const AuditLogView: React.FC = () => {
  const { auditLog, agents } = useSentinel();

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedDecisionFilter, setSelectedDecisionFilter] = useState<string>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Filtered entries
  const filteredLogs = auditLog.filter((entry) => {
    // Search keyword
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      entry.agentName.toLowerCase().includes(searchLower) ||
      entry.actionType.toLowerCase().includes(searchLower) ||
      entry.customerId.toLowerCase().includes(searchLower) ||
      entry.reasoning.toLowerCase().includes(searchLower) ||
      entry.id.toLowerCase().includes(searchLower);

    // Agent filter
    const matchesAgent = selectedAgentFilter === 'all' || entry.agentId === selectedAgentFilter;

    // Risk level filter
    const matchesRisk = selectedRiskFilter === 'all' || entry.riskLevel === selectedRiskFilter;

    // Decision outcome filter
    const matchesDecision = selectedDecisionFilter === 'all' || entry.decision === selectedDecisionFilter;

    return matchesSearch && matchesAgent && matchesRisk && matchesDecision;
  });

  // REAL CSV BLOB DOWNLOAD
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Audit ID',
      'Timestamp',
      'Agent ID',
      'Agent Name',
      'Action Type',
      'Amount ($)',
      'Customer ID',
      'Risk Score',
      'Risk Level',
      'Decision',
      'Permission Result',
      'Spend Cap Result',
      'Reasoning',
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      `"${log.timestamp}"`,
      log.agentId,
      `"${log.agentName}"`,
      log.actionType,
      log.amount,
      log.customerId,
      log.riskScore,
      log.riskLevel,
      log.decision,
      log.permissionCheckResult,
      log.spendCapCheckResult,
      `"${log.reasoning.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sentinel_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title Header & Export CTA */}
      <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00D1FF]" />
            Immutable Audit Log ({filteredLogs.length} Records)
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Complete cryptographic audit trail of all agent action requests and safety decisions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-slate-950 font-mono font-bold text-xs px-4 py-2.5 rounded-lg transition flex items-center gap-2 shadow cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV ({filteredLogs.length})</span>
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search keyword, customer, reasoning..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-[#00D1FF]"
            />
          </div>

          {/* Agent Select */}
          <div>
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00D1FF]"
            >
              <option value="all">All Agents ({agents.length})</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Select */}
          <div>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00D1FF]"
            >
              <option value="all">All Risk Tiers</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          {/* Decision Outcome Select */}
          <div>
            <select
              value={selectedDecisionFilter}
              onChange={(e) => setSelectedDecisionFilter(e.target.value)}
              className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00D1FF]"
            >
              <option value="all">All Decisions</option>
              <option value="auto_executed">Auto-Executed</option>
              <option value="human_review">Human Review</option>
              <option value="blocked">Blocked</option>
              <option value="human_approved">Human Approved</option>
              <option value="human_rejected">Human Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-[#161C2D] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#0B0F19] border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedRowId === log.id;
                  const timeStr = new Date(log.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedRowId(isExpanded ? null : log.id)}
                        className="hover:bg-slate-800/50 transition cursor-pointer"
                      >
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{timeStr}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{log.agentName}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-700/60 text-[11px] text-slate-300">
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-white">${log.amount}</td>
                        <td className="py-3.5 px-4 text-slate-300">{log.customerId}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.riskScore >= 75
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : log.riskScore >= 36
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {log.riskScore} ({log.riskLevel.toUpperCase()})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {log.decision === 'auto_executed' || log.decision === 'human_approved' ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {log.decision === 'human_approved' ? 'Approved (Human)' : 'Auto-Exec'}
                            </span>
                          ) : log.decision === 'human_review' ? (
                            <span className="text-amber-500 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Human Rev
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              {log.decision === 'human_rejected' ? 'Rejected (Human)' : 'Blocked'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                        </td>
                      </tr>

                      {/* EXPANDED ROW REASONING DETAIL */}
                      {isExpanded && (
                        <tr className="bg-[#0B0F19]">
                          <td colSpan={8} className="p-4 border-b border-slate-800">
                            <div className="bg-[#161C2D] p-4 rounded-lg border border-slate-800 space-y-3">
                              <div className="flex items-center justify-between text-slate-300 font-bold text-xs">
                                <span>Audit ID: <strong className="text-[#00D1FF]">{log.id}</strong></span>
                                <span>Permission Engine: <strong className={log.permissionCheckResult === 'pass' ? 'text-emerald-400' : 'text-red-400'}>{log.permissionCheckResult.toUpperCase()}</strong></span>
                                <span>Spend Cap Check: <strong className={log.spendCapCheckResult === 'pass' ? 'text-emerald-400' : 'text-red-400'}>{log.spendCapCheckResult.toUpperCase()}</strong></span>
                              </div>
                              <p className="text-xs text-slate-300 font-sans italic bg-[#0B0F19] p-3 rounded-lg border border-slate-800">
                                Reasoning: "{log.reasoning}"
                              </p>
                              {log.reviewedBy && (
                                <p className="text-[11px] text-amber-500 font-mono">
                                  Supervisor Action by: {log.reviewedBy}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
