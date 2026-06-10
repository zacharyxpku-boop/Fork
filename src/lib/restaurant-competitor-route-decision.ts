import { buildRestaurantBenchmarkStrategy, type RestaurantBenchmarkStrategy } from '@/lib/restaurant-benchmark-strategy';
import { buildRestaurantCapabilityTrainingPlanFromLedger, type RestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training';
import { buildRestaurantCompetitorTrainingBlueprint, type RestaurantCompetitorTrainingBlueprint } from '@/lib/restaurant-competitor-training-blueprint';
import { buildRestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantCompetitorRouteDecisionOption = {
  id: 'platform-spine' | 'claw-experience' | 'lobu-runtime' | 'restaurant-data';
  label: string;
  role: 'primary' | 'copy-experience' | 'runtime-backplane' | 'data-contract';
  verdict: 'adopt-as-spine' | 'adopt-as-layer' | 'connect-later' | 'must-have-contract';
  why: string;
  copyExactly: string[];
  upgradeBeyondCompetitor: string[];
  internalCanShipNow: string[];
  needsTraining: string[];
  externalRequired: string[];
  acceptanceProof: string[];
};

export type RestaurantCompetitorReferenceModel = {
  id: 'kuaizi-platform' | 'shaozi-claw-cloud' | 'lobu-browser-agent';
  label: string;
  recommendedUse: 'product-base' | 'operator-experience' | 'runtime-tool';
  fitScore: number;
  adopt: string[];
  doNotCopyBlindly: string[];
  uiUxToReplicate: string[];
  capabilityToOwn: string[];
  internalTraining: string[];
  externalRequired: string[];
};

export type RestaurantCompetitorRouteDecision = {
  ok: true;
  payloadShape: 'restaurant-competitor-route-decision-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  finalTarget: 'platform-spine-plus-claw-experience-plus-restaurant-data-contracts';
  answerForOwner: string;
  summary: {
    options: number;
    internalCanShipNow: number;
    trainingItems: number;
    externalRequired: number;
    setupRecordsRemembered: number;
    canClaimFullCompetitorParity: false;
  };
  options: RestaurantCompetitorRouteDecisionOption[];
  referenceModels: RestaurantCompetitorReferenceModel[];
  finalShape: {
    productBase: 'kuaizi-style-platform-spine';
    operatorLayer: 'shaozi-claw-cloud-style-ai-employee-workbench';
    runtimeLayer: 'lobu-openclaw-hermes-browser-agent';
    dataLayer: 'restaurant-pos-redemption-member-contracts';
    reason: string;
    firstScreenRule: string;
  };
  nextBuildOrder: Array<{
    id: string;
    owner: 'product' | 'runtime-admin' | 'ops' | 'merchant';
    action: string;
    proof: string;
  }>;
  providerKeyChecklist: string[];
  merchantInputsNeeded: string[];
  benchmarkStrategy: Pick<RestaurantBenchmarkStrategy, 'payloadShape' | 'recommendation' | 'productPrinciples' | 'safetyBoundary'>;
  trainingBlueprint: Pick<RestaurantCompetitorTrainingBlueprint, 'payloadShape' | 'verdict' | 'summary' | 'externalRequired' | 'safetyBoundary'>;
  trainingPlan: Pick<RestaurantCapabilityTrainingPlan, 'payloadShape' | 'summary' | 'nextInternalTraining' | 'externalSetupRequests' | 'safetyBoundary'>;
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: string[], limit = 18): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function countUnique(options: RestaurantCompetitorRouteDecisionOption[], field: 'internalCanShipNow' | 'needsTraining' | 'externalRequired') {
  return unique(options.flatMap(item => item[field]), 99).length;
}

function countUniqueReference(referenceModels: RestaurantCompetitorReferenceModel[], field: 'internalTraining' | 'externalRequired') {
  return unique(referenceModels.flatMap(item => item[field]), 99).length;
}

function providerKeysFrom(external: string[]): string[] {
  return unique(external.flatMap(item => {
    const upper = item.toUpperCase();
    const keys: string[] = [];
    if (/OPENCLAW|BROWSER|PROFILE/.test(upper)) keys.push('RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY');
    if (/HERMES/.test(upper)) keys.push('RESTAURANT_AGENT_HERMES_RUNTIME_URL', 'RESTAURANT_AGENT_HERMES_API_KEY');
    if (/LOBU|GATEWAY|WORKER|RUNTIME/.test(upper)) keys.push('RESTAURANT_AGENT_LOBU_RUNTIME_URL', 'RESTAURANT_AGENT_LOBU_API_KEY');
    if (/CALLBACK|RECEIPT/.test(upper)) keys.push('RESTAURANT_AGENT_CALLBACK_SECRET');
    if (/POS|REDEMPTION|COUPON|MEMBER|FINANCE|INVENTORY/.test(upper)) keys.push('RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY');
    if (/WECHAT|WECOM|SMS|STAFF|COMMUNITY|MESSAGE/.test(upper)) keys.push('STAFF_NOTIFICATION_WEBHOOK');
    return keys;
  }), 24);
}

export async function buildRestaurantCompetitorRouteDecision(input: RestaurantTrialIntake & {
  now?: Date;
} = {}): Promise<RestaurantCompetitorRouteDecision> {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const benchmarkStrategy = buildRestaurantBenchmarkStrategy();
  const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
  const trainingBlueprint = await buildRestaurantCompetitorTrainingBlueprint({
    ...input,
    restaurant,
    offer,
    now,
  });
  const setupState = buildRestaurantProviderSetupStateSummary(now);
  const setupText = [
    ...setupState.provided.envKeys,
    ...setupState.provided.merchantApprovals,
    ...setupState.provided.dataContracts,
  ].join(' | ').toLowerCase();

  const options: RestaurantCompetitorRouteDecisionOption[] = [
    {
      id: 'platform-spine',
      label: 'Kuaizi-style platform spine',
      role: 'primary',
      verdict: 'adopt-as-spine',
      why: 'Restaurant customers need a reliable operating chain more than a flashy agent demo: intake, content, publish proof, leads, redemption, operating analysis, review and next action must live in one ledger.',
      copyExactly: ['task/status/evidence ledger', 'owner and next action on every lane', 'provider callback and audit gates', 'content-to-distribution-to-review operating loop'],
      upgradeBeyondCompetitor: ['restaurant-specific daypart, offer and store context', 'no fake growth claims', 'field-level data provenance before any analysis'],
      internalCanShipNow: ['friend_trial workbench', 'trial workflow pack', 'activation cockpit', 'operating data contract', 'post-run review pack'],
      needsTraining: trainingPlan.nextInternalTraining.slice(0, 4).map(item => item.material),
      externalRequired: unique(benchmarkStrategy.candidates.find(item => item.id === 'kuaizi-platform')?.externalGates || []),
      acceptanceProof: ['one task timeline from intake to receipt to review', 'visible owner and blocker', 'provider gate status without secret values'],
    },
    {
      id: 'claw-experience',
      label: 'Shaozi/Claw/Cloud workbench experience',
      role: 'copy-experience',
      verdict: 'adopt-as-layer',
      why: 'The UI should feel like an AI employee cockpit: persistent browser, tools, memory, follow-up, training and provider gates are visible in one command surface.',
      copyExactly: ['persistent browser agent lane', 'skill catalog/workbench', 'memory follow-up', 'tool policy and forbidden actions', 'human-readable provider blockers'],
      upgradeBeyondCompetitor: ['restaurant-native modules instead of generic agent tricks', 'acceptance proof required before status turns green', 'private data stop-lines are first-class UI'],
      internalCanShipNow: ['Claw Skill Catalog', 'Claw Skill Workbench', 'Resident Agent Mission Control', 'Browser Gateway Pack', 'Runner Loop Pack'],
      needsTraining: trainingBlueprint.internalTrainingBacklog.slice(0, 5).map(item => item.material),
      externalRequired: unique(benchmarkStrategy.candidates.find(item => item.id === 'claw-agent')?.externalGates || []),
      acceptanceProof: ['browser runbook generated', 'runner event ledger updated', 'receipt accepted or rejected with recovery action'],
    },
    {
      id: 'lobu-runtime',
      label: 'Lobu/OpenClaw/Hermes runtime backplane',
      role: 'runtime-backplane',
      verdict: setupText.includes('runtime') || setupText.includes('openclaw') || setupText.includes('hermes') || setupText.includes('lobu')
        ? 'adopt-as-layer'
        : 'connect-later',
      why: 'A resident agent only becomes real when runtime URL/key, isolated browser profile, callback secret, session heartbeat and merchant grant are configured.',
      copyExactly: ['tenant event gateway', 'worker payload', 'signed callback', 'sandbox acceptance', 'recovery after failed runs'],
      upgradeBeyondCompetitor: ['restaurant action scopes', 'sanitized receipt-only callbacks', 'per-lane unlock instead of all-or-nothing automation'],
      internalCanShipNow: ['local tenant event', 'runtime setup contract', 'provider launch board', 'task provider handoff', 'sandbox acceptance contract'],
      needsTraining: ['runtime stop-line examples', 'accepted/rejected receipt examples', 'sandbox recovery examples'],
      externalRequired: ['OpenClaw/Hermes/Lobu 通道地址', '通道账号密钥', '隔离浏览器环境', '回执密钥', '店长动作范围确认'],
      acceptanceProof: ['sandbox run id', 'callback signature verified', 'sanitized event stream', 'recovery owner assigned'],
    },
    {
      id: 'restaurant-data',
      label: 'Restaurant SaaS data contracts',
      role: 'data-contract',
      verdict: 'must-have-contract',
      why: 'Auto acquisition, coupon redemption and true operating analysis cannot be credible without POS/coupon/member/reservation/source fields.',
      copyExactly: ['POS/coupon/member field dictionary', 'manual import before API', 'aggregate metrics only', 'source-bound attribution'],
      upgradeBeyondCompetitor: ['no source field, no claim', 'public proof plus operating data in one review', 'owner-friendly next operating action'],
      internalCanShipNow: ['POS import validator', 'operating insight report', 'business signal aggregator', 'provider readiness health'],
      needsTraining: ['sample sanitized POS export', 'coupon redemption aggregate sample', 'reservation intent sample', 'menu item id mapping sample'],
      externalRequired: unique(benchmarkStrategy.candidates.find(item => item.id === 'restaurant-saas')?.externalGates || []),
      acceptanceProof: ['data mode declared', 'field dictionary accepted', 'PII rejected', 'aggregate import batch id linked to review'],
    },
  ];

  const referenceModels: RestaurantCompetitorReferenceModel[] = [
    {
      id: 'kuaizi-platform',
      label: '筷子科技式平台级经营工厂',
      recommendedUse: 'product-base',
      fitScore: 92,
      adopt: ['任务流水线', '批量生产/分发/回流结构', '客户审核与结果入库', '平台级权限和审计'],
      doNotCopyBlindly: ['不要把视频工厂范式硬套到餐厅经营分析', '不要用大数字包装未接入的自动化'],
      uiUxToReplicate: ['多列任务看板', '状态/负责人/证据/下一步', 'Provider gate 明确可见', '结果回写入口'],
      capabilityToOwn: ['门店经营链路', '内容到发布证明', '团购/核销/POS 回流', '多角色交付'],
      internalTraining: ['餐饮任务模板', '门店活动生产队列', '证据回写规范'],
      externalRequired: ['平台账号授权', '发布/分发 provider', '真实回流数据源'],
    },
    {
      id: 'shaozi-claw-cloud',
      label: '勺子 Claw / Cloud 式 AI 员工工作台',
      recommendedUse: 'operator-experience',
      fitScore: 88,
      adopt: ['AI 员工感', '常驻任务/记忆/工具', '一键生成并推进下一步', '可见训练和能力缺口'],
      doNotCopyBlindly: ['不要只做炫技聊天框', '不要让用户猜下一步点哪里', '不要把未授权外部动作显示成已执行'],
      uiUxToReplicate: ['命令输入区', '能力卡片', '训练/Provider 缺口', '回执和记忆状态', '单击默认路径'],
      capabilityToOwn: ['Claw-style skill workbench', 'resident agent mission control', 'memory follow-up', 'provider receipt lifecycle'],
      internalTraining: ['餐饮技能样例', '拒绝/阻断样例', '店长跟进任务样例', '回执入库样例'],
      externalRequired: ['浏览器 runtime', 'callback secret', '商户账号授权', '安全隔离 profile'],
    },
    {
      id: 'lobu-browser-agent',
      label: '龙虾/Lobu/OpenClaw 式常驻浏览器 Agent',
      recommendedUse: 'runtime-tool',
      fitScore: 74,
      adopt: ['隔离浏览器', '任务执行事件', '截图证明', '失败恢复', '主动跟进'],
      doNotCopyBlindly: ['不要把 runtime 当完整产品', '不要让客户直接面对 agent 技术细节', '不要绕过平台授权或验证码/登录边界'],
      uiUxToReplicate: ['runner health', 'sandbox submit', 'signed callback', 'receipt inbox', 'failure recovery'],
      capabilityToOwn: ['browser gateway pack', 'runner loop pack', 'sandbox submit workbench', 'receipt lifecycle'],
      internalTraining: ['运行事件样例', '失败恢复样例', '截图证明样例'],
      externalRequired: ['runtime URL', 'runtime API key', 'browser profile id', 'merchant platform login', 'callback signature secret'],
    },
  ];

  const allExternal = unique([
    ...options.flatMap(item => item.externalRequired),
    ...referenceModels.flatMap(item => item.externalRequired),
    ...trainingBlueprint.externalRequired,
    ...trainingPlan.externalSetupRequests.map(item => item.provider),
  ], 32);

  return {
    ok: true,
    payloadShape: 'restaurant-competitor-route-decision-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    finalTarget: 'platform-spine-plus-claw-experience-plus-restaurant-data-contracts',
    answerForOwner: 'Best route: use the platform-grade operating spine as the product base, copy the Claw/Cloud workbench experience as the operator layer, connect Lobu/OpenClaw/Hermes as the runtime backplane, and require restaurant data contracts before claiming redemption or real analysis.',
    summary: {
      options: options.length,
      internalCanShipNow: countUnique(options, 'internalCanShipNow'),
      trainingItems: countUnique(options, 'needsTraining') + countUniqueReference(referenceModels, 'internalTraining'),
      externalRequired: allExternal.length,
      setupRecordsRemembered: setupState.summary.records,
      canClaimFullCompetitorParity: false,
    },
    options,
    referenceModels,
    finalShape: {
      productBase: 'kuaizi-style-platform-spine',
      operatorLayer: 'shaozi-claw-cloud-style-ai-employee-workbench',
      runtimeLayer: 'lobu-openclaw-hermes-browser-agent',
      dataLayer: 'restaurant-pos-redemption-member-contracts',
      reason: '餐饮客户先要稳定经营闭环，再要 AI 员工体验，最后才需要常驻浏览器执行。纯龙虾更 fancy 但不够产品化；纯平台后台更稳但缺少 AI 员工吸引力；纯 Claw 体验如果没有数据和回执会变成演示。',
      firstScreenRule: '第一屏必须让客户一眼看到：填什么、点哪个默认路径、内部马上产出什么、哪些外部 Provider/key/授权会阻断真实自动化。',
    },
    nextBuildOrder: [
      {
        id: 'owner-route-board',
        owner: 'product',
        action: 'Put route decision on the friend trial cockpit so a merchant sees which competitor model we are adopting and why.',
        proof: 'route decision payload and surface test include final target, options and provider checklist',
      },
      {
        id: 'claw-experience-hardening',
        owner: 'ops',
        action: 'Turn skill/workbench/training/provider gates into the default operator path before deep expert tools.',
        proof: 'operator can see train-now, provider-needed and proof-required in the same panel',
      },
      {
        id: 'runtime-provider-sandbox',
        owner: 'runtime-admin',
        action: 'Configure runtime URL/key, browser profile and callback secret, then run one sandbox proof loop.',
        proof: 'signed callback, sanitized runner events and accepted/rejected receipt',
      },
      {
        id: 'restaurant-data-contract',
        owner: 'merchant',
        action: 'Provide sanitized POS/coupon/member/reservation sample or API contract before any redemption or true analysis claim.',
        proof: 'accepted field dictionary and aggregate import batch id',
      },
    ],
    providerKeyChecklist: providerKeysFrom(allExternal),
    merchantInputsNeeded: unique([
      'merchant platform authorization scope',
      'isolated browser profile approval',
      'public proof URL or screenshot format',
      'sanitized POS/coupon/member sample',
      'reservation or inquiry aggregate export',
      'staff notification recipient roles',
    ]),
    benchmarkStrategy: {
      payloadShape: benchmarkStrategy.payloadShape,
      recommendation: benchmarkStrategy.recommendation,
      productPrinciples: benchmarkStrategy.productPrinciples,
      safetyBoundary: benchmarkStrategy.safetyBoundary,
    },
    trainingBlueprint: {
      payloadShape: trainingBlueprint.payloadShape,
      verdict: trainingBlueprint.verdict,
      summary: trainingBlueprint.summary,
      externalRequired: trainingBlueprint.externalRequired,
      safetyBoundary: trainingBlueprint.safetyBoundary,
    },
    trainingPlan: {
      payloadShape: trainingPlan.payloadShape,
      summary: trainingPlan.summary,
      nextInternalTraining: trainingPlan.nextInternalTraining,
      externalSetupRequests: trainingPlan.externalSetupRequests,
      safetyBoundary: trainingPlan.safetyBoundary,
    },
    safetyBoundary: 'Route Decision is a product architecture and activation map. It does not claim full Shaozi/Claw/Cloud/Lobu parity, does not expose Provider key values, does not auto-publish, does not auto-acquire customers, does not redeem coupons and does not analyze real operations until the listed providers, merchant approvals, callbacks and sanitized data contracts are verified.',
  };
}
