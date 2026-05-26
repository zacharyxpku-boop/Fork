import type { RestaurantGrantChecklist } from '@/lib/restaurant-agent-grant-checklist';
import type { RestaurantGrantChannel, RestaurantMerchantGrantManifest } from '@/lib/restaurant-agent-grant-manifest';
import type { RestaurantProviderAdapterConfigWorkbench } from '@/lib/restaurant-provider-adapter-config-workbench';
import type { RestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import type { RestaurantProviderSandboxRunConsole } from '@/lib/restaurant-provider-sandbox-run-console';

export type RestaurantMerchantAuthorizationScopeStatus =
  | 'ready-to-sign'
  | 'missing-merchant-grant'
  | 'missing-data-contract'
  | 'runtime-callback-blocked'
  | 'forbidden';

export type RestaurantMerchantAuthorizationPacket = {
  ok: true;
  payloadShape: 'restaurant-merchant-authorization-packet-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict:
    | 'ready-to-sign-first-scope'
    | 'merchant-auth-required'
    | 'data-contract-required'
    | 'runtime-callback-required'
    | 'privacy-boundary-review';
  summary: {
    scopes: number;
    readyToSign: number;
    missingMerchantGrant: number;
    missingDataContract: number;
    runtimeOrCallbackBlocked: number;
    permanentlyForbidden: number;
    canEnableRealProviderSubmit: boolean;
    canClaimExternalAutomation: false;
  };
  scopes: Array<{
    id: RestaurantGrantChannel;
    label: string;
    owner: 'merchant' | 'operator' | 'data-ops' | 'runtime-admin';
    status: RestaurantMerchantAuthorizationScopeStatus;
    allowedActions: string[];
    forbiddenActions: string[];
    requiredFields: string[];
    dataScope: string[];
    expiryRule: string;
    revocationRule: string;
    acceptanceEvidence: string[];
    providerCallbackRequired: string[];
    nextAction: string;
    stopLine: string;
  }>;
  signaturePacket: {
    merchantFields: string[];
    operatorFields: string[];
    platformFields: string[];
    dataFields: string[];
    validity: string;
    revocation: string;
  };
  providerHandOff: {
    giveProvider: string[];
    neverGiveProvider: string[];
    callbackContract: string[];
  };
  customerScript: string[];
  redactedFields: string[];
  safetyBoundary: string;
};

type ScopeTemplate = {
  id: RestaurantGrantChannel;
  label: string;
  owner: RestaurantMerchantAuthorizationPacket['scopes'][number]['owner'];
  requiredFields: string[];
  dataScope: string[];
  acceptanceEvidence: string[];
};

const SCOPE_TEMPLATES: ScopeTemplate[] = [
  {
    id: 'dianping-meituan',
    label: 'Dianping / Meituan local-life account',
    owner: 'merchant',
    requiredFields: ['merchant account owner', 'store public URL', 'allowed publish or receipt scope', 'voucher receipt format'],
    dataScope: ['public posted links', 'public screenshots', 'voucher aggregate counts', 'operator approval record'],
    acceptanceEvidence: ['posted link', 'screenshot id', 'content id', 'operator approval'],
  },
  {
    id: 'xiaohongshu',
    label: 'Xiaohongshu store content account',
    owner: 'merchant',
    requiredFields: ['account alias', 'allowed topic scope', 'review owner', 'receipt screenshot requirement'],
    dataScope: ['approved drafts', 'public note link', 'public note screenshot', 'aggregate interaction counts'],
    acceptanceEvidence: ['note link', 'screenshot id', 'publish status', 'review owner'],
  },
  {
    id: 'douyin',
    label: 'Douyin local content account',
    owner: 'merchant',
    requiredFields: ['account alias', 'allowed video or group-buy scope', 'review owner', 'public receipt field'],
    dataScope: ['approved video caption', 'public video link', 'public screenshot', 'aggregate lead counts'],
    acceptanceEvidence: ['video link', 'screenshot id', 'content id', 'publish status'],
  },
  {
    id: 'wechat-community',
    label: 'WeChat community handoff',
    owner: 'operator',
    requiredFields: ['community owner', 'approved text scope', 'handoff owner', 'manual posting proof rule'],
    dataScope: ['approved group copy', 'manual posting proof', 'aggregate inquiry counts', 'staff follow-up status'],
    acceptanceEvidence: ['manual screenshot id', 'handoff owner', 'aggregate inquiry count', 'next follow-up owner'],
  },
  {
    id: 'pos-redemption',
    label: 'POS / coupon redemption data contract',
    owner: 'data-ops',
    requiredFields: ['data mode', 'field dictionary', 'redemption source', 'aggregation period'],
    dataScope: ['sanitized aggregate rows', 'coupon redemption counts', 'gross sales bucket', 'inventory exception summary'],
    acceptanceEvidence: ['field dictionary id', 'import batch id', 'validation result', 'aggregate closeout summary'],
  },
];

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().replace(/\s+/g, ' ').slice(0, 120) : fallback;
}

