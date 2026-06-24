import { describe, expect, it } from 'vitest';

import { buildRestaurantContentDeliveryPack } from '@/lib/restaurant-content-delivery-pack';

describe('restaurant content delivery pack', () => {
  it('builds a restaurant short-video delivery kit from manual evidence', () => {
    const pack = buildRestaurantContentDeliveryPack({
      restaurantName: '南城川味小馆',
      dishOrOffer: '双人酸菜鱼套餐',
      audience: '附近 3 公里工作日晚餐客',
      localArea: '软件园商圈',
      channels: ['dianping', 'xiaohongshu', 'douyin', 'wechat'],
      referenceEvidence: '大众点评套餐截图; 小红书同城探店链接; 抖音参考视频截图',
      constraints: '工作日可用，周末和最低价口径待店长确认',
    });

    expect(pack.status).toBe('ready_for_manager_review');
    expect(pack.title).toContain('双人酸菜鱼套餐');
    expect(pack.inputSummary.join(' ')).toContain('大众点评 / 小红书 / 抖音 / 微信社群');
    expect(pack.referenceBreakdown).toHaveLength(3);
    expect(pack.scripts).toHaveLength(3);
    expect(pack.scripts[0].storyboard.join(' ')).toContain('发布链接或截图');
    expect(pack.publishProofSlots.join(' ')).toContain('券领取聚合信号');
    expect(pack.managerReviewChecklist.join(' ')).toContain('核销规则');
    expect(pack.markdown).toContain('## 店长审核');
  });

  it('stays honest when no reference evidence or provider execution exists', () => {
    const pack = buildRestaurantContentDeliveryPack({
      restaurantName: '南城川味小馆',
      dishOrOffer: '午市套餐',
      audience: '附近白领',
      channels: [],
    });

    expect(pack.status).toBe('draft_only');
    expect(pack.note).toContain('不代表已发布');
    expect(pack.referenceBreakdown.join(' ')).toContain('不能伪装成已抓取平台');
    expect(pack.publishProofSlots.join(' ')).toContain('大众点评');
    expect(pack.markdown).not.toContain('自动发布');
    expect(pack.markdown).not.toContain('真实增长');
  });

  it('guards against PII and raw operating-data migration', () => {
    const pack = buildRestaurantContentDeliveryPack({
      restaurantName: '南城川味小馆',
      dishOrOffer: '会员复购券',
      audience: '老客会员',
      channels: ['wechat'],
      constraints: '只看聚合信号，不处理顾客手机号、微信号或 POS 明细',
    });

    expect(pack.brollChecklist.join(' ')).toContain('禁止使用未授权顾客肖像');
    expect(pack.brollChecklist.join(' ')).toContain('联系电话');
    expect(pack.followUpTasks.join(' ')).toContain('真实预约、券领取、私信咨询');
    expect(pack.markdown).not.toContain('券码');
  });
});
