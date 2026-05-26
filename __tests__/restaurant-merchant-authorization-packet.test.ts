import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantGrantChecklist } from '@/lib/restaurant-agent-grant-checklist';
import { buildRestaurantMerchantGrantManifest } from '@/lib/restaurant-agent-grant-manifest';
import { buildRestaurantMerchantAuthorizationPacket } from '@/lib/restaurant-merchant-authorization-packet';
import type { RestaurantProviderAdapterConfigWorkbench } from '@/lib/restaurant-provider-adapter-config-workbench';
import type { RestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import type { RestaurantProviderSandboxRunConsole } from '@/lib/restaurant-provider-sandbox-run-console';

const now = new Date('2026-05-26T08:00:00.000Z');

function fakeProviderConfig(): RestaurantProviderAdapterConfigWorkbench {
  return {
    ok: true,
    payloadShape: 'restaurant-provider-adapter-config-workbench-v1',
    generatedAt: now.toISOString(),
    restaurant: 'Packet Bistro',
    offer: 'Dinner set',
    verdict: 'runtime-keys-first',
    summary: {
      targets: 3,
      realProviderReady: 0,
      simulatorReady: 3,
      setupRequired: 3,
      missingEnvKeys: 4,
      missingBusinessEvidence: 2,
      canUseSimulatorNow: true,
      canSubmitRealProviderNow: false,
      canClaimExternalAutomation: false,
    },
    recommended: {
      target: 'openclaw',
      mode: 'sandbox-simulator',
      reason: 'Use browser runner only after keys and grants exist.',
      nextAction: 'Run simulator first.',
    },
    targets: [],
    providerOfTheKeyRequest: [],
    sandboxVsReal: {
      simulatorCanDo: ['show timeline'],
      realProviderRequires: ['runtime key', 'merchant grant', 'callback'],
      productionClaimRequires: ['signed receipt'],
    },
    adapterContracts: [],
    redactedFields: ['api keys', 'cookies'],
    safetyBoundary: 'No real provider claim.',
  };
}

function fakeReadiness(): RestaurantProviderSandboxReadinessBoard {
  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-readiness-board-v1',
    generatedAt: now.toISOString(),
    restaurant: 'Packet Bistro',
    offer: 'Dinner set',
    verdict: 'blocked-provider-setup',
    summary: {
      capabilities: 5,
      readyToSubmit: 0,
      blockedProvider: 4,
      blockedData: 1,
      waitingReceipt: 0,
      accepted: 0,
      canSubmitSandboxNow: false,
      canClaimExternalAutomation: false,
    },
    rows: [],
    ownerQueue: [],
    providerScript: ['Submit only rows where submitAllowed=true.'],
    redactedFields: ['raw POS rows'],
    safetyBoundary: 'No external automation claim.',
  };
}

function fakeRunConsole(): RestaurantProviderSandboxRunConsole {
  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-run-console-v1',
    generatedAt: now.toISOString(),
    restaurant: 'Packet Bistro',
    offer: 'Dinner set',
    verdict: 'blocked-before-submit',
    summary: {
      steps: 6,
      done: 0,
      ready: 1,
      waiting: 0,
      blocked: 5,
      submitAllowed: false,
      runnerEvents: 0,
      waitingReceipts: 0,
      acceptedReceipts: 0,
      canCloseoutRun: false,
      canWriteMemory: false,
      canClaimExternalAutomation: false,
    },
    selectedLane: {
      capabilityId: 'auto-publish-proof',
      status: 'blocked-provider',
      owner: 'runtime-admin',
      nextAction: 'Configure keys and merchant grant.',
    },
    timeline: [],
    closeoutChecklist: [],
    operatorCommands: ['Configure keys and merchant grant.'],
    providerCallbackContract: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      header: 'x-restaurant-agent-signature',
      acceptedEvidence: ['eventId', 'externalRunId', 'evidenceUrl', 'operator summary'],
      forbiddenFields: ['private-message text', 'raw POS rows'],
    },
    externalRequired: ['runtime key', 'merchant grant', 'callback'],
    safetyBoundary: 'No external automation claim.',
  };
}

describe('restaurant merchant authorization packet', () => {
  it('turns grants, provider config and receipts into signable merchant scopes', () => {
    const grantManifest = buildRestaurantMerchantGrantManifest({
      restaurant: 'Packet Bistro',
      operator: 'Ops',
      env: {},
      now,
    });
    const grantChecklist = buildRestaurantGrantChecklist({
      restaurant: 'Packet Bistro',
      operator: 'Ops',
      env: {},
      now,
    });
    const packet = buildRestaurantMerchantAuthorizationPacket({
      restaurant: 'Packet Bistro',
      offer: 'Dinner set',
      grantManifest,
      grantChecklist,
      providerAdapterConfigWorkbench: fakeProviderConfig(),
      providerSandboxReadinessBoard: fakeReadiness(),
      providerSandboxRunConsole: fakeRunConsole(),
      now,
    });

    expect(packet.payloadShape).toBe('restaurant-merchant-authorization-packet-v1');
    expect(packet.summary.scopes).toBe(5);
    expect(packet.summary.missingMerchantGrant).toBe(4);
    expect(packet.summary.missingDataContract).toBe(1);
    expect(packet.summary.canEnableRealProviderSubmit).toBe(false);
    expect(packet.summary.canClaimExternalAutomation).toBe(false);
    expect(packet.scopes.map(scope => scope.id)).toEqual([
      'dianping-meituan',
      'xiaohongshu',
      'douyin',
      'wechat-community',
      'pos-redemption',
    ]);
    expect(packet.scopes.find(scope => scope.id === 'pos-redemption')?.status).toBe('missing-data-contract');
    expect(packet.providerHandOff.neverGiveProvider).toContain('private-message text');
    expect(packet.providerHandOff.callbackContract).toContain('x-restaurant-agent-signature');
    expect(packet.safetyBoundary).toContain('does not execute browser actions');
  });

  it('is exposed by the default path API without claiming real automation', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Packet API Bistro',
        offer: 'Weekend set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.merchantAuthorizationPacket.payloadShape).toBe('restaurant-merchant-authorization-packet-v1');
    expect(payload.merchantAuthorizationPacket.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.merchantAuthorizationPacket.scopes.map((scope: { id: string }) => scope.id)).toContain('pos-redemption');
    expect(payload.merchantAuthorizationPacket.providerHandOff.neverGiveProvider).toContain('cookies');
    expect(JSON.stringify(payload.merchantAuthorizationPacket)).not.toContain('secret-value');
  });
});
