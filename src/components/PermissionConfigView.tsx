import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  X, 
  Bot, 
  Check, 
  Info,
  Sparkles
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { ACTION_PRESETS } from '../types';

export const PermissionConfigView: React.FC = () => {
  const { agents, updateAgentPermissions, setActiveTab } = useSentinel();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent-001');
  const [newPermissionInput, setNewPermissionInput] = useState<string>('');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const availablePresetPermissions = [
    'reverse_fee',
    'refund_up_to_100',
    'reissue_card',
    'temporary_credit_increase',
    'waive_late_fee',
    'flag_fraud_account',
    'issue_credit_voucher',
    'freeze_card',
    'activate_card',
    'express_shipping',
    'update_address',
    'transfer_points',
    'set_payment_plan',
  ];

  const handleTogglePermission = (permission: string) => {
    if (!selectedAgent) return;
    const hasPerm = selectedAgent.permissions.includes(permission);
    let updated: string[];

    if (hasPerm) {
      updated = selectedAgent.permissions.filter((p) => p !== permission);
    } else {
      updated = [...selectedAgent.permissions, permission];
    }

    updateAgentPermissions(selectedAgent.id, updated);
    showSavedToast(`Updated permissions for ${selectedAgent.name}`);
  };

  const handleAddCustomPermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermissionInput.trim() || !selectedAgent) return;

    const formatted = newPermissionInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!selectedAgent.permissions.includes(formatted)) {
      const updated = [...selectedAgent.permissions, formatted];
      updateAgentPermissions(selectedAgent.id, updated);
      showSavedToast(`Added custom permission '${formatted}' to ${selectedAgent.name}`);
    }
    setNewPermissionInput('');
  };

  const showSavedToast = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00D1FF]" />
            Action-Level Permission Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Configure fine-grained action permissions (e.g. "refund_up_to_100") instead of blanket role assignments.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('simulator')}
          className="bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-slate-950 font-mono font-bold text-xs px-4 py-2.5 rounded-lg transition flex items-center gap-2 shadow cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Test Permission Changes Live in Simulator</span>
        </button>
      </div>

      {/* Save Notification Toast */}
      {saveNotification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-lg font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* AGENT SELECTION & MATRIX EDITING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Agent Select List (4 cols) */}
        <div className="lg:col-span-4 bg-[#161C2D] border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-800 pb-2">
            Select Agent to Configure
          </h3>

          <div className="space-y-2">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full text-left p-3 rounded-lg border transition cursor-pointer font-mono text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#00D1FF]/10 border-[#00D1FF] text-white shadow-inner'
                      : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white">{agent.name}</div>
                    <div className="text-[10px] text-slate-500">{agent.type}</div>
                  </div>
                  <span className="bg-[#00D1FF]/10 text-[#00D1FF] text-[10px] px-2 py-0.5 rounded border border-[#00D1FF]/20 font-bold">
                    {agent.permissions.length} perms
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Permission Matrix & Chip Editor (8 cols) */}
        {selectedAgent && (
          <div className="lg:col-span-8 bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#00D1FF]" />
                  {selectedAgent.name}
                  <span className="text-xs font-mono font-normal text-slate-500">({selectedAgent.type})</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono">Agent ID: {selectedAgent.id}</p>
              </div>

              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                selectedAgent.status === 'active'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {selectedAgent.status}
              </span>
            </div>

            {/* Currently Active Granted Permissions Chips */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Granted Action Permissions ({selectedAgent.permissions.length})
              </h4>

              <div className="flex flex-wrap gap-2 bg-[#0B0F19] p-4 rounded-lg border border-slate-800 min-h-[80px]">
                {selectedAgent.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="bg-[#00D1FF]/10 hover:bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/30 text-xs font-mono px-3 py-1 rounded-lg flex items-center gap-2 transition"
                  >
                    <span>{perm}</span>
                    <button
                      onClick={() => handleTogglePermission(perm)}
                      className="hover:text-red-400 transition cursor-pointer"
                      title="Revoke Permission"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Available Action Permissions Library Toggle Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Action Permissions Library (Click to Grant / Revoke)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availablePresetPermissions.map((perm) => {
                  const isGranted = selectedAgent.permissions.includes(perm);
                  return (
                    <button
                      key={perm}
                      onClick={() => handleTogglePermission(perm)}
                      className={`p-2.5 rounded-lg border text-left font-mono text-xs transition cursor-pointer flex items-center justify-between ${
                        isGranted
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold'
                          : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate mr-1">{perm}</span>
                      {isGranted ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Permission Input Form */}
            <form onSubmit={handleAddCustomPermission} className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase">
                Add Custom Fine-Grained Permission
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. waive_foreign_tx_fee"
                  value={newPermissionInput}
                  onChange={(e) => setNewPermissionInput(e.target.value)}
                  className="flex-1 bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00D1FF]"
                />
                <button
                  type="submit"
                  className="bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-slate-950 font-mono text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Grant Permission</span>
                </button>
              </div>
            </form>

            <div className="bg-[#0B0F19] p-3 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start gap-2 font-sans">
              <Info className="w-4 h-4 text-[#00D1FF] shrink-0 mt-0.5" />
              <span>
                Removing a permission chip (e.g. "reverse_fee") will immediately cause requests of that action type from {selectedAgent.name} to fail Stage 1 in the Request Simulator and route to Blocked.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
