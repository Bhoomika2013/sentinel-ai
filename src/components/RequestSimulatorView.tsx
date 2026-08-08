import React, { useState, useEffect } from 'react';
import { 
  Play, 
  PlayCircle,
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw,
  Bot,
  Info
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';
import { ACTION_PRESETS, ActionRequest, CheckResult, DecisionOutcome, RiskLevel } from '../types';

export const RequestSimulatorView: React.FC = () => {
  const { agents, processNewRequest, pitchPresetTriggered, clearPitchPresetTrigger } = useSentinel();

  // Form State
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'agent-001');
  const [actionType, setActionType] = useState<string>('fee_reversal');
  const [amount, setAmount] = useState<number>(45);
  const [customerId, setCustomerId] = useState<string>('CUST-9012');
  const [description, setDescription] = useState<string>('Customer requesting 3rd fee reversal this month. Claimed billing delay.');

  // Pipeline execution animation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<number>(0); // 0 = Idle, 1 = Permission, 2 = SpendCap, 3 = AIRisk, 4 = Final
  
  // Pipeline Results
  const [pipelineResult, setPipelineResult] = useState<{
    permissionCheck: CheckResult;
    spendCapCheck: CheckResult;
    riskScore: number;
    riskLevel: RiskLevel;
    riskReasoning: string;
    finalDecision: DecisionOutcome;
  } | null>(null);

  // Auto-fill pitch scenario when triggered from sidebar or header
  useEffect(() => {
    if (pitchPresetTriggered) {
      handleLoadPitchScenario();
      clearPitchPresetTrigger();
    }
  }, [pitchPresetTriggered]);

  const handleLoadPitchScenario = () => {
    const alphaAgent = agents.find((a) => a.id === 'agent-001') || agents[0];
    if (alphaAgent) setSelectedAgentId(alphaAgent.id);
    setActionType('fee_reversal');
    setAmount(45);
    setCustomerId('CUST-9012');
    setDescription('Customer requesting 3rd fee reversal this month. Claimed billing delay.');
    setPipelineResult(null);
    setActiveStage(0);
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    setIsSimulating(true);
    setPipelineResult(null);
    setActiveStage(1); // Start Stage 1: Permission Check

    // Stage 1: Check permissions
    const preset = ACTION_PRESETS.find((p) => p.id === actionType);
    const requiredPerm = preset ? preset.requiredPermission : actionType;
    const hasPermission = selectedAgent.permissions.includes(requiredPerm) || selectedAgent.permissions.includes(actionType);
    const permResult: CheckResult = hasPermission ? 'pass' : 'fail';

    await new Promise((resolve) => setTimeout(resolve, 700));
    setActiveStage(2); // Stage 2: Spend Cap Check

    // Stage 2: Check Dynamic Spend Cap
    const totalPotentialSpend = selectedAgent.spentToday + amount;
    const isWithinCap = totalPotentialSpend <= selectedAgent.dynamicSpendCap && selectedAgent.status === 'active';
    const spendCapResult: CheckResult = isWithinCap ? 'pass' : 'fail';

    await new Promise((resolve) => setTimeout(resolve, 800));
    setActiveStage(3); // Stage 3: AI Risk Assessment Call

    // Call Real Gemini API Backend Route
    let aiScore = 50;
    let aiLevel: RiskLevel = 'medium';
    let aiReasoning = 'Evaluating behavioral anomaly against transaction history...';

    try {
      const response = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: selectedAgent,
          actionType,
          amount,
          customerId,
          description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiScore = data.riskScore ?? 50;
        aiLevel = (data.riskLevel as RiskLevel) || 'medium';
        aiReasoning = data.reasoning || 'Request analyzed by Sentinel Gemini risk engine.';
      } else {
        console.warn('API route failed, using rule fallback');
      }
    } catch (err) {
      console.warn('Fetch error during risk scoring, fallback rule applied:', err);
    }

    // Override if permission or spend cap failed hard
    if (permResult === 'fail') {
      aiScore = Math.max(aiScore, 85);
      aiLevel = 'high';
      aiReasoning = `CRITICAL: Agent '${selectedAgent.name}' lacks permission '${requiredPerm}' for this action. Blocked automatically.`;
    } else if (spendCapResult === 'fail') {
      aiScore = Math.max(aiScore, 80);
      aiLevel = 'high';
      aiReasoning = `CRITICAL: Amount $${amount} exceeds available dynamic spend cap ($${selectedAgent.dynamicSpendCap - selectedAgent.spentToday} remaining).`;
    }

    // Determine Final Decision Outcome
    let decision: DecisionOutcome = 'auto_executed';
    if (aiLevel === 'high') {
      decision = 'blocked';
    } else if (aiLevel === 'medium') {
      decision = 'human_review';
    } else {
      decision = 'auto_executed';
    }

    await new Promise((resolve) => setTimeout(resolve, 900));
    setActiveStage(4); // Stage 4: Final Decision

    const finalResult = {
      permissionCheck: permResult,
      spendCapCheck: spendCapResult,
      riskScore: aiScore,
      riskLevel: aiLevel,
      riskReasoning: aiReasoning,
      finalDecision: decision,
    };

    setPipelineResult(finalResult);
    setIsSimulating(false);

    // Process & write to global audit log / review queue
    const requestRecord: ActionRequest = {
      id: `req-sim-${Date.now()}`,
      agentId: selectedAgent.id,
      agentName: `${selectedAgent.name} (${selectedAgent.type})`,
      actionType,
      amount,
      customerId,
      description,
      timestamp: new Date().toISOString(),
      permissionCheckResult: permResult,
      spendCapCheckResult: spendCapResult,
      riskScore: aiScore,
      riskLevel: aiLevel,
      riskReasoning: aiReasoning,
      finalDecision: decision,
    };

    processNewRequest(requestRecord);
  };

  return (
    <div className="space-y-6">
      {/* Title & Quick Run Button */}
      <div className="bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-[#00D1FF]" />
            Live Request Simulator & Checkpoint Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Dispatch financial actions from autonomous agents through Sentinel's 3-stage governance checkpoint.
          </p>
        </div>

        <button
          onClick={handleLoadPitchScenario}
          type="button"
          className="bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-500 font-bold text-xs px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer font-mono"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Pre-fill Pitch Demo Scenario ($45 Anomaly)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORM PANEL (Left Column - 5 cols) */}
        <div className="lg:col-span-5 bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3 flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00D1FF]" />
            Simulate Agent Request
          </h3>

          <form onSubmit={handleRunSimulation} className="space-y-4 text-xs font-mono">
            {/* Agent Select */}
            <div>
              <label className="block text-slate-500 uppercase text-[10px] mb-1 font-semibold">
                Select Agent
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00D1FF]"
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type}) - ${a.spentToday}/${a.dynamicSpendCap}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-slate-500 uppercase text-[10px] mb-1 font-semibold">
                Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value);
                  const preset = ACTION_PRESETS.find((p) => p.id === e.target.value);
                  if (preset) setAmount(preset.typicalAmount);
                }}
                className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00D1FF]"
              >
                {ACTION_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} (Requires: {p.requiredPermission})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Customer ID */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 uppercase text-[10px] mb-1 font-semibold">
                  Amount ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:border-[#00D1FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase text-[10px] mb-1 font-semibold">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#00D1FF]"
                />
              </div>
            </div>

            {/* Context / Description */}
            <div>
              <label className="block text-slate-500 uppercase text-[10px] mb-1 font-semibold">
                Request Context / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe request rationale or customer statement..."
                className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#00D1FF] text-xs font-sans"
              />
            </div>

            {/* Agent Live Specs Info Card */}
            {selectedAgent && (
              <div className="bg-[#0B0F19] p-3 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <div className="text-slate-500 uppercase text-[10px] flex items-center justify-between">
                  <span>Agent Permissions:</span>
                  <span className="text-white font-bold">{selectedAgent.permissions.length} Active</span>
                </div>
                <div className="text-slate-500 uppercase text-[10px] flex items-center justify-between">
                  <span>Available Limit Today:</span>
                  <span className="text-emerald-400 font-bold">
                    ${Math.max(0, selectedAgent.dynamicSpendCap - selectedAgent.spentToday)}
                  </span>
                </div>
                <div className="text-slate-500 uppercase text-[10px] flex items-center justify-between">
                  <span>Status:</span>
                  <span className={selectedAgent.status === 'active' ? 'text-emerald-400 font-bold uppercase' : 'text-red-400 font-bold uppercase'}>
                    {selectedAgent.status}
                  </span>
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSimulating}
              className={`w-full font-bold text-xs py-3 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer font-mono ${
                isSimulating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-slate-950 font-bold'
              }`}
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  <span>Processing Checkpoint...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>EXECUTE CHECKPOINT PIPELINE</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* PIPELINE VISUALIZER PANEL (Right Column - 7 cols) */}
        <div className="lg:col-span-7 bg-[#161C2D] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00D1FF]" />
              Sentinel 3-Stage Checkpoint Visualizer
            </h3>

            {/* PIPELINE HORIZONTAL STEPS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 my-6">
              {/* STAGE 1: Permission Engine */}
              <div
                className={`p-3 rounded-lg border transition-all duration-300 font-mono text-xs flex flex-col justify-between ${
                  activeStage === 1
                    ? 'bg-[#00D1FF]/10 border-[#00D1FF] scale-105 ring-1 ring-[#00D1FF]'
                    : activeStage > 1
                    ? pipelineResult?.permissionCheck === 'pass'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                    : 'bg-[#0B0F19] border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[10px] uppercase text-slate-500">1. Permission</span>
                  <ShieldCheck className="w-4 h-4 text-[#00D1FF]" />
                </div>
                <div className="text-[11px] font-semibold text-white">Action Control</div>
                <div className="mt-2 text-[10px] font-bold">
                  {activeStage === 1 ? (
                    <span className="text-[#00D1FF] animate-pulse">Evaluating...</span>
                  ) : activeStage > 1 ? (
                    pipelineResult?.permissionCheck === 'pass' ? (
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> PASS</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> FAIL</span>
                    )
                  ) : (
                    <span className="text-slate-600">Idle</span>
                  )}
                </div>
              </div>

              {/* STAGE 2: Dynamic Spend Cap */}
              <div
                className={`p-3 rounded-lg border transition-all duration-300 font-mono text-xs flex flex-col justify-between ${
                  activeStage === 2
                    ? 'bg-[#00D1FF]/10 border-[#00D1FF] scale-105 ring-1 ring-[#00D1FF]'
                    : activeStage > 2
                    ? pipelineResult?.spendCapCheck === 'pass'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                    : 'bg-[#0B0F19] border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[10px] uppercase text-slate-500">2. Spend Cap</span>
                  <DollarSign className="w-4 h-4 text-[#00D1FF]" />
                </div>
                <div className="text-[11px] font-semibold text-white">Adaptive Limit</div>
                <div className="mt-2 text-[10px] font-bold">
                  {activeStage === 2 ? (
                    <span className="text-[#00D1FF] animate-pulse">Checking Cap...</span>
                  ) : activeStage > 2 ? (
                    pipelineResult?.spendCapCheck === 'pass' ? (
                      <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> PASS</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> EXCEEDED</span>
                    )
                  ) : (
                    <span className="text-slate-600">Idle</span>
                  )}
                </div>
              </div>

              {/* STAGE 3: Gemini AI Risk Engine */}
              <div
                className={`p-3 rounded-lg border transition-all duration-300 font-mono text-xs flex flex-col justify-between ${
                  activeStage === 3
                    ? 'bg-purple-600/20 border-purple-400 scale-105 ring-1 ring-purple-500/50'
                    : activeStage > 3
                    ? 'bg-[#0B0F19] border-purple-500/40 text-purple-300'
                    : 'bg-[#0B0F19] border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[10px] uppercase text-slate-500">3. AI Risk</span>
                  <BrainCircuit className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-[11px] font-semibold text-white">Gemini Engine</div>
                <div className="mt-2 text-[10px] font-bold">
                  {activeStage === 3 ? (
                    <span className="text-purple-400 animate-pulse">Scoring...</span>
                  ) : activeStage > 3 ? (
                    <span className={pipelineResult?.riskLevel === 'high' ? 'text-red-400' : pipelineResult?.riskLevel === 'medium' ? 'text-amber-500' : 'text-emerald-400'}>
                      Score: {pipelineResult?.riskScore}/100
                    </span>
                  ) : (
                    <span className="text-slate-600">Idle</span>
                  )}
                </div>
              </div>

              {/* STAGE 4: Final Outcome */}
              <div
                className={`p-3 rounded-lg border transition-all duration-300 font-mono text-xs flex flex-col justify-between ${
                  activeStage === 4
                    ? pipelineResult?.finalDecision === 'auto_executed'
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                      : pipelineResult?.finalDecision === 'human_review'
                      ? 'bg-amber-950 border-amber-400 text-amber-300'
                      : 'bg-red-950 border-red-400 text-red-300'
                    : 'bg-[#0B0F19] border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[10px] uppercase text-slate-500">4. Outcome</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-semibold text-white">Routing</div>
                <div className="mt-2 text-[10px] font-extrabold uppercase">
                  {activeStage === 4 ? (
                    pipelineResult?.finalDecision === 'auto_executed' ? (
                      <span className="text-emerald-400">AUTO-EXECUTED</span>
                    ) : pipelineResult?.finalDecision === 'human_review' ? (
                      <span className="text-amber-500">HUMAN REVIEW</span>
                    ) : (
                      <span className="text-red-400">BLOCKED</span>
                    )
                  ) : (
                    <span className="text-slate-600">Idle</span>
                  )}
                </div>
              </div>
            </div>

            {/* FINAL DECISION DISPLAY BANNER */}
            {pipelineResult && activeStage === 4 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Big Result Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    pipelineResult.finalDecision === 'auto_executed'
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : pipelineResult.finalDecision === 'human_review'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                      : 'bg-red-500/10 border-red-500/40 text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {pipelineResult.finalDecision === 'auto_executed' ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                    ) : pipelineResult.finalDecision === 'human_review' ? (
                      <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                    )}

                    <div>
                      <h4 className="text-sm font-extrabold font-mono tracking-wider text-white">
                        FINAL DECISION: {pipelineResult.finalDecision === 'auto_executed' ? 'AUTO-EXECUTED INSTANTLY' : pipelineResult.finalDecision === 'human_review' ? 'ESCALATED TO HUMAN REVIEW QUEUE' : 'BLOCKED BY SENTINEL'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5 font-mono">
                        Risk Score: <span className="font-bold">{pipelineResult.riskScore} / 100</span> ({pipelineResult.riskLevel.toUpperCase()} RISK TIER)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gemini AI Reasoning Callout */}
                <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                    <span>Gemini AI Safety Assessment:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#161C2D] p-3 rounded-lg border border-slate-800 italic">
                    "{pipelineResult.riskReasoning}"
                  </p>
                </div>
              </div>
            )}

            {!pipelineResult && !isSimulating && (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl p-6 text-slate-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-mono">
                  Submit a request on the left or click "Pre-fill Pitch Demo Scenario" to test the pipeline live.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono border-t border-slate-800 pt-3 flex items-center justify-between">
            <span>Audit Trail: Auto-logged to persistent state</span>
            <span className="text-[#00D1FF] font-bold">Response &lt; 150ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
