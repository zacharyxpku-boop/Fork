import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import SettingsPage from '@/app/settings/page';
import KuaiziSettingsPage from '@/app/settings/kuaizi/page';
import DocsPage from '@/app/docs/page';

describe('settings pages', () => {
  it('renders client configuration in clear Chinese', () => {
    const html = renderToStaticMarkup(<SettingsPage />);

    expect(html).toContain('客户配置');
    expect(html).toContain('基本信息');
    expect(html).toContain('AI 员工配置');
    expect(html).toContain('保存配置');
    expect(html).not.toContain('瀹');
    expect(html).not.toContain('淇');
    expect(html).not.toContain('ON');
    expect(html).not.toContain('OFF');
  });

  it('surfaces the final product blueprint and external gates from the docs hub', () => {
    const html = renderToStaticMarkup(<DocsPage />);

    expect(html).toContain('终局产品形态与外部接入边界');
    expect(html).toContain('docs/FINAL_PRODUCT_BLUEPRINT.md');
    expect(html).toContain('Compose / Create / Cut / Cast / Manage');
    expect(html).toContain('没有 provider callback、平台 OAuth、广告账户授权、analytics sync、企业云资产和规模审计前');
    expect(html).toContain('不宣称筷子科技等价');
    expect(html).toContain('/status');
    expect(html).toContain('/settings/kuaizi');
    expect(html).toContain('/factory/video');
    expect(html).toContain('Clico 模板矩阵');
    expect(html).toContain('朋友/合作者零解释试用顺序');
    expect(html).toContain('/status?variant=friend_trial');
    expect(html).toContain('/factory/creative?variant=friend_trial');
    expect(html).toContain('/factory/create?variant=friend_trial');
    expect(html).toContain('/factory/video?variant=friend_trial');
    expect(html).toContain('/factory/cast?variant=friend_trial');
    expect(html).toContain('遇到 provider、OAuth、广告账户或云资产门禁，就停在材料清单');
  });

  it('renders Kuaizi connection settings without browser-side credential promises', () => {
    const html = renderToStaticMarkup(<KuaiziSettingsPage />);

    expect(html).toContain('筷子科技连接配置');
    expect(html).toContain('生产工具连接');
    expect(html).toContain('服务端托管');
    expect(html).toContain('不在浏览器保存');
    expect(html).toContain('不能承诺一键外部生产');
    expect(html).toContain('外部环境接入作战台');
    expect(html).toContain('能配的我接，必须授权的你统一给');
    expect(html).toContain('视频生成 / 剪辑供应商');
    expect(html).toContain('多平台 OAuth / 账号池');
    expect(html).toContain('自动发布 / PubPal 矩阵分发');
    expect(html).toContain('广告投放');
    expect(html).toContain('Cast Operating Board');
    expect(html).toContain('账号矩阵、PubPal 分发、广告投放和数据回流的统一门禁');
    expect(html).toContain('账号矩阵池');
    expect(html).toContain('PubPal 矩阵分发');
    expect(html).toContain('表现自动同步');
    expect(html).toContain('没有 oauth_ready 或 manual_ready 的账号，不能把任何 dispatch 标记为已发布');
    expect(html).toContain('没有平台发布证据链接前，只能算 handoff');
    expect(html).toContain('没有广告账户授权、预算和平台 campaign 证据，不能宣称自动投放或自动优化');
    expect(html).toContain('没有真实同步任务和回流证据，只能展示导入结果');
    expect(html).toContain('自有规模审计');
    expect(html).toContain('91M+ / 42M+ 只能显示为竞品 benchmark');
    expect(html).toContain('外部材料包');
    expect(html).toContain('你给材料，我按验收口径接；没有材料就保持门禁');
    expect(html).toContain('P0 先打通真实生成、真实账号和真实广告');
    expect(html).toContain('材料获取路径');
    expect(html).toContain('去哪里拿');
    expect(html).toContain('6 条获取路径');
    expect(html).toContain('供应商控制台或服务商对接群');
    expect(html).toContain('TikTok/Douyin、小红书、快手、Meta、Google、Amazon、Shopify 开发者后台');
    expect(html).toContain('各平台 Ads Manager 或商务管理后台');
    expect(html).toContain('对象存储、CDN、企业网盘或云服务 IAM 控制台');
    expect(html).toContain('账号进入 oauth_ready');
    expect(html).toContain('设置预算上限');
    expect(html).toContain('给出日期范围和证据 URL');
    expect(html).toContain('材料放行检查表');
    expect(html).toContain('对齐 /status 的内部 / 外部交付边界板');
    expect(html).toContain('回到 readiness 边界板');
    expect(html).toContain('P0 阻断包');
    expect(html).toContain('P1 加厚包');
    expect(html).toContain('材料字段');
    expect(html).toContain('放行口径');
    expect(html).toContain('接入后打开的能力');
    expect(html).toContain('缺失时保持的门禁');
    expect(html).toContain('解锁一键视频、智能混剪、批量成片');
    expect(html).toContain('不宣称自动成片');
    expect(html).toContain('解锁平台账号池、OAuth 状态、账号健康');
    expect(html).toContain('不把任何内容标记为真实发布');
    expect(html).toContain('解锁广告账户读取、测试 campaign 创建');
    expect(html).toContain('不宣称自动广告投放或自动优化');
    expect(html).toContain('解锁 Wenai 自有 creative output');
    expect(html).toContain('只能作为筷子科技 benchmark');
    expect(html).toContain('内部继续：');
    expect(html).toContain('外部提供：');
    expect(html).toContain('安全红线：');
    expect(html).toContain('材料已放入安全位置');
    expect(html).toContain('有 sandbox 或最小权限');
    expect(html).toContain('有可验证回执');
    expect(html).toContain('没有 callback、发布回执、campaign 数据或审计账本就保持门禁');
    expect(html).toContain('视频生成 / 剪辑 provider 包');
    expect(html).toContain('平台 OAuth / 账号池授权包');
    expect(html).toContain('广告账户 / Campaign 包');
    expect(html).toContain('Analytics sync / 回流包');
    expect(html).toContain('企业云资产 / 权限包');
    expect(html).toContain('规模数字审计包');
    expect(html).toContain('server token');
    expect(html).toContain('webhook signing secret');
    expect(html).toContain('不要把 provider token、cookie、后台登录态贴到聊天或浏览器 localStorage');
    expect(html).toContain('同一资产对客户、运营、分发角色返回不同权限结果');
    expect(html).toContain('规模数字能追溯到 Wenai 自有账本、平台回执和日期范围');
    expect(html).not.toContain('KUAIZI_API_KEY');
    expect(html).not.toContain('绛');
    expect(html).not.toContain('杩');
    expect(html).not.toContain('API Key');
  });

  it('keeps the partner-facing external integration material handoff explicit', () => {
    const doc = readFileSync(join(process.cwd(), 'docs/EXTERNAL_INTEGRATION_MATERIALS.md'), 'utf8');

    expect(doc).toContain('How To Obtain Materials');
    expect(doc).toContain('Provider console or provider integration contact');
    expect(doc).toContain('Create developer app; add redirect URI; grant sandbox/test account');
    expect(doc).toContain('Ads Manager or business manager console');
    expect(doc).toContain('Object storage, CDN, enterprise drive, or cloud IAM console');
    expect(doc).toContain('Wenai production ledger, platform publish backend, analytics exports');
    expect(doc).toContain('Account reaches `oauth_ready`');
    expect(doc).toContain('Video Generation / Editing Provider Pack');
    expect(doc).toContain('Platform OAuth / Account Pool Pack');
    expect(doc).toContain('Ad Account / Campaign Pack');
    expect(doc).toContain('Analytics Sync / Performance Return Pack');
    expect(doc).toContain('Enterprise Asset Cloud / Permission Pack');
    expect(doc).toContain('Audited Scale Ledger Pack');
    expect(doc).toContain('91M+ creative output and 42M+ video distribution numbers are competitor benchmarks');
    expect(doc).toContain('No platform OAuth: keep distribution as manual/provider-gated dispatch.');
    expect(doc).toContain('No ad account authorization: do not claim automatic ad delivery or optimization.');
    expect(doc).toContain('No video provider callback: do not claim one-click finished video or batch smart remixing.');
    expect(doc).toContain('No audited scale ledger: do not display Wenai-owned 91M+ / 42M+ scale claims.');
    expect(doc).not.toContain('KUAIZI_API_KEY');
    expect(doc).not.toContain('API Key');
  });

  it('keeps the final product blueprint grounded in reference platforms and external stop lines', () => {
    const doc = readFileSync(join(process.cwd(), 'docs/FINAL_PRODUCT_BLUEPRINT.md'), 'utf8');

    expect(doc).toContain('ecommerce AI content industrialization operating system');
    expect(doc).toContain('Compose');
    expect(doc).toContain('Create');
    expect(doc).toContain('Cut');
    expect(doc).toContain('Cast');
    expect(doc).toContain('Manage');
    expect(doc).toContain('Hookshot / Hookly');
    expect(doc).toContain('Omneky');
    expect(doc).toContain('VidMob');
    expect(doc).toContain('Creatify');
    expect(doc).toContain('Marpipe');
    expect(doc).toContain('Pencil');
    expect(doc).toContain('Smartly.io');
    expect(doc).toContain('Creatopy');
    expect(doc).toContain('Superads');
    expect(doc).toContain('Video generation/editing provider pack');
    expect(doc).toContain('Platform OAuth/account pool pack');
    expect(doc).toContain('Ad account/campaign pack');
    expect(doc).toContain('No provider callback');
    expect(doc).toContain('No platform OAuth');
    expect(doc).toContain('No ad account authorization');
    expect(doc).toContain('91M+ creative output');
    expect(doc).toContain('42M+ video distribution');
    expect(doc).toContain('competitor benchmarks only');
    expect(doc).not.toContain('API Key');
    expect(doc).not.toContain('KUAIZI_API_KEY');
  });
});
