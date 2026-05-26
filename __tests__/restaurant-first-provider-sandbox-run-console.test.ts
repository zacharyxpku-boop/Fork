import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantFirstProviderSandboxRunConsole } from '@/lib/restaurant-first-provider-sandbox-run-console';
import type { RestaurantMerchantAuthorizationPacket } from '@/lib/restaurant-merchant-authorization-packet';
import type { RestaurantProviderAdapterConfigWorkbench } from '@/lib/restaurant-provider-adapter-config-workbench';
import type { RestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import type { RestaurantProviderSandboxRunConsole } from '@/lib/restaurant-provider-sandbox-run-console';
import type { RestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';

const now = new Date('2026-05-26T10:00:00.000Z');

function merchantPacket(): RestaurantMerchantAuthorizationPacket {
  return {
    ok: true,
    payloadShape: 'restaurant-merchant-authorization-packet-v1',
    generatedAt: now.toISOString(),
    restaurant: 'First Run Bistro',
    offer: 'Weekend set',
    verdict: 'ready-to-sign-first-scope',
    summary: {
      scopes: 5,
      readyToSign: 1,
      missingMerchantGrant: 3,
      missingDataContract: 1,
      runtimeOrCallbackBlocked: 0,
      permanentlyForbidden: 1,
      canEnableRealProviderSubmit: false,
      canClaimExternalAutomation: false,
    },
    scopes: [
      {
        id: 'dianping-meituan',
        label: 'Dianping / Meituan local-life account',
        owner: 'merchant',
        status: 'ready-to-sign',
        allowedActions: ['prepare_publish_draft', 'submit_platform_publish'],
        forbiddenActions: ['read_private_message'],
        requiredFields: ['merchant account owner', 'store public URL', 'allowed scope'],
        dataScope: ['public posted links', 'public screenshots'],
        expiryRule: 'Expires in 7 days.',
        revocationRule: 'Merchant can revoke.',
        acceptanceEvidence: ['posted link', 'screenshot id'],
        providerCallbackRequired: ['x-restaurant-agent-signature', 'external-receipt'],
        nextAction: 'Sign the first controlled scope.',
        stopLine: 'No publish without signed scope and receipt.',
      },
    ],
    signaturePacket: {
      merchantFields: ['legal merchant name'],
      operatorFields: ['operator owner'],
      platformFields: ['Dianping scope'],
      dataFields: ['field dictionary id'],
      validity: 'one run only',
      revocation: 'stop immediately',
    },
    providerHandOff: {
      giveProvider: ['scope id', 'safePayload', 'callback header'],
      neverGiveProvider: ['cookies', 'private-message text', 'raw POS rows'],
      callbackContract: ['x-restaurant-agent-signature', 'external-receipt'],
    },
    customerScript: ['Sign one scope first.'],
    redactedFields: ['cookies', 'private-message text'],
    safetyBoundary: 'No external automation claim.',
  };
}

function providerConfig(): RestaurantProviderAdapterConfigWorkbench {
  return {
    ok: true,
    payloadShape: 'restaurant-provider-adapter-config-workbench-v1',
    generatedAt: now.toISOString(),
    restaurant: 'First Run Bistro',
    offer: 'Weekend set',
    verdict: 'real-provider-ready',
    summary: {
      targets: 3,
      realProviderReady: 1,
      simulatorReady: 3,
      setupRequired: 2,
      missingEnvKeys: 0,
      missingBusinessEvidence: 0,
      canUseSimulatorNow: true,
      canSubmitRealProviderNow: true,
      canClaimExternalAutomation: false,
    },
    recommended: {
      target: 'openclaw',
      mode: 'real-provider',
      reason: 'OpenClaw is ready for a controlled browser run.',
      nextAction: 'Submit one sanitized package.',
    },
    targets: [],
    providerOfTheKeyRequest: [],
    sandboxVsReal: {
      simulatorCanDo: ['show timeline'],
      realProviderRequires: ['runtime key'],
      productionClaimRequires: ['signed receipt'],
    },
    adapterContracts: [],
    redactedFields: ['api keys'],
    safetyBoundary: 'No production claim.',
  };
}

function readiness(): RestaurantProviderSandboxReadinessBoard {
  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-readiness-board-v1',
    generatedAt: now.toISOString(),
    restaurant: 'First Run Bistro',
    offer: 'Weekend set',
    verdict: 'ready-to-submit-one',
    summary: {
      capabilities: 5,
      readyToSubmit: 1,
      blockedProvider: 3,
      blockedData: 1,
      waitingReceipt: 0,
      accepted: 0,
      canSubmitSandboxNow: true,
      canClaimExternalAutomation: false,
    },
    rows: [],
    firstRunnable: {
      capabilityId: 'auto-publish-proof',
      packageId: 'pkg-first',
      action: 'Submit one package.',
      evidenceRequired: ['externalRunId'],
    },
    ownerQueue: [],
    providerScript: ['Submit only rows where submitAllowed=true.'],
    redactedFields: ['cookies'],
    safetyBoundary: 'No external automation claim.',
  };
}

function submitWorkbench(): RestaurantProviderSandboxSubmitWorkbench {
  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-submit-workbench-v1',
    generatedAt: now.toISOString(),
    targetRuntime: 'openclaw',
    summary: {
      capabilities: 5,
      readyToSubmit: 1,
      blocked: 4,
      waitingReceipt: 0,
      acceptedReceipt: 0,
      canClaimExternalAutomation: false,
    },
    submitPackages: [
      {
        capabilityId: 'auto-publish-proof',
        capabilityLabel: 'Auto publish and proof capture',
        targetRuntime: 'openclaw',
        status: 'ready-to-submit',
        selectedPackageId: 'pkg-first',
        selectedTaskId: 'task-first',
        selectedRequestedAction: 'submit_platform_publish',
        safePayload: {
          taskId: 'task-first',
          restaurant: 'First Run Bistro',
          offer: 'Weekend set',
          action: 'submit_platform_publish',
          owner: 'ops',
          evidenceRequired: 'externalRunId, public proof URL or screenshot id',
          externalRequired: [],
          stopLine: 'No receipt means no claim.',
        },
        submitEndpointShape: {
          method: 'POST',
          target: 'openclaw',
          endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks',
          payloadShape: 'restaurant-agent-external-execution-v1',
          includesSecrets: false,
        },
        callback: {
          endpoint: '/api/restaurant-agent/runtime',
          action: 'external-receipt',
          header: 'x-restaurant-agent-signature',
          signatureRequired: true,
        },
        receiptExpectation: ['externalRunId', 'public proof URL', 'operator summary'],
        recoveryOwner: 'ops',
        nextAction: 'Submit pkg-first to openclaw.',
        stopLine: 'No receipt means no claim.',
      },
    ],
    capabilitySubmissions: [],
    externalRequired: [],
    safetyBoundary: 'No external automation claim.',
  };
}

