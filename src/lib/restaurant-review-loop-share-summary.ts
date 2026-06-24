import type { RestaurantReviewLoopBossRecap } from './restaurant-review-loop-boss-recap';

export type RestaurantReviewLoopShareSummary = {
  ok: true;
  payloadShape: 'restaurant-review-loop-share-summary-v1';
  title: string;
  audience: '老板/店长';
  decisionLabel: string;
  lines: string[];
  ownerChecklist: Array<{
    owner: string;
    action: string;
    evidenceRequired: string;
  }>;
  evidenceChecklist: string[];
  markdown: string;
  stopLines: string[];
};

const DECISION_LABELS: Record<RestaurantReviewLoopBossRecap['decision'], string> = {
  amplify: '小步放大',
  iterate: '继续验证',
  pause: '暂停放大',
};

function cleanLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function bulletLines(items: string[]): string {
  return items.map(item => `- ${cleanLine(item)}`).join('\n');
}

export function buildRestaurantReviewLoopShareSummary(input: {
  recap: RestaurantReviewLoopBossRecap;
  publicUrl?: string;
}): RestaurantReviewLoopShareSummary {
  const { recap } = input;
  const decisionLabel = DECISION_LABELS[recap.decision];
  const title = `${recap.restaurantName} / ${recap.offerName} / 下一轮复盘摘要`;
  const lines = [
    `本轮判断：${decisionLabel}。`,
    `下一轮推什么：${recap.nextDishAction}`,
    `卖点怎么改：${recap.sellingPointChange}`,
    `先补什么：${recap.materialGaps[0]}`,
    `证据状态：发布凭证 ${recap.summary.acceptedProofs} 条，脱敏回流 ${recap.summary.recoverRows} 行。`,
  ];
  const ownerChecklist = recap.ownerActions.slice(0, 4).map(item => ({
    owner: item.owner,
    action: item.action,
    evidenceRequired: item.evidenceRequired,
  }));
  const evidenceChecklist = [
    ...recap.evidenceSources.slice(0, 4),
    input.publicUrl ? `摘要链接：${input.publicUrl}` : '',
  ].filter(Boolean);
  const stopLines = [
    ...recap.stopLines,
    '这份摘要只用于老板/店长复盘，不包含顾客身份、私信原文、券码、订单明细或收银明细。',
  ];

  const markdown = [
    `# ${title}`,
    '',
    '## 结论',
    bulletLines(lines),
    '',
    '## 负责人',
    bulletLines(ownerChecklist.map(item => `${item.owner}：${item.action}（证据：${item.evidenceRequired}）`)),
    '',
    '## 证据',
    bulletLines(evidenceChecklist),
    '',
    '## 边界',
    bulletLines(stopLines.slice(0, 5)),
  ].join('\n');

  return {
    ok: true,
    payloadShape: 'restaurant-review-loop-share-summary-v1',
    title,
    audience: '老板/店长',
    decisionLabel,
    lines,
    ownerChecklist,
    evidenceChecklist,
    markdown,
    stopLines,
  };
}
