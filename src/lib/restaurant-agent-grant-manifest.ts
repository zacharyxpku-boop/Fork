export type RestaurantGrantChannel = 'dianping-meituan' | 'xiaohongshu' | 'douyin' | 'wechat-community' | 'pos-redemption';

export type RestaurantGrantAction =
  | 'open_public_page'
  | 'capture_public_receipt'
  | 'prepare_publish_draft'
  | 'submit_platform_publish'
  | 'pull_pos_redemption'
  | 'summarize_lead_counts'
  | 'read_private_message';

export type RestaurantGrantActionPolicy = {
  action: RestaurantGrantAction;
  allowed: boolean;
  reason: string;
  requiresOperatorApproval: boolean;
  evidenceRequired: string[];
};

export type RestaurantGrantChannelPolicy = {
  channel: RestaurantGrantChannel;
  authorized: boolean;
  source: 'merchant-auth' | 'data-contract' | 'operator' | 'public';
  evidence: string;
  allowedActions: RestaurantGrantAction[];
  blockedActions: RestaurantGrantActionPolicy[];
};

export type RestaurantMerchantGrantManifest = {
  ok: true;
  manifestId: string;
  merchant: {
    restaurant: string;
    operator: string;
    grantStatus: 'active' | 'blocked' | 'expired' | 'revoked';
    expiresAt: string | null;
    revoked: boolean;
  };
  channels: RestaurantGrantChannelPolicy[];
  actionPolicy: RestaurantGrantActionPolicy[];
  permanentlyForbidden: RestaurantGrantActionPolicy[];
  privacyBoundary: string[];
  audit: {
    secretsIncluded: false;
    privateDataIncluded: false;
    tokenFieldsReturned: [];
    generatedFrom: 'env-and-merchant-grant';
  };
  nextStep: string;
};

type EnvMap = Record<string, string | undefined>;

const PUBLIC_RECEIPT_EVIDENCE = ['发布链接', '内容 ID', '截图编号', '外部 runId', '负责人'];
const PUBLISH_EVIDENCE = ['商家授权状态', '运营审批记录', '平台审核结果', '发布链接或失败原因'];
const POS_EVIDENCE = ['POS 数据模式', '字段字典', '核销来源', '导入批次编号'];

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 43 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback: string, max = 80): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function isFutureIso(value: string | undefined, now: Date): boolean {
  if (!value) return true;
  const time = Date.parse(value);
  return Number.isFinite(time) && time > now.getTime();
}

function grantStatus(input: { revoked?: boolean; expiresAt?: string; env: EnvMap; now: Date }): RestaurantMerchantGrantManifest['merchant']['grantStatus'] {
  if (input.revoked || input.env.RESTAURANT_AGENT_GRANT_REVOKED === 'true') return 'revoked';
  if (!isFutureIso(input.expiresAt || input.env.RESTAURANT_AGENT_GRANT_EXPIRES_AT, input.now)) return 'expired';
  if (input.env.RESTAURANT_AGENT_OPERATOR_APPROVAL === 'approved') return 'active';
  return 'blocked';
}

function buildActionPolicy(input: {
  grantActive: boolean;
  socialAuthorized: boolean;
  dianpingAuthorized: boolean;
  posReady: boolean;
  operatorApproved: boolean;
}): RestaurantGrantActionPolicy[] {
  return [
    {
      action: 'open_public_page',
      allowed: true,
      reason: '公开页面检查和手工证据导入可内部执行。',
      requiresOperatorApproval: false,
      evidenceRequired: ['公开链接', '检查时间', '负责人'],
    },
    {
      action: 'capture_public_receipt',
      allowed: input.grantActive && (input.socialAuthorized || input.dianpingAuthorized),
      reason: input.grantActive ? '只抽取公开发布证明，不读取后台私信。' : '商家授权未生效、过期或已撤销。',
      requiresOperatorApproval: false,
      evidenceRequired: PUBLIC_RECEIPT_EVIDENCE,
    },
    {
      action: 'prepare_publish_draft',
      allowed: true,
      reason: '内容草稿、发布清单和证据字段可内部生成。',
      requiresOperatorApproval: false,
      evidenceRequired: ['门店 brief', '菜品/套餐边界', '禁用表达'],
    },
    {
      action: 'submit_platform_publish',
      allowed: input.grantActive && input.operatorApproved && (input.socialAuthorized || input.dianpingAuthorized),
      reason: input.grantActive && input.operatorApproved ? '仅在平台账号授权和运营审批后交给外部 runtime。' : '代发必须等待商家授权、运营审批和平台边界。',
      requiresOperatorApproval: true,
      evidenceRequired: PUBLISH_EVIDENCE,
    },
    {
      action: 'pull_pos_redemption',
      allowed: input.grantActive && input.posReady,
      reason: input.posReady ? '只能读取授权导出/API 的聚合核销字段。' : '需要 POS 数据模式、字段字典和核销来源。',
      requiresOperatorApproval: true,
      evidenceRequired: POS_EVIDENCE,
    },
    {
      action: 'summarize_lead_counts',
      allowed: input.grantActive && (input.socialAuthorized || input.dianpingAuthorized),
      reason: '只保存预约、券领取、咨询数量和来源，不保存可识别顾客信息。',
      requiresOperatorApproval: false,
      evidenceRequired: ['聚合数量', '来源渠道', '时间范围'],
    },
    {
      action: 'read_private_message',
      allowed: false,
      reason: '私信原文、手机号、微信号和可识别顾客身份信息永久禁止进入系统。',
      requiresOperatorApproval: true,
      evidenceRequired: [],
    },
  ];
}

