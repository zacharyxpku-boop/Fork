import type {
  RestaurantPublishProofLedger,
  RestaurantPublishProofOwner,
} from './restaurant-publish-proof-ledger';
import type {
  RestaurantRecoverSignalImportReport,
  RestaurantRecoverSignalSummary,
} from './restaurant-recover-signal-import';

export type RestaurantReviewLoopDecision = 'amplify' | 'iterate' | 'pause';

export type RestaurantReviewLoopBossRecap = {
  ok: true;
  payloadShape: 'restaurant-review-loop-boss-recap-v1';
  restaurantName: string;
  offerName: string;
  generatedAt: string;
  decision: RestaurantReviewLoopDecision;
  headline: string;
  summary: RestaurantRecoverSignalSummary & {
    acceptedProofs: number;
    pendingProofs: number;
    blockedProofs: number;
    recoverRows: number;
    evidenceReady: boolean;
    canClaimAttribution: boolean;
  };
  nextDishAction: string;
  sellingPointChange: string;
  materialGaps: string[];
  ownerActions: Array<{
    owner: RestaurantPublishProofOwner | '老板';
    action: string;
    dueWindow: string;
    evidenceRequired: string;
  }>;
  evidenceSources: string[];
  stopLines: string[];
};

function zeroSummary(): RestaurantRecoverSignalSummary {
  return {
    reservationCount: 0,
    couponClaimCount: 0,
    inquiryCount: 0,
    reviewCount: 0,
    communityFeedbackCount: 0,
    visitIntentCount: 0,
    redemptionCount: 0,
  };
}

function hasMeaningfulDemand(summary: RestaurantRecoverSignalSummary): boolean {
  return summary.visitIntentCount >= 10
    || summary.couponClaimCount >= 10
    || summary.inquiryCount >= 8
    || summary.redemptionCount >= 3
    || summary.reservationCount >= 5;
}

function hasStoreArrivalSignal(summary: RestaurantRecoverSignalSummary): boolean {
  return summary.redemptionCount > 0 || summary.reservationCount > 0 || summary.visitIntentCount > 0;
}

function buildDecision(input: {
  publishProofLedger: RestaurantPublishProofLedger;
  recoverImport: RestaurantRecoverSignalImportReport;
}): RestaurantReviewLoopDecision {
  const { publishProofLedger, recoverImport } = input;
  const hasAcceptedProof = publishProofLedger.summary.accepted > 0;
  const recoverAccepted = recoverImport.status === 'accepted' && recoverImport.summary.validRows > 0;
  const hasBlockedEvidence = publishProofLedger.summary.blocked > 0 || recoverImport.status === 'rejected';

  if (!hasAcceptedProof || !recoverAccepted || hasBlockedEvidence) return 'pause';
  if (publishProofLedger.summary.canClaimExternalPublish && hasMeaningfulDemand(recoverImport.summary)) return 'amplify';
  return 'iterate';
}

function buildHeadline(decision: RestaurantReviewLoopDecision, offerName: string): string {
  if (decision === 'amplify') return `${offerName} 有放大信号，先小步加量并继续留凭证。`;
  if (decision === 'iterate') return `${offerName} 可以继续验证，先补齐素材和发布凭证。`;
  return `${offerName} 暂停放大，先补凭证、清理数据或重做卖点。`;
}

function buildNextDishAction(decision: RestaurantReviewLoopDecision, offerName: string): string {
  if (decision === 'amplify') return `继续主推 ${offerName}，只扩大已留凭证的渠道。`;
  if (decision === 'iterate') return `保留 ${offerName}，下一轮换一个到店场景或人群切口验证。`;
  return `暂不加推 ${offerName}，先确认发布凭证和脱敏回流是否可信。`;
}

function buildSellingPointChange(summary: RestaurantRecoverSignalSummary): string {
  if (summary.redemptionCount >= 3) return '把卖点从“活动优惠”改成“到店可核销的套餐价值”，并让店长确认履约体验。';
  if (summary.couponClaimCount >= 10) return '把卖点从泛泛推荐改成“领券后今天怎么吃”，减少顾客决策步骤。';
  if (summary.inquiryCount >= 8 || summary.communityFeedbackCount >= 8) return '补一句适合社群和私信咨询的清晰答疑：份量、排队、可用时间和适合几人。';
  if (summary.reviewCount > 0) return '优先回应评价里出现的口味、服务和等待时间风险，再决定是否放大。';
  return '先把主卖点压缩成一个到店理由：谁来、什么时候来、为什么现在来。';
}

function buildMaterialGaps(input: {
  publishProofLedger: RestaurantPublishProofLedger;
  recoverImport: RestaurantRecoverSignalImportReport;
}): string[] {
  const { publishProofLedger, recoverImport } = input;
  const gaps = [
    publishProofLedger.summary.needsProof > 0 ? '补齐未验收渠道的公开链接、截图、发布时间和负责人。' : '',
    recoverImport.status === 'rejected' ? '重新导入只含聚合数量的回流表，删掉所有顾客身份和原始记录。' : '',
    recoverImport.summary.redemptionCount === 0 ? '补一张店长确认的到店或核销汇总截图。' : '',
    recoverImport.summary.communityFeedbackCount === 0 ? '补社群反馈的脱敏计数，不粘贴聊天原文。' : '',
    publishProofLedger.items.some(item => item.channel === 'xiaohongshu' && item.status !== 'accepted') ? '补小红书图文或短视频封面素材截图。' : '',
  ].filter(Boolean);

  return gaps.length > 0 ? gaps.slice(0, 5) : ['素材和凭证本轮够用，下一轮只需要补放大后的渠道回执。'];
}

