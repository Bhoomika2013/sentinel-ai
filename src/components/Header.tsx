import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, OctagonX, Play, AlertTriangle, Cpu } from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export const Header: React.FC = () => {
  const { globalEmergencyStop, toggleEmergencyStop, humanReviewQueue } = useSentinel();
  const [showModal, setShowModal] = useState(false);

  const handleConfirmStop = () => {
    toggleEmergencyStop();
    setShowModal(false);
  };

  return (
    <>
      {/* Global Banner if Emergency Stop is Active */}
      {globalEmergencyStop && (
        <div className="bg-red-600/90 text-white px-4 py-2 font-mono text-sm font-bold tracking-wider uppercase flex items-center justify-between border-b border-red-500 shadow-lg shadow-red-900/40 animate-pulse">
          <div className="flex items-center gap-2 mx-auto">
            <OctagonX className="w-5 h-5 animate-spin text-white" />
            <span>CRITICAL ALERT: ALL AGENTS DISABLED VIA EMERGENCY STOP PROTOCOL</span>
          </div>
          <button
            onClick={toggleEmergencyStop}
            className="bg-white text-red-700 hover:bg-slate-100 px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1 shadow cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            RESUME ALL AGENTS
          </button>
        </div>
      )}

      <header className="h-16 bg-[#0E1421] border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-[#00D1FF] shadow-[0_0_10px_#00D1FF]"></div>
            <h1 className="font-extrabold text-xl tracking-tighter text-white flex items-center gap-2">
              SENTINEL
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#00D1FF]/10 border border-[#00D1FF]/30 text-[#00D1FF] font-semibold tracking-normal">
                v2.6 FinOps
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono hidden lg:block border-l border-slate-800 pl-3">
            Real-Time AI Agent Governance
          </p>
        </div>

        {/* Status Badges & Controls */}
        <div className="flex items-center gap-3">
          {/* Network Status Pill */}
          <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-mono text-xs ${
            globalEmergencyStop
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'border-slate-700 bg-slate-800/50 text-slate-300'
          }`}>
            {globalEmergencyStop ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                <span className="font-bold text-red-400">SYSTEM HALTED</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span className="font-medium">NETWORK ACTIVE</span>
              </>
            )}
          </div>

          {/* Pending Queue pill */}
          {humanReviewQueue.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              <span>{humanReviewQueue.length} Pending Review</span>
            </div>
          )}

          {/* EMERGENCY STOP BUTTON */}
          {globalEmergencyStop ? (
            <button
              onClick={toggleEmergencyStop}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold px-4 py-1.5 rounded-md border border-emerald-400/50 shadow-md flex items-center gap-2 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RESUME AGENTS</span>
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold px-4 py-1.5 rounded-md transition shadow-md flex items-center gap-2 cursor-pointer group"
            >
              <OctagonX className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">EMERGENCY STOP</span>
              <span className="sm:hidden">E-STOP</span>
            </button>
          )}
        </div>
      </header>

      {/* EMERGENCY STOP CONFIRM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161C2D] border border-red-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-center text-white font-mono">
              CONFIRM EMERGENCY STOP
            </h3>

            <p className="text-xs text-slate-300 text-center leading-relaxed font-sans">
              Are you sure you want to trigger the global Sentinel Emergency Stop? 
              This will immediately flip all <strong className="text-red-400 font-bold">7 AI agents to DISABLED</strong> status, halting all incoming financial actions.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-semibold font-mono border border-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStop}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-xs font-bold font-mono transition cursor-pointer shadow-lg"
              >
                Halt All Agents
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
