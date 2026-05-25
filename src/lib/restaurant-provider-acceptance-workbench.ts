import type { RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import type { RestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantProviderAcceptanceStage = {
  id: 'runtime' | 'callback' | 'merchant-auth' | 'browser-profile' | 'staff-channel' | 'operating-data' | 'sandbox-receipt';
  label: string;
  status: 'passed' | 'needs-evidence' | 'blocked';
  owner: 'runtime-admin' | 'merchant' | 'ops' | 'data-ops';
  unlocks: string[];
  evidenceRequired: string[];
  currentEvidence: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantProviderAcceptanceWorkbench = {
  ok: true;
  payloadShape: 'restaurant-provider-acceptance-workbench-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'ready-for-sandbox-run' | 'provider-setup-required' | 'data-contract-required' | 'receipt-required';
  summary: {
    stages: number;
    passed: number;
    needsEvidence: number;
    blocked: number;
    setupCompletionPercent: number;
    readinessScore: number;
    sandboxChecksPassed: number;
    canRunSandbox: boolean;
    canClaimExternalAutomation: boolean;
  };
  stages: RestaurantProviderAcceptanceStage[];
  acceptanceChecklist: Array<{
    label: string;
    source: 'setup-wizard' | 'health-probe' | 'sandbox-contract' | 'data-contract' | 'publish-inbox';
    status: 'pass' | 'missing' | 'blocked';
    evidence: string;
  }>;
  capabilityAcceptanceMatrix: Array<{
    id: 'auto-publish-proof' | 'auto-lead-acquisition' | 'auto-coupon-redemption' | 'true-operating-analysis' | 'staff-delivery';
    label: string;
    sandboxStatus: 'ready-to-submit' | 'needs-provider' | 'needs-data-contract' | 'needs-receipt';
    productionClaim: 'blocked-until-accepted-receipts';
    firstSandboxAction: string;
    requiredProviderKeys: string[];
    merchantGrantRequired: string[];
    dataContractRequired: string[];
    receiptRequired: string[];
    currentEvidence: string[];
    nextAction: string;
    stopLine: string;
  }>;
  externalRequired: string[];
  providerHandOffCopy: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, 120) : fallback;
}

function unique(values: string[], limit = 18) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function statusFrom(condition: boolean, hasEvidence: boolean): RestaurantProviderAcceptanceStage['status'] {
  if (condition) return 'passed';
  return hasEvidence ? 'needs-evidence' : 'blocked';
}

function firstHealthEvidence(health: RestaurantProviderReadinessHealth, id: string) {
  const item = health.items.find(entry => entry.id === id);
  return item ? [...item.configuredEvidence, ...item.missingEvidence].slice(0, 4) : [];
}

function matrixStatus(input: {
  runtimeReady: boolean;
  callbackReady: boolean;
  merchantReady?: boolean;
  dataReady?: boolean;
  sandboxReceiptReady?: boolean;
}): RestaurantProviderAcceptanceWorkbench['capabilityAcceptanceMatrix'][number]['sandboxStatus'] {
  if (!input.runtimeReady || !input.callbackReady || !input.merchantReady) return 'needs-provider';
  if (input.dataReady === false) return 'needs-data-contract';
  if (!input.sandboxReceiptReady) return 'needs-receipt';
  return 'ready-to-submit';
}

export function buildRestaurantProviderAcceptanceWorkbench(input: RestaurantTrialIntake & {
  providerSetupWizard: RestaurantProviderSetupWizard;
  providerReadinessHealth: RestaurantProviderReadinessHealth;
  providerSandboxContract: RestaurantProviderSandboxContract;
  operatingDataContract: RestaurantOperatingDataContract;
  publishExecutionInbox: RestaurantPublishExecutionInbox;
  now?: Date;
}): RestaurantProviderAcceptanceWorkbench {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.providerSetupWizard.restaurant || 'Trial restaurant');
  const offer = clean(input.offer, input.providerSetupWizard.offer || 'Today offer');
  const wizard = input.providerSetupWizard;
  const health = input.providerReadinessHealth;
  const sandbox = input.providerSandboxContract;
  const data = input.operatingDataContract;
  const publishInbox = input.publishExecutionInbox;
  const runtimeReady = health.items.some(item => item.category === 'runtime' && item.status === 'health-ready');
  const callbackReady = health.items.some(item => item.id === 'callback-secret' && item.status === 'health-ready');
  const merchantReady = health.items.some(item => item.id === 'merchant-platform-authorization' && item.status === 'health-ready');
  const dataReady = data.summary.canClaimTrueOperatingAnalysis || health.items.some(item => item.id === 'operating-data-contract' && item.status === 'health-ready');
  const runtimeSection = wizard.sections.find(section => section.id === 'runtime');
  const staffSection = wizard.sections.find(section => section.id === 'staff-delivery');
  const staffReady = staffSection?.status === 'ready';
  const browserReady = runtimeSection?.fields.some(field => field.id.includes('browser') && field.status === 'configured') || runtimeReady;
  const sandboxReceiptReady = sandbox.summary.canRunSandbox && publishInbox.summary.waitingReceipts + publishInbox.summary.acceptedReceipts > 0;

  const stages: RestaurantProviderAcceptanceStage[] = [
    {
      id: 'runtime',
      label: 'Runtime URL and server-side API key',
      status: statusFrom(runtimeReady, health.items.some(item => item.category === 'runtime' && item.configuredEvidence.length > 0)),
      owner: 'runtime-admin',
      unlocks: ['provider submit', 'browser runner task', 'external run id'],
      evidenceRequired: ['reachable Lobu/OpenClaw/Hermes runtime URL', 'server-side API key name', 'health probe result'],
      currentEvidence: health.items.filter(item => item.category === 'runtime').flatMap(item => item.configuredEvidence).slice(0, 4),
      nextAction: runtimeReady ? 'Keep runtime health attached to every sandbox run.' : 'Configure one reachable runtime URL/key pair and rerun Provider Health.',
      stopLine: 'Never paste or return API key values in the client payload.',
    },
    {
      id: 'callback',
      label: 'Signed callback secret and receipt schema',
      status: statusFrom(callbackReady, firstHealthEvidence(health, 'callback-secret').length > 0),
      owner: 'runtime-admin',
      unlocks: ['signed final receipt', 'run health closeout', 'proof acceptance'],
      evidenceRequired: ['RESTAURANT_AGENT_CALLBACK_SECRET configured server-side', 'signature validation', 'required receipt fields'],
      currentEvidence: firstHealthEvidence(health, 'callback-secret'),
      nextAction: callbackReady ? 'Require every provider completion to return a signed receipt.' : 'Configure callback secret outside the UI before accepting provider completion.',
      stopLine: 'Unsigned callbacks, placeholder proof and private payloads must be rejected.',
    },
    {
      id: 'merchant-auth',
      label: 'Merchant platform authorization',
      status: statusFrom(merchantReady, health.providerState.provided.merchantApprovals.length > 0),
      owner: 'merchant',
      unlocks: ['authorized platform action scope', 'publish proof capture', 'lead summary'],
      evidenceRequired: ['platform grant', 'allowed actions', 'expiry', 'revocation owner'],
      currentEvidence: firstHealthEvidence(health, 'merchant-platform-authorization'),
      nextAction: merchantReady ? 'Attach action scope and expiry to each provider run.' : 'Collect merchant authorization for the first platform lane.',
      stopLine: 'Public store context is not merchant authorization.',
    },
    {
      id: 'browser-profile',
      label: 'Isolated browser profile',
      status: statusFrom(Boolean(browserReady), (runtimeSection?.fields.length || 0) > 0),
      owner: 'runtime-admin',
      unlocks: ['persistent browser session', 'public proof screenshot', 'runner event health'],
      evidenceRequired: ['profile alias only', 'tenant isolation policy', 'allowed domains', 'snapshot redaction policy'],
      currentEvidence: runtimeSection?.fields.map(field => `${field.label}:${field.status}`).slice(0, 4) || [],
      nextAction: browserReady ? 'Use only the profile alias and snapshot policy in browser runner requests.' : 'Configure isolated browser profile evidence without exposing raw profile id.',
      stopLine: 'Do not expose cookies, raw profile ids, tokens, SMS codes or private inbox state.',
    },
    {
      id: 'staff-channel',
      label: 'Staff delivery channel',
      status: statusFrom(Boolean(staffReady), Boolean(staffSection)),
      owner: 'ops',
      unlocks: ['staff-only task delivery', 'recovery alerts', 'closeout reminders'],
      evidenceRequired: ['WeCom/Feishu/DingTalk/SMS provider', 'merchant staff recipient roles', 'approval boundary'],
      currentEvidence: staffSection?.fields.map(field => `${field.label}:${field.status}`).slice(0, 4) || [],
      nextAction: staffReady ? 'Send only staff work orders and audit logs.' : 'Keep staff messages manual-copy until channel provider and recipient roles are approved.',
      stopLine: 'Staff channels do not authorize customer outreach or private-message reads.',
    },
    {
      id: 'operating-data',
      label: 'POS, coupon, member and finance data contract',
      status: statusFrom(dataReady, data.summary.manualImportReady > 0),
      owner: 'data-ops',
      unlocks: ['true operating analysis', 'coupon redemption reconciliation', 'margin guardrail'],
      evidenceRequired: ['aggregate field dictionary', 'import cadence', 'no-PII sample', 'merchant data owner'],
      currentEvidence: data.tracks.filter(track => track.status !== 'provider-gated').map(track => `${track.name}:${track.status}`).slice(0, 4),
      nextAction: dataReady ? 'Run analysis only from accepted aggregate fields.' : 'Collect POS/coupon/member field dictionary before claiming real analysis.',
      stopLine: 'No raw POS rows, payment ids, order ids, member ids or customer identifiers.',
    },
    {
      id: 'sandbox-receipt',
      label: 'Sandbox submit and accepted receipt',
      status: statusFrom(sandboxReceiptReady, sandbox.summary.canRunSandbox || publishInbox.summary.waitingReceipts > 0),
      owner: 'ops',
      unlocks: ['sandbox acceptance', 'provider proof closeout', 'memory follow-up'],
      evidenceRequired: ['sanitized execution package', 'externalRunId', 'public URL/screenshot id', 'accepted signed receipt'],
      currentEvidence: [`sandbox:${sandbox.verdict}`, `waitingReceipts:${publishInbox.summary.waitingReceipts}`, `acceptedReceipts:${publishInbox.summary.acceptedReceipts}`],
      nextAction: sandboxReceiptReady ? 'Close the sandbox run and write aggregate memory.' : 'Run one sanitized sandbox package and wait for signed/public receipt.',
      stopLine: 'Sandbox readiness is not production automation until each run has accepted proof.',
    },
  ];

  const passed = stages.filter(stage => stage.status === 'passed').length;
  const needsEvidence = stages.filter(stage => stage.status === 'needs-evidence').length;
  const blocked = stages.filter(stage => stage.status === 'blocked').length;
  const verdict: RestaurantProviderAcceptanceWorkbench['verdict'] = sandboxReceiptReady
    ? 'ready-for-sandbox-run'
    : !dataReady && data.summary.providerGated > 0
      ? 'data-contract-required'
      : sandbox.summary.canRunSandbox || publishInbox.summary.waitingReceipts > 0
      ? 'receipt-required'
      : 'provider-setup-required';
  const capabilityAcceptanceMatrix: RestaurantProviderAcceptanceWorkbench['capabilityAcceptanceMatrix'] = [
    {
      id: 'auto-publish-proof',
      label: 'Auto publish and proof capture',
      sandboxStatus: matrixStatus({ runtimeReady, callbackReady, merchantReady, sandboxReceiptReady }),
      productionClaim: 'blocked-until-accepted-receipts',
      firstSandboxAction: 'Submit one approved public-platform proof package to a sandbox browser runner and require signed external-receipt callback.',
      requiredProviderKeys: ['RESTAURANT_AGENT_OPENCLAW_API_KEY or RESTAURANT_AGENT_HERMES_API_KEY', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrantRequired: ['Dianping/Xiaohongshu/Douyin/WeChat scoped publish-proof authorization'],
      dataContractRequired: ['posted link or screenshot id only; no private inbox data'],
      receiptRequired: ['externalRunId', 'public proof URL or screenshot id', 'operator summary', 'x-restaurant-agent-signature'],
      currentEvidence: unique([
        ...firstHealthEvidence(health, 'callback-secret'),
        ...firstHealthEvidence(health, 'merchant-platform-authorization'),
        `publishInbox:${publishInbox.summary.acceptedReceipts} accepted/${publishInbox.summary.waitingReceipts} waiting`,
      ], 8),
      nextAction: merchantReady ? 'Run a single proof-capture sandbox package and wait for signed callback.' : 'Collect scoped merchant platform authorization before sandbox publish-proof.',
      stopLine: 'No merchant grant and accepted receipt means no auto-publish claim.',
    },
    {
      id: 'auto-lead-acquisition',
      label: 'Auto lead acquisition and follow-up handoff',
      sandboxStatus: matrixStatus({ runtimeReady, callbackReady, merchantReady, sandboxReceiptReady }),
      productionClaim: 'blocked-until-accepted-receipts',
      firstSandboxAction: 'Submit a lead-summary callback contract that returns aggregate reservation, coupon-claim, inquiry and visit-intent counts.',
      requiredProviderKeys: ['RESTAURANT_AGENT_LEAD_PROVIDER_KEY or platform export provider', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrantRequired: ['lead summary/export authorization', 'staff follow-up owner map'],
      dataContractRequired: ['aggregate lead counts by source/channel/time window'],
      receiptRequired: ['source channel', 'time window', 'aggregate count', 'owner', 'signed callback'],
      currentEvidence: unique([
        `staffSection:${staffReady ? 'ready' : 'blocked'}`,
        ...firstHealthEvidence(health, 'merchant-platform-authorization'),
      ], 8),
      nextAction: merchantReady ? 'Request only aggregate lead receipts and route staff follow-up tasks.' : 'Get merchant approval for lead-summary export; do not read private messages.',
      stopLine: 'Private-message bodies, customer contact ids and customer outreach remain forbidden without explicit provider contract.',
    },
    {
      id: 'auto-coupon-redemption',
      label: 'Auto coupon redemption reconciliation',
      sandboxStatus: matrixStatus({ runtimeReady, callbackReady, merchantReady, dataReady, sandboxReceiptReady }),
      productionClaim: 'blocked-until-accepted-receipts',
      firstSandboxAction: 'Submit one coupon/redemption aggregate import and require receipt validation before any closeout.',
      requiredProviderKeys: ['POS/coupon export provider key if API mode is used', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrantRequired: ['coupon backend export authorization', 'redemption source owner'],
      dataContractRequired: ['couponClaimCount', 'redemptionCount', 'businessDate', 'storeName', 'offerName'],
      receiptRequired: ['aggregate redemption batch id', 'field dictionary version', 'operator', 'accepted receipt'],
      currentEvidence: data.tracks.filter(track => track.id.includes('coupon') || track.id.includes('redemption')).map(track => `${track.name}:${track.status}`).slice(0, 8),
      nextAction: dataReady ? 'Run sandbox reconciliation from accepted aggregate fields only.' : 'Collect coupon/POS field dictionary and no-PII sample before redemption claims.',
      stopLine: 'Do not write redemptions, coupon codes, payment ids or raw POS rows.',
    },
    {
      id: 'true-operating-analysis',
      label: 'True operating analysis',
      sandboxStatus: matrixStatus({ runtimeReady, callbackReady, merchantReady, dataReady, sandboxReceiptReady }),
      productionClaim: 'blocked-until-accepted-receipts',
      firstSandboxAction: 'Run one operating insight report from accepted aggregate POS/coupon/member fields and attach field dictionary evidence.',
      requiredProviderKeys: ['POS/export provider key if API mode is used'],
      merchantGrantRequired: ['POS/export authorization', 'finance owner approval'],
      dataContractRequired: ['orders', 'grossSales', 'redemptions', 'inventoryUsed', 'cost/margin field dictionary'],
      receiptRequired: ['accepted aggregate import', 'field dictionary', 'analysis timestamp', 'operator'],
      currentEvidence: data.tracks.map(track => `${track.name}:${track.status}`).slice(0, 8),
      nextAction: dataReady ? 'Limit insights to measured aggregate fields and mark unknowns as blocked.' : 'Connect aggregate operating data before using true-analysis wording.',
      stopLine: 'No aggregate data contract means no real operating analysis claim.',
    },
    {
      id: 'staff-delivery',
      label: 'Staff delivery and recovery alerts',
      sandboxStatus: runtimeReady && callbackReady && staffReady ? 'ready-to-submit' : 'needs-provider',
      productionClaim: 'blocked-until-accepted-receipts',
      firstSandboxAction: 'Send one staff-only task notification to an approved work channel and record acknowledgement or recovery blocker.',
      requiredProviderKeys: ['RESTAURANT_AGENT_WECOM_WEBHOOK_URL or FEISHU/DINGTALK/SMS provider', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrantRequired: ['merchant-approved staff recipient roles'],
      dataContractRequired: ['task id', 'owner', 'evidence required', 'no customer PII'],
      receiptRequired: ['staff channel acknowledgement', 'attempt id', 'operator', 'next action'],
      currentEvidence: staffSection?.fields.map(field => `${field.label}:${field.status}`).slice(0, 8) || [],
      nextAction: staffReady ? 'Run staff-only sandbox notification with no customer data.' : 'Configure staff channel provider and approved recipient roles.',
      stopLine: 'Staff delivery never authorizes customer marketing messages or private chat reads.',
    },
  ];

  return {
    ok: true,
    payloadShape: 'restaurant-provider-acceptance-workbench-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      stages: stages.length,
      passed,
      needsEvidence,
      blocked,
      setupCompletionPercent: wizard.summary.completionPercent,
      readinessScore: health.summary.readinessScore,
      sandboxChecksPassed: sandbox.summary.passed,
      canRunSandbox: sandbox.summary.canRunSandbox,
      canClaimExternalAutomation: false,
    },
    stages,
    acceptanceChecklist: [
      { label: 'Setup fields completed', source: 'setup-wizard', status: wizard.summary.missing === 0 ? 'pass' : 'missing', evidence: `${wizard.summary.configured}/${wizard.summary.fields} configured` },
      { label: 'Runtime health ready', source: 'health-probe', status: runtimeReady ? 'pass' : 'missing', evidence: `readiness score ${health.summary.readinessScore}` },
      { label: 'Sandbox contract passes', source: 'sandbox-contract', status: sandbox.summary.canRunSandbox ? 'pass' : 'blocked', evidence: `${sandbox.summary.passed}/${sandbox.summary.checks} checks passed` },
      { label: 'Operating data contract ready', source: 'data-contract', status: dataReady ? 'pass' : 'missing', evidence: `${data.summary.manualImportReady} manual imports / ${data.summary.providerGated} provider gated` },
      { label: 'Publish receipt accepted', source: 'publish-inbox', status: publishInbox.summary.acceptedReceipts > 0 ? 'pass' : publishInbox.summary.waitingReceipts > 0 ? 'missing' : 'blocked', evidence: `${publishInbox.summary.acceptedReceipts} accepted / ${publishInbox.summary.waitingReceipts} waiting` },
    ],
    capabilityAcceptanceMatrix,
    externalRequired: unique([
      ...stages.filter(stage => stage.status !== 'passed').map(stage => stage.nextAction),
      ...capabilityAcceptanceMatrix.filter(item => item.sandboxStatus !== 'ready-to-submit').map(item => item.nextAction),
      ...wizard.externalRequired,
      ...health.externalRequired,
      ...sandbox.externalRequired,
      ...data.providerSetupRequests.map(item => item.evidenceRequired),
      ...publishInbox.externalRequired,
    ]),
    providerHandOffCopy: [
      `Restaurant: ${restaurant}`,
      `Offer: ${offer}`,
      `Current provider acceptance: ${passed}/${stages.length} stages passed; ${blocked} blocked.`,
      'Send only setup evidence, authorization scope, callback receipt fields and aggregate data contracts. Do not send secrets or customer data.',
    ],
    safetyBoundary: 'Provider Acceptance Workbench is an evidence checklist only. It never stores or returns provider key values, cookies, tokens, raw browser profile ids, private messages, customer identifiers, coupon codes, payment ids or raw POS rows, and it never converts setup evidence into auto-publish, auto-acquisition, auto-redemption or true operating-analysis claims without accepted signed/public receipts.',
  };
}
