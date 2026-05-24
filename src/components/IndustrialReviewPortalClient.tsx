'use client';

import { useMemo, useState, type FormEvent } from 'react';

type ReviewStatus = 'active' | 'expired' | 'revoked' | 'approved';
type FeedbackType = 'comment' | 'question' | 'change';

export interface ReviewPayload {
  review: {
    token: string;
    projectId: string;
    assetId: string;
    assetTitle: string;
    deliverableUrl?: string;
    expiresAt: string;
    status: ReviewStatus;
    statusLabel?: string;
    clientHeadline?: string;
    clientRisk?: string;
    supportAction?: string;
    nextAction?: string;
    clientChecklist?: Array<{
      label: string;
      state: 'ok' | 'warn' | 'locked';
      detail: string;
    }>;
    clientDecision?: {
      primaryActionLabel: string;
      primaryActionState: 'feedback' | 'approve' | 'wait' | 'locked';
      disabledReason?: string;
      operatorNextStep: string;
      evidenceToCheck: string[];
    };
    clientReceipt?: {
      title: string;
      summary: string;
      nextStep: string;
      operatorRecipient: string;
      evidenceToCheck: string[];
      shareNote: string;
    };
    escalationMessage?: string;
    canSubmitFeedback?: boolean;
    canApprove?: boolean;
    interactionLockedReason?: string;
    feedbackCount: number;
    approvedAt?: string;
    approvalName?: string;
  };
  feedback: Array<{
    id: string;
    authorName: string;
    type: FeedbackType | 'approval';
    body: string;
    createdAt: string;
  }>;
}

function statusLabel(status: ReviewStatus) {
  if (status === 'active') return '待审核';
  if (status === 'approved') return '已批准';
  if (status === 'expired') return '已过期';
  return '已撤销';
}

function displayStatusLabel(review?: ReviewPayload['review']) {
  return review?.statusLabel || (review ? statusLabel(review.status) : '加载中');
}

function statusClass(status: ReviewStatus) {
  if (status === 'active') return 'border-amber-300/40 bg-amber-300/10 text-amber-100';
  if (status === 'approved') return 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100';
  return 'border-red-300/40 bg-red-300/10 text-red-100';
}

function lockMessage(status: ReviewStatus) {
  if (status === 'approved') return '该交付物已经批准，并已写回生产链路。';
  if (status === 'expired') return '该审核链接已经过期，请联系运营重新生成链接。';
  if (status === 'revoked') return '该审核链接已被运营撤销。';
  return '';
}

function errorMessage(error: string) {
  const map: Record<string, string> = {
    bad_token: '审核链接格式不正确，请确认你打开的是最新链接。',
    not_found: '没有找到这条审核链接，可能已被替换或尚未生成。',
    review_not_available: '审核链接暂时不可用，请稍后刷新或联系运营。',
    feedback_failed: '反馈提交失败，请检查内容后重试。',
    approval_failed: '批准失败，请确认链接仍在有效期内。',
    approval_confirmation_required: '请先勾选确认项，再批准交付物。',
    deliverable_required_before_approval: '交付物链接缺失，先不要批准。请让运营补齐预览或下载链接后再验收。',
    review_expired: '该审核链接已经过期，请让运营重新生成审核链接。',
    review_revoked: '该审核链接已经撤销，请等待运营发送新的审核链接。',
    asset_view_permission_denied: '当前审核链接没有查看交付物的权限，请让运营重新授权后再打开。',
  };
  if (error === 'expired') return map.review_expired;
  if (error === 'revoked') return map.review_revoked;
  if (error === 'feedback_required') return map.feedback_failed;
  if (error === 'already_approved') return map.approval_failed;
  return map[error] || error;
}

function reviewPayloadFromResponse(data: unknown): ReviewPayload | null {
  if (!data || typeof data !== 'object') return null;
  const candidate = data as { review?: ReviewPayload['review']; feedback?: ReviewPayload['feedback'] };
  if (!candidate.review) return null;
  return {
    review: candidate.review,
    feedback: Array.isArray(candidate.feedback) ? candidate.feedback : [],
  };
}

function feedbackLabel(type: FeedbackType | 'approval') {
  if (type === 'change') return '要求修改';
  if (type === 'question') return '问题';
  if (type === 'approval') return '批准';
  return '评论';
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url);
}

function decisionPath(status?: ReviewStatus, hasDeliverable = false, feedbackCount = 0) {
  if (!status) {
    return [
      { title: '确认链接', body: '当前链接还没有加载成功，请先确认运营发送的是最新审核链接。', state: 'warn' },
      { title: '等待交付物', body: '交付物不可见前不要批准，避免把空交付写回生产链路。', state: 'warn' },
      { title: '联系运营', body: '如果刷新后仍无法打开，请让运营重新生成审核链接。', state: 'warn' },
    ];
  }
  if (status === 'expired') {
    return [
      { title: '链接已过期', body: '旧链接不能继续验收，也不会展示交付物。', state: 'danger' },
      { title: '重新发起审核', body: '请让运营重新生成有效链接。', state: 'warn' },
      { title: '保留记录', body: '新的审核链接会重新记录反馈和批准结果。', state: 'muted' },
    ];
  }
  if (status === 'revoked') {
    return [
      { title: '链接已撤销', body: '这通常代表交付物已替换或审核被运营收回。', state: 'danger' },
      { title: '等待新链接', body: '不要继续使用旧链接做验收。', state: 'warn' },
      { title: '重新查看新版', body: '收到新链接后再检查交付物。', state: 'muted' },
    ];
  }
  if (status === 'approved') {
    return [
      { title: '已批准', body: '交付结果已经锁定，并写回生产链路。', state: 'ok' },
      { title: '进入交付', body: '运营会推进分发、CRM 交接或后续数据回流。', state: 'ok' },
      { title: '只读留档', body: '本页保留审核证据，不再接受新的修改意见。', state: 'muted' },
    ];
  }
  return [
    { title: '先看交付物', body: hasDeliverable ? '打开预览或原始链接，检查画面、文案、商品信息和平台适配。' : '当前缺少可打开的交付物，先不要批准。', state: hasDeliverable ? 'ok' : 'warn' },
    { title: feedbackCount > 0 ? '复核反馈' : '提交问题', body: feedbackCount > 0 ? '如果修改点还没解决，请继续补充；如果已解决，再进入批准。' : '有问题就写清楚位置、原因和期望修改。', state: feedbackCount > 0 ? 'warn' : 'muted' },
    { title: '确认后批准', body: hasDeliverable ? '确认无误后填写批准人，勾选确认项并提交。' : '补齐交付物前，批准按钮会保持不可用。', state: hasDeliverable ? 'ok' : 'warn' },
  ];
}

function pathClass(state: string) {
  if (state === 'ok') return 'border-emerald-400/30 bg-emerald-950/25 text-emerald-100';
  if (state === 'danger') return 'border-red-400/30 bg-red-950/30 text-red-100';
  if (state === 'warn') return 'border-amber-300/30 bg-amber-950/25 text-amber-100';
  return 'border-white/10 bg-white/[0.03] text-white/70';
}

function checklistStateClass(state: 'ok' | 'warn' | 'locked') {
  if (state === 'ok') return 'border-emerald-400/25 bg-emerald-950/20 text-emerald-100';
  if (state === 'locked') return 'border-red-400/25 bg-red-950/25 text-red-100';
  return 'border-amber-300/25 bg-amber-950/20 text-amber-100';
}

