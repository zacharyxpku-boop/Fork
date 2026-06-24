import { describe, expect, it } from 'vitest';

import { buildRestaurantContentDeliveryPack } from '@/lib/restaurant-content-delivery-pack';
import { buildRestaurantVideoProductionPassport } from '@/lib/restaurant-video-production-passport';

function contentPack() {
  return buildRestaurantContentDeliveryPack({
    restaurantName: '南城川味小馆',
    dishOrOffer: '双人酸菜鱼套餐',
    audience: '附近 3 公里工作日晚餐客',
    localArea: '软件园商圈',
    channels: ['dianping', 'xiaohongshu', 'douyin', 'wechat'],
    referenceEvidence: '大众点评套餐截图; 小红书同城探店链接',
    constraints: '工作日可用，价格和核销待店长确认',
  });
}

describe('restaurant video production passport', () => {
  it('turns a content delivery pack into a Create/Cut production passport with owner evidence gates', () => {
    const passport = buildRestaurantVideoProductionPassport({
      contentPack: contentPack(),
    });

    expect(passport.payloadShape).toBe('restaurant-video-production-passport-v1');
    expect(passport.title).toContain('视频生产护照');
    expect(passport.summary).toEqual(expect.objectContaining({
      totalStages: 7,
      readyStages: 2,
      canClaimFinishedVideo: false,
      canMoveToPublishProof: false,
    }));
    expect(passport.stages.map(stage => stage.title)).toEqual([
      '脚本与分镜',
      '素材清单',
      '外部视频通道',
      '成片凭证',
      '店长审核',
      '发布证明',
      '回流复盘',
    ]);
    expect(passport.stages.find(stage => stage.id === 'external-video-gate')).toEqual(expect.objectContaining({
      status: 'external-gated',
      owner: '剪辑负责人',
    }));
    expect(passport.ownerChecklist.map(item => item.owner)).toEqual(expect.arrayContaining([
      '剪辑负责人',
      '店长',
      '发布负责人',
      '复盘负责人',
    ]));
    expect(passport.stopLines.join('\n')).toContain('不宣称一键成片完成');
  });

  it('allows publish handoff only after finished video evidence and manager approval', () => {
    const passport = buildRestaurantVideoProductionPassport({
      contentPack: contentPack(),
      externalVideoChannelReady: true,
      finishedVideoUrl: 'https://video.example.test/acid-fish-v1.mp4',
      managerApproved: true,
      publishProofReady: true,
      recoveredAggregateReady: true,
    });

    expect(passport.summary).toEqual(expect.objectContaining({
      readyStages: 7,
      evidenceMissing: 0,
      externalGated: 0,
      canClaimFinishedVideo: true,
      canMoveToPublishProof: true,
    }));
    expect(passport.ownerChecklist).toEqual([]);
    expect(passport.stages.find(stage => stage.id === 'finished-video')).toEqual(expect.objectContaining({
      status: 'ready',
      output: '成片链接或截图已回填',
    }));
  });

  it('keeps privacy and attribution stop lines even when all production evidence is present', () => {
    const passport = buildRestaurantVideoProductionPassport({
      contentPack: contentPack(),
      externalVideoChannelReady: true,
      finishedVideoScreenshotId: 'shot-video-v1',
      managerApproved: true,
      publishProofReady: true,
    });

    expect(passport.summary.canClaimFinishedVideo).toBe(true);
    expect(passport.summary.canMoveToPublishProof).toBe(true);
    expect(passport.stages.find(stage => stage.id === 'recover-review')?.status).toBe('needs-evidence');
    expect(passport.stopLines).toEqual(expect.arrayContaining([
      '没有脱敏反馈汇总，不宣称真实经营归因。',
      '不保存顾客身份、聊天原文、券码、订单明细或收银明细。',
    ]));
    expect(JSON.stringify(passport)).not.toContain('手机号');
    expect(JSON.stringify(passport)).not.toContain('API key');
  });
});
