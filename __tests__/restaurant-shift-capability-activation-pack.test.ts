import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantCapabilityTrainingPlan, clearRestaurantCapabilityTrainingRecordsForTest, recordRestaurantCapabilityTrainingRecord } from '@/lib/restaurant-capability-training';
import type { RestaurantCapabilityTrainingRecord } from '@/lib/restaurant-capability-training';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantShiftCapabilityActivationPack } from '@/lib/restaurant-shift-capability-activation-pack';

describe('restaurant shift capability activation pack', () => {
  beforeEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
  });

  it('turns accepted closeout training records into internal activation status', async () => {
    const records: RestaurantCapabilityTrainingRecord[] = [{
      recordId: 'record-proof',
      kind: 'material',
      capabilityId: 'auto-publish-receipts',
      name: 'Accepted public proof closeout pattern',
      owner: 'ops',
      source: 'manual',
      evidenceSummary: 'Accepted proof only.',
      accepted: true,
      createdAt: '2026-05-24T15:00:00.000Z',
    }];
    const plan = buildRestaurantCapabilityTrainingPlan({ trainingRecords: records });
    const pack = buildRestaurantShiftCapabilityActivationPack({
      capabilityTrainingPlan: plan,
      trainingRecords: records,
      now: new Date('2026-05-24T15:01:00.000Z'),
    });
    const activation = pack.activations.find(item => item.capabilityId === 'auto-publish-receipts');

    expect(pack.payloadShape).toBe('restaurant-shift-capability-activation-pack-v1');
    expect(pack.verdict).toBe('provider-gated');
    expect(pack.summary.activatedInternal + pack.summary.trainedNeedsProvider).toBeGreaterThan(0);
    expect(activation?.acceptedRecords).toBe(1);
    expect(activation?.status).toBe('trained-needs-provider');
    expect(pack.summary.canClaimExternalAutomation).toBe(false);
    expect(pack.safetyBoundary).toContain('does not auto-publish');
  });

  it('uses provider readiness evidence to move trained capabilities into internal-active mode', async () => {
    const records: RestaurantCapabilityTrainingRecord[] = [{
      recordId: 'record-pos',
      kind: 'material',
      capabilityId: 'redemption-operating-analytics',
      name: 'Sanitized POS aggregate closeout pattern',
      owner: 'finance',
      source: 'pos-import',
      evidenceSummary: 'Accepted aggregate POS import.',
      accepted: true,
      createdAt: '2026-05-24T15:02:00.000Z',
    }];
    const env = {
      RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
      RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret-value',
      RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
      RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
      RESTAURANT_POS_DATA_MODE: 'csv',
      RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
    };
    const fetcher = (async () => Response.json({ ok: true })) as typeof fetch;
    const runtimeProbe = await buildRestaurantRuntimeProbe({ env, fetcher, now: new Date('2026-05-24T15:03:00.000Z') });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      env,
      fetcher,
      runtimeProbe,
      now: new Date('2026-05-24T15:04:00.000Z'),
    });
    const pack = buildRestaurantShiftCapabilityActivationPack({
      capabilityTrainingPlan: buildRestaurantCapabilityTrainingPlan({ trainingRecords: records }),
      trainingRecords: records,
      providerReadinessHealth,
      now: new Date('2026-05-24T15:05:00.000Z'),
    });
    const activation = pack.activations.find(item => item.capabilityId === 'redemption-operating-analytics');
    const serialized = JSON.stringify(pack);

    expect(activation?.status).toBe('activated-internal');
    expect(activation?.providerEvidence.length).toBeGreaterThan(0);
    expect(serialized).not.toContain('openclaw-secret-value');
    expect(serialized).not.toContain('callback-secret-value');
  });

  it('is exposed through the runtime API', async () => {
    recordRestaurantCapabilityTrainingRecord({
      kind: 'material',
      capabilityId: 'auto-publish-receipts',
      name: 'Accepted public proof closeout pattern',
      owner: 'ops',
      source: 'manual',
      evidenceSummary: 'Accepted proof only.',
    }, new Date('2026-05-24T15:06:00.000Z'));

    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'shift-capability-activation-pack' }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.shiftCapabilityActivationPack.payloadShape).toBe('restaurant-shift-capability-activation-pack-v1');
    expect(payload.shiftCapabilityActivationPack.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.shiftCapabilityActivationPack.safetyBoundary).toContain('does not auto-publish');
  });
});
