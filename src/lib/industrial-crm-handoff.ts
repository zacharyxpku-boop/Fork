import type { IndustrializationSnapshot } from '@/lib/industrial-chain-store';
import type { PerformanceImportReport } from '@/lib/performance-import';

export interface IndustrialCrmHandoffInput {
  inquiryId: string;
  projectId: string;
  owner?: string;
  snapshot: IndustrializationSnapshot;
  performance?: PerformanceImportReport;
}

export interface IndustrialCrmHandoffPatch {
  owner: string;
  nextAction: string;
  nextActionDue: string;
  reviewNotes: string;
  reviewDecision: 'iterate_poc' | 'expand_sku' | 'push_contract' | 'drop';
  reviewCompletedAt: string;
  contractNextStep: string;
  contractStage: 'discovery' | 'proposal' | 'negotiation' | 'waiting_payment';
  quoteStatus: 'not_sent' | 'drafting' | 'sent';
  paymentStatus: 'not_started' | 'pending';
  lifecycleStage: 'mql' | 'sql' | 'opportunity';
  dealProbability: string;
  closeDate: string;
  renewalPotential: 'low' | 'medium' | 'high';
  crmSyncStatus: 'ready';
  crmSyncAt: string;
  crmSyncNote: string;
  tags: string;
  priority: 'normal' | 'high' | 'urgent';
}

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function plusDays(baseIso: string, days: number) {
  return new Date(Date.parse(baseIso) + days * 24 * 60 * 60 * 1000).toISOString();
}

export function buildIndustrialCrmHandoff(input: IndustrialCrmHandoffInput): IndustrialCrmHandoffPatch {
  const now = new Date().toISOString();
  const scale = input.performance?.summary.scaleCount || 0;
  const iterate = input.performance?.summary.iterateCount || 0;
  const pause = input.performance?.summary.pauseCount || 0;
  const missing = input.snapshot.missingLinks;
  const hasMeasuredSignal = Boolean(input.performance && input.performance.decisions.length > 0);
  const best = input.performance?.decisions.find(item => item.decision === 'scale');
  const reviewDecision: IndustrialCrmHandoffPatch['reviewDecision'] = best
    ? 'expand_sku'
    : hasMeasuredSignal && iterate > 0
      ? 'iterate_poc'
      : missing.length > 0
        ? 'iterate_poc'
        : 'push_contract';
  const commercialReady = reviewDecision === 'expand_sku' || reviewDecision === 'push_contract';
  const priority: IndustrialCrmHandoffPatch['priority'] = best ? 'high' : missing.length >= 2 ? 'normal' : 'high';
  const quoteStatus: IndustrialCrmHandoffPatch['quoteStatus'] = best ? 'drafting' : 'not_sent';
  const paymentStatus: IndustrialCrmHandoffPatch['paymentStatus'] = best ? 'pending' : 'not_started';
  const lifecycleStage: IndustrialCrmHandoffPatch['lifecycleStage'] = best ? 'opportunity' : commercialReady ? 'sql' : 'mql';
  const dealProbability = best
    ? '68'
    : commercialReady
      ? '55'
      : missing.length > 0
        ? '35'
        : '45';
  const renewalPotential: IndustrialCrmHandoffPatch['renewalPotential'] = best ? 'high' : commercialReady ? 'medium' : 'low';
  const nextActionDue = plusDays(now, best ? 1 : commercialReady ? 2 : 3);
  const closeDate = plusDays(now, best ? 7 : commercialReady ? 10 : 14).slice(0, 10);
  const nextAction = best
    ? `Scale ${best.row.sku} / ${best.row.asset}; prepare expansion quote and next SKU batch scope.`
    : missing.length > 0
      ? `Close industrial-chain gaps: ${missing.slice(0, 2).join('; ')}.`
      : 'Book review call and decide whether to move into contract or next SKU batch.';
  const metricLine = input.performance
    ? `Performance return: scale ${scale} / iterate ${iterate} / pause ${pause}; avg CTR ${pct(input.performance.summary.averageCtr)}; avg CVR ${pct(input.performance.summary.averageConversionRate)}.`
    : 'Performance return: CSV is not imported yet; collect impressions, clicks, spend, orders, and revenue next.';

  return {
    owner: input.owner || 'ops',
    nextAction,
    nextActionDue,
    reviewNotes: [
      `Industrial snapshot: assets ${input.snapshot.assetCount}, plans ${input.snapshot.planCount}, ready plans ${input.snapshot.readyPlanCount}, dispatches ${input.snapshot.dispatchCount}, measured ${input.snapshot.measuredDispatchCount}.`,
      metricLine,
      missing.length > 0 ? `Current gaps: ${missing.join('; ')}.` : 'Current asset and distribution ledger can support a repeatable review loop.',
      `Commercial handoff: lifecycle=${lifecycleStage}; quote=${quoteStatus}; payment=${paymentStatus}; probability=${dealProbability}%; closeDate=${closeDate}; renewal=${renewalPotential}.`,
    ].join('\n'),
    reviewDecision,
    reviewCompletedAt: now,
    contractNextStep: best
      ? 'Prepare expansion evidence, quote, and next SKU batch scope for contract discussion.'
      : 'Resolve industrial gaps or complete the next performance return before contract push.',
    contractStage: best ? 'proposal' : 'discovery',
    quoteStatus,
    paymentStatus,
    lifecycleStage,
    dealProbability,
    closeDate,
    renewalPotential,
    crmSyncStatus: 'ready',
    crmSyncAt: now,
    crmSyncNote: `industrial-chain handoff: ${input.projectId}`,
    tags: ['industrial-chain', hasMeasuredSignal ? 'performance-returned' : 'needs-performance', best ? 'scale-ready' : 'iterate'].join(','),
    priority,
  };
}
