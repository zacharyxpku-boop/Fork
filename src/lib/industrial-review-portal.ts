import {
  getContentAsset,
  updateContentAssetDelivery,
  type ContentAssetRecord,
} from '@/lib/industrial-chain-store';
import {
  evaluateAssetPermissionAccess,
  recordAssetPermissionAccessAudit,
  upsertAssetPermission,
  upsertAssetStorageObject,
} from '@/lib/asset-permission-ledger';

export type IndustrialReviewFeedbackType = 'change' | 'question' | 'comment' | 'approval';

export interface IndustrialReviewFeedback {
  id: string;
  authorName: string;
  type: IndustrialReviewFeedbackType;
  body: string;
  deliverableId?: string;
  createdAt: string;
}

export interface IndustrialReviewLinkRecord {
  token: string;
  orgId: string;
  projectId: string;
  assetId: string;
  assetTitle: string;
  deliverableUrl?: string;
  expiresAt: string;
  revoked: boolean;
  feedback: IndustrialReviewFeedback[];
  approvedAt?: string;
  approvalName?: string;
  createdAt: string;
  updatedAt: string;
}

export type IndustrialReviewLinkStatus = 'active' | 'expired' | 'revoked' | 'approved';

export interface IndustrialReviewPortalView {
  token: string;
  projectId: string;
  assetId: string;
  assetTitle: string;
  deliverableUrl?: string;
  expiresAt: string;
  status: IndustrialReviewLinkStatus;
  statusLabel: string;
  clientHeadline: string;
  clientRisk: string;
  supportAction: string;
  nextAction: string;
  clientChecklist: Array<{
    label: string;
    state: 'ok' | 'warn' | 'locked';
    detail: string;
  }>;
  clientDecision: {
    primaryActionLabel: string;
    primaryActionState: 'feedback' | 'approve' | 'wait' | 'locked';
    disabledReason?: string;
    operatorNextStep: string;
    evidenceToCheck: string[];
  };
  clientReceipt: {
    title: string;
    summary: string;
    nextStep: string;
    operatorRecipient: string;
    evidenceToCheck: string[];
    shareNote: string;
  };
  escalationMessage: string;
  canSubmitFeedback: boolean;
  canApprove: boolean;
  interactionLockedReason?: string;
  feedbackCount: number;
  approvedAt?: string;
  approvalName?: string;
}

type ReviewGlobal = typeof globalThis & {
  __wenaiIndustrialReviewLinks?: Map<string, IndustrialReviewLinkRecord>;
  __wenaiIndustrialReviewLinkLists?: Map<string, string[]>;
};

function stores() {
  const target = globalThis as ReviewGlobal;
  if (!target.__wenaiIndustrialReviewLinks) target.__wenaiIndustrialReviewLinks = new Map();
  if (!target.__wenaiIndustrialReviewLinkLists) target.__wenaiIndustrialReviewLinkLists = new Map();
  return {
    links: target.__wenaiIndustrialReviewLinks,
    lists: target.__wenaiIndustrialReviewLinkLists,
  };
}

function scopedListKey(orgId: string, projectId: string) {
  return `${orgId}:${projectId}`;
}

function genToken() {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '')
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
  return `wrv_${random}`.slice(0, 48);
}

function genFeedbackId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function cleanString(value: unknown, fallback: string, limit = 240) {
  return (typeof value === 'string' ? value : fallback).trim().slice(0, limit) || fallback;
}

function cleanOptionalString(value: unknown, limit = 1000) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : undefined;
}