function channel(
  channelName: RestaurantGrantChannel,
  authorized: boolean,
  source: RestaurantGrantChannelPolicy['source'],
  evidence: string,
  actions: RestaurantGrantActionPolicy[],
): RestaurantGrantChannelPolicy {
  return {
    channel: channelName,
    authorized,
    source,
    evidence,
    allowedActions: actions.filter(action => action.allowed && action.action !== 'read_private_message').map(action => action.action),
    blockedActions: actions.filter(action => !action.allowed),
  };
}

export function buildRestaurantMerchantGrantManifest(input: {
  restaurant?: string;
  operator?: string;
  expiresAt?: string;
  revoked?: boolean;
  env?: EnvMap;
  now?: Date;
} = {}): RestaurantMerchantGrantManifest {
  const env = input.env || process.env;
  const now = input.now || new Date();
  const restaurant = cleanText(input.restaurant, '试用门店');
  const operator = cleanText(input.operator, '运营负责人');
  const status = grantStatus({ revoked: input.revoked, expiresAt: input.expiresAt, env, now });
  const grantActive = status === 'active';
  const dianpingAuthorized = grantActive && env.RESTAURANT_DIANPING_AUTH_STATUS === 'authorized';
  const socialAuthorized = grantActive && env.RESTAURANT_SOCIAL_AUTH_STATUS === 'authorized';
  const operatorApproved = grantActive && env.RESTAURANT_AGENT_OPERATOR_APPROVAL === 'approved';
  const posReady = grantActive
    && ['api', 'csv', 'sheet'].includes(env.RESTAURANT_POS_DATA_MODE || '')
    && hasValue(env, 'RESTAURANT_POS_FIELD_DICTIONARY')
    && hasValue(env, 'RESTAURANT_REDEMPTION_SOURCE');
  const actionPolicy = buildActionPolicy({ grantActive, socialAuthorized, dianpingAuthorized, posReady, operatorApproved });
  const expiresAt = input.expiresAt || env.RESTAURANT_AGENT_GRANT_EXPIRES_AT || null;

  return {
    ok: true,
    manifestId: `restaurant-grant-${stableId([restaurant, operator, status, expiresAt || 'no-expiry'])}`,
    merchant: {
      restaurant,
      operator,
      grantStatus: status,
      expiresAt,
      revoked: status === 'revoked',
    },
    channels: [
      channel('dianping-meituan', dianpingAuthorized, 'merchant-auth', `RESTAURANT_DIANPING_AUTH_STATUS=${env.RESTAURANT_DIANPING_AUTH_STATUS || 'missing'}`, actionPolicy),
      channel('xiaohongshu', socialAuthorized, 'merchant-auth', `RESTAURANT_SOCIAL_AUTH_STATUS=${env.RESTAURANT_SOCIAL_AUTH_STATUS || 'missing'}`, actionPolicy),
      channel('douyin', socialAuthorized, 'merchant-auth', `RESTAURANT_SOCIAL_AUTH_STATUS=${env.RESTAURANT_SOCIAL_AUTH_STATUS || 'missing'}`, actionPolicy),
      channel('wechat-community', socialAuthorized, 'operator', `RESTAURANT_AGENT_OPERATOR_APPROVAL=${env.RESTAURANT_AGENT_OPERATOR_APPROVAL || 'missing'}`, actionPolicy),
      channel('pos-redemption', posReady, 'data-contract', `RESTAURANT_POS_DATA_MODE=${env.RESTAURANT_POS_DATA_MODE || 'missing'}`, actionPolicy),
    ],
    actionPolicy,
    permanentlyForbidden: actionPolicy.filter(action => action.action === 'read_private_message'),
    privacyBoundary: [
      '不返回 API key、cookie、token、密码、短信码或浏览器 profile 原始标识。',
      '不读取或保存私信原文、手机号、微信号、顾客姓名和可识别身份信息。',
      '发布、核销、POS 拉取必须有商家授权、运营审批、证据字段和可撤销机制。',
      '授权过期或撤销后，外部动作全部降级为草稿、检查清单和人工回填。',
    ],
    audit: {
      secretsIncluded: false,
      privateDataIncluded: false,
      tokenFieldsReturned: [],
      generatedFrom: 'env-and-merchant-grant',
    },
    nextStep: grantActive
      ? '可以把授权 manifest 与 browser session manifest 一起交给外部 runtime；runtime 仍必须按 actionPolicy 拒绝越权动作。'
      : '先补商家授权、运营审批和有效期；在此之前只允许草稿、公开检查和手工证据导入。',
  };
}
