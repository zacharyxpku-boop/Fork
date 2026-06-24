import { describe, expect, it } from 'vitest';
import {
  POC_REPORT_STANDARD_PACK_ROUTE,
  POC_STANDARD_PACK_ROUTE,
  buildAbTestStandardPackRoute,
  buildAIVideoStandardPackRoute,
  buildBatchLaunchStandardPackRoute,
  buildCustomerServiceStandardPackRoute,
  buildDataInsightsStandardPackRoute,
  buildIntentMiningStandardPackRoute,
  buildInfluencerOutboundStandardPackRoute,
  buildInquiryStandardPackRoute,
  buildInquiryStandardPackPrefill,
  buildNewListingStandardPackRoute,
  buildPocReportRoute,
  buildPocReportStandardPackRoute,
  buildPhotoshootStandardPackRoute,
  buildProductDiscoveryStandardPackRoute,
  buildProductImageStandardPackRoute,
  buildStandardPackRoute,
  buildVideoTeardownStandardPackRoute,
} from '@/lib/standard-pack-routing';

describe('standard pack routing', () => {
  it('builds a route with encoded standard-pack context', () => {
    const route = buildStandardPackRoute({
      workflow: 'slideshow-batch',
      goal: 'test goal',
      brand: 'brand / shop',
      sku: 'sku line',
      links: 'https://example.com/a',
    });

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(route).toContain('workflow=slideshow-batch');
    expect(route).toContain('goal=test+goal');
    expect(route).toContain('links=https%3A%2F%2Fexample.com%2Fa');
  });

  it('keeps canonical POC entry routes pointed at the SOP module', () => {
    expect(POC_STANDARD_PACK_ROUTE).toContain('/modules/standard-pack?');
    expect(POC_STANDARD_PACK_ROUTE).toContain('workflow=benchmark');
    const pocParams = new URLSearchParams(POC_STANDARD_PACK_ROUTE.split('?')[1]);
    expect(pocParams.get('sku')).toContain('真实菜品/套餐/活动');

    expect(POC_REPORT_STANDARD_PACK_ROUTE).toContain('/modules/standard-pack?');
    const reportParams = new URLSearchParams(POC_REPORT_STANDARD_PACK_ROUTE.split('?')[1]);
    expect(reportParams.get('goal')).toContain('合同判断');
    expect(reportParams.get('brand')).toContain('餐饮门店增长 POC');
  });

  it('builds new-listing standard pack routes with bounded URL payloads', () => {
    const longSku = `核心菜品 ${'长卖点 '.repeat(520)}`;
    const route = buildNewListingStandardPackRoute({
      categoryLabel: '川菜套餐',
      skuInput: longSku,
      mode: 'single',
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('川菜套餐 菜品/套餐');
    expect(params.get('sku')).toContain('核心菜品');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('sku')).toMatch(/\.\.\.$/);
  });

  it('passes completed new-listing summaries as bounded context', () => {
    const route = buildNewListingStandardPackRoute({
      categoryLabel: '午市套餐',
      skuInput: '双人酸菜鱼套餐 - 工作日晚餐 - ¥128',
      mode: 'batch',
      resultSummary: `翻译完成\n${'合规摘要 '.repeat(160)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('brand')).toContain('批量活动模式');
    expect(params.get('links')).toContain('翻译完成');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
    expect(params.get('links')).toMatch(/\.\.\.$/);
  });

  it('builds bounded poc-report routes from pipeline recap metrics', () => {
    const route = buildPocReportRoute({
      skuPlanned: 12.6,
      skuDelivered: 9.2,
      finalReviewPassRate: 104,
      benchmarkCoverage: -5,
      riskCount: 3,
      missingAssetCount: 2,
      reworkCount: 4,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: false,
      source: 'new-listing-batch',
      categoryLabel: 'home storage accessories'.repeat(10),
      benchmarkPreset: 'creative-test',
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/poc\/report\?/);
    expect(params.get('skuPlanned')).toBe('13');
    expect(params.get('skuDelivered')).toBe('9');
    expect(params.get('finalReviewPassRate')).toBe('100');
    expect(params.get('benchmarkCoverage')).toBe('0');
    expect(params.get('contentTestReady')).toBe('1');
    expect(params.get('ownerReady')).toBe('1');
    expect(params.get('contractIntent')).toBe('0');
    expect(params.get('from')).toBe('new-listing-batch');
    expect(params.get('category')!.length).toBeLessThanOrEqual(80);
    expect(params.get('benchmarkPreset')).toBe('creative-test');
  });

  it('builds dynamic standard packs from current poc-report metrics', () => {
    const route = buildPocReportStandardPackRoute({
      skuPlanned: 10,
      skuDelivered: 9,
      finalReviewPassRate: 84,
      benchmarkCoverage: 81,
      riskCount: 1,
      missingAssetCount: 0,
      reworkCount: 1,
      contentTestReady: true,
      ownerReady: true,
      contractIntent: true,
      decisionLabel: 'push contract',
      nextStep: 'book final review and move to paid contract',
      source: 'new-listing-batch',
      categoryLabel: 'home storage',
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('contract-ready');
    expect(params.get('brand')).toContain('Restaurant POC Report');
    expect(params.get('brand')).toContain('home storage');
    expect(params.get('sku')).toContain('offers delivered: 9');
    expect(params.get('links')).toContain('decision: push contract');
    expect(params.get('links')).toContain('contract intent: yes');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds inquiry routes from submitted lead context', () => {
    const route = buildInquiryStandardPackRoute({
      company: '南城川味小馆',
      scale: '50-200',
      category: '川菜',
      skuCount: '10',
      platforms: '大众点评 + 小红书 + 微信社群',
      assetsReady: 'ready',
      expectedDeliverables: '菜品图方向 / benchmark / slideshow',
      creativeNeeds: 'slideshow-batch',
      benchmarkLinks: 'https://example.com/tiktok',
      painPoint: '想验证 10 个菜品/套餐的本地内容 SOP 和到店跟进是否能减少返工',
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('slideshow-batch');
    expect(params.get('goal')).toContain('菜品图方向');
    expect(params.get('brand')).toContain('南城川味小馆');
    expect(params.get('brand')).toContain('大众点评 + 小红书 + 微信社群');
    expect(params.get('sku')).toContain('10 个菜品/套餐/活动');
    expect(params.get('links')).toContain('https://example.com/tiktok');
  });

  it('builds reusable inquiry prefill for admin scoring and routing', () => {
    const prefill = buildInquiryStandardPackPrefill({
      company: '南城川味小馆',
      scale: '50-200',
      category: '川菜',
      skuCount: '10',
      platforms: '大众点评 + 小红书 + 微信社群',
      assetsReady: 'ready',
      expectedDeliverables: '7 天验收复盘, 判断是否进入门店运营合同',
      creativeNeeds: 'slideshow-batch',
      benchmarkLinks: 'https://example.com/tiktok',
      painPoint: '想验证 10 个菜品/套餐的本地内容 SOP 和到店跟进是否能减少返工',
    });

    expect(prefill.workflow).toBe('slideshow-batch');
    expect(prefill.goal).toContain('门店运营合同');
    expect(prefill.brand).toContain('南城川味小馆');
    expect(prefill.sku).toContain('10 个菜品/套餐/活动');
    expect(prefill.links).toContain('https://example.com/tiktok');
  });

  it('builds bounded data-insights review routes', () => {
    const route = buildDataInsightsStandardPackRoute({
      channelLabel: '大众点评',
      period: 'week',
      context: '工作日晚餐双人套餐',
      dataInput: `核心数据 ${'点击 2.3 券领取 57 私信 4 到店反馈 '.repeat(80)}`,
      resultSummary: `overall win\n${'P0 action '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('acceptance-ready POC recap');
    expect(params.get('brand')).toContain('大众点评');
    expect(params.get('sku')).toContain('核心数据');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('overall win');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded ab-test standard pack routes', () => {
    const route = buildAbTestStandardPackRoute({
      platformLabel: '小红书',
      productHint: `核心测款套餐 ${'到店钩子 菜品图 团购券 '.repeat(120)}`,
      dailyBudget: 500,
      primaryDimension: 'hook',
      resultSummary: `recommended A1/B2/C3\n${'CTR threshold '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('AB test result');
    expect(params.get('brand')).toContain('小红书');
    expect(params.get('brand')).toContain('budget 500');
    expect(params.get('sku')).toContain('核心测款套餐');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('recommended A1/B2/C3');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded photoshoot standard pack routes', () => {
    const route = buildPhotoshootStandardPackRoute({
      modeLabel: '菜品棚拍',
      productHint: '双人酸菜鱼套餐',
      prompt: `工业级 prompt ${'热气 菜品近景 门店桌面 真实分量 '.repeat(100)}`,
      quality: 'high',
      size: '1024x1536',
      count: 4,
      resultSummary: `generated 4 images\n${'candidate accepted '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('image production run');
    expect(params.get('brand')).toContain('AI Photoshoot');
    expect(params.get('brand')).toContain('菜品棚拍');
    expect(params.get('brand')).toContain('4 images');
    expect(params.get('sku')).toContain('工业级 prompt');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('generated 4 images');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded product-image standard pack routes', () => {
    const route = buildProductImageStandardPackRoute({
      categoryLabel: '川菜套餐',
      sceneLabel: '门店餐桌',
      skuInput: `核心菜品信息 ${'酸菜鱼 双人套餐 到店理由 团购券 '.repeat(100)}`,
      outputs: ['菜品图', '门店图', '团购券海报'],
      resultSummary: `generated 3 images\n${'prompt approved '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('餐饮图片交付包');
    expect(params.get('brand')).toContain('餐饮图片交付');
    expect(params.get('brand')).toContain('川菜套餐');
    expect(params.get('brand')).toContain('门店餐桌');
    expect(params.get('sku')).toContain('核心菜品信息');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('generated 3 images');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded customer-service conversion routes', () => {
    const route = buildCustomerServiceStandardPackRoute({
      intentLabel: '价格异议',
      customerMessage: `顾客原话 ${'团购券能不能便宜一点 周末能用吗 需要排队吗 '.repeat(100)}`,
      languageLabel: '中文',
      shopContext: `大众点评 / 川菜 / ${'会员券有效 核销规则待确认 '.repeat(40)}`,
      orderContext: 'coupon-10086',
      resultSummary: `convert reply accepted\n${'next hook '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('restaurant follow-up result');
    expect(params.get('brand')).toContain('到店跟进');
    expect(params.get('brand')).toContain('价格异议');
    expect(params.get('brand')).toContain('中文');
    expect(params.get('brand')).toContain('coupon-10086');
    expect(params.get('sku')).toContain('顾客原话');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('convert reply accepted');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded influencer-outbound routes', () => {
    const route = buildInfluencerOutboundStandardPackRoute({
      brand: '南城川味小馆',
      productName: '双人酸菜鱼套餐',
      price: '¥128',
      usp: `工作日晚餐 / 到店套餐 / ${'无需排队 店长确认核销边界 '.repeat(40)}`,
      budget: '到店体验 + 素材授权',
      cta: '1 条小红书笔记 + 1 条抖音短视频',
      influencerInput: `creator batch\n${'@creator | 小红书 | 5W | 本地探店 '.repeat(80)}`,
      resultSummary: `5 emails generated\n${'subject approved '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('creator outreach');
    expect(params.get('brand')).toContain('Influencer Outbound');
    expect(params.get('brand')).toContain('南城川味小馆');
    expect(params.get('brand')).toContain('双人酸菜鱼套餐');
    expect(params.get('sku')).toContain('creator list:');
    expect(params.get('sku')).toContain('creator batch');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('5 emails generated');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded video-teardown standard pack routes', () => {
    const route = buildVideoTeardownStandardPackRoute({
      templateLabel: '本地探店',
      productHint: `core restaurant offer ${'酸菜鱼 到店理由 工作日晚餐 团购券 '.repeat(120)}`,
      videoContext: 'uploaded 6.4MB competitor Douyin restaurant video',
      resultSummary: `hook demo / fast pacing / end CTA\n${'scene prompt accepted '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('video teardown');
    expect(params.get('brand')).toContain('Video Teardown');
    expect(params.get('brand')).toContain('本地探店');
    expect(params.get('sku')).toContain('core restaurant offer');
    expect(params.get('sku')).toContain('reference video');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('hook demo');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded ai-video standard pack routes', () => {
    const route = buildAIVideoStandardPackRoute({
      scenarioLabel: 'Dish Display',
      productHint: `酸菜鱼套餐 ${'热气 菜品近景 门店餐桌 到店CTA '.repeat(60)}`,
      imageUrl: 'https://cdn.example.com/source-image.png',
      prompt: `final motion prompt ${'camera hold soft light product focus '.repeat(100)}`,
      duration: 5,
      resolution: '1080P',
      model: 'wanx2.1-i2v-plus',
      resultSummary: `video accepted / cache miss / ¥7.0\n${'cta timing approved '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('animated-ads');
    expect(params.get('goal')).toContain('AI video run');
    expect(params.get('brand')).toContain('AI Video');
    expect(params.get('brand')).toContain('Dish Display');
    expect(params.get('brand')).toContain('1080P');
    expect(params.get('sku')).toContain('source image:');
    expect(params.get('sku')).toContain('final motion prompt');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('video accepted');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded batch-launch standard pack routes', () => {
    const route = buildBatchLaunchStandardPackRoute({
      platformLabel: '大众点评 + 小红书 + 抖音',
      brandContext: `南城川味小馆 ${'工作日晚餐 双人套餐 本地生活 '.repeat(20)}`,
      skuInput: `offer batch\n${'酸菜鱼套餐 - 工作日晚餐 - 团购券 '.repeat(80)}`,
      skuCount: 18,
      stages: ['选品验证', 'AI 影棚', '内容拆解包', 'A-B 测试'],
      resultSummary: `coverage 82 / risk 2 / checklist 5\n${'review owner assigned '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('slideshow-batch');
    expect(params.get('goal')).toContain('acceptance-ready POC recap');
    expect(params.get('brand')).toContain('Restaurant Batch Launch');
    expect(params.get('brand')).toContain('大众点评 + 小红书 + 抖音');
    expect(params.get('sku')).toContain('活动数量: 18');
    expect(params.get('sku')).toContain('selected stages:');
    expect(params.get('sku')).toContain('dish / offer preview:');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('coverage 82');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds bounded product-discovery standard pack routes', () => {
    const route = buildProductDiscoveryStandardPackRoute({
      platformLabel: '大众点评',
      category: '川菜套餐',
      priceMin: 39,
      priceMax: 129,
      budget: 120000,
      riskLabel: 'high risk / blue ocean',
      extraNote: `need fast content flywheel ${'ugc seeding creator angle '.repeat(40)}`,
      skuContext: `existing offer library\n${'酸菜鱼 / 毛血旺 / 双人套餐 '.repeat(60)}`,
      resultSummary: `winner: weekday fish set\n${'margin 68 competition medium rising demand '.repeat(80)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('benchmark');
    expect(params.get('goal')).toContain('dish/offer discovery result');
    expect(params.get('brand')).toContain('Restaurant Offer Discovery');
    expect(params.get('brand')).toContain('大众点评');
    expect(params.get('brand')).toContain('川菜套餐');
    expect(params.get('sku')).toContain('category: 川菜套餐');
    expect(params.get('sku')).toContain('existing dish / offer context');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('winner: weekday fish set');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });

  it('builds intent-mining routes for audience-to-content packs', () => {
    const route = buildIntentMiningStandardPackRoute({
      product: `双人酸菜鱼套餐 ${'工作日晚餐 附近白领 到店理由 团购券 '.repeat(80)}`,
      knownSegments: '家庭聚餐, 公司团建, 生日宴',
      resultSummary: `segments: late office workers, gym studios, nearby couples\n${'Douyin hook carousel test podcast ugc '.repeat(120)}`,
    });
    const params = new URLSearchParams(route.split('?')[1]);

    expect(route).toMatch(/^\/modules\/standard-pack\?/);
    expect(params.get('workflow')).toBe('slideshow-batch');
    expect(params.get('goal')).toContain('local diner audience-to-content test pack');
    expect(params.get('brand')).toContain('Intent Mining');
    expect(params.get('brand')).toContain('audience validation recap');
    expect(params.get('sku')).toContain('双人酸菜鱼套餐');
    expect(params.get('sku')).toContain('已知/默认客群排除');
    expect(params.get('sku')!.length).toBeLessThanOrEqual(1200);
    expect(params.get('links')).toContain('segments: late office workers');
    expect(params.get('links')!.length).toBeLessThanOrEqual(800);
  });
});