function unique(values: string[], limit = 12): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function verdictFor(summary: RestaurantMerchantAuthorizationPacket['summary']): RestaurantMerchantAuthorizationPacket['verdict'] {
  if (summary.permanentlyForbidden > 0 && summary.scopes === summary.permanentlyForbidden) return 'privacy-boundary-review';
  if (summary.runtimeOrCallbackBlocked > 0) return 'runtime-callback-required';
  if (summary.missingDataContract > 0) return 'data-contract-required';
  if (summary.missingMerchantGrant > 0) return 'merchant-auth-required';
  return 'ready-to-sign-first-scope';
}

function statusFor(input: {
  template: ScopeTemplate;
  grantManifest: RestaurantMerchantGrantManifest;
  grantChecklist: RestaurantGrantChecklist;
  providerAdapterConfigWorkbench: RestaurantProviderAdapterConfigWorkbench;
  providerSandboxReadinessBoard: RestaurantProviderSandboxReadinessBoard;
}): RestaurantMerchantAuthorizationScopeStatus {
  const channel = input.grantManifest.channels.find(item => item.channel === input.template.id);
  const grantActive = input.grantManifest.merchant.grantStatus === 'active';
  const runtimeBlocked = !input.providerAdapterConfigWorkbench.summary.canSubmitRealProviderNow
    && input.providerAdapterConfigWorkbench.summary.missingEnvKeys > 0;
  const callbackOrReceiptBlocked = !input.providerSandboxReadinessBoard.summary.canSubmitSandboxNow
    && input.providerSandboxReadinessBoard.summary.waitingReceipt === 0
    && input.providerSandboxReadinessBoard.summary.accepted === 0;

  if (input.template.id === 'pos-redemption' && !input.grantChecklist.summary.canEnablePosImport) {
    return 'missing-data-contract';
  }
  if (!grantActive || !channel?.authorized) return 'missing-merchant-grant';
  if (runtimeBlocked || callbackOrReceiptBlocked) return 'runtime-callback-blocked';
  return 'ready-to-sign';
}

function nextActionFor(status: RestaurantMerchantAuthorizationScopeStatus, template: ScopeTemplate): string {
  if (status === 'ready-to-sign') return `Sign the first controlled ${template.label} scope and attach it to one provider sandbox run.`;
  if (status === 'missing-data-contract') return 'Provide POS mode, field dictionary, redemption source and a sanitized aggregate sample before analysis or redemption automation.';
  if (status === 'runtime-callback-blocked') return 'Configure runtime URL/API key, isolated browser profile and signed callback, then run one receipt-only sandbox package.';
  if (status === 'forbidden') return 'Keep this outside the product permanently.';
  return `Merchant must approve ${template.label} account scope, expiry and revocation before any provider receives a package.`;
}

