import type { RestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import type { RestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import type { RestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantExternalAccessGuideStep = {
  id: 'runtime' | 'merchant-grants' | 'callback-proof' | 'operating-data' | 'staff-channel';
  title: string;
  owner: 'merchant' | 'runtime-admin' | 'data-ops' | 'ops';
  status: 'ready-to-check' | 'missing-evidence' | 'provider-gated' | 'data-gated';
  customerAsk: string;
  providerAsk: string[];
  unlocks: string[];
  acceptanceEvidence: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantExternalAccessGuide = {
  ok: true;
  payloadShape: 'restaurant-external-access-guide-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  answerForCustomer: string;
  summary: {
    steps: number;
    readyToCheck: number;
    missingEvidence: number;
    providerGated: number;
    dataGated: number;
    setupCompletionPercent: number;
    canStartSandbox: boolean;
    canClaimExternalAutomation: false;
  };
  steps: RestaurantExternalAccessGuideStep[];
  ownerPacket: Array<{
    owner: RestaurantExternalAccessGuideStep['owner'];
    giveThis: string[];
    unlocks: string[];
  }>;
  customerScript: string[];
  providerScript: string[];
  redactedFields: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: string[], limit = 10): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function countStatus(steps: RestaurantExternalAccessGuideStep[], status: RestaurantExternalAccessGuideStep['status']) {
  return steps.filter(step => step.status === status).length;
}

function fieldsFor(wizard: RestaurantProviderSetupWizard, sectionId: RestaurantProviderSetupWizard['sections'][number]['id']) {
  return wizard.sections.find(section => section.id === sectionId)?.fields || [];
}

function ladderItem(ladder: RestaurantProviderUnlockLadder, id: RestaurantProviderUnlockLadder['items'][number]['id']) {
  return ladder.items.find(item => item.id === id);
}

function gapRow(board: RestaurantProviderKeyGapBoard, id: RestaurantProviderKeyGapBoard['rows'][number]['id']) {
  return board.rows.find(row => row.id === id);
}

function statusFrom(input: {
  missingFields: number;
  ladderStage?: RestaurantProviderUnlockLadder['items'][number]['stage'];
  data?: boolean;
}): RestaurantExternalAccessGuideStep['status'] {
  if (input.data) return 'data-gated';
  if (input.ladderStage === 'provider-health-ready') return 'ready-to-check';
  if (input.ladderStage === 'setup-evidence-signed') return 'missing-evidence';
  if (input.missingFields > 0) return 'provider-gated';
  return 'missing-evidence';
}

export function buildRestaurantExternalAccessGuide(input: RestaurantTrialIntake & {
  providerSetupWizard: RestaurantProviderSetupWizard;
  providerUnlockLadder: RestaurantProviderUnlockLadder;
  providerKeyGapBoard: RestaurantProviderKeyGapBoard;
  now?: Date;
}): RestaurantExternalAccessGuide {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant || input.providerSetupWizard.restaurant, 'Trial restaurant');
  const offer = clean(input.offer || input.providerSetupWizard.offer, 'Today featured offer');
  const runtimeFields = fieldsFor(input.providerSetupWizard, 'runtime');
  const merchantFields = fieldsFor(input.providerSetupWizard, 'merchant-platforms');
  const staffFields = fieldsFor(input.providerSetupWizard, 'staff-delivery');
  const dataFields = fieldsFor(input.providerSetupWizard, 'operating-data');
  const callbackFields = fieldsFor(input.providerSetupWizard, 'proof-callback');
  const runtime = ladderItem(input.providerUnlockLadder, 'persistent-browser');
  const publish = ladderItem(input.providerUnlockLadder, 'auto-publish-proof');
  const redemption = ladderItem(input.providerUnlockLadder, 'coupon-redemption');
  const analysis = ladderItem(input.providerUnlockLadder, 'operating-analysis');
  const memory = ladderItem(input.providerUnlockLadder, 'memory-follow-up');
  const browserGap = gapRow(input.providerKeyGapBoard, 'persistent-browser-runner');
  const publishGap = gapRow(input.providerKeyGapBoard, 'auto-publish');
  const leadGap = gapRow(input.providerKeyGapBoard, 'auto-lead-acquisition');
  const couponGap = gapRow(input.providerKeyGapBoard, 'auto-coupon-redemption');
  const analysisGap = gapRow(input.providerKeyGapBoard, 'true-operating-analysis');
  const staffGap = gapRow(input.providerKeyGapBoard, 'staff-delivery');

  const steps: RestaurantExternalAccessGuideStep[] = [
    {
      id: 'runtime',
      title: 'Connect one isolated browser runtime',
      owner: 'runtime-admin',
      status: statusFrom({ missingFields: runtimeFields.filter(field => field.status === 'missing').length, ladderStage: runtime?.stage }),
      customerAsk: 'Choose OpenClaw, Lobu, Hermes or another controlled browser runtime and configure URL/key/profile server-side.',
      providerAsk: unique([
        ...runtimeFields.map(field => field.label),
        ...(browserGap?.externalNeeded || []),
      ], 7),
      unlocks: ['persistent browser agent', 'sandbox submit package', 'runner heartbeat', 'failure recovery'],
      acceptanceEvidence: browserGap?.acceptanceEvidence || ['runtime health ready', 'signed callback', 'accepted receipt'],
      nextAction: runtime?.nextAction || browserGap?.nextAction || 'Configure runtime URL/key, browser profile and callback secret.',
      stopLine: browserGap?.stopLine || 'No live browser execution without runtime health, isolated profile, merchant grant and accepted receipt.',
    },
    {
      id: 'merchant-grants',
      title: 'Sign merchant platform grants',
      owner: 'merchant',
      status: statusFrom({ missingFields: merchantFields.filter(field => field.status === 'missing').length, ladderStage: publish?.stage }),
      customerAsk: 'Approve the first platform lane: allowed account, allowed actions, proof type, expiry and revocation owner.',
      providerAsk: unique([
        ...merchantFields.map(field => field.label),
        ...(publishGap?.merchantGrant || []),
        ...(leadGap?.merchantGrant || []),
      ], 8),
      unlocks: ['auto publish proof', 'lead capture receipts', 'public evidence closeout'],
      acceptanceEvidence: unique([
        ...(publishGap?.acceptanceEvidence || []),
        ...(leadGap?.acceptanceEvidence || []),
      ], 8),
      nextAction: publish?.nextAction || publishGap?.nextAction || 'Collect scoped merchant platform authorization before sandbox publish-proof.',
      stopLine: 'Public store context is not merchant authorization; no account action before explicit grant.',
    },
    {
      id: 'callback-proof',
      title: 'Enable signed proof callback',
      owner: 'runtime-admin',
      status: statusFrom({ missingFields: callbackFields.filter(field => field.status === 'missing').length, ladderStage: publish?.stage }),
      customerAsk: 'Configure callback secret and receipt fields so every Provider run returns public proof or a rejected reason.',
      providerAsk: unique([
        ...callbackFields.map(field => field.label),
        'x-restaurant-agent-signature',
        'eventId',
        'externalRunId or evidenceUrl or screenshotId',
      ], 8),
      unlocks: ['accepted publish receipt', 'lead acquisition receipt', 'memory write gate'],
      acceptanceEvidence: ['signed callback header', 'public proof URL or screenshot id', 'operator summary', 'accepted receipt id'],
      nextAction: 'Return one signed sandbox receipt before enabling repeated external runs.',
      stopLine: 'Unsigned callbacks, private payloads and unverifiable screenshots must stay rejected.',
    },
    {
      id: 'operating-data',
      title: 'Approve POS, coupon and operating data contract',
      owner: 'data-ops',
      status: 'data-gated',
      customerAsk: 'Provide aggregate field dictionary, export cadence, source owner and no-PII sample before redemption or true analysis claims.',
      providerAsk: unique([
        ...dataFields.map(field => field.label),
        ...(couponGap?.externalNeeded || []),
        ...(analysisGap?.externalNeeded || []),
      ], 8),
      unlocks: ['coupon redemption reconciliation', 'true operating analysis', 'next-shift closeout'],
      acceptanceEvidence: unique([
        ...(couponGap?.acceptanceEvidence || []),
        ...(analysisGap?.acceptanceEvidence || []),
        ...(redemption?.providerEvidence || []),
        ...(analysis?.providerEvidence || []),
      ], 8),
      nextAction: analysis?.nextAction || analysisGap?.nextAction || 'Import one sanitized POS/coupon aggregate before judging store operations.',
      stopLine: 'No raw POS rows, payment ids, coupon codes, customer identifiers or margin claims without authorized aggregate data.',
    },
    {
      id: 'staff-channel',
      title: 'Approve staff delivery and memory follow-up',
      owner: 'ops',
      status: statusFrom({ missingFields: staffFields.filter(field => field.status === 'missing').length, ladderStage: memory?.stage }),
      customerAsk: 'Choose staff-only channel, recipient scope, message template and acknowledgement receipt.',
      providerAsk: unique([
        ...staffFields.map(field => field.label),
        ...(staffGap?.externalNeeded || []),
      ], 7),
      unlocks: ['staff work order delivery', 'recovery alert', 'memory follow-up wakeup'],
      acceptanceEvidence: unique([
        ...(staffGap?.acceptanceEvidence || []),
        ...(memory?.providerEvidence || []),
      ], 8),
      nextAction: memory?.nextAction || staffGap?.nextAction || 'Keep copy-ready internally until the merchant approves recipient scope.',
      stopLine: 'No customer outreach, private chat reading, staff impersonation or hidden autonomous follow-up.',
    },
  ];

  const ownerPacket = (['merchant', 'runtime-admin', 'data-ops', 'ops'] as const).map(owner => {
    const owned = steps.filter(step => step.owner === owner);
    return {
      owner,
      giveThis: unique(owned.flatMap(step => [step.customerAsk, ...step.providerAsk]), 8),
      unlocks: unique(owned.flatMap(step => step.unlocks), 8),
    };
  }).filter(packet => packet.giveThis.length > 0);

  return {
    ok: true,
    payloadShape: 'restaurant-external-access-guide-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    answerForCustomer: `${restaurant} can keep using the internal AI employee today. To unlock competitor-grade external execution for ${offer}, complete runtime, merchant grant, callback, data contract and staff channel evidence in this order.`,
    summary: {
      steps: steps.length,
      readyToCheck: countStatus(steps, 'ready-to-check'),
      missingEvidence: countStatus(steps, 'missing-evidence'),
      providerGated: countStatus(steps, 'provider-gated'),
      dataGated: countStatus(steps, 'data-gated'),
      setupCompletionPercent: input.providerSetupWizard.summary.completionPercent,
      canStartSandbox: input.providerUnlockLadder.summary.setupEvidenceSigned > 0 || input.providerUnlockLadder.summary.providerHealthReady > 0,
      canClaimExternalAutomation: false,
    },
    steps,
    ownerPacket,
    customerScript: [
      '先选一个平台和一个门店活动，不要一次打开所有外部权限。',
      '所有 key、callback secret、browser profile 只放服务端，不在页面、聊天或导出包里出现。',
      '先跑一条 sandbox receipt，验收公开链接/截图/签名回执，再扩大到多平台。',
      'POS、核销、会员和财务只接聚合字段；没有字段字典就不做真实经营结论。',
    ],
    providerScript: [
      'Return signed receipt fields only: eventId, externalRunId/evidenceUrl/screenshotId, operator summary, signedAt.',
      'Stop on login challenge, captcha, private inbox, customer identifiers, coupon codes, payment ids or raw POS rows.',
      'Every failed run returns a rejected reason and recovery owner; no silent retry loop.',
    ],
    redactedFields: [
      'api keys',
      'auth tokens',
      'cookies',
      'browser profile ids',
      'private message text',
      'customer PII',
      'coupon codes',
      'payment ids',
      'raw POS rows',
    ],
    safetyBoundary: 'External Access Guide is a setup and acceptance guide only. It does not collect or expose secret values, does not log in, does not publish, does not contact customers, does not redeem coupons and does not claim operating results before Provider health, merchant authorization, signed receipts and aggregate data contracts are accepted.',
  };
}
