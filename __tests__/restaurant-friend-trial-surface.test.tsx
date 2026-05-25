import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import FactoryPage from '@/app/factory/page';
import CastFactoryPage from '@/app/factory/cast/page';
import CreateFactoryPage from '@/app/factory/create/page';
import CreativeFactoryPage from '@/app/factory/creative/page';
import ManageFactoryPage from '@/app/factory/manage/page';
import VideoFactoryPage from '@/app/factory/video/page';

const oldSurfaceTerms = [
  'SKU',
  '商品',
  '电商',
  '广告',
  '投放',
  'campaign',
  'Campaign',
  'CRM',
  '客户审核',
  '商品 brief',
  '产品素材',
  '15s launch script',
  'Product visual asset',
  'benchmark-video',
  '@brand-main',
  'Launch conversion boost',
  '写入账号',
];

describe('restaurant friend trial surface', () => {
  it('keeps the six customer trial factory pages restaurant-native', async () => {
    const pages = [
      await FactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await CreativeFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await CreateFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await VideoFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await CastFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await ManageFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
    ];

    const html = pages.map(page => renderToStaticMarkup(page)).join('\n');

    expect(html).toContain('餐饮');
    expect(html).toContain('门店');
    expect(html).toContain('菜品');
    expect(html).toContain('今天先跑一张门店经营工单');
    expect(html).toContain('Wenai Claw Runtime');
    expect(html).toContain('今日任务包');
    expect(html).toContain('证据回执');
    expect(html).toContain('经营导入');
    expect(html).toContain('浏览器执行');
    expect(html).toContain('AI OS Audit');
    expect(html).toContain('先看哪些能力能跑、哪些必须接 Provider');
    expect(html).toContain('Run Trial');
    expect(html).toContain('Provider Setup');
    expect(html).toContain('Operating Insight');
    expect(html).toContain('restaurant-agent-runtime');
    expect(html).toContain('20 模块 / 200 技能 / 60 工具，逐项标注能否现在执行');
    expect(html).toContain('Claw Skill Catalog');
    expect(html).toContain('模块 / 技能 / 工具');
    expect(html).toContain('内部可用 / 待训练 / 等 Provider');
    expect(html).toContain('训练：');
    expect(html).toContain('外部：');
    expect(html).toContain('试用路径');
    expect(html).toContain('填门店任务');
    expect(html).toContain('跑受控试单');
    expect(html).toContain('补外部钥匙');
    expect(html).toContain('真实餐饮场景，即刻体验');
    expect(html).toContain('菜单定价与结构分析');
    expect(html).toContain('外卖活动方案设计');
    expect(html).toContain('财务报表解读与诊断');
    expect(html).toContain('Hermes 架构：自我进化的智能内核');
    expect(html).toContain('深度分层记忆');
    expect(html).toContain('沙箱安全隔离');
    expect(html).toContain('Provider 门槛');
    expect(html).toContain('竞品能力训练与接入矩阵');
    expect(html).toContain('跨平台经营问答');
    expect(html).toContain('自动发布与回执');
    expect(html).toContain('自动获客与社群跟进');
    expect(html).toContain('核销与真实经营分析');
    expect(html).toContain('需要训练材料');
    expect(html).toContain('外部 Provider / 授权');
    expect(html).toContain('验收标准');
    expect(html).toContain('生成能力训练计划');
    expect(html).toContain('Build Trial Workflow Pack');
    expect(html).toContain('加载 Claw 能力库');
    expect(html).toContain('判断产品底座');
    expect(html).toContain('生成 Claw 训练批次');
    expect(html).toContain('Build Platform Operating Spine');
    expect(html).toContain('Build Operating Data Contract');
    expect(html).toContain('Provider Setup Pack');
    expect(html).toContain('Signoff delivery kit');
    expect(html).toContain('Acceptance fields');
    expect(html).toContain('Export digest');
    expect(html).toContain('External Execution Wizard');
    expect(html).toContain('Controlled Trial Run');
    expect(html).toContain('Execution Timeline');
    expect(html).toContain('Agent Command Center');
    expect(html).toContain('AI employee command router');
    expect(html).toContain('Route Command');
    expect(html).toContain('architecture decision');
    expect(html).toContain('kuaizi-platform-spine-plus-claw-agent-layer');
    expect(html).toContain('Activation Cockpit');
    expect(html).toContain('Internal ability vs training vs provider gates');
    expect(html).toContain('Build Activation Cockpit');
    expect(html).toContain('Claw Skill Workbench');
    expect(html).toContain('Pick a restaurant skill, get an executable task pack');
    expect(html).toContain('Content Launch');
    expect(html).toContain('Private Domain');
    expect(html).toContain('Coupon + POS');
    expect(html).toContain('Agent Governance');
    expect(html).toContain('Open Skill Workbench');
    expect(html).toContain('Public Intelligence Brief');
    expect(html).toContain('Store facts, local platforms, material gaps');
    expect(html).toContain('Import Public Store Intel');
    expect(html).toContain('Provider Setup Wizard');
    expect(html).toContain('Keys, grants, staff channels, POS contracts');
    expect(html).toContain('Build Provider Setup Wizard');
    expect(html).toContain('Save Setup State');
    expect(html).toContain('remembered records');
    expect(html).toContain('Provider Readiness Health');
    expect(html).toContain('Check Provider Health');
    expect(html).toContain('health ready');
    expect(html).toContain('AI employee channel hub');
    expect(html).toContain('Chat commands, scheduled jobs, provider gates');
    expect(html).toContain('Build Channel Hub');
    expect(html).toContain('Attempt Staff Delivery');
    expect(html).toContain('Run Due Schedule');
    expect(html).toContain('AI employee inbox');
    expect(html).toContain('Wenai Store Operator');
    expect(html).toContain('主控台：先跑受控试单，再看时间线和外部缺口');
    expect(html).toContain('Run Trial');
    expect(html).toContain('Open Timeline');
    expect(html).toContain('Setup Gates');
    expect(html).toContain('store manager today');
    expect(html).toContain('Build Pack');
    expect(html).toContain('waiting for accepted receipt');
    expect(html).toContain('Refresh Center');
    expect(html).toContain('restaurant-agent-command-center-v1');
    expect(html).toContain('Restaurant AI Cockpit');
    expect(html).toContain('GM Command Deck');
    expect(html).toContain('Open-shift command');
    expect(html).toContain('AI autopilot queue');
    expect(html).toContain('Shift Autopilot');
    expect(html).toContain('Run Full Shift Loop');
    expect(html).toContain('Run Shift Autopilot');
    expect(html).toContain('Build Provider Handoff');
    expect(html).toContain('Check Sandbox Acceptance');
    expect(html).toContain('Build Shift First Forwardable Run');
    expect(html).toContain('Submit Shift Sandbox Run');
    expect(html).toContain('Closeout + Train');
    expect(html).toContain('Record Training');
    expect(html).toContain('Activation Pack');
    expect(html).toContain('now queue');
    expect(html).toContain('next wakeups');
    expect(html).toContain('Competitor Route Decision');
    expect(html).toContain('Build Route Decision');
    expect(html).toContain('Platform spine + Claw experience + runtime/data contracts');
    expect(html).toContain('Competitor Parity Board');
    expect(html).toContain('Persistent Browser Agent');
    expect(html).toContain('Auto Publish');
    expect(html).toContain('Auto Lead Capture');
    expect(html).toContain('Coupon Redemption');
    expect(html).toContain('Business Analysis');
    expect(html).toContain('Memory Follow-up');
    expect(html).toContain('provider-gated');
    expect(html).toContain('Resident AI Employee Loop');
    expect(html).toContain('Morning Brief');
    expect(html).toContain('Service Window Watch');
    expect(html).toContain('Closeout Memory');
    expect(html).toContain('Run Resident Heartbeat');
    expect(html).toContain('shift runs watched');
    expect(html).toContain('task wakeups');
    expect(html).toContain('Build Channel Hub');
    expect(html).toContain('Build Memory Pack');
    expect(html).toContain('Customer Operating Path');
    expect(html).toContain('Claw Experience Default Path');
    expect(html).toContain('Start here: one runnable path before expert tools');
    expect(html).toContain('Click once to create the restaurant brief');
    expect(html).toContain('Start Default Path');
    expect(html).toContain('Build Default Path');
    expect(html).toContain('Skill pack');
    expect(html).toContain('Task queue');
    expect(html).toContain('Staff handoff');
    expect(html).toContain('Provider gates');
    expect(html).toContain('merchant inputs to collect');
    expect(html).toContain('provider unlock sheet');
    expect(html).toContain('External execution only unlocks');
    expect(html).toContain('default path unlock package');
    expect(html).toContain('Default Path now creates Provider Setup Pack and External Unlock Request Pack.');
    expect(html).toContain('setup gates');
    expect(html).toContain('env placeholders');
    expect(html).toContain('signoff items');
    expect(html).toContain('merchant handoff copy');
    expect(html).toContain('owner signoff queue');
    expect(html).toContain('receipt + export digest');
    expect(html).toContain('Provider acceptance receipt template is created after Start Default Path.');
    expect(html).toContain('markdown + csv created on start');
    expect(html).toContain('competitor parity snapshot');
    expect(html).toContain('Internal execution now, external automation after Provider proof.');
    expect(html).toContain('Ready inside');
    expect(html).toContain('Provider gated');
    expect(html).toContain('Data gated');
    expect(html).toContain('controlled run receipt');
    expect(html).toContain('Start Default Path also runs one local simulator receipt.');
    expect(html).toContain('callback');
    expect(html).toContain('run health');
    expect(html).toContain('business signal');
    expect(html).toContain('browser runner simulation lane');
    expect(html).toContain('Default Path prepares the OpenClaw/Hermes browser gateway before real Provider execution.');
    expect(html).toContain('accepted actions');
    expect(html).toContain('runner loop');
    expect(html).toContain('next runner action');
    expect(html).toContain('provider readiness ladder');
    expect(html).toContain('Default Path now shows exactly which Claw/Cloud-style abilities are internal-ready and which need external Provider setup.');
    expect(html).toContain('automation claim');
    expect(html).toContain('external asks');
    expect(html).toContain('restaurant capability coverage map');
    expect(html).toContain('Default Path covers the restaurant AI product surface: public profile, content, publish proof, lead intake, coupon redemption and operating analysis.');
    expect(html).toContain('provider required');
    expect(html).toContain('pilot order');
    expect(html).toContain('restaurant AI cockpit zones');
    expect(html).toContain('Default Path now lands in an operator cockpit: today operations, AI consultant, automation launch and evidence review.');
    expect(html).toContain('daily runbook');
    expect(html).toContain('reservation redemption closeout loop');
    expect(html).toContain('Default Path now closes the loop from reservations and coupon claims into POS aggregate import, redemption review and next-shift actions.');
    expect(html).toContain('next-shift actions');
    expect(html).toContain('客户默认只走 6 步');
    expect(html).toContain('1 导入门店');
    expect(html).toContain('2 受控试跑');
    expect(html).toContain('3 刷新主控台');
    expect(html).toContain('4 时间线');
    expect(html).toContain('5 店长跟进');
    expect(html).toContain('生成任务和话术');
    expect(html).toContain('6 外部缺口');
    expect(html).toContain('Expert Runtime Tools');
    expect(html).toContain('Merchant Activation Packet');
    expect(html).toContain('发布链接');
    expect(html).toContain('到店跟进');
    expect(html).toContain('竞品能力覆盖');
    expect(html).toContain('常驻浏览器与工具权限');
    expect(html).toContain('主动跟进与失败恢复');
    expect(html).toContain('餐饮平台连接器');
    expect(html).toContain('自动发布、自动获客、自动核销的真实接入条件');
    expect(html).toContain('Lobu 多租户 Runtime');
    expect(html).toContain('POS / 核销 / 经营数据');
    expect(html).toContain('本地持久 Agent 账本');
    expect(html).toContain('签名 Runtime 回执入口');
    expect(html).toContain('失败恢复与重试编排');
    expect(html).toContain('隔离浏览器 Session Manifest');
    expect(html).toContain('商家授权与工具 Grant Manifest');
    expect(html).toContain('外部执行投递包');
    expect(html).toContain('Run Health 与回执验收面板');
    expect(html).toContain('外部 Runtime Health Probe');
    expect(html).toContain('Runtime Adapter Contract');
    expect(html).toContain('Browser Gateway Pack');
    expect(html).toContain('Competitor Training Blueprint');
    expect(html).toContain('Runner Loop Pack');
    expect(html).toContain('Resident Agent Control');
    expect(html).toContain('带 grant、browser session、callback 和停止条件的执行投递包');
    expect(html).toContain('酸菜鱼双人餐 15 秒到店脚本');
    expect(html).toContain('双人酸菜鱼晚餐到店活动');
    expect(html).toContain('写入菜品素材');
    expect(html).toContain('写入发布安排');

    for (const term of oldSurfaceTerms) {
      expect(html).not.toContain(term);
    }
  });

  it('carries the restaurant intake through the trial workflow links', async () => {
    const searchParams = Promise.resolve({
      variant: 'friend_trial',
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      audience: '附近写字楼午餐客',
      channels: '大众点评 / 微信社群',
      visitReason: '午餐快出餐',
      constraints: '不写最低价',
      evidence: '菜单截图已确认',
    });

    const overviewHtml = renderToStaticMarkup(await FactoryPage({ searchParams }));
    const createHtml = renderToStaticMarkup(await CreateFactoryPage({ searchParams }));
    const manageHtml = renderToStaticMarkup(await ManageFactoryPage({ searchParams }));
    const combinedHtml = `${overviewHtml}\n${createHtml}\n${manageHtml}`;

    expect(overviewHtml).toContain('Build Trial Workflow Pack');
    expect(overviewHtml).toContain('北城面馆');
    expect(overviewHtml).toContain('番茄牛腩面套餐');
    expect(overviewHtml).toContain('附近写字楼午餐客');
    expect(overviewHtml).toContain('大众点评 / 微信社群');
    expect(combinedHtml).toContain('北城面馆');
    expect(combinedHtml).toContain('番茄牛腩面套餐');
    expect(combinedHtml).toContain('附近写字楼午餐客');
    expect(combinedHtml).toContain('午餐快出餐');
    expect(combinedHtml).toContain('不写最低价');
    expect(combinedHtml).toContain('菜单截图已确认');
    expect(combinedHtml).toContain('restaurant=%E5%8C%97%E5%9F%8E%E9%9D%A2%E9%A6%86');
    expect(combinedHtml).toContain('offer=%E7%95%AA%E8%8C%84%E7%89%9B%E8%85%A9%E9%9D%A2%E5%A5%97%E9%A4%90');
    expect(createHtml).toContain('action="/factory/video"');
  });
});
