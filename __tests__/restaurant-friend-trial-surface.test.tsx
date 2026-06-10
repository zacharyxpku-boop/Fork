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
  'analytics sync',
  'Cast Distribution Variant',
  'Ad Delivery Guardrails',
  'Manual Publish Receipt Board',
  'Channel Matrix',
  'download-ready',
  'share-ready',
  'Manage Operations Variant',
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
    expect(html).toContain('门店今天就能试跑');
    expect(html).toContain('本地门店试跑入口');
    expect(html).toContain('href="#restaurant-trial-spine"');
    expect(html).toContain('id="restaurant-trial-spine"');
    expect(html).toContain('今日任务包');
    expect(html).toContain('证据回执');
    expect(html).toContain('Restaurant Content Delivery Kit');
    expect(html).toContain('餐饮探店短视频交付包');
    expect(html).toContain('B-roll 素材');
    expect(html).toContain('发布证明');
    expect(html).toContain('店长审核');
    expect(html).toContain('经营汇总');
    expect(html).toContain('发布代办清单');
    expect(html).toContain('先看今天能做啥');
    expect(html).toContain('直接告诉老板今天能先做哪几件事');
    expect(html).toContain('生成试跑工单');
    expect(html).toContain('补缺的资料');
    expect(html).toContain('不用等接口 key，先列出还差哪些截图或表格');
    expect(html).toContain('看回收结果');
    expect(html).toContain('不承诺爆单，只跑清楚第一轮');
    expect(html).toContain('第一次使用，只走 3 步');
    expect(html).toContain('1 家门店、1 个爆品、1 个到店理由。');
    expect(html).toContain('填门店和本次活动');
    expect(html).toContain('生成今天能执行的方案');
    expect(html).toContain('交给店长跟进');
    expect(html).toContain('门店试跑主流程');
    expect(html).toContain('五段试跑主链路');
    expect(html).toContain('trial-input -&gt; standard-pack -&gt; content-production -&gt; publish-proof -&gt; ops-followup');
    expect(html).toContain('trial-intake');
    expect(html).toContain('standard-pack');
    expect(html).toContain('content-production');
    expect(html).toContain('publish-proof');
    expect(html).toContain('ops-followup');
    expect(html).toContain('标准交付包');
    expect(html).toContain('内容/素材生产');
    expect(html).toContain('发布凭证');
    expect(html).toContain('线索/店长跟进');
    expect(html).toContain('proof-slots:');
    expect(html).toContain('followup-tasks:');
    expect(html).toContain('内部产包、凭证槽和任务队列先跑通');
    expect(html).toContain('确认账号后再记录真实步骤');
    expect(html).toContain('Merchant platform authorization before platform reads or publishing.');
    expect(html).toContain('restaurant-agent-runtime');
    expect(html).toContain('20 模块 / 200 技能 / 60 工具，逐项标注能否现在执行');
    expect(html).toContain('内部能力清单');
    expect(html).toContain('模块 / 技能 / 工具');
    expect(html).toContain('内部可用 / 待训练 / 等账号资料');
    expect(html).toContain('训练：');
    expect(html).toContain('外部账号：补齐账号、截图或经营表格后解锁');
    expect(html).toContain('试用路径');
    expect(html).toContain('填门店任务');
    expect(html).toContain('生成今日工单');
    expect(html).toContain('补缺的资料');
    expect(html).toContain('真实餐饮场景，即刻体验');
    expect(html).toContain('菜单定价与结构分析');
    expect(html).toContain('外卖活动方案设计');
    expect(html).toContain('财务报表解读与诊断');
    expect(html).toContain('把确认过的门店经验记下来');
    expect(html).toContain('深度分层记忆');
    expect(html).toContain('沙箱安全隔离');
    expect(html).toContain('上线前需要准备');
    expect(html).toContain('公开资料和门店素材');
    expect(html).toContain('竞品能力训练与接入矩阵');
    expect(html).toContain('跨平台经营问答');
    expect(html).toContain('发布执行与回执');
    expect(html).toContain('线索承接与社群跟进');
    expect(html).toContain('核销与真实经营分析');
    expect(html).toContain('需要训练材料');
    expect(html).toContain('外部账号 / 权限');
    expect(html).toContain('验收标准');
    expect(html).toContain('生成能力训练计划');
    expect(html).toContain('生成试跑工作流');
    expect(html).toContain('加载 Claw 能力库');
    expect(html).toContain('判断产品底座');
    expect(html).toContain('生成 Claw 训练批次');
    expect(html).toContain('生成平台经营主链');
    expect(html).toContain('生成经营数据规则');
    expect(html).toContain('补资料包');
    expect(html).toContain('交付包');
    expect(html).toContain('验收字段');
    expect(html).toContain('导出摘要');
    expect(html).toContain('外部执行补资料向导');
    expect(html).toContain('受控试跑');
    expect(html).toContain('执行时间线');
    expect(html).toContain('今天这张门店工单');
    expect(html).toContain('把活动、内容、发布凭证和店长跟进排成一张可执行清单');
    expect(html).toContain('能力清单');
    expect(html).toContain('老板先看今天能做什么，内部再看底层能力是否齐全');
    expect(html).toContain('门店工单主控台');
    expect(html).toContain('先跑一张受控试单，再看凭证、跟进和还缺什么资料');
    expect(html).toContain('已回填凭证');
    expect(html).toContain('待补资料');
    expect(html).toContain('渠道回收');
    expect(html).toContain('门店指令拆解');
    expect(html).toContain('一句店长的话，拆成内部动作、发布凭证和待补资料');
    expect(html).toContain('生成今日工单');
    expect(html).toContain('拆解门店指令');
    expect(html).toContain('生成经营计划');
    expect(html).toContain('内部高级工具');
    expect(html).toContain('架构判断');
    expect(html).toContain('kuaizi-platform-spine-plus-claw-agent-layer');
    expect(html).toContain('能力总览台');
    expect(html).toContain('本地能力、训练缺口与待补资料');
    expect(html).toContain('生成能力总览');
    expect(html).toContain('能力工单台');
    expect(html).toContain('选一个门店技能，拿一个可执行任务包');
    expect(html).toContain('内容上新包');
    expect(html).toContain('私域跟进包');
    expect(html).toContain('券码与POS包');
    expect(html).toContain('代办治理包');
    expect(html).toContain('打开能力工单');
    expect(html).toContain('公开情报简报');
    expect(html).toContain('门店事实、本地平台、素材缺口');
    expect(html).toContain('导入公开门店资料');
    expect(html).toContain('账号和资料补齐向导');
    expect(html).toContain('账号确认、店长授权、员工通道、经营表格');
    expect(html).toContain('生成补资料向导');
    expect(html).toContain('保存补资料状态');
    expect(html).toContain('外部条件可用性');
    expect(html).toContain('检查外部条件');
    expect(html).toContain('员工通道清单');
    expect(html).toContain('对话指令、定时任务、待补资料');
    expect(html).toContain('生成员工通道清单');
    expect(html).toContain('尝试员工送达');
    expect(html).toContain('运行到期任务');
    expect(html).toContain('AI 店员收件箱');
    expect(html).toContain('Wenai 门店操作员');
    expect(html).toContain('先跑一张受控试单，再看凭证、跟进和还缺什么资料');
    expect(html).toContain('运行试跑');
    expect(html).toContain('打开时间线');
    expect(html).toContain('查看补资料条件');
    expect(html).toContain('今日店长任务');
    expect(html).toContain('生成任务包');
    expect(html).toContain('等待已验收回执');
    expect(html).toContain('刷新中心');
    expect(html).toContain('restaurant-agent-command-center-v1');
    expect(html).toContain('今日门店工单');
    expect(html).toContain('店总指挥台');
    expect(html).toContain('开班指令');
    expect(html).toContain('AI 自动队列');
    expect(html).toContain('班次自动巡航');
    expect(html).toContain('跑完整班次循环');
    expect(html).toContain('运行班次自动巡航');
    expect(html).toContain('生成代办交接');
    expect(html).toContain('检查沙箱验收');
    expect(html).toContain('生成首轮可转发试跑');
    expect(html).toContain('提交班次沙箱试跑');
    expect(html).toContain('收尾并训练');
    expect(html).toContain('记录训练');
    expect(html).toContain('激活包');
    expect(html).toContain('当前队列');
    expect(html).toContain('下次唤醒');
    expect(html).toContain('对标路线判断');
    expect(html).toContain('生成路线判断');
    expect(html).toContain('平台主干 + 操作体验 + 通道/数据约定');
    expect(html).toContain('最终产品形态');
    expect(html).toContain('产品底座');
    expect(html).toContain('操作层');
    expect(html).toContain('补资料条件');
    expect(html).toContain('不要照抄');
    expect(html).toContain('UI/UX');
    expect(html).toContain('竞品对照板');
    expect(html).toContain('常驻浏览器代办');
    expect(html).toContain('代发布');
    expect(html).toContain('代接线索');
    expect(html).toContain('券码核销');
    expect(html).toContain('经营分析');
    expect(html).toContain('门店记忆跟进');
    expect(html).toContain('本地能做');
    expect(html).toContain('还需外部');
    expect(html).toContain('常驻店员循环');
    expect(html).toContain('早班简报');
    expect(html).toContain('服务时段巡视');
    expect(html).toContain('收尾记忆');
    expect(html).toContain('运行常驻心跳');
    expect(html).toContain('已巡视班次');
    expect(html).toContain('任务唤醒');
    expect(html).toContain('生成员工通道清单');
    expect(html).toContain('生成门店记忆包');
    expect(html).toContain('客户经营路径');
    expect(html).toContain('第一次试跑路径');
    expect(html).toContain('先跑一张门店工单，再看高级工具');
    expect(html).toContain('点击一次生成门店简报');
    expect(html).toContain('从这里开始');
    expect(html).toContain('生成第一张工单');
    expect(html).toContain('任务能力包');
    expect(html).toContain('负责人队列');
    expect(html).toContain('店长交接');
    expect(html).toContain('补资料条件');
    expect(html).toContain('需要店长确认');
    expect(html).toContain('代办解锁表');
    expect(html).toContain('门店任务助手首页');
    expect(html).toContain('老板先看一张工单，高级工具放下面。');
    expect(html).toContain('生成门店建议');
    expect(html).toContain('待补资料');
    expect(html).toContain('店长可转发简报');
    expect(html).toContain('一页交接给店长、运营和技术复核。');
    expect(html).toContain('店长转发文案');
    expect(html).toContain('没有已验收凭证，不承诺外部代办已经完成。');
    expect(html).toContain('只有账号确认、回填凭证、经营汇总和数据边界都齐了');
    expect(html).toContain('补资料清单');
    expect(html).toContain('第一张工单会同时生成账号确认、资料补齐和签收清单。');
    expect(html).toContain('待补条件');
    expect(html).toContain('服务端配置项');
    expect(html).toContain('签收项');
    expect(html).toContain('商户交接文案');
    expect(html).toContain('负责人签收队列');
    expect(html).toContain('回执和导出摘要');
    expect(html).toContain('点击后生成代办验收回执模板。');
    expect(html).toContain('点击后生成 markdown + csv');
    expect(html).toContain('能力对齐快照');
    expect(html).toContain('现在先跑本地工单，真实代办等凭证齐全后再开。');
    expect(html).toContain('可先做');
    expect(html).toContain('待补账号');
    expect(html).toContain('待补数据');
    expect(html).toContain('本地试跑回执');
    expect(html).toContain('第一张工单会同时生成一份本地试跑回执。');
    expect(html).toContain('回执');
    expect(html).toContain('试跑健康');
    expect(html).toContain('经营信号');
    expect(html).toContain('受控浏览器试跑');
    expect(html).toContain('第一张工单会先准备受控浏览器操作清单，真实外部动作等资料齐全后再执行。');
    expect(html).toContain('允许动作');
    expect(html).toContain('执行循环');
    expect(html).toContain('下一步浏览器动作');
    expect(html).toContain('发布任务收件箱');
    expect(html).toContain('第一张工单会把发布、受控浏览器、回执、异常恢复和门店记忆整理成一个执行队列。');
    expect(html).toContain('发布代办');
    expect(html).toContain('浏览器代办');
    expect(html).toContain('代办验收工作台');
    expect(html).toContain('第一张工单会把账号确认、店长授权、浏览器环境、回填凭证、数据边界和试跑回执整理成验收清单。');
    expect(html).toContain('交给执行方的资料');
    expect(html).toContain('资料就绪阶梯');
    expect(html).toContain('外部接入指南');
    expect(html).toContain('补资料清单会按负责人、要补什么、解锁什么、凭证和停止线整理给店长。');
    expect(html).toContain('已脱敏:');
    expect(html).toContain('第一次试跑路径会明确标出哪些能力本地可做，哪些还需要账号、授权或回执。');
    expect(html).toContain('可否代办');
    expect(html).toContain('待补资料');
    expect(html).toContain('常驻门店任务板');
    expect(html).toContain('第一张工单会打开今日任务板：任务主控、营业节奏、记忆提醒和待补资料。');
    expect(html).toContain('记忆提醒');
    expect(html).toContain('门店能力覆盖图');
    expect(html).toContain('默认路径覆盖门店 AI 产品面：公开主页、内容、发布凭证、线索承接、券码核销和经营分析。');
    expect(html).toContain('需要外部资料');
    expect(html).toContain('试点顺序');
    expect(html).toContain('门店数据导入中心');
    expect(html).toContain('默认路径已对齐真实门店数据源：公开主页、发布凭证、预约、券码核销、POS 销售、会员、库存和毛利。');
    expect(html).toContain('缺必填');
    expect(html).toContain('线索收件箱');
    expect(html).toContain('默认路径把预约、领券、私域咨询、到店意向和差评挽回收进一个受控线索队列。');
    expect(html).toContain('代接线索');
    expect(html).toContain('顾客触达');
    expect(html).toContain('线索承接工作台');
    expect(html).toContain('默认路径把线索承接变成可验收的外部对接路径，覆盖预约、领券、私域咨询、到店意向和差评挽回。');
    expect(html).toContain('lead-acquisition-receipt');
    expect(html).toContain('线索沙箱验收流');
    expect(html).toContain('外部提交有一条受控路径：脱敏任务包、签名线索回执、失败回执恢复、员工审核和只进汇总的记忆门槛。');
    expect(html).toContain('aggregate-only-after-accepted-receipt');
    expect(html).toContain('今日指挥台');
    expect(html).toContain('默认路径把门店 AI 面收成四条链路：获客、发布凭证、核销/POS、复盘/训练。');
    expect(html).toContain('accepted-proof-or-sanitized-aggregate-only');
    expect(html).toContain('外部对接合同包');
    expect(html).toContain('外部对接拆成六份约定：试跑通道、平台凭证、线索承接、员工下发、POS 核销和模型智能。');
    expect(html).toContain('server-env-or-secret-manager-only');
    expect(html).toContain('门店操作台分区');
    expect(html).toContain('默认路径最终落在一个操作台，今日运营、AI 经营顾问、真实代办启动和凭证复核。');
    expect(html).toContain('每日执行清单');
    expect(html).toContain('预约核销收尾闭环');
    expect(html).toContain('默认路径把预约和领券闭环到 POS 汇总导入、核销复盘和下一班动作。');
    expect(html).toContain('下一班动作');
    expect(html).toContain('口碑与服务恢复闭环');
    expect(html).toContain('公开评价、评论主题和服务问题会变成店长审核的回复、恢复任务和下一轮内容。');
    expect(html).toContain('自动回评');
    expect(html).toContain('服务恢复');
    expect(html).toContain('客户默认只走 6 步');
    expect(html).toContain('1 导入门店');
    expect(html).toContain('2 受控试跑');
    expect(html).toContain('3 刷新主控台');
    expect(html).toContain('4 时间线');
    expect(html).toContain('5 店长跟进');
    expect(html).toContain('生成任务和话术');
    expect(html).toContain('6 外部缺口');
    expect(html).toContain('内部工具列表，老板可先跳过');
    expect(html).toContain('门店启动资料包');
    expect(html).toContain('发布链接');
    expect(html).toContain('到店跟进');
    expect(html).toContain('能力清单');
    expect(html).toContain('老板可见');
    expect(html).toContain('发布凭证');
    expect(html).toContain('门店记忆');
    expect(html).toContain('店长跟进');
    expect(html).toContain('账号确认');
    expect(html).toContain('没确认前只生成操作清单，不冒充已执行。');
    expect(html).toContain('接入检查 1');
    expect(html).toContain('给运营和技术复核使用：确认这类外部动作现在是可内部生成、待补资料，还是必须人工交接。');
    expect(html).toContain('老板只需要看上面的发布凭证、门店记忆、店长跟进和账号确认。');
    expect(html).toContain('跟进助手');
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

    expect(overviewHtml).toContain('生成试跑工作流');
    expect(overviewHtml).toContain('北城面馆');
    expect(overviewHtml).toContain('番茄牛腩面套餐');
    expect(overviewHtml).toContain('附近写字楼午餐客');
    expect(overviewHtml).toContain('大众点评 / 微信社群');
    expect(overviewHtml).toContain('门店试跑主流程');
    expect(overviewHtml).toContain('trial-input -&gt; standard-pack -&gt; content-production -&gt; publish-proof -&gt; ops-followup');
    expect(overviewHtml).toContain('proof-slots:');
    expect(overviewHtml).toContain('followup-tasks:');
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
