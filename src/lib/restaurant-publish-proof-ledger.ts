export type RestaurantPublishProofChannel =
  | 'dianping'
  | 'meituan'
  | 'xiaohongshu'
  | 'douyin'
  | 'wechat-community'
  | 'manual';

export type RestaurantPublishProofStatus =
  | 'planned'
  | 'needs-account'
  | 'needs-proof'
  | 'proof-ready'
  | 'accepted'
  | 'blocked';

export type RestaurantPublishProofOwner =
  | '店长'
  | '运营'
  | '社群负责人'
  | '外部服务商';

export interface RestaurantPublishProofPlan {
  id: string;
  restaurantName: string;
  storeName: string;
  offerName: string;
  channel: RestaurantPublishProofChannel;
  owner: RestaurantPublishProofOwner;
  scheduledAt: string;
  status: RestaurantPublishProofStatus;
  nextAction: string;
  externalGates: string[];
}

export interface RestaurantPublishProofReceiptInput {
  planId: string;
  channel: RestaurantPublishProofChannel;
  publicUrl?: string;
  screenshotId?: string;
  publishedAt?: string;
  owner?: RestaurantPublishProofOwner;
  note?: string;
  aggregateSignals?: {
    reservationCount?: number;
    couponClaimCount?: number;
    inquiryCount?: number;
    reviewCount?: number;
    visitIntentCount?: number;
  };
}

export interface RestaurantPublishProofLedgerItem extends RestaurantPublishProofPlan {
  publicUrl?: string;
  screenshotId?: string;
  publishedAt?: string;
  proofSummary: string;
  aggregateSignals: Required<NonNullable<RestaurantPublishProofReceiptInput['aggregateSignals']>>;
  blockers: string[];
  privacyWarnings: string[];
}

export interface RestaurantPublishProofLedger {
  payloadShape: 'restaurant-publish-proof-ledger-v1';
  restaurantName: string;
  offerName: string;
  summary: {
    total: number;
    accepted: number;
    needsProof: number;
    blocked: number;
    nextActionCount: number;
    canClaimExternalPublish: boolean;
  };
  items: RestaurantPublishProofLedgerItem[];
  nextActions: string[];
  stopLines: string[];
}

const CHANNEL_LABELS: Record<RestaurantPublishProofChannel, string> = {
  dianping: '大众点评',
  meituan: '美团',
  xiaohongshu: '小红书',
  douyin: '抖音',
  'wechat-community': '微信社群',
  manual: '人工渠道',
};

const SENSITIVE_PATTERNS = [
  { label: '手机号', pattern: /(?:\+?86[-\s]?)?1[3-9]\d{9}/ },
  { label: '微信号', pattern: /(?:微信|wechat|weixin|wx)[:：\s-]*[a-zA-Z][-_a-zA-Z0-9]{5,19}/i },
  { label: '优惠码', pattern: /(?:优惠码|coupon code|券码|code)[:：\s-]*[-_a-zA-Z0-9]{4,}/i },
  { label: '订单明细', pattern: /(?:订单号|order id|orderId|payment id|支付单号)[:：\s-]*[-_a-zA-Z0-9]{4,}/i },
  { label: '原始 POS 行', pattern: /(?:raw pos|pos row|原始 POS|原始pos|sku_id|line_item)/i },
  { label: 'cookie/token/API key', pattern: /(?:cookie|token|api key|apikey|secret|bearer)[=:：\s-]+[-_.a-zA-Z0-9]{8,}/i },
];

function clampCount(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) return 0;
  return Math.min(Math.floor(numberValue), 1_000_000);
}

function emptySignals(): RestaurantPublishProofLedgerItem['aggregateSignals'] {
  return {
    reservationCount: 0,
    couponClaimCount: 0,
    inquiryCount: 0,
    reviewCount: 0,
    visitIntentCount: 0,
  };
}

export function detectPublishProofPrivacyWarnings(input: RestaurantPublishProofReceiptInput): string[] {
  const scanText = [
    input.publicUrl || '',
    input.screenshotId || '',
    input.note || '',
  ].join('\n');
  return SENSITIVE_PATTERNS
    .filter(item => item.pattern.test(scanText))
    .map(item => `不得保存${item.label}`);
}

function buildBlockers(plan: RestaurantPublishProofPlan, receipt?: RestaurantPublishProofReceiptInput, privacyWarnings: string[] = []) {
  return [
    plan.externalGates.length > 0 && plan.status === 'needs-account' ? '缺外部账号/授权' : '',
    !receipt?.publicUrl && !receipt?.screenshotId ? '缺发布链接或截图凭证' : '',
    !receipt?.publishedAt ? '缺发布时间' : '',
    privacyWarnings.length > 0 ? '包含不能保存的敏感信息' : '',
    plan.status === 'blocked' ? plan.nextAction : '',
  ].filter(Boolean);
}

