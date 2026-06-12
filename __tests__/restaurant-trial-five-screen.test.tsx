import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import TrialPage from '@/app/trial/page';
import { buildShareSummary, deriveTodayActions, deriveTomorrowPlan } from '@/lib/restaurant-trial-five-screen';

const intake = {
  restaurant: '椒香记·川味面馆（国贸店）',
  offer: '藤椒鸡丝拌面双人套餐 ¥59.9',
  audience: '附近三公里写字楼晚餐白领',
  channels: '大众点评 / 小红书 / 微信社群',
  visitReason: '工作日 17:30-20:00 到店免排队',
  constraints: '周末不适用；每桌限用一张券',
  evidence: '菜单截图、套餐菜品图',
};

describe('restaurant trial five screen', () => {
  it('renders the owner-facing five-step frame without advanced panels', () => {
    const html = renderToStaticMarkup(<TrialPage />);
    expect(html).toContain('门店试跑：五步走完第一轮');
    expect(html).toContain('第1屏 填门店');
    expect(html).toContain('第2屏 今天三件事');
    expect(html).toContain('第3屏 能直接发的内容');
    expect(html).toContain('第4屏 回填凭证');
    expect(html).toContain('第5屏 明日动作');
    expect(html).toContain('不承诺爆单');
    expect(html).toContain('发布前店长逐条确认事实和价格');
    expect(html).toContain('门店名称');
    expect(html).toContain('主推菜 / 套餐（带价格）');
    expect(html).toContain('直接生成能发的内容');
    expect(html).toContain('先用示例门店看看效果');
    expect(html).toContain('分享给店长');
    expect(html).not.toContain('provider');
    expect(html).not.toContain('runtime');
    expect(html).not.toContain('沙箱');
    expect(html).not.toContain('回执生命周期');
  });

  it('derives three doable actions with owner and evidence in plain language', () => {
    const actions = deriveTodayActions(intake);
    expect(actions).toHaveLength(3);
    for (const action of actions) {
      expect(action.title.length).toBeGreaterThan(3);
      expect(['店长', '运营', '技术', '数据负责人']).toContain(action.ownerLabel);
      expect(action.doNow.length).toBeGreaterThan(5);
      expect(action.evidenceRequired.length).toBeGreaterThan(3);
    }
  });

  it('marks tomorrow as missing-material until at least one proof is backfilled', () => {
    const withoutProof = deriveTomorrowPlan(intake, []);
    expect(withoutProof[0].kind).toBe('missing-material');
    expect(withoutProof[0].title).toContain('待补资料');

    const withProof = deriveTomorrowPlan(intake, [
      { id: 'proof-1', channel: '小红书', proofUrl: 'https://example.com/note', note: '', recordedAt: '2026-06-11T10:00:00.000Z' },
    ]);
    expect(withProof[0].kind).toBe('next-action');
    expect(withProof[0].title).toContain('1 条凭证');
  });

  it('surfaces a memory-backed suggestion when the store has confirmed history', () => {
    const plan = deriveTomorrowPlan(intake, [], [
      { kind: 'revision-preference', note: '不要文艺腔' },
      { kind: 'campaign-note', note: '酸梅汤赠品反响不错' },
    ]);
    expect(plan[0].title).toContain('明天可以续用');
    expect(plan[0].detail).toContain('酸梅汤赠品反响不错');
    expect(plan[0].kind).toBe('next-action');
  });

  it('builds wechat share summaries that never promise growth', () => {
    const summary2 = buildShareSummary({ screen: 2, intake, todayActions: deriveTodayActions(intake) });
    expect(summary2).toContain('椒香记');
    expect(summary2).toContain('今天先做这三件事');
    const summary1 = buildShareSummary({ screen: 1, intake });
    expect(summary1).toContain('不承诺爆单');
    for (const text of [summary1, summary2]) {
      expect(text).not.toContain('爆单保证');
      expect(text).not.toContain('必火');
    }
  });
});
