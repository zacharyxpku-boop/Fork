import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import {
  buildRestaurantCapabilityTrainingPlanFromLedger,
  clearRestaurantCapabilityTrainingRecordsForTest,
  recordRestaurantCapabilityTrainingRecord,
} from '@/lib/restaurant-capability-training';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import {
  buildRestaurantProviderSetupStateSummary,
  clearRestaurantProviderSetupStateForTest,
  recordRestaurantProviderSetupState,
} from '@/lib/restaurant-provider-setup-state-store';

describe('restaurant customer demand gateway', () => {
  beforeEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
    clearRestaurantProviderSetupStateForTest();
  });

  it('maps front-door restaurant demand channels without claiming automatic customer contact', () => {
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T11:00:00.000Z'));
    const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const gateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      audience: 'nearby office dinner guests',
      visitReason: 'walk in before 19:30 without waiting',
      capabilityTrainingPlan: trainingPlan,
      providerSetupState,
      now: new Date('2026-05-24T11:01:00.000Z'),
    });

    expect(gateway.payloadShape).toBe('restaurant-customer-demand-gateway-v1');
    expect(gateway.summary.channels).toBe(6);
    expect(gateway.summary.canClaimAutoCustomerContact).toBe(false);
    expect(gateway.summary.canClaimAutoOrderTaking).toBe(false);
    expect(gateway.channels.map(channel => channel.job)).toEqual(expect.arrayContaining([
      'phone-order',
      'chat-inquiry',
      'reservation',
      'coupon-lead',
      'delivery-order',
      'loyalty-winback',
    ]));
    expect(gateway.intakeSchema.find(field => field.field === 'customer_identifier')?.storage).toBe('forbidden-raw-private');
    expect(gateway.safetyBoundary).toContain('never contacts customers');
  });

  it('uses accepted training and remembered provider labels to unlock order-taking readiness labels', () => {
    [
      '会员标签',
      '券领取记录',
      '咨询分类',
      '社群 SOP',
      '黑名单规则',
      '核销表',
      '客单',
      '菜品销量',
      '毛利',
      '库存',
      '损耗',
      '人效',
    ].forEach((name, index) => {
      recordRestaurantCapabilityTrainingRecord({
        kind: 'material',
        capabilityId: index < 5 ? 'auto-acquisition-followup' : 'redemption-operating-analytics',
        name,
        owner: 'ops',
        evidenceSummary: `accepted material ${name}`,
      }, new Date(`2026-05-24T11:${String(index).padStart(2, '0')}:00.000Z`));
    });
    recordRestaurantProviderSetupState({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      configuredEnvKeys: ['VOICE_PROVIDER_URL', 'SMS_PROVIDER_URL', 'POS_API_URL', 'CRM_PROVIDER_URL'],
      merchantApprovals: ['WeCom staff channel approval', 'Dianping coupon approval', 'Reservation provider approval'],
      dataContracts: ['delivery aggregate export', 'coupon aggregate export', 'POS aggregate export'],
      submittedBy: 'runtime-admin',
      now: new Date('2026-05-24T11:20:00.000Z'),
    });
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T11:21:00.000Z'));
    const basePlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: basePlan.items.flatMap(item => item.trainingMaterials),
      configuredProviders: [
        ...basePlan.items.flatMap(item => item.externalProviders),
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const gateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      capabilityTrainingPlan: trainingPlan,
      providerSetupState,
      now: new Date('2026-05-24T11:22:00.000Z'),
    });

    expect(gateway.summary.internalReady).toBeGreaterThan(0);
    expect(gateway.summary.blockedSensitive).toBe(0);
    expect(JSON.stringify(gateway)).not.toContain('VOICE_PROVIDER_URL=');
    expect(JSON.stringify(gateway)).not.toContain('13800000000');
  });

  it('is exposed through the runtime API and redacts sensitive command text', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'customer-demand-gateway',
        command: 'Call every customer at 13800000000 and redeem all coupons automatically.',
        restaurant: 'API Noodle',
        offer: 'Dinner set',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.customerDemandGateway.payloadShape).toBe('restaurant-customer-demand-gateway-v1');
    expect(payload.customerDemandGateway.summary.blockedSensitive).toBeGreaterThan(0);
    expect(payload.commandRoute.command).toBe('[redacted-sensitive-command]');
    expect(serialized).not.toContain('13800000000');
    expect(payload.customerDemandGateway.safetyBoundary).toContain('never contacts customers');
  });
});