function decisionStateLabel(state: 'feedback' | 'approve' | 'wait' | 'locked') {
  if (state === 'approve') return '可以批准';
  if (state === 'feedback') return '先反馈';
  if (state === 'wait') return '等待运营';
  return '只读留档';
}

function decisionStateClass(state: 'feedback' | 'approve' | 'wait' | 'locked') {
  if (state === 'approve') return 'border-emerald-300/35 bg-emerald-950/25 text-emerald-100';
  if (state === 'feedback') return 'border-amber-300/35 bg-amber-950/25 text-amber-100';
  if (state === 'wait') return 'border-sky-300/35 bg-sky-950/25 text-sky-100';
  return 'border-white/15 bg-white/[0.03] text-white/65';
}

function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp|avif)(\?|#|$)/i.test(url);
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

function nextStepText(status?: ReviewStatus, hasDeliverable = false) {
  if (!status) return '等待审核链接加载。';
  if (status === 'approved') return '交付物已批准，下一步由运营进入分发、CRM 交接和表现回流。';
  if (status === 'expired') return '链接已过期，请让运营重新生成审核链接。';
  if (status === 'revoked') return '链接已撤销，请等待运营发送新的审核链接。';
  if (!hasDeliverable) return '交付物链接缺失，先不要批准；可以先提交问题反馈。';
  return '先检查交付物；有修改就提交反馈，确认无误后再批准。';
}

function reviewNextStep(review: ReviewPayload['review'] | undefined, hasDeliverable = false) {
  return review?.nextAction || nextStepText(review?.status, hasDeliverable);
}

function reviewChecklist(review: ReviewPayload['review'] | undefined, hasDeliverable: boolean) {
  return [
    {
      label: '交付物可打开',
      ok: hasDeliverable,
      detail: hasDeliverable ? '已附交付物链接，可直接预览或打开。' : '缺少交付物链接，不能完成验收。',
    },
    {
      label: '链接仍有效',
      ok: review?.status === 'active' || review?.status === 'approved',
      detail: review ? `当前状态：${displayStatusLabel(review)}` : '审核链接尚未加载。',
    },
    {
      label: '反馈会写回生产',
      ok: review?.status === 'active',
      detail: review?.status === 'active' ? '修改意见会进入生产链路。' : '当前链接只读，不能继续写入反馈。',
    },
    {
      label: '批准会锁定结果',
      ok: review?.status === 'approved',
      detail: review?.status === 'approved' ? '已批准并锁定。' : '批准后会写回生产链路并锁定本链接。',
    },
  ];
}

function reviewDecisionSummary(
  review: ReviewPayload['review'] | undefined,
  hasDeliverable: boolean,
  feedbackCount: number,
) {
  if (!review) {
    return {
      title: '审核链接尚未加载',
      body: '请刷新页面；如果仍无法打开，请让运营重新发送最新审核链接。',
      tone: 'warn',
    };
  }
  if (review.status === 'approved') {
    return {
      title: '已完成验收',
      body: `该交付物已由 ${review.approvalName || '客户'} 批准，生产链路会进入分发、CRM 交接和表现回流。`,
      tone: 'ok',
    };
  }
  if (review.status === 'expired') {
    return {
      title: '链接已过期',
      body: '请不要继续使用旧链接；让运营重新生成审核链接后再验收。',
      tone: 'danger',
    };
  }
  if (review.status === 'revoked') {
    return {
      title: '链接已撤销',
      body: '这通常代表交付物已被替换或需要重新审核，请等待运营发送新链接。',
      tone: 'danger',
    };
  }
  if (!hasDeliverable) {
    return {
      title: '暂不能批准',
      body: '交付物链接缺失。你可以先提交问题反馈，但不要批准，直到运营补齐可预览或可打开的交付物。',
      tone: 'warn',
    };
  }
  if (feedbackCount > 0) {
    return {
      title: '已有反馈记录',
      body: '请确认反馈是否已经处理。如果修改点仍未解决，继续提交反馈；确认无误后再批准。',
      tone: 'warn',
    };
  }
  return {
    title: '可以开始验收',
    body: '先查看交付物画面、文案、商品信息和平台适配；确认无误后填写批准人并勾选确认项。',
    tone: 'ok',
  };
}

function clientHandoffCards(
  review: ReviewPayload['review'] | undefined,
  hasDeliverable: boolean,
  feedbackCount: number,
) {
  const status = review?.status;
  if (status === 'approved') {
    return [
      { title: '你已完成', body: '批准结果已锁定，客户侧不需要再重复操作。' },
      { title: '系统已写回', body: '交付状态进入 approved，并保留批准人、时间和审核记录。' },
      { title: '运营接力', body: '运营继续推进分发、CRM 交接和表现回流。' },
      { title: '数据留档', body: '本页作为只读验收凭证，后续复盘可追溯。' },
    ];
  }
  if (status === 'expired' || status === 'revoked') {
    return [
      { title: '你先暂停', body: status === 'expired' ? '当前链接已过期，不要继续验收。' : '当前链接已撤销，不要继续验收。' },
      { title: '系统已保护', body: '旧链接不会继续写入反馈或批准，避免错审旧版本。' },
      { title: '运营接力', body: '等待运营重新生成有效审核链接后再打开。' },
      { title: '数据留档', body: '历史状态会保留，新的审核链接会重新记录结果。' },
    ];
  }
  if (!hasDeliverable) {
    return [
      { title: '你先反馈', body: '直接提交“交付物打不开/缺失”的问题反馈。' },
      { title: '系统会拦截', body: '批准按钮保持不可用，避免空交付写回生产链路。' },
      { title: '运营接力', body: '运营补齐预览或下载链接后重新通知你验收。' },
      { title: '数据不丢', body: '你的问题会进入生产记录，不需要私聊重复说明。' },
    ];
  }
  if (feedbackCount > 0) {
    return [
      { title: '你先复核', body: '确认上一轮反馈是否已经处理，未处理就继续补充。' },
      { title: '系统会归档', body: '每条反馈都会写回生产链路，形成修改依据。' },
      { title: '运营接力', body: '运营按反馈修订交付物，再推回本页确认。' },
      { title: '确认后批准', body: '修改点都解决后，再批准进入分发和 CRM 后续动作。' },
    ];
  }
  return [
    { title: '你先查看', body: '检查画面、文案、商品信息、链接和平台适配。' },
    { title: '有问题就反馈', body: '写清楚位置、原因和期望修改，不要勉强批准。' },
    { title: '没问题再批准', body: '批准会锁定本链接，并写回生产和交付链路。' },
    { title: '后续可追踪', body: '运营会继续推进分发、CRM 交接和表现回流。' },
  ];
}

function systemWritebackReceipts(
  review: ReviewPayload['review'] | undefined,
  hasDeliverable: boolean,
  feedbackCount: number,
) {
  const status = review?.status;
  const approved = status === 'approved';
  const locked = status === 'expired' || status === 'revoked';
  const missingDeliverable = status === 'active' && !hasDeliverable;
  const hasFeedback = feedbackCount > 0;

  return [
    {
      label: '生产记录',
      state: approved || hasFeedback || missingDeliverable ? '已写入' : locked ? '已保护' : '待动作',
      detail: approved
        ? '批准人、批准时间和审核结果已经锁定到交付记录。'
        : hasFeedback
          ? '客户反馈已成为生产修订依据。'
          : missingDeliverable
            ? '缺交付物问题会进入生产补齐队列。'
            : locked
              ? '旧链接不会继续写入生产，避免错审旧版本。'
              : '客户提交反馈或批准后才会写入。',
    },
    {
      label: 'CRM 交接',
      state: approved ? '可交接' : locked ? '暂停' : '待验收',
      detail: approved
        ? '可把客户批准、交付物和下一步动作交给运营/销售跟进。'
        : locked
          ? '需要新审核链接后再继续客户交接。'
          : '验收完成前不应宣称已交付。',
    },
    {
      label: '分发门禁',
      state: approved ? '已放行' : '未放行',
      detail: approved
        ? '内容可进入分发计划、矩阵发布或投放准备。'
        : '未批准前不进入自动分发，避免错误素材上线。',
    },
    {
      label: '表现回流',
      state: approved ? '待回流' : '未开始',
      detail: approved
        ? '上线后的平台指标会回到复盘和品牌学习档案。'
        : '只有批准并发布后才会产生表现数据。',
    },
  ];
}

export interface ReviewCrmHandoffPacket {
  lane: string;
  ready: boolean;
  owner: string;
  nextAction: string;
  evidence: string;
  releaseGate: string;
}

export function buildReviewCrmHandoffPacket(
  review: ReviewPayload['review'] | undefined,
  hasDeliverable: boolean,
  feedbackCount: number,
): ReviewCrmHandoffPacket[] {
  const status = review?.status;
  const statusText = displayStatusLabel(review);
  const baseEvidence = `token ${review?.token || '-'} / project ${review?.projectId || '-'} / asset ${review?.assetId || '-'}`;

  if (!review) {
    return [{
      lane: '审核入口未加载',
      ready: false,
      owner: '运营',
      nextAction: '重新打开或重发 review token，先确认客户拿到的是最新链接。',
      evidence: '没有 review payload，不能进入 CRM 或分发。',
      releaseGate: '必须先拿到有效 review token。',
    }];
  }

  if (status === 'approved') {
    return [
      {
        lane: 'CRM 成交/交付承接',
        ready: true,
        owner: 'CRM/销售运营',
        nextAction: '把批准人、批准时间、交付物链接和下一次跟进动作写入客户时间线。',
        evidence: `${baseEvidence} / approved by ${review.approvalName || '客户'}`,
        releaseGate: '可以进入客户交付、续约跟进或复购机会。',
      },
      {
        lane: '分发与投放放行',
        ready: hasDeliverable,
        owner: 'Cast/投放运营',
        nextAction: '把已批准交付物接到分发计划、账号矩阵和广告 campaign 待办。',
        evidence: hasDeliverable ? '有可打开交付物，且客户已批准。' : '客户已批准但交付物链接缺失，必须先补链。',
        releaseGate: hasDeliverable ? '允许进入人工/沙盒分发；自动发布仍等待 OAuth。' : '补齐交付物链接前不能分发。',
      },
      {
        lane: '复盘回流',
        ready: true,
        owner: 'Manage/增长复盘',
        nextAction: '上线后把平台表现、客户反馈和胜出结构回写到品牌学习档案。',
        evidence: `feedback ${feedbackCount} / status ${statusText}`,
        releaseGate: '真实表现回流仍等待 analytics sync 或手动导入。',
      },
    ];
  }

  if (status === 'expired' || status === 'revoked') {
    return [{
      lane: '链接异常承接',
      ready: false,
      owner: '运营',
      nextAction: status === 'expired'
        ? '重新生成审核链接，并说明旧链接已过期不能继续验收。'
        : '确认撤销原因和交付版本，再发送新的审核链接。',
      evidence: `${baseEvidence} / status ${statusText}`,
      releaseGate: '新链接生成并通知客户前，不进入 CRM 成交或分发。',
    }];
  }

  if (!hasDeliverable) {
    return [{
      lane: '交付物补链',
      ready: false,
      owner: '生产运营',
      nextAction: '补齐预览/下载链接，重新通知客户验收；不要让客户口头批准空交付。',
      evidence: `${baseEvidence} / missing deliverable url`,
      releaseGate: '交付物可打开前，批准与分发都保持关闭。',
    }];
  }

  if (feedbackCount > 0) {
    return [{
      lane: '返修任务承接',
      ready: false,
      owner: '生产/剪辑运营',
      nextAction: '把客户反馈拆成返修任务，处理后让客户回到同一 review 链接复核。',
      evidence: `${baseEvidence} / feedback ${feedbackCount}`,
      releaseGate: '返修处理完成并获得客户批准前，不进入分发。',
    }];
  }

  return [{
    lane: '等待客户决策',
    ready: false,
    owner: '客户成功/运营',
    nextAction: '提醒客户先预览交付物；有问题反馈，没问题批准。',
    evidence: `${baseEvidence} / deliverable ready / status ${statusText}`,
    releaseGate: '客户批准前不进入自动发布、广告投放或规模数字展示。',
  }];
}

export function buildClientReviewPassport(
  review: ReviewPayload['review'] | undefined,
  hasDeliverable: boolean,
  feedbackCount: number,
) {
  const status = review?.status;
  const active = status === 'active';
  const approved = status === 'approved';
  const locked = status === 'expired' || status === 'revoked';

  return [
    {
      title: '预览状态',
      value: hasDeliverable ? '可打开交付物' : '待补交付物',
      tone: hasDeliverable ? 'ready' : 'attention',
      detail: hasDeliverable
        ? '客户可以直接预览或打开原始链接，再判断是否需要修改。'
        : '缺少可打开链接时只能提交问题，不能完成验收。',
    },
    {
      title: '反馈入口',
      value: active ? '可提交反馈' : '只读留档',
      tone: active ? 'ready' : 'locked',
      detail: active
        ? feedbackCount > 0
          ? `已有 ${feedbackCount} 条反馈，继续补充会写回生产记录。`
          : '有问题就写清楚位置、原因和希望修改方式。'
        : '当前链接不会继续写入反馈，避免误审旧版本。',
    },
    {
      title: '批准门禁',
      value: approved ? '已批准' : active && hasDeliverable ? '可在确认后批准' : '暂不可批准',
      tone: approved ? 'ready' : active && hasDeliverable ? 'attention' : locked ? 'locked' : 'attention',
      detail: approved
        ? `批准人 ${review?.approvalName || '客户'} 已锁定结果。`
        : active && hasDeliverable
          ? '批准会锁定本链接，并写回生产、交付和后续运营链路。'
          : '未满足交付物或链接状态门禁前，系统会阻止批准。',
    },
    {
      title: '后续流向',
      value: approved ? '进入分发/CRM/回流' : locked ? '等待新链接' : '等待客户动作',
      tone: approved ? 'ready' : locked ? 'locked' : 'attention',
      detail: approved
        ? '运营可以继续推进分发计划、CRM 交接和表现回流。'
        : locked
          ? '过期或撤销后，需要运营重新生成审核链接。'
          : '反馈进入返修；批准进入后续交付动作。',
    },
  ];
}

export type ReviewCommercialAcceptanceCheck = {
  gate: string;
  ready: boolean;
  evidence: string;
  clientInstruction: string;
  operatorHandoff: string;
};

export function buildReviewCommercialAcceptanceChecks(
  review: ReviewPayload['review'] | undefined,
  hasDeliverable: boolean,
  feedbackCount: number,
): ReviewCommercialAcceptanceCheck[] {
  const status = review?.status;
  const active = status === 'active';
  const approved = status === 'approved';
  const locked = status === 'expired' || status === 'revoked' || approved;
  const canFeedback = review?.canSubmitFeedback ?? active;
  const canApprove = review?.canApprove ?? (active && hasDeliverable);
  const checklist = review?.clientChecklist || [];
  const hasViewChecklist = checklist.some(item => item.label.includes('交付物') && item.state === 'ok');
  const hasWritableChecklist = checklist.some(item => item.label.includes('写入') && item.state === 'ok');
  const decisionState = review?.clientDecision?.primaryActionState;

  return [
    {
      gate: '预览可用门禁',
      ready: hasDeliverable && status !== 'expired' && status !== 'revoked',
      evidence: hasDeliverable ? '交付物链接存在，可直接预览或打开。' : '缺少可打开的交付物链接。',
      clientInstruction: hasDeliverable ? '先检查画面、文案、商品信息和平台适配。' : '不要批准，直接反馈交付物缺失或打不开。',
      operatorHandoff: hasDeliverable ? '保留当前版本作为审核对象。' : '补齐预览/下载链接后重新通知客户审核。',
    },
    {
      gate: '反馈写回门禁',
      ready: Boolean(canFeedback && active && hasWritableChecklist),
      evidence: `反馈 ${feedbackCount} 条 / 可写入 ${canFeedback ? '是' : '否'} / 状态 ${displayStatusLabel(review)}`,
      clientInstruction: active ? '有问题就写清楚位置、原因和希望修改方式。' : '当前只读，等待运营发送新链接。',
      operatorHandoff: feedbackCount > 0 ? '把反馈转成返修任务，并在处理后让客户复核。' : '保持反馈入口可用，避免客户转去私聊丢失证据。',
    },
    {
      gate: '批准锁定门禁',
      ready: Boolean(approved || (canApprove && hasDeliverable && decisionState === 'approve')),
      evidence: approved ? `已由 ${review?.approvalName || '客户'} 批准。` : `可批准 ${canApprove ? '是' : '否'} / 决策 ${decisionState || '未加载'}`,
      clientInstruction: approved ? '不需要继续操作，等待运营后续交付。' : '确认无误后再批准；需要修改就先反馈。',
      operatorHandoff: approved ? '推进分发、CRM 交接和表现回流。' : '未批准前不要放行自动分发、投放或交付完成。',
    },
    {
      gate: '异常保护门禁',
      ready: Boolean(locked || active),
      evidence: locked ? `链接已锁定为 ${displayStatusLabel(review)}。` : '链接处于 active，可继续审核。',
      clientInstruction: locked && !approved ? '不要继续使用旧链接，等待新审核链接。' : '按页面状态继续反馈或批准。',
      operatorHandoff: locked && !approved ? '生成新 token，并说明旧版本状态。' : '保持当前 token 和资产版本可追踪。',
    },
    {
      gate: '下游交接门禁',
      ready: Boolean(approved && hasDeliverable && hasViewChecklist),
      evidence: approved ? '批准、交付物、审核记录齐全，可进入后续链路。' : '仍等待客户批准或交付物补齐。',
      clientInstruction: approved ? '本页作为验收留档。' : '客户只需要完成反馈或批准，不需要理解后台链路。',
      operatorHandoff: approved
        ? '把批准结果接到分发计划、CRM handoff、资产权限和表现回流。'
        : '在批准前维持人工承接，不展示自动发布或投放完成。',
    },
  ];
}

function passportClass(tone: string) {
  if (tone === 'ready') return 'border-emerald-300/25 bg-emerald-950/20 text-emerald-100';
  if (tone === 'locked') return 'border-red-300/25 bg-red-950/25 text-red-100';
  return 'border-amber-300/25 bg-amber-950/20 text-amber-100';
}

const ZERO_EXPLANATION_REVIEW_STEPS = [
  {
    title: '先打开交付物',
    body: '能播放、能下载或能预览，才进入下一步；打不开就直接反馈，不要批准。',
  },
  {
    title: '只看四件事',
    body: '商品信息、画面/文案、版本是否正确、目标平台是否适配。',
  },
  {
    title: '有问题写具体',
    body: '写清楚位置、原因和希望怎么改，反馈会写回生产链路。',
  },
  {
    title: '确认无误再批准',
    body: '批准会锁定本链接，并进入分发、CRM 交接和表现回流。',
  },
];

const CLIENT_REVIEW_OPERATION_CARDS = [
  {
    title: '客户只做判断',
    body: '本页不要求客户理解 provider、ledger 或后台任务，只判断交付物能否用于下一步。',
  },
  {
    title: '运营承接修改',
    body: '客户反馈会进入生产记录，运营负责补链、返修、重发审核链接或推进批准后的分发。',
  },
  {
    title: '批准才放行',
    body: '没有客户批准前，交付物不会被当成已验收结果进入自动分发、投放或 CRM 交付完成。',
  },
  {
    title: '证据留在系统',
    body: '反馈、批准人、批准时间、链接状态和写回回执都会保留，方便复盘和下一轮生产。',
  },
];

type ReviewUiVariant = 'partner' | 'operator' | 'friend_trial';

function normalizeReviewUiVariant(value?: string): ReviewUiVariant {
  if (value === 'operator' || value === 'friend_trial' || value === 'partner') return value;
  return 'friend_trial';
}

const REVIEW_UI_VARIANTS: Array<{
  id: ReviewUiVariant;
  label: string;
  intent: string;
  proof: string;
  eyebrow: string;
  heroBody: string;
  focusTitle: string;
  focusBody: string;
  focusChecklist: string[];
  showInternalReceipts: boolean;
}> = [
  {
    id: 'friend_trial',
    label: '朋友试用版',
    intent: '只保留客户需要判断的事：能否打开、是否正确、有问题就反馈、没问题再批准。',
    proof: '非技术客户不需要理解 provider、ledger、CRM 或分发系统，也能独立完成验收。',
    eyebrow: '朋友试用审核',
    heroBody: '你只需要判断交付物能不能用：能打开、内容正确、没有明显问题就批准；有问题就写清楚，运营会接手修改。',
    focusTitle: '不用懂后台，只做验收',
    focusBody: '页面会把不能批准的情况拦住。你不需要理解生产队列、平台授权或投放系统。',
    focusChecklist: ['能不能打开交付物', '商品和文案是否正确', '是否需要修改', '确认无误再批准'],
    showInternalReceipts: false,
  },
  {
    id: 'operator',
    label: '运营工作台版',
    intent: '突出反馈、批准、锁定状态、写回回执和卡住时的运营接力动作。',
    proof: '每次客户动作都要进入生产记录、CRM 交接、分发门禁或复盘回流。',
    eyebrow: '运营验收工作台',
    heroBody: '这里要看客户动作是否已经写回生产链路，并判断下一步是返修、补链接、推进分发，还是进入 CRM 和表现回流。',
    focusTitle: '把客户动作接回运营链路',
    focusBody: '重点不是页面好不好看，而是反馈、批准、锁定和异常状态是否都有明确承接人和下一步。',
    focusChecklist: ['反馈是否进入生产记录', '批准是否解锁分发门禁', '卡住时运营要补什么', 'CRM/表现回流是否可追踪'],
    showInternalReceipts: true,
  },
  {
    id: 'partner',
    label: '合作者/投资人版',
    intent: '展示 Wenai 已吸收 Clico 的免登录客户审核、反馈、批准、撤销/过期和审计闭环。',
    proof: '这不是静态交付页，而是 Manage 链路里的客户验收前台。',
    eyebrow: '合作者验收视角',
    heroBody: '这页展示 Wenai 的 Manage 能力：客户免登录验收、反馈写回、批准锁定、异常保护和后续分发/CRM/回流承接。',
    focusTitle: 'Clico 式客户前台已产品化',
    focusBody: '合作者应看到的不只是审核按钮，而是客户动作如何变成可审计的生产、交付和运营证据。',
    focusChecklist: ['免登录客户审核', '反馈/批准写回', '过期/撤销保护', '交付到分发的证据链'],
    showInternalReceipts: true,
  },
];

export function buildReviewVariantPlaybook(
  review: ReviewPayload['review'] | undefined,
  variant: ReviewUiVariant,
  hasDeliverable = false,
  feedbackCount = 0,
) {
  const status = review?.status;
  const approved = status === 'approved';
  const locked = status === 'expired' || status === 'revoked';
  const activeWithFeedback = status === 'active' && feedbackCount > 0;
  const missingDeliverable = status === 'active' && !hasDeliverable;

  if (variant === 'friend_trial') {
    return {
      title: '朋友试用下一步',
      primaryAction: approved
        ? '你已经完成验收，不需要继续操作；后续由运营处理。'
        : locked
          ? '不要继续使用这条旧链接，等待运营发新的审核链接。'
          : missingDeliverable
            ? '先提交“交付物打不开或缺失”的问题反馈，不要批准。'
            : activeWithFeedback
              ? '先确认上一轮修改是否解决；没解决继续反馈，解决后再批准。'
              : '先打开交付物；有问题就反馈，确认无误再批准。',
      proofToCheck: hasDeliverable
        ? '只检查交付物能否打开、内容是否正确、版本是否能用于下一步。'
        : '没有可打开交付物时，朋友试用只能验证审核入口，不能完成验收。',
      handoffBoundary: '朋友不需要理解 provider、CRM、分发和投放；页面只暴露反馈和批准。',
      cards: [
        `状态 ${displayStatusLabel(review)} / 反馈 ${feedbackCount}`,
        hasDeliverable ? '交付物已附加，可预览或打开。' : '交付物缺失，批准按钮必须保持不可用。',
        approved ? '批准结果已写回生产链路。' : '批准前不会进入自动分发或投放。',
      ],
    };
  }

  if (variant === 'operator') {
    return {
      title: '运营承接下一步',
      primaryAction: approved
        ? '把批准结果推进到分发计划、CRM 交接和表现回流待办。'
        : locked
          ? '生成新的 review token，并确认旧链接不会继续写入。'
          : missingDeliverable
            ? '补齐预览/下载链接后重发审核，不要要求客户口头批准。'
            : activeWithFeedback
              ? '把客户反馈转成返修任务，完成后让客户回到同一审核链路确认。'
              : '等待客户反馈或批准，并确保所有动作写回生产记录。',
      proofToCheck: '运营要核对反馈、批准、锁定状态、review token、assetId、projectId 和下一步 owner。',
      handoffBoundary: '未批准前不放行分发；未接外部 CRM/平台 API 前，先保留系统回执和人工交接。',
      cards: [
        `项目 ${review?.projectId || '-'} / 资产 ${review?.assetId || '-'}`,
        `状态 ${displayStatusLabel(review)} / 反馈 ${feedbackCount}`,
        '每次客户动作都要落到生产、CRM、分发门禁或表现回流。',
      ],
    };
  }

  return {
    title: '合作者证据链下一步',
    primaryAction: approved
      ? '展示客户批准、写回回执、分发门禁和 CRM 后续动作，证明 Manage 闭环成立。'
      : locked
        ? '展示过期/撤销保护，证明客户前台不会误审旧版本。'
        : '展示免登录 review、反馈/批准写回、异常保护和运营承接边界。',
    proofToCheck: '这不是静态交付页；它要证明 Wenai 已承接 Clico 式客户前台，并把审核动作接回 Compose/Create/Cut/Cast/Manage。',
    handoffBoundary: '没有客户批准和系统回执前，不能宣称交付已完成，也不能进入自动发布、投放或规模数字展示。',
    cards: [
      `Review token ${review?.token || '-'} / 状态 ${displayStatusLabel(review)}`,
      `项目 ${review?.projectId || '-'} / 资产 ${review?.assetId || '-'}`,
      '证据链必须覆盖反馈、批准、过期/撤销、审计和后续运营动作。',
    ],
  };
}

export function IndustrialReviewPortalClient({
  token,
  initialPayload = null,
  initialError = '',
  initialVariant,
}: {
  token: string;
  initialPayload?: ReviewPayload | null;
  initialError?: string;
  initialVariant?: string;
}) {
  const [payload, setPayload] = useState<ReviewPayload | null>(initialPayload);
  const [error, setError] = useState(initialError);
  const [authorName, setAuthorName] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('comment');
  const [body, setBody] = useState('');
  const [approvalName, setApprovalName] = useState('');
  const [approvalConfirmed, setApprovalConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [uiVariant, setUiVariant] = useState<ReviewUiVariant>(normalizeReviewUiVariant(initialVariant));

  const review = payload?.review;
  const deliverableUrl = review?.deliverableUrl || '';
  const interactionDisabled = useMemo(() => review?.canSubmitFeedback === false || review?.status !== 'active' || submitting, [review?.canSubmitFeedback, review?.status, submitting]);
  const approvalDisabled = useMemo(
    () => review?.canApprove === false || review?.status !== 'active' || submitting || !deliverableUrl,
    [deliverableUrl, review?.canApprove, review?.status, submitting],
  );
  const lockedReason = review?.interactionLockedReason || (review ? lockMessage(review.status) : '');
  const clientDecision = review?.clientDecision;
  const checklist = reviewChecklist(review, Boolean(deliverableUrl));
  const serverChecklist = review?.clientChecklist || [];
  const decision = reviewDecisionSummary(review, Boolean(deliverableUrl), payload?.feedback.length || 0);
  const path = decisionPath(review?.status, Boolean(deliverableUrl), payload?.feedback.length || 0);
  const handoffCards = clientHandoffCards(review, Boolean(deliverableUrl), payload?.feedback.length || 0);
  const writebackReceipts = systemWritebackReceipts(review, Boolean(deliverableUrl), payload?.feedback.length || 0);
  const crmHandoffPacket = buildReviewCrmHandoffPacket(review, Boolean(deliverableUrl), payload?.feedback.length || 0);
  const clientPassport = buildClientReviewPassport(review, Boolean(deliverableUrl), payload?.feedback.length || 0);
  const commercialAcceptanceChecks = buildReviewCommercialAcceptanceChecks(review, Boolean(deliverableUrl), payload?.feedback.length || 0);
  const activeVariant = REVIEW_UI_VARIANTS.find(variant => variant.id === uiVariant) || REVIEW_UI_VARIANTS[0];
  const variantPlaybook = buildReviewVariantPlaybook(review, uiVariant, Boolean(deliverableUrl), payload?.feedback.length || 0);
  const decisionClass = decision.tone === 'ok'
    ? 'border-emerald-400/40 bg-emerald-950/35 text-emerald-100'
    : decision.tone === 'danger'
      ? 'border-red-400/40 bg-red-950/35 text-red-100'
      : 'border-amber-300/40 bg-amber-950/30 text-amber-100';

  async function refresh() {
    const res = await fetch(`/api/industrial-chain/review/${token}`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'review_not_available');
      setPayload(reviewPayloadFromResponse(data));
      return;
    }
    setError('');
    setPayload(data);
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/industrial-chain/review/${token}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, type: feedbackType, body }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || 'feedback_failed');
      const nextPayload = reviewPayloadFromResponse(data);
      if (nextPayload) setPayload(nextPayload);
      return;
    }
    setError('');
    setNotice('反馈已提交，生产团队会按这条记录更新交付状态。');
    setBody('');
    await refresh();
  }

  async function approve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deliverableUrl) {
      setError('deliverable_required_before_approval');
      return;
    }
    if (!approvalConfirmed) {
      setError('approval_confirmation_required');
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/industrial-chain/review/${token}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalName }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || 'approval_failed');
      const nextPayload = reviewPayloadFromResponse(data);
      if (nextPayload) setPayload(nextPayload);
      return;
    }
    setError('');
    setNotice('已批准交付物，系统已把批准结果写回生产链路。');
    await refresh();
  }

  return (
    <main className="min-h-screen bg-[#0d1014] text-[#f4efe7]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-7 px-5 py-8 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/65">Wenai 客户审核</span>
            <span className={`border px-3 py-1 text-xs ${review ? statusClass(review.status) : 'border-white/15 text-white/60'}`}>
              {displayStatusLabel(review)}
            </span>
          </div>
          <div>
            <p className="text-sm text-white/55">{activeVariant.eyebrow}</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
              {review?.assetTitle || '审核链接未加载'}
            </h1>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-white/65">
            {activeVariant.heroBody}
          </p>
          <div className="border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-white/50">Review Variant</div>
                <div className="mt-1 text-sm font-semibold text-white">同一条客户审核链路，按对象切换验收重点</div>
              </div>
              <div className="text-xs leading-5 text-white/50">
                和 /factory、/status 共用 partner / operator / friend_trial 视角。
              </div>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {REVIEW_UI_VARIANTS.map(variant => (
                <a
                  aria-current={uiVariant === variant.id ? 'page' : undefined}
                  className={`border px-3 py-2 text-left transition ${
                    uiVariant === variant.id
                      ? 'border-amber-300/45 bg-amber-300/10 text-amber-50'
                      : 'border-white/10 bg-black/15 text-white/60 hover:border-amber-300/30 hover:text-white'
                  }`}
                  href={`/review/${encodeURIComponent(token)}?variant=${variant.id}`}
                  key={variant.id}
                  onClick={(event) => {
                    event.preventDefault();
                    setUiVariant(variant.id);
                    const url = new URL(window.location.href);
                    url.searchParams.set('variant', variant.id);
                    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
                  }}
                >
                  <div className="text-xs font-semibold">{variant.label}</div>
                  <div className="mt-1 text-[11px] leading-5 opacity-75">{variant.intent}</div>
                </a>
              ))}
            </div>
            <div className="mt-3 border border-white/10 bg-black/20 px-3 py-2 text-xs leading-5 text-white/60">
              当前选择：<span className="font-semibold text-white">{activeVariant.label}</span>。{activeVariant.proof}
            </div>
            <div className="mt-3 border border-amber-300/20 bg-amber-950/20 px-3 py-3">
              <div className="text-xs font-semibold text-amber-100/70">当前视角任务卡</div>
              <div className="mt-1 text-sm font-semibold text-amber-50">{activeVariant.focusTitle}</div>
              <p className="mt-2 text-xs leading-5 text-amber-100/75">{activeVariant.focusBody}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeVariant.focusChecklist.map(item => (
                  <span className="border border-amber-200/20 bg-black/15 px-2 py-1 text-xs text-amber-50/85" key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="mt-3 border border-sky-300/20 bg-sky-950/20 px-3 py-3">
              <div className="text-xs font-semibold text-sky-100/70">Review Action Playbook</div>
              <div className="mt-1 text-sm font-semibold text-sky-50">{variantPlaybook.title}</div>
              <p className="mt-2 text-xs leading-5 text-sky-100/75">{variantPlaybook.primaryAction}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {variantPlaybook.cards.map(card => (
                  <div className="border border-sky-300/15 bg-black/15 px-3 py-2 text-xs leading-5 text-sky-100/70" key={card}>{card}</div>
                ))}
                <div className="border border-rose-300/20 bg-rose-950/20 px-3 py-2 text-xs leading-5 text-rose-100">
                  停止线：{variantPlaybook.handoffBoundary}
                </div>
              </div>
              <div className="mt-3 border border-sky-300/15 bg-black/15 px-3 py-2 text-xs leading-5 text-sky-100/70">
                验收证据：{variantPlaybook.proofToCheck}
              </div>
            </div>
          </div>
          {lockedReason ? <div className={`border px-4 py-3 text-sm ${statusClass(review!.status)}`}>{lockedReason}</div> : null}
          <div className={`border px-4 py-3 ${decisionClass}`}>
            <div className="text-sm font-semibold">{decision.title}</div>
            <div className="mt-1 text-sm leading-6 opacity-80">{decision.body}</div>
          </div>
          {review ? (
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-white/45">当前判断</div>
                <div className="mt-1 font-semibold text-white">{review.clientHeadline || decision.title}</div>
              </div>
              <div className="border border-amber-300/25 bg-amber-950/20 px-4 py-3 text-amber-100">
                <div className="text-xs opacity-65">不要踩坑</div>
                <div className="mt-1 leading-6">{review.clientRisk || '批准前请先确认交付物能打开、内容正确、版本无误。'}</div>
              </div>
              <div className="border border-emerald-300/25 bg-emerald-950/20 px-4 py-3 text-emerald-100">
                <div className="text-xs opacity-65">需要帮助时</div>
                <div className="mt-1 leading-6">{review.supportAction || '看不懂或打不开时，先提交问题反馈，不要勉强批准。'}</div>
              </div>
            </div>
          ) : null}
          <div className="border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-white/55">客户交付护照</div>
                <div className="mt-1 text-sm font-semibold text-white">一眼判断：能不能看、能不能改、能不能批、批完去哪</div>
              </div>
              <div className="text-xs leading-5 text-white/45">
                这张卡只展示客户和运营都能核对的事实，不暴露 provider、token 或后台配置。
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {clientPassport.map(item => (
                <div className={`border px-3 py-2 ${passportClass(item.tone)}`} key={item.title}>
                  <div className="text-xs opacity-65">{item.title}</div>
                  <div className="mt-1 text-sm font-semibold">{item.value}</div>
                  <div className="mt-1 text-xs leading-5 opacity-75">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-emerald-300/20 bg-emerald-950/20 px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-100/70">零解释验收流程</div>
                <div className="mt-1 text-sm font-semibold text-emerald-50">不懂生产链路也能独立完成审核</div>
              </div>
              <div className="text-xs leading-5 text-emerald-100/70">
                这页只让客户做两件事：反馈或批准；其他交接由系统和运营承接。
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {ZERO_EXPLANATION_REVIEW_STEPS.map((item, index) => (
                <div className="border border-emerald-300/15 bg-black/15 px-3 py-2" key={item.title}>
                  <div className="text-[11px] font-semibold text-emerald-100/60">0{index + 1}</div>
                  <div className="mt-1 text-xs font-semibold text-emerald-50">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-emerald-100/70">{item.body}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-lime-300/20 bg-lime-950/15 px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-lime-100/65">Review Commercial Acceptance Board</div>
                <div className="mt-1 text-sm font-semibold text-lime-50">客户审核商用品质验收板</div>
              </div>
              <div className="text-xs leading-5 text-lime-100/60">
                对标 Clico 客户前台：客户不需要解释，也不会误批空交付或旧版本。
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-5">
              {commercialAcceptanceChecks.map(item => (
                <div className={`border px-3 py-2 ${item.ready ? 'border-lime-300/20 bg-black/20 text-lime-100' : 'border-amber-300/25 bg-amber-950/20 text-amber-100'}`} key={item.gate}>
                  <div className="text-xs font-semibold">{item.gate}</div>
                  <div className="mt-2 text-xs leading-5 opacity-75">{item.evidence}</div>
                  <div className="mt-2 text-xs leading-5 opacity-80">客户：{item.clientInstruction}</div>
                  <div className="mt-2 text-xs leading-5 opacity-80">运营：{item.operatorHandoff}</div>
                </div>
              ))}
            </div>
          </div>
          {clientDecision ? (
            <div className={`border px-4 py-3 ${decisionStateClass(clientDecision.primaryActionState)}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-semibold opacity-70">客户当前应该做什么</div>
                  <div className="mt-1 text-lg font-semibold">{clientDecision.primaryActionLabel}</div>
                </div>
                <span className="w-fit border border-current/30 px-3 py-1 text-xs">
                  {decisionStateLabel(clientDecision.primaryActionState)}
                </span>
              </div>
              {clientDecision.disabledReason ? (
                <div className="mt-2 text-sm leading-6 opacity-80">不能继续的原因：{clientDecision.disabledReason}</div>
              ) : null}
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.15fr]">
                <div className="border border-current/20 bg-black/15 px-3 py-2">
                  <div className="text-xs font-semibold opacity-70">运营下一步</div>
                  <div className="mt-1 text-sm leading-6 opacity-85">{clientDecision.operatorNextStep}</div>
                </div>
                <div className="border border-current/20 bg-black/15 px-3 py-2">
                  <div className="text-xs font-semibold opacity-70">批准前核对证据</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {clientDecision.evidenceToCheck.map(item => (
                      <span className="border border-current/20 px-2 py-1 text-xs" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {review?.clientReceipt ? (
            <div className="border border-emerald-300/25 bg-emerald-950/20 px-4 py-3 text-emerald-50">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-100/70">{review.clientReceipt.title}</div>
                  <div className="mt-1 text-sm font-semibold">{review.clientReceipt.summary}</div>
                </div>
                <div className="w-fit border border-emerald-200/25 px-3 py-1 text-xs text-emerald-100/80">
                  交给：{review.clientReceipt.operatorRecipient}
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1.1fr]">
                <div className="border border-emerald-200/15 bg-black/15 px-3 py-2">
                  <div className="text-xs font-semibold text-emerald-100/70">下一步</div>
                  <div className="mt-1 text-sm leading-6 text-emerald-50/85">{review.clientReceipt.nextStep}</div>
                </div>
                <div className="border border-emerald-200/15 bg-black/15 px-3 py-2">
                  <div className="text-xs font-semibold text-emerald-100/70">回执证据</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {review.clientReceipt.evidenceToCheck.map(item => (
                      <span className="border border-emerald-200/20 px-2 py-1 text-xs text-emerald-50/80" key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 border border-emerald-200/15 bg-black/15 px-3 py-2 text-xs leading-5 text-emerald-50/75">
                {review.clientReceipt.shareNote}
              </div>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-3">
            {path.map((item, index) => (
              <div className={`border px-4 py-3 ${pathClass(item.state)}`} key={`${item.title}-${index}`}>
                <div className="text-xs opacity-60">第 {index + 1} 步</div>
                <div className="mt-1 text-sm font-semibold">{item.title}</div>
                <div className="mt-1 text-xs leading-5 opacity-75">{item.body}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-2 text-xs text-white/55 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/[0.03] px-3 py-2">1. 先检查交付物画面、文案、商品信息和平台适配。</div>
            <div className="border border-white/10 bg-white/[0.03] px-3 py-2">2. 有问题就提交修改意见；没问题再批准。</div>
            <div className="border border-white/10 bg-white/[0.03] px-3 py-2">3. 批准会写回生产链路，作为交付和后续分发依据。</div>
          </div>
          <div className="border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
            下一步：{reviewNextStep(review, Boolean(deliverableUrl))}
          </div>
          <div className="border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="text-xs font-semibold text-white/55">客户交接闭环</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {handoffCards.map(item => (
                <div className="border border-white/10 bg-black/20 px-3 py-2" key={item.title}>
                  <div className="text-xs font-semibold text-white/80">{item.title}</div>
                  <div className="mt-1 text-xs leading-5 text-white/55">{item.body}</div>
                </div>
              ))}
            </div>
          </div>
          {activeVariant.showInternalReceipts ? <div className="border border-cyan-300/20 bg-cyan-950/15 px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-cyan-100/65">系统写回回执</div>
                <div className="mt-1 text-sm font-semibold text-cyan-50">客户每一步都会落到可追踪的运营链路</div>
              </div>
              <div className="text-xs leading-5 text-cyan-100/60">
                让客户知道反馈、批准和卡住状态分别流向哪里。
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {writebackReceipts.map(item => (
                <div className="border border-cyan-300/15 bg-black/20 px-3 py-2" key={item.label}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-cyan-50">{item.label}</div>
                    <span className="border border-cyan-200/20 px-2 py-0.5 text-[11px] text-cyan-100/70">{item.state}</span>
                  </div>
                  <div className="mt-2 text-xs leading-5 text-cyan-100/65">{item.detail}</div>
                </div>
              ))}
            </div>
          </div> : null}
          {activeVariant.showInternalReceipts ? <div className="border border-blue-300/20 bg-blue-950/15 px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-blue-100/65">Review CRM Handoff Packet</div>
                <div className="mt-1 text-sm font-semibold text-blue-50">客户动作进入 CRM/分发/复盘承接包</div>
              </div>
              <div className="text-xs leading-5 text-blue-100/60">
                对齐 Clico 的客户时间线思路：客户不是点完按钮就结束，系统要给运营一个可执行接力包。
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {crmHandoffPacket.map(item => (
                <div className={`border px-3 py-2 ${item.ready ? 'border-blue-300/20 bg-black/20 text-blue-100' : 'border-amber-300/25 bg-amber-950/20 text-amber-100'}`} key={item.lane}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold">{item.lane}</div>
                    <span className="border border-current/20 px-2 py-0.5 text-[11px]">{item.ready ? '可承接' : '待处理'}</span>
                  </div>
                  <div className="mt-2 text-xs leading-5 opacity-80">负责人：{item.owner}</div>
                  <div className="mt-2 text-xs leading-5 opacity-80">下一步：{item.nextAction}</div>
                  <div className="mt-2 text-xs leading-5 opacity-70">证据：{item.evidence}</div>
                  <div className="mt-2 text-xs leading-5 opacity-90">放行门禁：{item.releaseGate}</div>
                </div>
              ))}
            </div>
          </div> : null}
          {activeVariant.showInternalReceipts ? <div className="border border-fuchsia-300/20 bg-fuchsia-950/15 px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs font-semibold text-fuchsia-100/65">客户验收作战卡</div>
                <div className="mt-1 text-sm font-semibold text-fuchsia-50">把 Clico 式客户前台变成零解释交接</div>
              </div>
              <div className="text-xs leading-5 text-fuchsia-100/60">
                客户只判断交付是否可用；运营负责链路、返修、分发和回流。
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {CLIENT_REVIEW_OPERATION_CARDS.map(item => (
                <div className="border border-fuchsia-300/15 bg-black/20 px-3 py-2" key={item.title}>
                  <div className="text-xs font-semibold text-fuchsia-50">{item.title}</div>
                  <div className="mt-2 text-xs leading-5 text-fuchsia-100/65">{item.body}</div>
                </div>
              ))}
            </div>
          </div> : null}
          {review ? (
            <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="text-xs font-semibold text-white/55">朋友试用不会卡住的处理卡</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {serverChecklist.map(item => (
                    <div className={`border px-3 py-2 text-xs ${checklistStateClass(item.state)}`} key={item.label}>
                      <div className="font-semibold">{item.label}</div>
                      <div className="mt-1 leading-5 opacity-75">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-sky-300/20 bg-sky-950/20 px-4 py-3 text-sm text-sky-100">
                <div className="text-xs font-semibold opacity-70">卡住时直接发给运营</div>
                <div className="mt-2 leading-6">{review.escalationMessage || '发给运营：我打不开审核链接或交付物，请重新确认链接和版本。'}</div>
              </div>
            </div>
          ) : null}
        </header>

        {notice ? (
          <div className="border border-emerald-400/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">{notice}</div>
        ) : null}
        {error ? (
          <div className="border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">{errorMessage(error)}</div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold">交付物预览</h2>
              <span className="text-xs text-white/45">审核码 {token.slice(0, 12)}</span>
            </div>
            {deliverableUrl ? (
              <div className="space-y-3">
                {isVideo(deliverableUrl) ? (
                  <video className="aspect-video w-full border border-white/10 bg-black object-contain" controls preload="metadata" src={deliverableUrl} />
                ) : isImage(deliverableUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="max-h-[520px] w-full border border-white/10 bg-black object-contain" alt={review?.assetTitle || '交付物预览'} src={deliverableUrl} />
                ) : (
                  <div className="border border-white/10 bg-black/30 px-4 py-10 text-sm text-white/55">该文件类型不能直接嵌入预览，请打开交付物查看。</div>
                )}
                <a
                  href={deliverableUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm text-amber-100 hover:bg-amber-300/15"
                >
                  打开交付物
                </a>
              </div>
            ) : (
              <div className="border border-white/10 px-4 py-8 text-sm text-white/55">暂未附加预览链接，请让运营补齐交付物链接后再审核。</div>
            )}
            <dl className="mt-5 grid gap-3 text-sm text-white/65 sm:grid-cols-3">
              <div>
                <dt className="text-white/40">项目</dt>
                <dd>{review?.projectId || '-'}</dd>
              </div>
              <div>
                <dt className="text-white/40">资产</dt>
                <dd className="break-all">{review?.assetId || '-'}</dd>
              </div>
              <div>
                <dt className="text-white/40">有效期</dt>
                <dd>{formatDate(review?.expiresAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold">批准交付</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">批准后会把交付状态写回生产链路。</p>
            <div className="mt-4 border border-white/10 bg-black/20 p-3">
              <h3 className="text-xs font-semibold text-white/70">客户验收清单</h3>
              <div className="mt-3 space-y-2">
                {checklist.map(item => (
                  <div className="flex gap-2 text-xs leading-5" key={item.label}>
                    <span className={item.ok ? 'text-emerald-200' : 'text-amber-200'}>{item.ok ? '已满足' : '待补齐'}</span>
                    <span className="text-white/70">{item.label}</span>
                    <span className="text-white/40">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <form className="mt-4 flex flex-col gap-3" onSubmit={approve}>
              <label className="text-xs text-white/50" htmlFor="approvalName">批准人</label>
              <input
                id="approvalName"
                value={approvalName}
                onChange={event => setApprovalName(event.target.value)}
                disabled={approvalDisabled}
                required
                className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300"
                placeholder="姓名或公司"
              />
              <label className="flex items-start gap-2 border border-white/10 bg-black/20 px-3 py-3 text-xs leading-5 text-white/60">
                <input
                  type="checkbox"
                  checked={approvalConfirmed}
                  onChange={event => setApprovalConfirmed(event.target.checked)}
                  disabled={approvalDisabled}
                  className="mt-1"
                />
                <span>
                  我已检查交付物，确认可以进入交付、分发或 CRM 后续动作。批准后本链接会锁定；如需修改，请先在反馈区提交修改意见。
                </span>
              </label>
              <button
                type="submit"
                disabled={approvalDisabled || !approvalConfirmed}
                className="mt-2 bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"
              >
                批准并写回状态
              </button>
            </form>
            <div className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/45">
              状态：{displayStatusLabel(review)}<br />
              反馈：{payload?.feedback.length || 0}<br />
              {review?.approvedAt ? <>批准：{review.approvalName || '-'} / {formatDate(review.approvedAt)}</> : '批准后将锁定本页并进入分发交接'}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <form className="border border-white/10 bg-white/[0.03] p-5" onSubmit={submitFeedback}>
            <h2 className="text-base font-semibold">提交反馈</h2>
            <div className="mt-4 grid gap-3">
              <input
                value={authorName}
                onChange={event => setAuthorName(event.target.value)}
                disabled={interactionDisabled}
                required
                className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300"
                placeholder="你的姓名"
              />
              <select
                value={feedbackType}
                onChange={event => setFeedbackType(event.target.value as FeedbackType)}
                disabled={interactionDisabled}
                className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300"
              >
                <option value="comment">评论</option>
                <option value="question">问题</option>
                <option value="change">要求修改</option>
              </select>
              <textarea
                value={body}
                onChange={event => setBody(event.target.value)}
                disabled={interactionDisabled}
                required
                rows={6}
                className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300"
                placeholder="写下需要修改、确认或提问的具体位置。"
              />
              <button
                type="submit"
                disabled={interactionDisabled}
                className="bg-white px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"
              >
                提交反馈
              </button>
            </div>
          </form>

          <div className="border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-base font-semibold">审核记录</h2>
            <div className="mt-4 space-y-3">
              {payload?.feedback.length ? payload.feedback.map(item => (
                <article key={item.id} className="border border-white/10 px-3 py-3">
                  <div className="flex items-center justify-between gap-3 text-xs text-white/45">
                    <span>{item.authorName} / {feedbackLabel(item.type)}</span>
                    <time>{formatDate(item.createdAt)}</time>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/75">{item.body}</p>
                </article>
              )) : (
                <p className="text-sm text-white/50">暂无反馈。</p>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
