import { describe, expect, it } from 'vitest';
import {
  buildStandardPack,
  formatStandardPackFollowup,
  formatStandardPackMarkdown,
  formatStandardPackOpsBrief,
  formatStandardPackReport,
  getStandardPackExecutionPlan,
  recommendWorkflowId,
  scoreStandardPackReadiness,
} from '@/lib/sop-workflows';

describe('sop workflow engine', () => {
  it('recommends workflow from natural language', () => {
    expect(recommendWorkflowId('做 podcast 口播种草')).toBe('podcast-ugc');
    expect(recommendWorkflowId('需要街采路人采访')).toBe('street-interview');
    expect(recommendWorkflowId('做 slideshow reels 批量测试')).toBe('slideshow-batch');
  });

  it('builds a standard pack with missing input gates', () => {
    const pack = buildStandardPack({
      goal: '测试 TikTok Hook',
      brand: '',
      sku: '厨房收纳盒',
      links: '',
    });

    expect(pack.workflow.id).toBe('benchmark');
    expect(pack.missingInputs).toContain('餐厅 / 门店上下文');
    expect(pack.missingInputs).toContain('benchmark URL / 竞品门店账号 / 评论或截图证据');
    expect(pack.readiness.decision).toBe('needs-info');
    expect(pack.readiness.acceptanceScore).toBeLessThan(80);
    expect(pack.sections.some(section => section.title.includes('验收标准'))).toBe(true);
  });

  it('scores POC readiness for contract-grade standard packs', () => {
    const readiness = scoreStandardPackReadiness({
      goal: '10 dish restaurant POC for 大众点评 and 小红书, review acceptance, coupon claims and 7 day test recap before contract',
      brand: '南城川味小馆 with 店长 review, compliance and 核销 rules needed',
      sku: '10 个菜品/套餐 batch: 酸菜鱼套餐, 毛血旺套餐, 工作日晚餐券, with price band and 到店 reasons',
      links: 'https://example.com/dianping https://example.com/xiaohongshu',
      workflowId: 'slideshow-batch',
    }, []);

    expect(readiness.decision).toBe('ready-for-poc');
    expect(readiness.leadScore).toBeGreaterThanOrEqual(80);
    expect(readiness.acceptanceScore).toBeGreaterThanOrEqual(80);
    expect(readiness.contractReadiness).toBeGreaterThanOrEqual(70);
    expect(readiness.nextStepLabel).toContain('运营合同');
    expect(readiness.strengths.join(' ')).toContain('门店活动测试包');
    expect(readiness.reviewChecklist.length).toBeGreaterThanOrEqual(4);
  });

  it('formats markdown as a stable deliverable', () => {
    const pack = buildStandardPack({
      goal: '做 7 天内容测试',
      brand: '南城川味小馆',
      sku: '双人酸菜鱼套餐',
      links: 'https://example.com/video',
      workflowId: 'slideshow-batch',
    });

    const md = formatStandardPackMarkdown(pack);
    expect(md).toContain('# wenai Slideshow / Reels 批量测试 标准交付包');
    expect(md).toContain('## 04 验收标准');
    expect(md).toContain('## 07 POC 准入与复盘判断');
    expect(md).toContain('## 08 商业推进动作');
    expect(md).toContain('验收准备度');
    expect(md).toContain('合同准备度');
    expect(md).toContain('## 下一步');
  });

  it('formats customer-ready report, ops brief, and followup assets', () => {
    const pack = buildStandardPack({
      goal: '10 dish restaurant POC for 大众点评, review acceptance and contract decision',
      brand: '南城川味小馆 with 店长 review',
      sku: '10 个菜品/套餐 batch: 酸菜鱼套餐, 毛血旺套餐, 工作日晚餐券',
      links: 'https://example.com/dianping https://example.com/xiaohongshu',
      workflowId: 'slideshow-batch',
    });

    const report = formatStandardPackReport(pack);
    const brief = formatStandardPackOpsBrief(pack);
    const followup = formatStandardPackFollowup(pack);

    expect(report).toContain('验收摘要');
    expect(report).toContain('合同准备');
    expect(report).toContain('下一步');
    expect(report).toContain('推荐执行路线');
    expect(brief).toContain('执行 Brief');
    expect(brief).toContain('验收标准');
    expect(brief).toContain('红线');
    expect(followup).toContain('你好');
    expect(followup).toContain('POC 状态');
    expect(followup).toContain('拿到这些信息后');
  });

  it('routes standard packs to the right customer execution pipeline', () => {
    const pack = buildStandardPack({
      goal: '做 slideshow reels 批量测试, 7 天后复盘券领取和合同判断',
      brand: '南城川味小馆 with 店长 review',
      sku: '10 个菜品/套餐 batch with 菜品图 and 到店理由',
      links: 'https://example.com/tiktok-video',
      workflowId: 'slideshow-batch',
    });

    const plan = getStandardPackExecutionPlan(pack);

    expect(plan.primaryPipeline.href).toBe('/pipelines/ab-test');
    expect(plan.supportingPipelines.some(item => item.href === '/pipelines/product-image')).toBe(true);
    expect(plan.customerSteps.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps hypothesis packs away from contract push when benchmark is missing', () => {
    const pack = buildStandardPack({
      goal: '10 个菜品门店 POC, 7 天测试后做验收复盘并评估门店运营合同',
      brand: '南城川味小馆, 店长亲自审核, 有菜品图和点评截图素材',
      sku: '10 个菜品/套餐 batch: 酸菜鱼套餐, 毛血旺套餐, 工作日晚餐券',
      links: '',
      workflowId: 'benchmark',
    });

    expect(pack.readiness.decision).toBe('hypothesis-only');
    expect(pack.readiness.contractBlockers.join(' ')).toContain('缺少 benchmark 证据');
    expect(pack.sections.some(section => section.title.includes('商业推进动作'))).toBe(true);
    expect(formatStandardPackMarkdown(pack)).toContain('补 benchmark 证据');
  });
});
