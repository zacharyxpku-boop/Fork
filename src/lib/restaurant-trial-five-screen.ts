import { buildRestaurantTrialWorkflowPack } from '@/lib/restaurant-trial-workflow-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export interface TrialTodayAction {
  id: string;
  title: string;
  ownerLabel: string;
  doNow: string;
  evidenceRequired: string;
}

export interface TrialProofEntry {
  id: string;
  channel: string;
  proofUrl: string;
  note: string;
  recordedAt: string;
}

export interface TrialTomorrowItem {
  id: string;
  title: string;
  detail: string;
  kind: 'next-action' | 'missing-material';
}

const OWNER_LABELS: Record<string, string> = {
  merchant: '店长',
  'store-manager': '店长',
  ops: '运营',
  'runtime-admin': '技术',
  'data-ops': '数据负责人',
};

export function ownerLabel(owner: string): string {
  return OWNER_LABELS[owner] || owner;
}

export function deriveTodayActions(intake: RestaurantTrialIntake): TrialTodayAction[] {
  const pack = buildRestaurantTrialWorkflowPack(intake);
  const readySteps = pack.workflowSteps.filter(step => step.status === 'ready' || step.status === 'needs-review');
  return readySteps.slice(0, 3).map(step => ({
    id: step.id,
    title: step.title,
    ownerLabel: ownerLabel(step.owner),
    doNow: step.nextAction,
    evidenceRequired: typeof step.evidenceRequired === 'string' ? step.evidenceRequired : String(step.evidenceRequired),
  }));
}

export interface TrialMemoryNote {
  kind: string;
  note: string;
}

export function deriveTomorrowPlan(
  intake: RestaurantTrialIntake,
  proofs: TrialProofEntry[],
  memoryNotes: TrialMemoryNote[] = [],
): TrialTomorrowItem[] {
  const pack = buildRestaurantTrialWorkflowPack(intake);
  const items: TrialTomorrowItem[] = [];
  const reusable = memoryNotes.filter(note => note.kind === 'campaign-note' || note.kind === 'effective-angle');
  if (reusable.length > 0) {
    const latest = reusable[reusable.length - 1];
    items.push({
      id: 'memory-suggestion',
      title: '上次验证有效的做法，明天可以续用',
      detail: `之前记过：「${latest.note}」。明天的内容和活动可以沿着这个角度再来一次，效果有变化就更新这条记忆。`,
      kind: 'next-action',
    });
  }
  if (proofs.length === 0) {
    items.push({
      id: 'collect-first-proof',
      title: '待补资料：先回填第一条发布凭证',
      detail: '今天发出去的内容，把公开链接或截图说明填回来，明天的复盘才有依据。没有凭证之前，不下经营结论。',
      kind: 'missing-material',
    });
  } else {
    items.push({
      id: 'review-proofs',
      title: `复盘今天的 ${proofs.length} 条凭证`,
      detail: '和店长一起看哪条内容带来了询问或到店，把有效的渠道明天加一条，没动静的渠道换个角度再试一次。',
      kind: 'next-action',
    });
    items.push({
      id: 'next-content-loop',
      title: '把有效内容做成系列',
      detail: '同一道菜换一个就餐场景再写一条，保持每天一条的节奏，比一次发五条更有用。',
      kind: 'next-action',
    });
  }
  const gatedInPlainWords: Record<string, { title: string; detail: string }> = {
    'operating-data': {
      title: '待补资料：想看真实经营效果，要给一份汇总表',
      detail: '让收银员或店长导出一份不带顾客信息的汇总表（订单数、销售额、券领取和核销数量）。没有这份表之前，系统只给方向参考，不下经营结论。',
    },
    'browser-runbook': {
      title: '待补资料：想让系统代发内容，要先授权账号',
      detail: '现在内容由店长复制后手动发布。想以后由系统代发，需要店长确认平台账号授权范围，这一步不着急，先把手动节奏跑顺。',
    },
  };
  const gated = pack.workflowSteps.filter(step => step.status === 'external-gated').slice(0, 2);
  for (const step of gated) {
    const plain = gatedInPlainWords[step.id];
    if (!plain) continue;
    items.push({
      id: `gated-${step.id}`,
      title: plain.title,
      detail: plain.detail,
      kind: 'missing-material',
    });
  }
  return items.slice(0, 4);
}

export function buildShareSummary(input: {
  screen: 1 | 2 | 3 | 4 | 5;
  intake: RestaurantTrialIntake;
  todayActions?: TrialTodayAction[];
  proofs?: TrialProofEntry[];
  tomorrow?: TrialTomorrowItem[];
}): string {
  const store = input.intake.restaurant || '门店';
  const offer = input.intake.offer || '主推套餐';
  switch (input.screen) {
    case 1:
      return `【${store}】今天试跑一张经营工单：主推「${offer}」。不承诺爆单，先跑清楚第一轮。稍后把今天要做的三件事发给你。`;
    case 2: {
      const lines = (input.todayActions || []).map((action, index) => `${index + 1}. ${action.title}（${action.ownerLabel}）：${action.doNow}`);
      return `【${store}】今天先做这三件事：\n${lines.join('\n')}\n每件事做完要留凭证（链接或截图）。`;
    }
    case 3:
      return `【${store}】「${offer}」的渠道内容已经准备好，发布前请逐条确认价格、限量和活动边界，确认无误再发。`;
    case 4: {
      const count = input.proofs?.length || 0;
      return count
        ? `【${store}】今天已回填 ${count} 条发布凭证，明天复盘用。`
        : `【${store}】今天发布后记得把链接或截图回填，没有凭证就不下结论。`;
    }
    case 5: {
      const lines = (input.tomorrow || []).map((item, index) => `${index + 1}. ${item.title}`);
      return `【${store}】明天的安排：\n${lines.join('\n')}`;
    }
  }
}