function statusFrom(plan: RestaurantPublishProofPlan, receipt: RestaurantPublishProofReceiptInput | undefined, blockers: string[]): RestaurantPublishProofStatus {
  if (blockers.some(item => item.includes('敏感信息')) || plan.status === 'blocked') return 'blocked';
  if (receipt?.publicUrl || receipt?.screenshotId) return blockers.length === 0 ? 'accepted' : 'proof-ready';
  if (plan.status === 'needs-account') return 'needs-account';
  return 'needs-proof';
}

export function buildRestaurantPublishProofLedger(input: {
  restaurantName: string;
  offerName: string;
  plans: RestaurantPublishProofPlan[];
  receipts?: RestaurantPublishProofReceiptInput[];
}): RestaurantPublishProofLedger {
  const receiptByPlan = new Map((input.receipts || []).map(receipt => [receipt.planId, receipt]));
  const items = input.plans.map(plan => {
    const receipt = receiptByPlan.get(plan.id);
    const privacyWarnings = receipt ? detectPublishProofPrivacyWarnings(receipt) : [];
    const blockers = buildBlockers(plan, receipt, privacyWarnings);
    const aggregateSignals = {
      ...emptySignals(),
      reservationCount: clampCount(receipt?.aggregateSignals?.reservationCount),
      couponClaimCount: clampCount(receipt?.aggregateSignals?.couponClaimCount),
      inquiryCount: clampCount(receipt?.aggregateSignals?.inquiryCount),
      reviewCount: clampCount(receipt?.aggregateSignals?.reviewCount),
      visitIntentCount: clampCount(receipt?.aggregateSignals?.visitIntentCount),
    };
    const status = statusFrom(plan, receipt, blockers);
    const proofSummary = receipt?.publicUrl || receipt?.screenshotId
      ? `${CHANNEL_LABELS[plan.channel]} 已有凭证，等待店长按链接、截图、发布时间和脱敏回流复核。`
      : `${CHANNEL_LABELS[plan.channel]} 还缺发布凭证，不能宣称外部发布完成。`;

    return {
      ...plan,
      owner: receipt?.owner || plan.owner,
      status,
      publicUrl: receipt?.publicUrl,
      screenshotId: receipt?.screenshotId,
      publishedAt: receipt?.publishedAt,
      proofSummary,
      aggregateSignals,
      blockers,
      privacyWarnings,
    };
  });

  const accepted = items.filter(item => item.status === 'accepted').length;
  const blocked = items.filter(item => item.status === 'blocked' || item.blockers.length > 0).length;
  const needsProof = items.filter(item => item.status === 'needs-proof' || item.status === 'needs-account' || item.status === 'proof-ready').length;
  const nextActions = items
    .filter(item => item.status !== 'accepted')
    .map(item => `${CHANNEL_LABELS[item.channel]} / ${item.owner}：${item.blockers[0] || item.nextAction}`)
    .slice(0, 20);

  return {
    payloadShape: 'restaurant-publish-proof-ledger-v1',
    restaurantName: input.restaurantName,
    offerName: input.offerName,
    summary: {
      total: items.length,
      accepted,
      needsProof,
      blocked,
      nextActionCount: nextActions.length,
      canClaimExternalPublish: items.length > 0 && accepted === items.length,
    },
    items,
    nextActions,
    stopLines: [
      '没有平台账号或商户授权，不宣称自动发布。',
      '没有发布链接、截图、发布时间和负责人，不宣称外部发布完成。',
      '没有脱敏聚合信号，不宣称真实经营归因。',
      '不保存手机号、微信号、私信原文、优惠码、订单明细、原始 POS 行、cookie、token 或 API key。',
    ],
  };
}

export const RESTAURANT_PUBLISH_PROOF_DEMO_PLANS: RestaurantPublishProofPlan[] = [
  {
    id: 'publish-dianping-main-dish',
    restaurantName: '样例餐厅',
    storeName: '人民广场店',
    offerName: '招牌双人套餐',
    channel: 'dianping',
    owner: '运营',
    scheduledAt: '今天 17:30',
    status: 'planned',
    nextAction: '补大众点评发布链接或截图，并回填发布时间。',
    externalGates: ['大众点评商户账号', '店长授权'],
  },
  {
    id: 'publish-xhs-main-dish',
    restaurantName: '样例餐厅',
    storeName: '人民广场店',
    offerName: '招牌双人套餐',
    channel: 'xiaohongshu',
    owner: '社群负责人',
    scheduledAt: '今天 19:00',
    status: 'needs-proof',
    nextAction: '确认图文笔记发布负责人和截图回填方式。',
    externalGates: ['小红书账号', '素材授权'],
  },
  {
    id: 'publish-wechat-community',
    restaurantName: '样例餐厅',
    storeName: '人民广场店',
    offerName: '招牌双人套餐',
    channel: 'wechat-community',
    owner: '店长',
    scheduledAt: '今天 20:30',
    status: 'planned',
    nextAction: '只回填社群发布截图和脱敏咨询数量，不保存私信原文。',
    externalGates: ['社群负责人确认'],
  },
];
