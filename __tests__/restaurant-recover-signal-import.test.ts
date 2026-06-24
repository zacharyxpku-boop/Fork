import { describe, expect, it } from 'vitest';

import {
  RESTAURANT_RECOVER_SIGNAL_DEMO_ROWS,
  buildRestaurantRecoverSignalImportReport,
  detectRecoverSignalSensitiveFields,
  detectRecoverSignalSensitiveValues,
} from '@/lib/restaurant-recover-signal-import';

describe('restaurant recover signal import', () => {
  it('accepts only aggregate reservation coupon inquiry review community visit and redemption signals', () => {
    const report = buildRestaurantRecoverSignalImportReport({
      restaurantName: '北城面馆',
      offerName: '番茄牛腩面套餐',
      rows: RESTAURANT_RECOVER_SIGNAL_DEMO_ROWS,
      now: new Date('2026-06-22T12:00:00.000Z'),
    });

    expect(report.payloadShape).toBe('restaurant-recover-signal-import-v1');
    expect(report.status).toBe('accepted');
    expect(report.restaurantName).toBe('北城面馆');
    expect(report.offerName).toBe('番茄牛腩面套餐');
    expect(report.summary).toEqual(expect.objectContaining({
      totalRows: 3,
      validRows: 3,
      sourceCount: 3,
      reservationCount: 6,
      couponClaimCount: 21,
      inquiryCount: 12,
      reviewCount: 1,
      communityFeedbackCount: 12,
      visitIntentCount: 17,
      redemptionCount: 7,
    }));
    expect(report.sanitizedPreview[0]).toEqual(expect.objectContaining({
      source: 'reservation',
      owner: '店长',
      evidence: '预约汇总截图',
    }));
    expect(JSON.stringify(report)).not.toContain('138');
    expect(report.nextActions.join('\n')).toContain('把脱敏回流汇总交给店长确认');
  });

  it('rejects fields and values that would store private customer data or raw operating rows', () => {
    const row = {
      source: 'inquiry',
      owner: '社群负责人',
      evidence: '社群截图',
      reservationCount: 0,
      couponClaimCount: 1,
      inquiryCount: 2,
      reviewCount: 0,
      communityFeedbackCount: 3,
      visitIntentCount: 1,
      redemptionCount: 0,
      phone: '13812345678',
      privateMessageText: '顾客说今晚 7 点到店',
      couponCode: 'VIP8888',
      orderId: 'O-10086',
      rawPosRow: 'line_item=酸菜鱼',
      token: 'secret123456',
    };

    expect(detectRecoverSignalSensitiveFields(row)).toEqual(expect.arrayContaining([
      'phone',
      'privateMessageText',
      'couponCode',
      'orderId',
      'rawPosRow',
      'token',
    ]));
    expect(detectRecoverSignalSensitiveValues(row)).toEqual(expect.arrayContaining([
      'phone',
      'token',
    ]));

    const report = buildRestaurantRecoverSignalImportReport({ rows: [row] });
    expect(report.status).toBe('rejected');
    expect(report.summary.validRows).toBe(0);
    expect(report.issues.map(item => item.code)).toEqual(expect.arrayContaining([
      'forbidden_sensitive_field',
      'forbidden_sensitive_value',
    ]));
    expect(report.sanitizedPreview).toEqual([]);
    expect(report.nextActions.join('\n')).toContain('删除手机号、微信号、私信原文、优惠码、订单明细和原始 POS 行后重新导入');
  });

  it('rejects unknown sources and invalid counts before Review Loop can use the data', () => {
    const report = buildRestaurantRecoverSignalImportReport({
      rows: [{
        source: 'phone-call-recording',
        owner: '店长',
        evidence: '手工表',
        reservationCount: -1,
        couponClaimCount: 'not-a-number',
        inquiryCount: 0,
        reviewCount: 0,
        communityFeedbackCount: 0,
        visitIntentCount: 0,
        redemptionCount: 0,
      }],
    });

    expect(report.status).toBe('rejected');
    expect(report.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'invalid_source' }),
      expect.objectContaining({ code: 'invalid_count_field' }),
    ]));
    expect(report.nextActions.join('\n')).toContain('没有脱敏汇总前，不进入经营归因或放大建议');
  });
});