export function buildRestaurantMerchantAuthorizationPacket(input: {
  restaurant?: string;
  offer?: string;
  grantManifest: RestaurantMerchantGrantManifest;
  grantChecklist: RestaurantGrantChecklist;
  providerAdapterConfigWorkbench: RestaurantProviderAdapterConfigWorkbench;
  providerSandboxReadinessBoard: RestaurantProviderSandboxReadinessBoard;
  providerSandboxRunConsole: RestaurantProviderSandboxRunConsole;
  now?: Date;
}): RestaurantMerchantAuthorizationPacket {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.grantManifest.merchant.restaurant);
  const offer = clean(input.offer, input.providerAdapterConfigWorkbench.offer);
  const permanentlyForbidden = input.grantManifest.permanentlyForbidden.map(item => item.action);
  const callbackRequired = unique([
    'x-restaurant-agent-signature',
    input.providerSandboxRunConsole.providerCallbackContract.action,
    ...input.providerSandboxRunConsole.providerCallbackContract.acceptedEvidence,
  ], 8);

  const scopes = SCOPE_TEMPLATES.map(template => {
    const channel = input.grantManifest.channels.find(item => item.channel === template.id);
    const status = statusFor({
      template,
      grantManifest: input.grantManifest,
      grantChecklist: input.grantChecklist,
      providerAdapterConfigWorkbench: input.providerAdapterConfigWorkbench,
      providerSandboxReadinessBoard: input.providerSandboxReadinessBoard,
    });
    const allowedActions = unique([
      ...(channel?.allowedActions || []),
      'prepare_publish_draft',
    ], 8).filter(action => !permanentlyForbidden.includes(action as never));
    const forbiddenActions = unique([
      ...permanentlyForbidden,
      ...(channel?.blockedActions.map(item => item.action) || []),
      'store raw customer identifiers',
      'reuse merchant login outside approved browser profile',
    ], 10);

    return {
      id: template.id,
      label: template.label,
      owner: template.owner,
      status,
      allowedActions,
      forbiddenActions,
      requiredFields: template.requiredFields,
      dataScope: template.dataScope,
      expiryRule: input.grantManifest.merchant.expiresAt
        ? `Expires at ${input.grantManifest.merchant.expiresAt}; provider packages must stop after that timestamp.`
        : 'Merchant must choose an expiry date before production execution; sandbox may use this draft packet only.',
      revocationRule: 'Merchant or operator can revoke the scope; revoked scopes downgrade to draft, manual import and proof review only.',
      acceptanceEvidence: unique(template.acceptanceEvidence, 8),
      providerCallbackRequired: callbackRequired,
      nextAction: nextActionFor(status, template),
      stopLine: 'No auto publish, lead contact, coupon redemption, POS pull, POS write or production claim without signed scope and accepted receipt.',
    };
  });

  const summary = {
    scopes: scopes.length,
    readyToSign: scopes.filter(scope => scope.status === 'ready-to-sign').length,
    missingMerchantGrant: scopes.filter(scope => scope.status === 'missing-merchant-grant').length,
    missingDataContract: scopes.filter(scope => scope.status === 'missing-data-contract').length,
    runtimeOrCallbackBlocked: scopes.filter(scope => scope.status === 'runtime-callback-blocked').length,
    permanentlyForbidden: permanentlyForbidden.length,
    canEnableRealProviderSubmit: input.grantChecklist.summary.canEnableAutoPublish
      && input.providerAdapterConfigWorkbench.summary.canSubmitRealProviderNow,
    canClaimExternalAutomation: false,
  } satisfies RestaurantMerchantAuthorizationPacket['summary'];

  return {
    ok: true,
    payloadShape: 'restaurant-merchant-authorization-packet-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict: verdictFor(summary),
    summary,
    scopes,
    signaturePacket: {
      merchantFields: ['legal merchant name', 'store name', 'platform account alias', 'authorizing owner', 'expiry date', 'revocation contact'],
      operatorFields: ['Wenai operator owner', 'review owner', 'allowed channel list', 'per-run approval requirement'],
      platformFields: ['Dianping/Meituan scope', 'Xiaohongshu scope', 'Douyin scope', 'WeChat community scope', 'public proof fields'],
      dataFields: ['POS data mode', 'field dictionary id', 'redemption source', 'aggregation period', 'sanitized sample batch'],
      validity: 'One signed scope unlocks one controlled sandbox lane only; production requires accepted signed receipts.',
      revocation: 'Revocation stops provider submit immediately and preserves only audit summaries and manually supplied aggregate evidence.',
    },
    providerHandOff: {
      giveProvider: [
        'scope id and allowed action list',
        'public store URL or account alias',
        'approved content draft or data import contract',
        'callback URL and required signature header name',
        'acceptance evidence list',
      ],
      neverGiveProvider: [
        'API key values',
        'cookies',
        'passwords or verification codes',
        'raw browser profile id',
        'private-message text',
        'customer phone, WeChat id, name or identifiable data',
        'coupon codes, payment ids or raw POS rows',
      ],
      callbackContract: callbackRequired,
    },
    customerScript: [
      `We can prepare ${offer} content and operating packages now, but real provider execution needs the signed merchant authorization packet first.`,
      'Pick one platform scope first; do not authorize every channel at once.',
      'The provider receives only the approved scope, public proof fields and callback contract, never passwords, cookies, private messages or customer identifiers.',
      'After the first signed callback receipt is accepted, Wenai can train the next run from proof and sanitized aggregate data.',
    ],
    redactedFields: [
      'provider secrets',
      'merchant passwords',
      'cookies',
      'verification codes',
      'raw browser profile ids',
      'private-message text',
      'customer identifiers',
      'coupon codes',
      'payment ids',
      'raw POS rows',
    ],
    safetyBoundary: 'Merchant Authorization Packet is a signable scope and provider handoff surface. It does not execute browser actions, publish content, read private messages, contact customers, redeem coupons, write POS records, expose secrets or claim external automation without active merchant grants, runtime config, signed callbacks and accepted public or aggregate evidence.',
  };
}