function cleanFeedbackType(value: unknown): IndustrialReviewFeedbackType {
  const allowed: IndustrialReviewFeedbackType[] = ['change', 'question', 'comment', 'approval'];
  return allowed.includes(value as IndustrialReviewFeedbackType) ? value as IndustrialReviewFeedbackType : 'comment';
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function statusFor(record: IndustrialReviewLinkRecord): IndustrialReviewLinkStatus {
  if (record.revoked) return 'revoked';
  if (record.approvedAt) return 'approved';
  if (Date.parse(record.expiresAt) < Date.now()) return 'expired';
  return 'active';
}

function statusLabel(status: IndustrialReviewLinkStatus) {
  if (status === 'active') return '待客户验收';
  if (status === 'approved') return '已批准交付';
  if (status === 'expired') return '链接已过期';
  return '链接已撤销';
}

function clientHeadlineFor(record: IndustrialReviewLinkRecord, status: IndustrialReviewLinkStatus) {
  if (status === 'approved') return '已完成验收，结果已锁定';
  if (status === 'expired') return '审核链接已过期，请不要继续验收';
  if (status === 'revoked') return '审核链接已撤销，请等待新链接';
  if (!record.deliverableUrl) return '交付物还没准备好，先不要批准';
  if (record.feedback.length > 0) return '已有反馈记录，请先确认修改是否完成';
  return '请先预览交付物，再选择反馈或批准';
}

function clientRiskFor(record: IndustrialReviewLinkRecord, status: IndustrialReviewLinkStatus) {
  if (status === 'approved') return '本页已变为只读，继续修改需要运营重新发起审核。';
  if (status === 'expired') return '旧链接不能提交反馈或批准，继续使用会造成验收记录缺失。';
  if (status === 'revoked') return '该链接可能对应旧版本交付物，继续查看会造成版本混淆。';
  if (!record.deliverableUrl) return '当前没有可打开的交付物链接，批准会被系统阻止。';
  if (record.feedback.length > 0) return '如果反馈还没处理完，请不要批准；继续补充修改意见即可。';
  return '批准会写回生产链路，并作为后续分发、CRM 交接和表现回流依据。';
}

function supportActionFor(record: IndustrialReviewLinkRecord, status: IndustrialReviewLinkStatus) {
  if (status === 'approved') return '如需追加修改，请联系运营重新开启一轮审核。';
  if (status === 'expired') return '请联系运营重新生成审核链接。';
  if (status === 'revoked') return '请等待运营发送新的审核链接。';
  if (!record.deliverableUrl) return '请让运营补齐预览或下载链接后再继续。';
  if (record.feedback.length > 0) return '请确认修改点已处理，再填写批准人并提交批准。';
  return '如果看不懂或打不开交付物，请直接提交问题反馈，不要勉强批准。';
}

function nextActionFor(record: IndustrialReviewLinkRecord, status: IndustrialReviewLinkStatus) {
  if (status === 'approved') return '交付物已批准，运营可以继续分发、CRM 交接和表现回流。';
  if (status === 'expired') return '请让运营重新生成审核链接；旧链接不能继续提交反馈或批准。';
  if (status === 'revoked') return '请等待运营发送新的审核链接；旧链接已停止使用。';
  if (!record.deliverableUrl) return '交付物链接缺失，请先让运营补齐预览或下载链接，不要批准。';
  if (record.feedback.length > 0) return '请确认反馈是否已处理；确认无误后再批准交付。';
  return '请先查看交付物；有问题提交反馈，确认无误后再批准。';
}

function clientChecklistFor(record: IndustrialReviewLinkRecord, status: IndustrialReviewLinkStatus): IndustrialReviewPortalView['clientChecklist'] {
  const hasDeliverable = Boolean(record.deliverableUrl);
  return [
    {
      label: '交付物可查看',
      state: hasDeliverable && status !== 'expired' && status !== 'revoked' ? 'ok' : 'warn',
      detail: hasDeliverable
        ? '页面已经附上预览或原始交付链接。'
        : '当前没有交付物链接，不能完成验收。',
    },
    {
      label: '审核链接可写入',
      state: status === 'active' ? 'ok' : 'locked',
      detail: status === 'active'
        ? '可以提交反馈；满足条件时也可以批准。'
        : `当前状态为${statusLabel(status)}，页面只读。`,
    },
    {
      label: '反馈是否已处理',
      state: record.feedback.some(item => item.type === 'change') && !record.approvedAt ? 'warn' : 'ok',
      detail: record.feedback.some(item => item.type === 'change') && !record.approvedAt
        ? '已有修改意见，确认处理完成前不要批准。'
        : '没有未处理的修改阻断，或结果已经批准锁定。',
    },
    {
      label: '批准后动作',
      state: status === 'approved' ? 'locked' : 'ok',
      detail: status === 'approved'
        ? '结果已锁定，运营可进入分发、CRM 交接和表现回流。'
        : '批准会写回生产链路，并锁定当前审核链接。',
    },
  ];
}

function escalationMessageFor(record: IndustrialReviewLinkRecord, status: IndustrialReviewLinkStatus) {
  if (status === 'approved') {
    return `发给运营：审核码 ${record.token} 已由 ${record.approvalName || '客户'} 批准，请继续分发、CRM 交接和表现回流。`;
  }
  if (status === 'expired') {
    return `发给运营：审核码 ${record.token} 已过期，请重新生成审核链接；旧链接不要继续验收。`;
  }
  if (status === 'revoked') {
    return `发给运营：审核码 ${record.token} 已撤销，请发送新的审核链接或确认交付版本。`;
  }
  if (!record.deliverableUrl) {
    return `发给运营：审核码 ${record.token} 缺少可打开的交付物链接，请补齐预览或下载链接后再让我验收。`;
  }
  if (record.feedback.some(item => item.type === 'change')) {
    return `发给运营：审核码 ${record.token} 已有修改反馈，请确认修改完成后再让我批准。`;
  }
  return `发给运营：审核码 ${record.token} 可以验收；我会先看交付物，有问题提交反馈，没问题再批准。`;
}

function clientDecisionFor(record: IndustrialReviewLinkRecord, status: IndustrialReviewLinkStatus): IndustrialReviewPortalView['clientDecision'] {
  const hasDeliverable = Boolean(record.deliverableUrl);
  const hasChangeFeedback = record.feedback.some(item => item.type === 'change');
  if (status === 'approved') {
    return {
      primaryActionLabel: '已批准，只读留档',
      primaryActionState: 'locked',
      disabledReason: '交付物已经批准并写回生产链路。',
      operatorNextStep: '继续推进分发、CRM 交接和表现回流。',
      evidenceToCheck: ['批准人', '批准时间', '交付物版本'],
    };
  }
  if (status === 'expired') {
    return {
      primaryActionLabel: '联系运营重新发起审核',
      primaryActionState: 'wait',
      disabledReason: '审核链接已过期，不能继续提交反馈或批准。',
      operatorNextStep: '重新生成审核链接，并确认交付物版本仍然有效。',
      evidenceToCheck: ['新审核链接', '交付物版本', '有效期'],
    };
  }
  if (status === 'revoked') {
    return {
      primaryActionLabel: '等待新审核链接',
      primaryActionState: 'wait',
      disabledReason: '审核链接已撤销，可能对应旧版本交付物。',
      operatorNextStep: '发送新的审核链接，或说明当前交付物版本已作废。',
      evidenceToCheck: ['新审核链接', '版本说明', '撤销原因'],
    };
  }
  if (!hasDeliverable) {
    return {
      primaryActionLabel: '先提交问题反馈',
      primaryActionState: 'feedback',
      disabledReason: '缺少可打开的交付物链接，不能批准。',
      operatorNextStep: '补齐预览或下载链接，并重新通知客户验收。',
      evidenceToCheck: ['交付物链接', '预览可打开', '版本说明'],
    };
  }
  if (hasChangeFeedback) {
    return {
      primaryActionLabel: '复核修改后再批准',
      primaryActionState: 'feedback',
      disabledReason: '已有修改反馈，批准前需要确认修改点已经处理。',
      operatorNextStep: '标记修改处理结果，必要时重新生成交付物和审核链接。',
      evidenceToCheck: ['修改反馈', '新交付物版本', '客户复核结果'],
    };
  }
  return {
    primaryActionLabel: '确认无误后批准',
    primaryActionState: 'approve',
    operatorNextStep: '批准后进入分发、CRM 交接和表现回流。',
    evidenceToCheck: ['画面内容', '商品信息', '文案和字幕', '平台适配', '版本无误'],
  };
}

function clientReceiptFor(
  record: IndustrialReviewLinkRecord,
  status: IndustrialReviewLinkStatus,
  hasDeliverable: boolean,
  feedbackCount: number,
): IndustrialReviewPortalView['clientReceipt'] {
  const decision = clientDecisionFor(record, status);
  if (status === 'approved') {
    return {
      title: '客户验收回执',
      summary: `已由 ${record.approvalName || '客户'} 批准，结果进入分发、CRM 交接和表现回流。`,
      nextStep: '运营继续推进分发、投放或复购跟进。',
      operatorRecipient: '运营 / CRM / 分发',
      evidenceToCheck: ['批准人', '批准时间', '交付物链接', '客户确认记录'],
      shareNote: `把这张回执发给运营：审核码 ${record.token} 已批准，可继续下游动作。`,
    };
  }
  if (status === 'expired') {
    return {
      title: '客户验收回执',
      summary: '该审核链接已过期，不能继续用于验收旧版本。',
      nextStep: '请运营重新生成审核链接，再让客户验收最新版本。',
      operatorRecipient: '运营',
      evidenceToCheck: ['新审核链接', '最新交付物版本', '有效期'],
      shareNote: `把这张回执发给运营：审核码 ${record.token} 已过期，请重新发链接。`,
    };
  }
  if (status === 'revoked') {
    return {
      title: '客户验收回执',
      summary: '该审核链接已撤销，可能对应旧版本或替代版本。',
      nextStep: '请运营重新发新的审核链接，并说明当前交付版本。',
      operatorRecipient: '运营',
      evidenceToCheck: ['新审核链接', '版本说明', '撤销原因'],
      shareNote: `把这张回执发给运营：审核码 ${record.token} 已撤销，请不要继续使用旧链接。`,
    };
  }
  if (!hasDeliverable) {
    return {
      title: '客户验收回执',
      summary: '当前缺少可打开的交付物链接，客户不能直接批准。',
      nextStep: '先补预览/下载链接，再继续验收。',
      operatorRecipient: '生产运营',
      evidenceToCheck: ['交付物链接', '预览页面', '版本说明'],
      shareNote: `把这张回执发给运营：审核码 ${record.token} 缺少可打开交付物链接。`,
    };
  }
  if (feedbackCount > 0) {
    return {
      title: '客户验收回执',
      summary: '客户已提交反馈，需先处理修改再继续批准。',
      nextStep: '把反馈转成返修任务，处理后让客户回到同一审核链接复核。',
      operatorRecipient: '生产 / 剪辑 / 运营',
      evidenceToCheck: ['反馈内容', '返修任务', '最新版本链接'],
      shareNote: `把这张回执发给运营：审核码 ${record.token} 已有反馈，请先处理再回访。`,
    };
  }
  return {
    title: '客户验收回执',
    summary: '客户当前可以查看交付物，并决定是反馈还是批准。',
    nextStep: decision.operatorNextStep,
    operatorRecipient: '运营 / 客服',
    evidenceToCheck: decision.evidenceToCheck,
    shareNote: `把这张回执发给客户或运营：审核码 ${record.token} 可继续验收。`,
  };
}

function lockReasonFor(record: IndustrialReviewLinkRecord, status: IndustrialReviewLinkStatus) {
  if (status === 'approved') return '该交付物已经批准，审核入口已锁定为只读。';
  if (status === 'expired') return '该审核链接已经过期，不能继续提交反馈或批准。';
  if (status === 'revoked') return '该审核链接已经撤销，不能继续使用。';
  if (!record.deliverableUrl) return '交付物链接缺失，批准按钮保持关闭。';
  return undefined;
}

function publicView(record: IndustrialReviewLinkRecord): IndustrialReviewPortalView {
  const status = statusFor(record);
  const hasDeliverable = Boolean(record.deliverableUrl);
  return {
    token: record.token,
    projectId: record.projectId,
    assetId: record.assetId,
    assetTitle: record.assetTitle,
    deliverableUrl: record.deliverableUrl,
    expiresAt: record.expiresAt,
    status,
    statusLabel: statusLabel(status),
    clientHeadline: clientHeadlineFor(record, status),
    clientRisk: clientRiskFor(record, status),
    supportAction: supportActionFor(record, status),
    nextAction: nextActionFor(record, status),
    clientChecklist: clientChecklistFor(record, status),
    clientDecision: clientDecisionFor(record, status),
    clientReceipt: clientReceiptFor(record, status, hasDeliverable, record.feedback.length),
    escalationMessage: escalationMessageFor(record, status),
    canSubmitFeedback: status === 'active',
    canApprove: status === 'active' && hasDeliverable,
    interactionLockedReason: lockReasonFor(record, status),
    feedbackCount: record.feedback.length,
    approvedAt: record.approvedAt,
    approvalName: record.approvalName,
  };
}

export async function createIndustrialReviewLink(
  orgId: string,
  input: {
    assetId: string;
    expiresAt?: string;
    ttlDays?: number;
  },
): Promise<IndustrialReviewLinkRecord | null> {
  const asset = await getContentAsset(orgId, input.assetId);
  if (!asset) return null;
  const now = new Date().toISOString();
  const token = genToken();
  const record: IndustrialReviewLinkRecord = {
    token,
    orgId,
    projectId: asset.projectId,
    assetId: asset.id,
    assetTitle: asset.title,
    deliverableUrl: asset.url || asset.clientReviewUrl,
    expiresAt: input.expiresAt || addDays(input.ttlDays || 30),
    revoked: false,
    feedback: [],
    createdAt: now,
    updatedAt: now,
  };
  const store = stores();
  store.links.set(token, record);
  const listKey = scopedListKey(orgId, asset.projectId);
  const list = store.lists.get(listKey) || [];
  store.lists.set(listKey, [token, ...list.filter(item => item !== token)].slice(0, 500));
  await updateContentAssetDelivery(orgId, asset.id, {
    deliveryStatus: 'client_review',
    clientReviewUrl: `/review/${token}`,
    evidence: `Client review link created: ${token}`,
  });
  await upsertAssetPermission(orgId, {
    projectId: asset.projectId,
    assetId: asset.id,
    owner: 'client-review',
    scope: 'client_review',
    roles: ['owner', 'crm', 'client'],
    allowedActions: ['view', 'share', 'approve'],
    expiresAt: record.expiresAt,
    actor: 'review-portal',
    auditNote: `Client review token created for ${token}.`,
  });
  if (record.deliverableUrl) {
    await upsertAssetStorageObject(orgId, {
      projectId: asset.projectId,
      assetId: asset.id,
      provider: 'external',
      objectKey: `client-review/${token}/${asset.id}`,
      contentType: asset.type === 'video' ? 'video/mp4' : 'application/octet-stream',
      byteSize: 1,
      downloadUrl: record.deliverableUrl,
      shareUrl: `/review/${token}`,
    });
  }
  return record;
}

export async function getIndustrialReviewLink(token: string): Promise<IndustrialReviewLinkRecord | null> {
  return stores().links.get(token) || null;
}

export async function listIndustrialReviewLinks(orgId: string, projectId = 'default-project', limit = 100): Promise<IndustrialReviewLinkRecord[]> {
  const store = stores();
  const ids = store.lists.get(scopedListKey(orgId, projectId)) || [];
  return ids.slice(0, limit).map(id => store.links.get(id)).filter(Boolean) as IndustrialReviewLinkRecord[];
}

export async function revokeIndustrialReviewLink(orgId: string, token: string): Promise<IndustrialReviewLinkRecord | null> {
  const existing = await getIndustrialReviewLink(token);
  if (!existing || existing.orgId !== orgId) return null;
  const next: IndustrialReviewLinkRecord = {
    ...existing,
    revoked: true,
    updatedAt: new Date().toISOString(),
  };
  stores().links.set(token, next);
  return next;
}

export function getIndustrialReviewPortalView(record: IndustrialReviewLinkRecord): IndustrialReviewPortalView {
  return publicView(record);
}

export async function appendIndustrialReviewFeedback(
  token: string,
  input: {
    authorName: string;
    type: IndustrialReviewFeedbackType;
    body: string;
    deliverableId?: string;
  },
): Promise<{ record: IndustrialReviewLinkRecord; status: IndustrialReviewLinkStatus } | null> {
  const existing = await getIndustrialReviewLink(token);
  if (!existing) return null;
  const status = statusFor(existing);
  if (status !== 'active') return { record: existing, status };

  const feedback: IndustrialReviewFeedback = {
    id: genFeedbackId('fb'),
    authorName: cleanString(input.authorName, 'Client', 80),
    type: cleanFeedbackType(input.type),
    body: cleanString(input.body, 'Client feedback attached.', 4000),
    deliverableId: cleanOptionalString(input.deliverableId, 160),
    createdAt: new Date().toISOString(),
  };
  const next: IndustrialReviewLinkRecord = {
    ...existing,
    feedback: [...existing.feedback, feedback],
    updatedAt: feedback.createdAt,
  };
  stores().links.set(token, next);
  await updateContentAssetDelivery(existing.orgId, existing.assetId, {
    deliveryStatus: feedback.type === 'change' ? 'revision_requested' : 'client_review',
    revisionReason: feedback.type === 'change' ? feedback.body : existing.feedback.find(item => item.type === 'change')?.body,
    evidence: `Client feedback ${feedback.type}: ${feedback.body}`,
  });
  return { record: next, status: 'active' };
}

export async function approveIndustrialReviewLink(
  token: string,
  input: {
    approvalName: string;
  },
): Promise<{ record: IndustrialReviewLinkRecord; status: IndustrialReviewLinkStatus; asset: ContentAssetRecord | null; approvedNow: boolean } | null> {
  const existing = await getIndustrialReviewLink(token);
  if (!existing) return null;
  const status = statusFor(existing);
  if (status !== 'active') {
    return {
      record: existing,
      status,
      asset: await getContentAsset(existing.orgId, existing.assetId),
      approvedNow: false,
    };
  }

  const now = new Date().toISOString();
  const approvalName = cleanString(input.approvalName, 'Client', 80);
  const access = await evaluateAssetPermissionAccess(existing.orgId, {
    projectId: existing.projectId,
    assetId: existing.assetId,
    action: 'approve',
    role: 'client',
  });
  await recordAssetPermissionAccessAudit(existing.orgId, {
    projectId: existing.projectId,
    assetId: existing.assetId,
    action: 'approve',
    role: 'client',
    actor: approvalName,
    operation: 'client_review_approve',
    allowed: access.allowed,
    reason: access.reason,
    record: access.record,
  });
  if (!access.allowed) {
    return {
      record: existing,
      status: 'revoked',
      asset: await getContentAsset(existing.orgId, existing.assetId),
      approvedNow: false,
    };
  }
  const approval: IndustrialReviewFeedback = {
    id: genFeedbackId('ap'),
    authorName: approvalName,
    type: 'approval',
    body: 'Approved for delivery, distribution, and commercial handoff.',
    deliverableId: existing.assetId,
    createdAt: now,
  };
  const next: IndustrialReviewLinkRecord = {
    ...existing,
    feedback: [...existing.feedback, approval],
    approvedAt: now,
    approvalName,
    updatedAt: now,
  };
  stores().links.set(token, next);
  const asset = await updateContentAssetDelivery(existing.orgId, existing.assetId, {
    deliveryStatus: 'approved',
    clientApprovedAt: now,
    evidence: `Client approved via review token ${token} by ${approvalName}`,
  });
  return { record: next, status: 'approved', asset, approvedNow: true };
}
