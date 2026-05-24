import { buildRestaurantPublicIntelligenceBrief, type RestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import { buildRestaurantPublicProfileIntake, type RestaurantPublicProfileIntakeReport } from '@/lib/restaurant-public-profile-intake';
import { buildRestaurantPublicSourceHarvestPack, type RestaurantPublicSourceHarvestPack } from '@/lib/restaurant-public-source-harvest-pack';
import { buildRestaurantTrialWorkflowPack, type RestaurantTrialWorkflowPack } from '@/lib/restaurant-trial-workflow-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantPublicTrialSeed = {
  ok: true;
  payloadShape: 'restaurant-public-trial-seed-v1';
  generatedAt: string;
  verdict: 'ready-for-controlled-trial' | 'needs-merchant-material' | 'provider-required';
  trialIntake: Required<RestaurantTrialIntake>;
  publicProfile: RestaurantPublicProfileIntakeReport;
  publicIntelligenceBrief: RestaurantPublicIntelligenceBrief;
  publicSourceHarvestPack: RestaurantPublicSourceHarvestPack;
  trialWorkflowPack: Pick<RestaurantTrialWorkflowPack, 'payloadShape' | 'summary' | 'workOrder' | 'evidenceChecklist' | 'externalUnlocks'>;
  summary: {
    usableFields: number;
    missingForActivation: number;
    internalHarvestTargets: number;
    merchantUploads: number;
    providerRequired: number;
    workflowReadySteps: number;
    workflowExternalGatedSteps: number;
  };
  normalizedEvidence: Array<{
    field: string;
    value: string;
    source: string;
    requiredFor: string;
  }>;
  nextActions: Array<{
    owner: 'ops' | 'merchant' | 'runtime-admin' | 'store-manager';
    action: string;
    evidence: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string, max = 160): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function joinedChannels(profile: RestaurantPublicProfileIntakeReport): string {
  const source = profile.profile.sourceUrl ? 'Public profile URL' : 'Merchant upload';
  return ['Dianping / Meituan', 'Xiaohongshu', 'Douyin', 'WeChat community', source].join(' / ');
}

function evidenceSummary(profile: RestaurantPublicProfileIntakeReport, harvest: RestaurantPublicSourceHarvestPack): string {
  const ledger = profile.evidenceLedger[0];
  const source = ledger ? `${ledger.source} / ${ledger.license}` : 'manual public source';
  const url = profile.profile.sourceUrl || 'public URL missing';
  return `${source}; ${url}; normalized fields ${harvest.summary.normalizedFields}`;
}

export function buildRestaurantPublicTrialSeed(input: {
  sampleId?: string;
  restaurant?: string;
  city?: string;
  area?: string;
  cuisine?: string;
  scenario?: string;
  sourceUrl?: string;
  suggestedOffer?: string;
  suggestedAudience?: string;
  manualText?: string;
  now?: Date;
} = {}): RestaurantPublicTrialSeed {
  const now = input.now || new Date();
  const publicProfile = buildRestaurantPublicProfileIntake(input);
  const publicIntelligenceBrief = buildRestaurantPublicIntelligenceBrief({ publicProfile, now });
  const publicSourceHarvestPack = buildRestaurantPublicSourceHarvestPack({
    publicProfile,
    publicIntelligenceBrief,
    now,
  });
  const restaurant = clean(publicProfile.profile.restaurant, clean(input.restaurant, 'Trial restaurant'));
  const offer = clean(publicProfile.profile.suggestedOffer, clean(input.suggestedOffer, 'Today featured set meal'));
  const audience = clean(publicProfile.profile.suggestedAudience, clean(input.suggestedAudience, 'Nearby diners'));
  const visitReason = clean(publicProfile.profile.scenario, clean(input.scenario, 'Clear local reason to visit today'));
  const constraints = [
    'Merchant must confirm menu price, stock, coupon rules, photo rights and forbidden claims.',
    'Public profile context is not merchant authorization.',
    'Publish proof, reservation/coupon signals and POS aggregates must be imported as evidence before claims.',
  ].join(' ');
  const trialIntake: Required<RestaurantTrialIntake> = {
    restaurant,
    offer,
    audience,
    channels: joinedChannels(publicProfile),
    visitReason,
    constraints,
    evidence: evidenceSummary(publicProfile, publicSourceHarvestPack),
  };
  const trialWorkflowPack = buildRestaurantTrialWorkflowPack(trialIntake, now);
  const providerRequired = publicSourceHarvestPack.summary.providerRequired + trialWorkflowPack.summary.externalGatedSteps;
  const merchantUploads = publicSourceHarvestPack.summary.merchantUploads;
  const verdict: RestaurantPublicTrialSeed['verdict'] = providerRequired > 0
    ? 'provider-required'
    : merchantUploads > 0
      ? 'needs-merchant-material'
      : 'ready-for-controlled-trial';

  return {
    ok: true,
    payloadShape: 'restaurant-public-trial-seed-v1',
    generatedAt: now.toISOString(),
    verdict,
    trialIntake,
    publicProfile,
    publicIntelligenceBrief,
    publicSourceHarvestPack,
    trialWorkflowPack: {
      payloadShape: trialWorkflowPack.payloadShape,
      summary: trialWorkflowPack.summary,
      workOrder: trialWorkflowPack.workOrder,
      evidenceChecklist: trialWorkflowPack.evidenceChecklist,
      externalUnlocks: trialWorkflowPack.externalUnlocks,
    },
    summary: {
      usableFields: publicProfile.fields.filter(item => item.confidence !== 'missing').length,
      missingForActivation: publicProfile.missingForActivation.length,
      internalHarvestTargets: publicSourceHarvestPack.summary.internalTargets,
      merchantUploads,
      providerRequired,
      workflowReadySteps: trialWorkflowPack.summary.readySteps,
      workflowExternalGatedSteps: trialWorkflowPack.summary.externalGatedSteps,
    },
    normalizedEvidence: publicSourceHarvestPack.normalizedImportTemplate.map(item => ({
      field: item.field,
      value: item.currentValue,
      source: item.source,
      requiredFor: item.requiredFor,
    })),
    nextActions: [
      {
        owner: 'ops',
        action: 'Use the generated trialIntake to run a controlled trial workflow pack.',
        evidence: trialWorkflowPack.payloadShape,
      },
      {
        owner: 'merchant',
        action: publicSourceHarvestPack.merchantAsk[0] || 'Confirm menu price, offer boundary, photos and proof fields.',
        evidence: publicProfile.intakeId,
      },
      {
        owner: 'runtime-admin',
        action: publicSourceHarvestPack.externalRequired[0] || 'Keep browser execution as a runbook until provider gates are configured.',
        evidence: publicSourceHarvestPack.payloadShape,
      },
      {
        owner: 'store-manager',
        action: 'After manual publish, import public link/screenshot plus reservation, coupon or visit-intent aggregate.',
        evidence: 'public receipt or sanitized aggregate',
      },
    ],
    externalRequired: Array.from(new Set([
      ...publicSourceHarvestPack.externalRequired,
      ...trialWorkflowPack.externalUnlocks.map(item => `${item.capability}: ${item.missing}`),
    ])).slice(0, 12),
    safetyBoundary: 'Public Trial Seed converts public or manually supplied store context into a controlled trial input. It does not log in, bypass captcha, publish, scrape private messages, collect customer identifiers, redeem coupons, pull POS rows, expose provider keys, or treat public context as merchant authorization.',
  };
}
