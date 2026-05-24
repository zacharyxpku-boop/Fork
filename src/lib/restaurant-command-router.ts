import type { RestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantCommandIntent =
  | 'controlled-trial'
  | 'public-proof'
  | 'store-followup'
  | 'operating-review'
  | 'next-loop-shift'
  | 'provider-setup'
  | 'channel-schedule'
  | 'blocked-sensitive';

export type RestaurantCommandRouteAction = {
  id: string;
  label: string;
  clientAction:
    | 'controlled-trial-run'
    | 'post-run-review-pack'
    | 'next-loop-channel-plan'
    | 'store-manager-followup'
    | 'operating-insight-report'
    | 'provider-setup-wizard'
    | 'channel-hub'
    | 'channel-schedule-run'
    | 'manual-sanitize';
  owner: 'ops' | 'store-manager' | 'community-ops' | 'finance' | 'runtime-admin';
  status: 'internal-ready' | 'needs-evidence' | 'provider-gated' | 'blocked';
  reason: string;
  evidenceRequired: string[];
  externalRequired: string[];
  stopLine: string;
};

export type RestaurantCommandRoute = {
  ok: true;
  payloadShape: 'restaurant-command-route-v1';
  generatedAt: string;
  command: string;
  restaurant: string;
  offer: string;
  intent: RestaurantCommandIntent;
  confidence: 'high' | 'medium' | 'low';
  verdict: 'route-ready' | 'needs-evidence' | 'provider-gated' | 'blocked-sensitive';
  extracted: {
    restaurant?: string;
    offer?: string;
    channels: string[];
    serviceWindow?: string;
    evidenceHints: string[];
    forbiddenHints: string[];
  };
  primaryAction: RestaurantCommandRouteAction;
  followupActions: RestaurantCommandRouteAction[];
  commandCenter?: Pick<RestaurantAgentCommandCenter, 'payloadShape' | 'mode' | 'summary' | 'primaryAction' | 'nextAction' | 'safetyBoundary'>;
  operatorBrief: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

const CHANNELS = [
  { id: 'dianping', label: 'Dianping/Meituan', patterns: ['大众点评', '点评', '美团', '团购'] },
  { id: 'xiaohongshu', label: 'Xiaohongshu', patterns: ['小红书', '种草'] },
  { id: 'douyin', label: 'Douyin', patterns: ['抖音', '短视频', '直播'] },
  { id: 'wechat', label: 'WeChat community', patterns: ['微信', '社群', '私域', '群'] },
  { id: 'wecom', label: 'WeCom/Staff channel', patterns: ['企业微信', '企微', '员工群', '店长群'] },
  { id: 'pos', label: 'POS/redemption', patterns: ['POS', 'pos', '核销', '订单', '库存', '收银'] },
];

const SENSITIVE_PATTERNS = [
  /api[_ -]?key/i,
  /secret/i,
  /token/i,
  /cookie/i,
  /password/i,
  /session/i,
  /手机号|手机|电话|微信号|openid|身份证|顾客名单|客户名单|私信原文|聊天记录/i,
  /\b1[3-9]\d{9}\b/,
];

function clean(value: unknown, fallback: string, max = 160): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function hasAny(text: string, words: string[]) {
  return words.some(word => text.toLowerCase().includes(word.toLowerCase()));
}

function extractChannels(command: string) {
  return CHANNELS
    .filter(channel => channel.patterns.some(pattern => command.includes(pattern)))
    .map(channel => channel.label);
}

function extractServiceWindow(command: string) {
  const match = command.match(/(今天|今晚|明天|午市|晚市|早餐|午餐|晚餐|夜宵|收盘后|开店前|闭店前|[0-2]?\d[:：][0-5]\d(?:\s*[-到至]\s*[0-2]?\d[:：][0-5]\d)?)/);
  return match?.[0];
}

function extractEvidenceHints(command: string) {
  const hints = [
    command.includes('截图') ? 'screenshot id' : '',
    command.includes('链接') || command.includes('link') ? 'public link' : '',
    command.includes('回执') ? 'accepted receipt' : '',
    command.includes('核销') ? 'redemption aggregate' : '',
    command.includes('库存') ? 'inventory aggregate' : '',
    command.includes('预约') ? 'reservation aggregate' : '',
    command.includes('领券') || command.includes('券') ? 'coupon aggregate' : '',
  ].filter(Boolean);
  return Array.from(new Set(hints));
}

function forbiddenHints(command: string) {
  const hints = [
    hasAny(command, ['自动私信', '群发', '联系所有客户', '导出客户', '拉取私信']) ? 'customer outreach/private-message action requested' : '',
    hasAny(command, ['自动核销', '核销所有', '改订单', '退款']) ? 'redemption/order mutation requested' : '',
    SENSITIVE_PATTERNS.some(pattern => pattern.test(command)) ? 'sensitive value or PII-like content detected' : '',
  ].filter(Boolean);
  return Array.from(new Set(hints));
}

function inferIntent(command: string): { intent: RestaurantCommandIntent; confidence: RestaurantCommandRoute['confidence'] } {
  if (forbiddenHints(command).length) return { intent: 'blocked-sensitive', confidence: 'high' };
  if (hasAny(command, ['下一轮', '班次', '排班', '下一班', '作战计划'])) return { intent: 'next-loop-shift', confidence: 'high' };
  if (hasAny(command, ['发布', '发到', '发一篇', '种草', '短视频', '截图', '链接', '回执'])) return { intent: 'public-proof', confidence: 'high' };
  if (hasAny(command, ['领券', '预约', '到店', '咨询', '私域', '社群', '跟进'])) return { intent: 'store-followup', confidence: 'high' };
  if (hasAny(command, ['核销', 'POS', 'pos', '库存', '毛利', '营收', '订单', '收盘', '经营分析'])) return { intent: 'operating-review', confidence: 'high' };
  if (hasAny(command, ['明天'])) return { intent: 'next-loop-shift', confidence: 'medium' };
  if (hasAny(command, ['provider', 'key', '密钥', '授权', '浏览器', 'runtime', '回调', 'callback', '接入'])) return { intent: 'provider-setup', confidence: 'high' };
  if (hasAny(command, ['提醒', '员工', '店长群', '企业微信', '飞书', '钉钉', '定时'])) return { intent: 'channel-schedule', confidence: 'medium' };
  if (command.trim().length > 0) return { intent: 'controlled-trial', confidence: 'medium' };
  return { intent: 'controlled-trial', confidence: 'low' };
}

function primaryActionFor(input: {
  intent: RestaurantCommandIntent;
  commandCenter?: RestaurantAgentCommandCenter;
  forbidden: string[];
  evidenceHints: string[];
  channels: string[];
}): RestaurantCommandRouteAction {
  const providerGates = input.commandCenter?.summary.providerGates || 0;
  if (input.intent === 'blocked-sensitive') {
    return {
      id: 'sanitize-command',
      label: 'Sanitize Command',
      clientAction: 'manual-sanitize',
      owner: 'ops',
      status: 'blocked',
      reason: 'The command appears to include private customer data, secret material, private-message access, or direct customer mutation.',
      evidenceRequired: ['sanitized aggregate counts', 'merchant-approved scope', 'public proof or staff-only owner note'],
      externalRequired: [],
      stopLine: 'Do not route commands containing phone numbers, WeChat IDs, tokens, cookies, private-message raw text, raw POS rows or customer lists.',
    };
  }
  if (input.intent === 'public-proof') {
    return {
      id: 'route-public-proof',
      label: 'Build Public Proof Run',
      clientAction: input.evidenceHints.length ? 'post-run-review-pack' : 'controlled-trial-run',
      owner: 'ops',
      status: input.evidenceHints.length ? 'needs-evidence' : 'internal-ready',
      reason: 'The command asks for platform content or proof capture; internal mode can prepare the governed work order and proof checklist.',
      evidenceRequired: ['approved content', 'target platform', 'posted link or screenshot id', 'operator'],
      externalRequired: providerGates ? ['platform merchant authorization', 'isolated browser profile', 'runtime provider', 'signed callback receipt'] : [],
      stopLine: 'No accepted public proof means no publishing or performance claim.',
    };
  }
  if (input.intent === 'store-followup') {
    return {
      id: 'route-store-followup',
      label: 'Build Store Follow-up',
      clientAction: 'store-manager-followup',
      owner: 'store-manager',
      status: 'needs-evidence',
      reason: 'The command asks to turn reservation, coupon, inquiry or visit intent into owner-routed store work.',
      evidenceRequired: ['aggregate lead count', 'source channel', 'merchant-approved talk track', 'follow-up owner'],
      externalRequired: ['merchant authorization for customer-facing follow-up', 'no raw private-message storage'],
      stopLine: 'Do not DM customers, export contacts or read private chats from this route.',
    };
  }
  if (input.intent === 'operating-review') {
    return {
      id: 'route-operating-review',
      label: 'Build Operating Review',
      clientAction: 'operating-insight-report',
      owner: 'finance',
      status: 'needs-evidence',
      reason: 'The command asks for redemption, POS, stock or closeout analysis; only sanitized aggregate data can be used internally.',
      evidenceRequired: ['business date', 'offer name', 'coupon claim count', 'redemption count', 'field dictionary'],
      externalRequired: ['POS/export contract', 'redemption data source', 'finance/inventory field dictionary'],
      stopLine: 'Do not pull raw orders, payment ids, member ids, customer names or margin claims.',
    };
  }
  if (input.intent === 'next-loop-shift') {
    return {
      id: 'route-next-loop',
      label: 'Build Next Loop Plan',
      clientAction: 'next-loop-channel-plan',
      owner: 'ops',
      status: 'internal-ready',
      reason: 'The command asks for the next operating loop; route through proof, staff channels, POS aggregate and provider gates.',
      evidenceRequired: ['accepted proof or manual note', 'store capacity', 'service window', 'aggregate operating data if available'],
      externalRequired: providerGates ? ['provider keys', 'callback secret', 'merchant platform grants', 'POS/data contract'] : [],
      stopLine: 'Do not claim automated acquisition or true operating impact without provider receipts and data contracts.',
    };
  }
  if (input.intent === 'provider-setup') {
    return {
      id: 'route-provider-setup',
      label: 'Open Provider Setup',
      clientAction: 'provider-setup-wizard',
      owner: 'runtime-admin',
      status: 'provider-gated',
      reason: 'The command asks to connect external runtime, browser, callback, merchant grants or data contracts.',
      evidenceRequired: ['server-side config present', 'merchant grant', 'isolated browser profile id', 'callback test receipt'],
      externalRequired: ['runtime URL/key', 'callback secret', 'merchant authorization', 'provider health check'],
      stopLine: 'Do not paste or expose API keys, cookies, tokens or browser profile paths in the client.',
    };
  }
  if (input.intent === 'channel-schedule') {
    return {
      id: 'route-channel-schedule',
      label: 'Run Staff Schedule',
      clientAction: input.channels.length ? 'channel-schedule-run' : 'channel-hub',
      owner: 'runtime-admin',
      status: 'provider-gated',
      reason: 'The command asks for staff reminders or scheduled AI employee jobs.',
      evidenceRequired: ['staff-only channel', 'message preview', 'delivery attempt id or manual handoff', 'acknowledgement'],
      externalRequired: ['WeCom/Feishu/DingTalk/SMS provider if external delivery is required', 'merchant-approved staff recipient roles'],
      stopLine: 'Staff channels cannot contact customers or include PII, private chats, secrets or coupon codes.',
    };
  }
  return {
    id: 'route-controlled-trial',
    label: 'Run Controlled Trial',
    clientAction: 'controlled-trial-run',
    owner: 'ops',
    status: 'internal-ready',
    reason: 'The command is broad enough to start with an internal controlled restaurant work order.',
    evidenceRequired: ['restaurant', 'offer', 'target audience', 'channels', 'proof requirement'],
    externalRequired: [],
    stopLine: 'Internal trial output is not proof of external publishing, acquisition, redemption or operating impact.',
  };
}

function followupsFor(primary: RestaurantCommandRouteAction, intent: RestaurantCommandIntent): RestaurantCommandRouteAction[] {
  const common: RestaurantCommandRouteAction[] = [
    {
      id: 'followup-next-loop',
      label: 'Next Loop Plan',
      clientAction: 'next-loop-channel-plan',
      owner: 'ops',
      status: intent === 'blocked-sensitive' ? 'blocked' : 'internal-ready',
      reason: 'Turn routed intent into a daily shift plan after proof and store capacity are checked.',
      evidenceRequired: ['accepted proof', 'store capacity note', 'one changed variable'],
      externalRequired: [],
      stopLine: 'Change one variable at a time and keep external automation behind provider receipts.',
    },
    {
      id: 'followup-provider-gates',
      label: 'Provider Gates',
      clientAction: 'provider-setup-wizard',
      owner: 'runtime-admin',
      status: 'provider-gated',
      reason: 'Expose the external setup required before claiming competitor-grade automation.',
      evidenceRequired: ['runtime config', 'callback receipt', 'merchant grants', 'data contract'],
      externalRequired: ['provider keys', 'callback secret', 'merchant authorizations', 'POS/data contract'],
      stopLine: 'Secret values remain server-side and are never included in routed command payloads.',
    },
  ];
  return common.filter(item => item.id !== primary.id).slice(0, 2);
}

function verdictFor(primary: RestaurantCommandRouteAction): RestaurantCommandRoute['verdict'] {
  if (primary.status === 'blocked') return 'blocked-sensitive';
  if (primary.status === 'provider-gated') return 'provider-gated';
  if (primary.status === 'needs-evidence') return 'needs-evidence';
  return 'route-ready';
}

export function buildRestaurantCommandRoute(input: RestaurantTrialIntake & {
  command?: string;
  commandCenter?: RestaurantAgentCommandCenter;
  now?: Date;
} = {}): RestaurantCommandRoute {
  const now = input.now || new Date();
  const command = clean(input.command, '', 1000);
  const restaurant = clean(input.restaurant, input.commandCenter?.restaurant || 'Trial restaurant');
  const offer = clean(input.offer, input.commandCenter?.offer || 'Today featured set meal');
  const channels = extractChannels(command);
  const evidenceHints = extractEvidenceHints(command);
  const forbidden = forbiddenHints(command);
  const { intent, confidence } = inferIntent(command);
  const primaryAction = primaryActionFor({
    intent,
    commandCenter: input.commandCenter,
    forbidden,
    evidenceHints,
    channels,
  });
  const followupActions = followupsFor(primaryAction, intent);
  const externalRequired = Array.from(new Set([
    ...primaryAction.externalRequired,
    ...followupActions.flatMap(item => item.externalRequired),
    ...(input.commandCenter?.externalRequired || []),
  ])).slice(0, 12);

  return {
    ok: true,
    payloadShape: 'restaurant-command-route-v1',
    generatedAt: now.toISOString(),
    command,
    restaurant,
    offer,
    intent,
    confidence,
    verdict: verdictFor(primaryAction),
    extracted: {
      restaurant: command.includes(restaurant) ? restaurant : undefined,
      offer: command.includes(offer) ? offer : undefined,
      channels,
      serviceWindow: extractServiceWindow(command),
      evidenceHints,
      forbiddenHints: forbidden,
    },
    primaryAction,
    followupActions,
    commandCenter: input.commandCenter ? {
      payloadShape: input.commandCenter.payloadShape,
      mode: input.commandCenter.mode,
      summary: input.commandCenter.summary,
      primaryAction: input.commandCenter.primaryAction,
      nextAction: input.commandCenter.nextAction,
      safetyBoundary: input.commandCenter.safetyBoundary,
    } : undefined,
    operatorBrief: [
      primaryAction.reason,
      `Route ${intent} with ${confidence} confidence; internal action ${primaryAction.clientAction}; status ${primaryAction.status}.`,
      primaryAction.stopLine,
    ],
    externalRequired,
    safetyBoundary: 'Command Router classifies a merchant command into governed internal actions, evidence requirements and external gates. It does not execute external publishing, contact customers, read private messages, redeem coupons, pull raw POS rows, expose secrets, or treat natural-language intent as merchant authorization.',
  };
}
