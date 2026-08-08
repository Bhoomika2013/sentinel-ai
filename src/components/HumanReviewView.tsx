import React from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  BrainCircuit, 
  Clock, 
  Bot, 
  ShieldAlert,
  Inbox
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const HumanReviewView: React.FC = () => {
  const { humanReviewQueue, resolveHumanReview } = useSentinel();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Human Review Queue ({humanReviewQueue.length} Pending)
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Medium-risk requests escalated by Sentinel AI risk engine awaiting human supervisor decision.
          </p>
        </div>

        {humanReviewQueue.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Escalated Supervisor Queue Active</span>
          </div>
        )}
      </div>

      {/* QUEUE ITEMS LIST */}
      {humanReviewQueue.length === 0 ? (
        <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase">Review Queue Clear</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no pending medium-risk escalations requiring supervisor intervention.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {humanReviewQueue.map((req) => {
            const timeStr = new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div
                key={req.id}
                className="bg-[#161C2D] border border-amber-500/30 rounded-xl p-5 shadow-lg space-y-4 hover:border-amber-500/50 transition"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        {req.agentName}
                        <span className="text-xs font-mono font-normal text-slate-500">ID: {req.agentId}</span>
                      </h3>
                      <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
                        <span>Action: <strong className="text-white">{req.actionType}</strong></span>
                        <span>•</span>
                        <span>Customer ID: <strong className="text-white">{req.customerId}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {timeStr}
                    </span>
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-1 rounded font-bold">
                      Risk Score: {req.riskScore} / 100
                    </span>
                  </div>
                </div>

                {/* Body Details & AI Reasoning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Left: Request Rationale */}
                  <div className="bg-[#0B0F19] p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-slate-500 font-bold uppercase text-[10px] flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-[#00D1FF]" /> Request Rationale & Amount
                    </div>
                    <div className="text-base font-extrabold text-white">
                      ${req.amount} USD
                    </div>
                    <p className="text-slate-300 font-sans italic text-xs">
                      "{req.description || 'No context description specified.'}"
                    </p>
                  </div>

                  {/* Right: AI Risk Reasoning */}
                  <div className="bg-[#0B0F19] p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-slate-500 font-bold uppercase text-[10px] flex items-center gap-1">
                      <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> Sentinel AI Assessment
                    </div>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed">
                      {req.riskReasoning}
                    </p>
                  </div>
                </div>

                {/* Supervisor Resolution CTA */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => resolveHumanReview(req.id, 'rejected', 'Security Supervisor')}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject & Block Action</span>
                  </button>

                  <button
                    onClick={() => resolveHumanReview(req.id, 'approved', 'Security Supervisor')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Override</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