function runConsole(): RestaurantProviderSandboxRunConsole {
  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-run-console-v1',
    generatedAt: now.toISOString(),
    restaurant: 'First Run Bistro',
    offer: 'Weekend set',
    verdict: 'ready-to-submit',
    summary: {
      steps: 6,
      ready: 2,
      waiting: 1,
      blocked: 3,
      done: 0,
      submitAllowed: true,
      runnerEvents: 0,
      waitingReceipts: 0,
      acceptedReceipts: 0,
      canCloseoutRun: false,
      canWriteMemory: false,
      canClaimExternalAutomation: false,
    },
    selectedLane: {
      capabilityId: 'auto-publish-proof',
      packageId: 'pkg-first',
      status: 'ready-to-submit',
      owner: 'ops',
      nextAction: 'Submit one package.',
    },
    timeline: [],
    closeoutChecklist: [],
    operatorCommands: ['Submit pkg-first.'],
    providerCallbackContract: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      header: 'x-restaurant-agent-signature',
      acceptedEvidence: ['eventId', 'externalRunId', 'public proof URL', 'operator summary'],
      forbiddenFields: ['private-message text', 'raw POS rows'],
    },
    externalRequired: [],
    safetyBoundary: 'No external automation claim.',
  };
}

describe('restaurant first provider sandbox run console', () => {
  it('selects one scope, package and provider target for the first controlled run', () => {
    const consolePayload = buildRestaurantFirstProviderSandboxRunConsole({
      merchantAuthorizationPacket: merchantPacket(),
      providerAdapterConfigWorkbench: providerConfig(),
      providerSandboxReadinessBoard: readiness(),
      providerSandboxSubmitWorkbench: submitWorkbench(),
      providerSandboxRunConsole: runConsole(),
      now,
    });

    expect(consolePayload.payloadShape).toBe('restaurant-first-provider-sandbox-run-console-v1');
    expect(consolePayload.verdict).toBe('ready-for-first-provider-submit');
    expect(consolePayload.summary.canStartFirstSandboxRun).toBe(true);
    expect(consolePayload.summary.canClaimExternalAutomation).toBe(false);
    expect(consolePayload.selectedRun.scopeId).toBe('dianping-meituan');
    expect(consolePayload.selectedRun.capabilityId).toBe('auto-publish-proof');
    expect(consolePayload.selectedRun.targetProvider).toBe('openclaw');
    expect(consolePayload.providerSubmitCard.includesSecrets).toBe(false);
    expect(consolePayload.providerSubmitCard.forbiddenPayload).toContain('cookies');
    expect(consolePayload.steps.map(step => step.id)).toEqual([
      'merchant-scope',
      'provider-choice',
      'submit-package',
      'dispatch',
      'signed-callback',
      'closeout-training',
    ]);
  });

  it('is exposed by the default path API while keeping production claims blocked', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'First API Bistro',
        offer: 'Dinner set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.firstProviderSandboxRunConsole.payloadShape).toBe('restaurant-first-provider-sandbox-run-console-v1');
    expect(payload.firstProviderSandboxRunConsole.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.firstProviderSandboxRunConsole.selectedRun.callbackAction).toBe('external-receipt');
    expect(payload.firstProviderSandboxRunConsole.steps.map((step: { id: string }) => step.id)).toContain('signed-callback');
    expect(payload.firstProviderSandboxRunConsole.providerSubmitCard.forbiddenPayload).toContain('cookies');
  });
});
