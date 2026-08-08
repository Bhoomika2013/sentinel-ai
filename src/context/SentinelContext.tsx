import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Agent, ActionRequest, AuditLogEntry, INITIAL_AGENTS } from '../types';
import { generateSeedAuditLogs, generateSeedHumanReviews } from '../data/seedData';

export type NavigationTab = 
  | 'dashboard'
  | 'fleet'
  | 'simulator'
  | 'human_review'
  | 'audit_log'
  | 'analytics'
  | 'permissions';

interface SentinelContextType {
  agents: Agent[];
  auditLog: AuditLogEntry[];
  humanReviewQueue: ActionRequest[];
  globalEmergencyStop: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  toggleEmergencyStop: () => void;
  toggleAgentStatus: (agentId: string) => void;
  updateAgentBaseCap: (agentId: string, newCap: number) => void;
  updateAgentPermissions: (agentId: string, permissions: string[]) => void;
  processNewRequest: (req: ActionRequest) => void;
  resolveHumanReview: (requestId: string, decision: 'approved' | 'rejected', reviewerName?: string) => void;
  selectedAgentForDetail: Agent | null;
  setSelectedAgentForDetail: (agent: Agent | null) => void;
  pitchPresetTriggered: boolean;
  triggerPitchPreset: () => void;
  clearPitchPresetTrigger: () => void;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

export const SentinelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [humanReviewQueue, setHumanReviewQueue] = useState<ActionRequest[]>([]);
  const [globalEmergencyStop, setGlobalEmergencyStop] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedAgentForDetail, setSelectedAgentForDetail] = useState<Agent | null>(null);
  const [pitchPresetTriggered, setPitchPresetTriggered] = useState<boolean>(false);

  // Initialize seed data
  useEffect(() => {
    setAuditLog(generateSeedAuditLogs());
    setHumanReviewQueue(generateSeedHumanReviews());
  }, []);

  const toggleEmergencyStop = () => {
    setGlobalEmergencyStop((prev) => {
      const nextState = !prev;
      if (nextState) {
        // Disable ALL agents
        setAgents((currentAgents) =>
          currentAgents.map((a) => ({ ...a, status: 'disabled' }))
        );
        // Log system alert
        const emergencyLog: AuditLogEntry = {
          id: `audit-sys-${Date.now()}`,
          timestamp: new Date().toISOString(),
          agentId: 'SYSTEM',
          agentName: 'GLOBAL SENTINEL PROTOCOL',
          actionType: 'EMERGENCY_STOP_TRIGGERED',
          amount: 0,
          customerId: 'ALL_AGENTS',
          permissionCheckResult: 'pass',
          spendCapCheckResult: 'pass',
          riskScore: 100,
          riskLevel: 'high',
          decision: 'blocked',
          reasoning: 'CRITICAL: Global Emergency Stop triggered by administrator. All active agents halted immediately.',
        };
        setAuditLog((prev) => [emergencyLog, ...prev]);
      } else {
        // Resume ALL agents
        setAgents((currentAgents) =>
          currentAgents.map((a) => ({ ...a, status: 'active' }))
        );
        const resumeLog: AuditLogEntry = {
          id: `audit-sys-${Date.now()}`,
          timestamp: new Date().toISOString(),
          agentId: 'SYSTEM',
          agentName: 'GLOBAL SENTINEL PROTOCOL',
          actionType: 'EMERGENCY_STOP_RESUMED',
          amount: 0,
          customerId: 'ALL_AGENTS',
          permissionCheckResult: 'pass',
          spendCapCheckResult: 'pass',
          riskScore: 0,
          riskLevel: 'low',
          decision: 'auto_executed',
          reasoning: 'INFO: Global Emergency Stop reset by administrator. Agent operations resumed.',
        };
        setAuditLog((prev) => [resumeLog, ...prev]);
      }
      return nextState;
    });
  };

  const toggleAgentStatus = (agentId: string) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === agentId) {
          const updatedStatus = agent.status === 'active' ? 'disabled' : 'active';
          return { ...agent, status: updatedStatus };
        }
        return agent;
      })
    );
  };

  const updateAgentBaseCap = (agentId: string, newCap: number) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === agentId) {
          // Dynamic cap adjusts adaptively based on risk profile
          const riskMultiplier = agent.riskProfile === 'watch' ? 0.75 : agent.riskProfile === 'elevated' ? 0.85 : 1.0;
          const dynamicCap = Math.round(newCap * riskMultiplier);
          return {
            ...agent,
            baseSpendCap: newCap,
            dynamicSpendCap: dynamicCap,
          };
        }
        return agent;
      })
    );
  };

  const updateAgentPermissions = (agentId: string, permissions: string[]) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, permissions } : agent
      )
    );
  };

  const processNewRequest = (req: ActionRequest) => {
    // 1. Update agent metrics if executed
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === req.agentId) {
          const addSpend = req.finalDecision === 'auto_executed' ? req.amount : 0;
          const newSpent = a.spentToday + addSpend;

          // Adaptive dynamic cap calculation logic
          let newRiskProfile = a.riskProfile;
          if (newSpent > a.dynamicSpendCap * 0.9 || req.riskLevel === 'high') {
            newRiskProfile = 'watch';
          } else if (newSpent > a.dynamicSpendCap * 0.7 || req.riskLevel === 'medium') {
            newRiskProfile = 'elevated';
          }

          return {
            ...a,
            spentToday: newSpent,
            recentActionCount: a.recentActionCount + 1,
            riskProfile: newRiskProfile,
          };
        }
        return a;
      })
    );

    // 2. Add to audit log
    const auditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: req.timestamp || new Date().toISOString(),
      agentId: req.agentId,
      agentName: req.agentName,
      actionType: req.actionType,
      amount: req.amount,
      customerId: req.customerId,
      permissionCheckResult: req.permissionCheckResult,
      spendCapCheckResult: req.spendCapCheckResult,
      riskScore: req.riskScore,
      riskLevel: req.riskLevel,
      decision: req.finalDecision,
      reasoning: req.riskReasoning,
    };
    setAuditLog((prev) => [auditEntry, ...prev]);

    // 3. If medium risk, append to human review queue
    if (req.finalDecision === 'human_review') {
      setHumanReviewQueue((prev) => [req, ...prev]);
    }
  };

  const resolveHumanReview = (requestId: string, decision: 'approved' | 'rejected', reviewerName: string = 'Security Lead (Amex Ops)') => {
    const targetReq = humanReviewQueue.find((r) => r.id === requestId);
    if (!targetReq) return;

    // Remove from queue
    setHumanReviewQueue((prev) => prev.filter((r) => r.id !== requestId));

    // Update audit log
    const resolvedAuditEntry: AuditLogEntry = {
      id: `audit-rev-${Date.now()}`,
      timestamp: new Date().toISOString(),
      agentId: targetReq.agentId,
      agentName: targetReq.agentName,
      actionType: targetReq.actionType,
      amount: targetReq.amount,
      customerId: targetReq.customerId,
      permissionCheckResult: targetReq.permissionCheckResult,
      spendCapCheckResult: targetReq.spendCapCheckResult,
      riskScore: targetReq.riskScore,
      riskLevel: targetReq.riskLevel,
      decision: decision === 'approved' ? 'human_approved' : 'human_rejected',
      reasoning: `Human Review (${reviewerName}): ${decision.toUpperCase()}. Original AI Assessment: ${targetReq.riskReasoning}`,
      reviewedBy: reviewerName,
    };

    setAuditLog((prev) => [resolvedAuditEntry, ...prev]);

    // If approved, update agent spentToday
    if (decision === 'approved') {
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === targetReq.agentId) {
            return {
              ...a,
              spentToday: a.spentToday + targetReq.amount,
            };
          }
          return a;
        })
      );
    }
  };

  const triggerPitchPreset = () => {
    setActiveTab('simulator');
    setPitchPresetTriggered(true);
  };

  const clearPitchPresetTrigger = () => {
    setPitchPresetTriggered(false);
  };

  return (
    <SentinelContext.Provider
      value={{
        agents,
        auditLog,
        humanReviewQueue,
        globalEmergencyStop,
        activeTab,
        setActiveTab,
        toggleEmergencyStop,
        toggleAgentStatus,
        updateAgentBaseCap,
        updateAgentPermissions,
        processNewRequest,
        resolveHumanReview,
        selectedAgentForDetail,
        setSelectedAgentForDetail,
        pitchPresetTriggered,
        triggerPitchPreset,
        clearPitchPresetTrigger,
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
};

export const useSentinel = () => {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
};
