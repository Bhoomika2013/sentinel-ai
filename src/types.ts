export type AgentStatus = 'active' | 'disabled';
export type RiskProfile = 'low' | 'elevated' | 'watch';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CheckResult = 'pass' | 'fail';
export type DecisionOutcome = 'auto_executed' | 'human_review' | 'blocked';
export type ReviewDecision = 'approved' | 'rejected';

export interface Agent {
  id: string;
  name: string;
  type: string; // e.g. "Servicing Agent", "Refund Agent", "Card Issuance Agent", "Collections Agent", "Fraud Investigation Agent", "Credit Limit Agent"
  status: AgentStatus;
  permissions: string[]; // e.g. "refund_up_to_100", "reverse_fee", "reissue_card", "cannot_change_credit_limit"
  dynamicSpendCap: number; // adaptive limit in USD
  baseSpendCap: number;
  spentToday: number;
  riskProfile: RiskProfile;
  recentActionCount: number; // last 24h
}

export interface ActionRequest {
  id: string;
  agentId: string;
  agentName: string;
  actionType: string; // e.g. "fee_reversal", "refund", "card_reissue", "credit_limit_change"
  amount: number;
  customerId: string;
  description: string;
  timestamp: string;
  permissionCheckResult: CheckResult;
  spendCapCheckResult: CheckResult;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskReasoning: string;
  finalDecision: DecisionOutcome;
  reviewedBy?: string;
  reviewDecision?: ReviewDecision;
  reviewedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  actionType: string;
  amount: number;
  customerId: string;
  permissionCheckResult: CheckResult;
  spendCapCheckResult: CheckResult;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: DecisionOutcome | 'human_approved' | 'human_rejected';
  reasoning: string;
  reviewedBy?: string;
}

export interface ActionTypePreset {
  id: string;
  label: string;
  requiredPermission: string;
  typicalAmount: number;
  category: string;
}

export const ACTION_PRESETS: ActionTypePreset[] = [
  { id: 'fee_reversal', label: 'Fee Reversal', requiredPermission: 'reverse_fee', typicalAmount: 45, category: 'Servicing' },
  { id: 'refund', label: 'Customer Refund', requiredPermission: 'refund_up_to_100', typicalAmount: 85, category: 'Refunds' },
  { id: 'card_reissue', label: 'Card Reissuance', requiredPermission: 'reissue_card', typicalAmount: 15, category: 'Cards' },
  { id: 'credit_limit_change', label: 'Credit Limit Adjustment', requiredPermission: 'temporary_credit_increase', typicalAmount: 500, category: 'Credit' },
  { id: 'waive_late_fee', label: 'Waive Late Fee', requiredPermission: 'waive_late_fee', typicalAmount: 35, category: 'Collections' },
  { id: 'flag_fraud_account', label: 'Flag Account for Fraud', requiredPermission: 'flag_fraud_account', typicalAmount: 0, category: 'Security' },
];

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    name: 'Agent Alpha',
    type: 'Servicing Agent',
    status: 'active',
    permissions: ['reverse_fee', 'refund_up_to_100', 'update_address'],
    dynamicSpendCap: 800,
    baseSpendCap: 1000,
    spentToday: 620,
    riskProfile: 'elevated',
    recentActionCount: 18,
  },
  {
    id: 'agent-002',
    name: 'Agent Beta',
    type: 'Refund Agent',
    status: 'active',
    permissions: ['refund_up_to_100', 'issue_credit_voucher'],
    dynamicSpendCap: 1500,
    baseSpendCap: 1500,
    spentToday: 350,
    riskProfile: 'low',
    recentActionCount: 6,
  },
  {
    id: 'agent-003',
    name: 'Agent Gamma',
    type: 'Card Issuance Agent',
    status: 'active',
    permissions: ['reissue_card', 'activate_card', 'express_shipping'],
    dynamicSpendCap: 500,
    baseSpendCap: 500,
    spentToday: 120,
    riskProfile: 'low',
    recentActionCount: 4,
  },
  {
    id: 'agent-004',
    name: 'Agent Delta',
    type: 'Collections Agent',
    status: 'active',
    permissions: ['waive_late_fee', 'set_payment_plan'],
    dynamicSpendCap: 2000,
    baseSpendCap: 2000,
    spentToday: 1850,
    riskProfile: 'watch',
    recentActionCount: 22,
  },
  {
    id: 'agent-005',
    name: 'Agent Epsilon',
    type: 'Fraud Investigation Agent',
    status: 'active',
    permissions: ['flag_fraud_account', 'freeze_card', 'reverse_fee'],
    dynamicSpendCap: 3000,
    baseSpendCap: 3000,
    spentToday: 400,
    riskProfile: 'low',
    recentActionCount: 3,
  },
  {
    id: 'agent-006',
    name: 'Agent Zeta',
    type: 'Credit Limit Agent',
    status: 'active',
    permissions: ['temporary_credit_increase', 'view_credit_score'],
    dynamicSpendCap: 1000,
    baseSpendCap: 1000,
    spentToday: 950,
    riskProfile: 'watch',
    recentActionCount: 15,
  },
  {
    id: 'agent-007',
    name: 'Agent Eta',
    type: 'Servicing Agent',
    status: 'active',
    permissions: ['reverse_fee', 'transfer_points'],
    dynamicSpendCap: 750,
    baseSpendCap: 750,
    spentToday: 100,
    riskProfile: 'low',
    recentActionCount: 2,
  },
];
