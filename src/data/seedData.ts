import { AuditLogEntry, ActionRequest } from '../types';

export function generateSeedAuditLogs(): AuditLogEntry[] {
  const now = new Date();
  const logs: AuditLogEntry[] = [];

  const sampleActions = [
    { action: 'fee_reversal', amount: 35, customer: 'CUST-8821', agentId: 'agent-001', agentName: 'Agent Alpha', level: 'low', decision: 'auto_executed', score: 12, reasoning: 'Routine fee reversal within policy and agent threshold.' },
    { action: 'fee_reversal', amount: 45, customer: 'CUST-9012', agentId: 'agent-001', agentName: 'Agent Alpha', level: 'medium', decision: 'human_review', score: 58, reasoning: 'Customer requested 3rd fee reversal in 30 days. Pattern anomaly flagged.' },
    { action: 'refund', amount: 89, customer: 'CUST-4120', agentId: 'agent-002', agentName: 'Agent Beta', level: 'low', decision: 'auto_executed', score: 18, reasoning: 'Standard product refund request validated against order history.' },
    { action: 'card_reissue', amount: 15, customer: 'CUST-3319', agentId: 'agent-003', agentName: 'Agent Gamma', level: 'low', decision: 'auto_executed', score: 5, reasoning: 'Standard damaged card replacement request.' },
    { action: 'waive_late_fee', amount: 35, customer: 'CUST-7741', agentId: 'agent-004', agentName: 'Agent Delta', level: 'low', decision: 'auto_executed', score: 22, reasoning: 'First time late fee waiver granted under customer loyalty policy.' },
    { action: 'credit_limit_change', amount: 2500, customer: 'CUST-1190', agentId: 'agent-006', agentName: 'Agent Zeta', level: 'high', decision: 'blocked', score: 88, reasoning: 'Requested limit change $2,500 exceeds dynamic cap of $1,000 and unauthorized high-risk delta.' },
    { action: 'flag_fraud_account', amount: 0, customer: 'CUST-5523', agentId: 'agent-005', agentName: 'Agent Epsilon', level: 'low', decision: 'auto_executed', score: 8, reasoning: 'Suspicious overseas transaction trigger confirmed by rule engine.' },
    { action: 'refund', amount: 120, customer: 'CUST-6621', agentId: 'agent-002', agentName: 'Agent Beta', level: 'high', decision: 'blocked', score: 82, reasoning: 'Amount $120 exceeds maximum permitted refund limit ($100) for this agent role.' },
    { action: 'fee_reversal', amount: 50, customer: 'CUST-4910', agentId: 'agent-007', agentName: 'Agent Eta', level: 'low', decision: 'auto_executed', score: 15, reasoning: 'Service interruption courtesy fee reversal approved.' },
    { action: 'waive_late_fee', amount: 35, customer: 'CUST-2291', agentId: 'agent-004', agentName: 'Agent Delta', level: 'medium', decision: 'human_review', score: 62, reasoning: 'High frequency waiving behavior detected on agent Delta over last 2 hours.' },
    { action: 'credit_limit_change', amount: 500, customer: 'CUST-8023', agentId: 'agent-006', agentName: 'Agent Zeta', level: 'low', decision: 'auto_executed', score: 28, reasoning: 'Temporary holiday credit line extension within safety margin.' },
    { action: 'card_reissue', amount: 25, customer: 'CUST-3901', agentId: 'agent-003', agentName: 'Agent Gamma', level: 'low', decision: 'auto_executed', score: 10, reasoning: 'Express international replacement card request.' },
    { action: 'fee_reversal', amount: 45, customer: 'CUST-1092', agentId: 'agent-001', agentName: 'Agent Alpha', level: 'low', decision: 'auto_executed', score: 14, reasoning: 'Annual percentage rate dispute resolution credit.' },
    { action: 'refund', amount: 75, customer: 'CUST-7712', agentId: 'agent-002', agentName: 'Agent Beta', level: 'low', decision: 'auto_executed', score: 16, reasoning: 'Merchant dispute refund within agent autonomy limits.' },
    { action: 'flag_fraud_account', amount: 0, customer: 'CUST-9901', agentId: 'agent-005', agentName: 'Agent Epsilon', level: 'low', decision: 'auto_executed', score: 4, reasoning: 'Compromised credential list match freeze.' },
    { action: 'waive_late_fee', amount: 40, customer: 'CUST-3129', agentId: 'agent-004', agentName: 'Agent Delta', level: 'high', decision: 'blocked', score: 91, reasoning: 'Daily cumulative spend cap ($2,000) reached. Further waivers blocked.' },
    { action: 'fee_reversal', amount: 150, customer: 'CUST-4412', agentId: 'agent-001', agentName: 'Agent Alpha', level: 'high', decision: 'blocked', score: 85, reasoning: 'Action fee_reversal amount $150 lacks permission refund_up_to_100 validation.' },
    { action: 'refund', amount: 95, customer: 'CUST-6019', agentId: 'agent-002', agentName: 'Agent Beta', level: 'medium', decision: 'human_review', score: 52, reasoning: 'Customer account created < 7 days ago requesting max threshold refund.' },
    { action: 'credit_limit_change', amount: 800, customer: 'CUST-1823', agentId: 'agent-006', agentName: 'Agent Zeta', level: 'medium', decision: 'human_review', score: 65, reasoning: 'Agent approaching daily dynamic spend cap ceiling.' },
    { action: 'fee_reversal', amount: 30, customer: 'CUST-5510', agentId: 'agent-007', agentName: 'Agent Eta', level: 'low', decision: 'auto_executed', score: 9, reasoning: 'Overdraft fee courtesy waiver.' },
    { action: 'card_reissue', amount: 15, customer: 'CUST-2201', agentId: 'agent-003', agentName: 'Agent Gamma', level: 'low', decision: 'auto_executed', score: 6, reasoning: 'Lost card replacement.' },
    { action: 'waive_late_fee', amount: 35, customer: 'CUST-9122', agentId: 'agent-004', agentName: 'Agent Delta', level: 'low', decision: 'auto_executed', score: 25, reasoning: 'Hardship request fee credit.' },
    { action: 'refund', amount: 60, customer: 'CUST-3810', agentId: 'agent-002', agentName: 'Agent Beta', level: 'low', decision: 'auto_executed', score: 11, reasoning: 'Returned item store credit.' },
    { action: 'fee_reversal', amount: 45, customer: 'CUST-7700', agentId: 'agent-001', agentName: 'Agent Alpha', level: 'medium', decision: 'human_review', score: 56, reasoning: 'Repetitive reversal code entered by automated agent script.' },
  ];

  sampleActions.forEach((item, index) => {
    // Distribute timestamps over last 7 days
    const hoursAgo = Math.floor((index / sampleActions.length) * 168); // 7 days * 24h
    const time = new Date(now.getTime() - hoursAgo * 3600 * 1000 - (index * 13 * 60 * 1000));

    logs.push({
      id: `audit-${1000 + index}`,
      timestamp: time.toISOString(),
      agentId: item.agentId,
      agentName: item.agentName,
      actionType: item.action,
      amount: item.amount,
      customerId: item.customer,
      permissionCheckResult: item.score > 80 && item.amount > 100 ? 'fail' : 'pass',
      spendCapCheckResult: item.score > 85 ? 'fail' : 'pass',
      riskScore: item.score,
      riskLevel: item.level as any,
      decision: item.decision as any,
      reasoning: item.reasoning,
    });
  });

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateSeedHumanReviews(): ActionRequest[] {
  const now = new Date();
  return [
    {
      id: 'req-rev-001',
      agentId: 'agent-001',
      agentName: 'Agent Alpha (Servicing)',
      actionType: 'fee_reversal',
      amount: 45,
      customerId: 'CUST-9012',
      description: 'Customer requesting 3rd fee reversal this month. Claimed billing delay.',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      permissionCheckResult: 'pass',
      spendCapCheckResult: 'pass',
      riskScore: 58,
      riskLevel: 'medium',
      riskReasoning: 'Customer account shows 2 prior fee reversals within the last 28 days. Sequential waiver pattern requires human supervisor authorization.',
      finalDecision: 'human_review',
    },
    {
      id: 'req-rev-002',
      agentId: 'agent-006',
      agentName: 'Agent Zeta (Credit Limit)',
      actionType: 'credit_limit_change',
      amount: 800,
      customerId: 'CUST-1823',
      description: 'Temporary 30-day credit increase for travel emergency purchase.',
      timestamp: new Date(now.getTime() - 42 * 60000).toISOString(),
      permissionCheckResult: 'pass',
      spendCapCheckResult: 'pass',
      riskScore: 65,
      riskLevel: 'medium',
      riskReasoning: 'Agent Zeta is currently at 95% of daily dynamic spend cap ($950/$1000). High volume window requires oversight before cap expansion.',
      finalDecision: 'human_review',
    },
    {
      id: 'req-rev-003',
      agentId: 'agent-002',
      agentName: 'Agent Beta (Refunds)',
      actionType: 'refund',
      amount: 95,
      customerId: 'CUST-6019',
      description: 'Manual exception refund for damaged goods shipment.',
      timestamp: new Date(now.getTime() - 110 * 60000).toISOString(),
      permissionCheckResult: 'pass',
      spendCapCheckResult: 'pass',
      riskScore: 52,
      riskLevel: 'medium',
      riskReasoning: 'Customer account established recently (6 days ago). High-value refund near $100 permission threshold triggers elevated verification protocol.',
      finalDecision: 'human_review',
    },
  ];
}