function buildOwnerActions(input: {
  decision: RestaurantReviewLoopDecision;
  publishProofLedger: RestaurantPublishProofLedger;
  recoverImport: RestaurantRecoverSignalImportReport;
  owner?: string;
}): RestaurantReviewLoopBossRecap['ownerActions'] {
  const { decision, publishProofLedger, recoverImport, owner } = input;
  const proofAction = publishProofLedger.nextActions[0] || '复核已验收渠道的链接、截图和发布时间。';
  const recoverAction = recoverImport.status === 'accepted'
    ? '确认脱敏回流汇总，标出预约、领券、咨询、评价和核销断点。'
    : '删除隐私字段和原始记录后重新导入聚合汇总。';

  return [
    {
      owner: '运营',
      action: proofAction,
      dueWindow: '今天收班前',
      evidenceRequired: '发布凭证账本记录',
    },
    {
      owner: '店长',
      action: recoverAction,
      dueWindow: '明天午市前',
      evidenceRequired: '脱敏回流汇总',
    },
    {
      owner: '社群负责人',
      action: decision === 'pause' ? '停止扩散新话术，只补社群脱敏反馈计数。' : '按新卖点发一版社群话术，并只回填聚合咨询数。',
      dueWindow: '下一次社群触达后',
      evidenceRequired: '社群反馈计数',
    },
    {
      owner: '老板',
      action: owner ? `${owner} 复核是否允许进入下一轮。` : '确认是否允许小步放大、继续验证或暂停。',
      dueWindow: '下一轮排期前',
      evidenceRequired: '老板复盘确认',
    },
  ];
}

function buildEvidenceSources(input: {
  publishProofLedger: RestaurantPublishProofLedger;
  recoverImport: RestaurantRecoverSignalImportReport;
}): string[] {
  const { publishProofLedger, recoverImport } = input;
  const acceptedChannels = publishProofLedger.items
    .filter(item => item.status === 'accepted')
    .map(item => `${item.channel}/${item.owner}`);
  const recoverSources = recoverImport.sources.map(source => `${source.source}/${source.owner}`);

  return [
    `发布凭证账本：${publishProofLedger.summary.accepted}/${publishProofLedger.summary.total} 个渠道已验收。`,
    `脱敏回流：${recoverImport.summary.validRows}/${recoverImport.summary.totalRows} 行可进入复盘。`,
    acceptedChannels.length > 0 ? `已验收渠道负责人：${acceptedChannels.join('、')}` : '暂无已验收发布渠道。',
    recoverSources.length > 0 ? `回流来源负责人：${recoverSources.join('、')}` : '暂无可用回流来源。',
  ];
}

export function buildRestaurantReviewLoopBossRecap(input: {
  publishProofLedger: RestaurantPublishProofLedger;
  recoverImport: RestaurantRecoverSignalImportReport;
  owner?: string;
  now?: Date;
}): RestaurantReviewLoopBossRecap {
  const { publishProofLedger, recoverImport } = input;
  const decision = buildDecision(input);
  const recoverSummary = recoverImport.status === 'accepted' ? recoverImport.summary : zeroSummary();
  const evidenceReady = publishProofLedger.summary.accepted > 0 && recoverImport.status === 'accepted' && recoverImport.summary.validRows > 0;
  const canClaimAttribution = evidenceReady
    && publishProofLedger.summary.canClaimExternalPublish
    && recoverImport.status === 'accepted'
    && hasStoreArrivalSignal(recoverImport.summary);

  return {
    ok: true,
    payloadShape: 'restaurant-review-loop-boss-recap-v1',
    restaurantName: publishProofLedger.restaurantName || recoverImport.restaurantName,
    offerName: publishProofLedger.offerName || recoverImport.offerName,
    generatedAt: (input.now || new Date()).toISOString(),
    decision,
    headline: buildHeadline(decision, publishProofLedger.offerName || recoverImport.offerName),
    summary: {
      ...recoverSummary,
      acceptedProofs: publishProofLedger.summary.accepted,
      pendingProofs: publishProofLedger.summary.needsProof,
      blockedProofs: publishProofLedger.summary.blocked,
      recoverRows: recoverImport.summary.validRows,
      evidenceReady,
      canClaimAttribution,
    },
    nextDishAction: buildNextDishAction(decision, publishProofLedger.offerName || recoverImport.offerName),
    sellingPointChange: buildSellingPointChange(recoverSummary),
    materialGaps: buildMaterialGaps(input),
    ownerActions: buildOwnerActions({
      decision,
      publishProofLedger,
      recoverImport,
      owner: input.owner,
    }),
    evidenceSources: buildEvidenceSources(input),
    stopLines: [
      '没有已验收发布凭证，不建议放大或宣称外部发布完成。',
      '没有脱敏聚合回流，不宣称真实经营归因。',
      '不保存手机号、微信号、私信原文、优惠码、订单明细、原始 POS 行、cookie、token 或 API key。',
      '没有平台 OAuth、商户授权、POS/核销/会员数据契约，不宣称自动发布、自动核销或真实复购归因。',
    ],
  };
}
