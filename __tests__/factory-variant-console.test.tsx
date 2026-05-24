import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FactoryVariantConsole } from '@/components/FactoryVariantConsole';

describe('factory variant console', () => {
  it('renders the shared factory variant shell with role links, proof, and stop line', () => {
    const html = renderToStaticMarkup(
      <FactoryVariantConsole
        basePath="/factory/creative"
        evidenceCards={['监控源 3 / provider-ready 来源 1', '机会 2 / 模式簇 1']}
        eyebrow="Compose Variant Console"
        firstScreen="先看创意来源和下一步生产交接。"
        nextAction="把机会地图写入脚本资产。"
        primaryAction="检查监控源和机会地图。"
        projectId="variant-shell-project"
        proofFocus="证据必须能追到 source 和 insight_id。"
        selectedVariantId="operator"
        stopLine="未授权来源不抓取。"
        title="Compose 执行队列剧本"
        variants={{
          partner: { label: '合作者视角', audience: '看商业验收证据。' },
          operator: { label: '运营工作台', audience: '看今天要做的动作。' },
          friend_trial: { label: '朋友试用版', audience: '看能否零解释完成。' },
        }}
      />,
    );

    expect(html).toContain('Compose Variant Console');
    expect(html).toContain('Compose 执行队列剧本');
    expect(html).toContain('/factory/creative?projectId=variant-shell-project&amp;variant=partner');
    expect(html).toContain('/factory/creative?projectId=variant-shell-project&amp;variant=operator');
    expect(html).toContain('/factory/creative?projectId=variant-shell-project&amp;variant=friend_trial');
    expect(html).toContain('第一动作');
    expect(html).toContain('证据检查');
    expect(html).toContain('停止线');
    expect(html).toContain('监控源 3 / provider-ready 来源 1');
    expect(html).toContain('下一步：把机会地图写入脚本资产。');
    expect(html).not.toContain('provider-gated');
  });
});
