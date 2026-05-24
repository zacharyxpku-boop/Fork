import { createHmac } from 'crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/industrial-chain/video-workflow/route';
import {
  createIndustrialVideoWorkflow,
  createOneClickVideoOperation,
  executeVideoProviderSubmission,
  getIndustrialVideoProductionQueue,
  listVideoProviderExecutions,
  submitVideoProviderExecution,
  updateVideoProviderExecution,
} from '@/lib/industrial-video-workflow';
import { ingestIndustrialProductionResult } from '@/lib/industrial-production-result';
import { approveIndustrialReviewLink } from '@/lib/industrial-review-portal';
import { addCreativeInsight } from '@/lib/creative-intelligence';
import {
  getIndustrializationSnapshot,
  listContentAssets,
  listDistributionDispatches,
  listDistributionPlans,
} from '@/lib/industrial-chain-store';

const videoWebhookSecret = 'test-video-webhook-secret';

function expectNoSecretMaterial(payload: unknown) {
  const serialized = JSON.stringify(payload);
  expect(serialized).not.toMatch(/"[^"]*(?:apiKey|api_key|accessToken|refreshToken|clientSecret|webhookSecret|signingSecret|secretValue|providerToken)[^"]*"\s*:/i);
  expect(serialized).not.toMatch(/(?:sk|rk|pk|pat|ghp|gho|ghu|ghs)_[A-Za-z0-9_]{12,}/);
  expect(serialized).not.toMatch(/Bearer\s+[A-Za-z0-9._~+/=-]{12,}/i);
}

function buildSignedVideoWebhookRequest(orgId: string, body: Record<string, unknown>, signature?: string | null) {
  const rawBody = JSON.stringify(body);
  const headers: Record<string, string> = { 'x-tenant-id': orgId };
  if (signature !== null) {
    const signed = signature || `sha256=${createHmac('sha256', videoWebhookSecret).update(rawBody).digest('hex')}`;
    headers['x-wenai-video-signature'] = signed;
  }
  return new Request('http://localhost/api/industrial-chain/video-workflow', {
    method: 'POST',
    headers,
    body: rawBody,
  }) as unknown as Parameters<typeof POST>[0];
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('industrial video workflow bridge', () => {
  it('creates a Clico-like video workflow pack and writes it into the industrial ledger', async () => {
    const orgId = `video-workflow-${Date.now()}`;
    const projectId = `video-project-${Date.now()}`;

    const result = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Portable Pet Slow Feeder',
      category: 'pet supplies',
      market: 'US',
      audience: 'traveling dog owners',
      goal: 'create first paid social video test',
      platforms: ['TikTok Shop', 'Instagram Reels'],
      references: ['https://example.test/reference-1'],
      productAssets: ['https://cdn.example.test/product.png'],
      owner: 'creative-ops',
    });

    expect(result.pack.mode).toBe('handoff_only');
    expect(result.pack.providerGate.blocker).toContain('Provider execution needs configured video keys');
    expect(result.pack.providerGate.referenceReady).toBe(true);
    expect(result.pack.providerGate.productAssetsReady).toBe(true);
    expect(result.pack.providerGate.qualityTier).toBe('standard');
    expect(result.pack.artifacts.map(artifact => artifact.title)).toEqual([
      'Campaign Video Brief',
      'Script Pack',
      'Storyboard',
      'Production Template Matrix',
      'Smart Remix Plan',
      'Provider Request',
    ]);
    expect(result.pack.stages.map(stage => stage.id)).toContain('template-ladder');
    expect(result.pack.productionTemplates.map(template => template.id)).toEqual([
      'batch_ugc',
      'street_interview',
      'animated_ad',
      'editing_orchestration',
      'slideshow_reels',
    ]);
    expect(result.pack.productionTemplates[0]).toMatchObject({
      sourceReference: 'Clico batch-ugc-video skill',
      executionKind: 'video_batch',
    });
    expect(result.pack.markdown).toContain('Production Template Matrix');
    expect(result.pack.markdown).toContain('Street Interview Video Builder');
    expect(result.pack.remixPlan).toHaveLength(1);
    expect(result.pack.remixPlan[0]).toMatchObject({
      label: '基础一键视频混剪',
      source: 'fallback',
    });
    expect(result.pack.markdown).toContain('Smart Remix Plan');
    expect(result.asset.type).toBe('production_handoff');
    expect(result.asset.tags).toContain('video-workflow');
    expect(result.asset.evidence).toContain('Production templates: 5');
    expect(result.asset.evidence).toContain('Template: Batch UGC Video Pack / video_batch');
    expect(result.distributionPlans).toHaveLength(2);
    expect(result.distributionDispatches).toHaveLength(2);
    expect(result.distributionDispatches.every(dispatch => dispatch.status === 'manual_ready')).toBe(true);

    await expect(listContentAssets(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: result.asset.id, source: 'industrial-video-workflow' })]),
    );
    await expect(listDistributionPlans(orgId, projectId)).resolves.toHaveLength(2);
    await expect(listDistributionDispatches(orgId, projectId)).resolves.toHaveLength(2);
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.readyPlanCount).toBe(2);
    expect(snapshot.executableDispatchCount).toBe(2);
    expect(snapshot.missingLinks).not.toContain('Missing production brief or script asset');

    const queue = await getIndustrialVideoProductionQueue(orgId, projectId);
    expect(queue.itemCount).toBe(1);
    expect(queue.handoffOnlyCount).toBe(1);
    expect(queue.items[0]).toMatchObject({
      assetId: result.asset.id,
      stage: 'provider_gate',
      priority: 'medium',
      planCount: 2,
      dispatchCount: 2,
      manualReadyDispatchCount: 2,
      loopCompletionScore: 30,
    });
    expect(queue.items[0].remixPlan[0].label).toBe('基础一键视频混剪');
    expect(queue.averageLoopCompletionScore).toBe(30);
    expect(queue.items[0].handoffPacket.summary).toContain('provider_gate');
    expect(queue.items[0].handoffPacket.missingEvidence).toContain('Missing completed provider/editor result URL.');
    expect(queue.items[0].handoffPacket.executionTrace).toEqual(expect.arrayContaining([
      `handoff_asset:${result.asset.id}`,
    ]));
    expect(queue.items[0].runbookActions.map(action => action.id)).toEqual(
      expect.arrayContaining(['ingest-production-result', 'refresh-provider-ready-workflow']),
    );
    expect(queue.items[0].nextActions).toContain('Publish or hand off the video, capture evidence URL, then import performance CSV.');
  });

  it('keeps provider mode gated until config, consent, reference, and product assets are present', async () => {
    const orgId = `video-provider-${Date.now()}`;
    const projectId = `video-provider-project-${Date.now()}`;

    const gated = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Desk Treadmill',
      providerConfigured: true,
      legalConsent: true,
      platforms: ['TikTok Shop'],
    });

    expect(gated.pack.mode).toBe('handoff_only');
    expect(gated.pack.providerGate.referenceReady).toBe(false);
    expect(gated.pack.providerGate.productAssetsReady).toBe(false);
    expect(gated.distributionDispatches[0].providerAdapter).toMatchObject({
      mode: 'manual',
      configured: false,
    });

    const result = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Desk Treadmill',
      providerConfigured: true,
      legalConsent: true,
      references: ['https://example.test/reference-video'],
      productAssets: ['https://cdn.example.test/treadmill.png'],
      qualityTier: 'master',
      platforms: ['TikTok Shop'],
    });

    expect(result.pack.mode).toBe('provider_ready');
    expect(result.pack.providerGate.blocker).toBeUndefined();
    expect(result.pack.providerGate.qualityTier).toBe('master');
    expect(result.distributionDispatches[0]).toMatchObject({
      status: 'manual_ready',
      providerAdapter: {
        mode: 'provider',
        configured: true,
        providerName: 'configured-video-provider',
      },
    });
  });

  it('creates a one-click video operation without pretending external platform automation is complete', async () => {
    const orgId = `one-click-video-${Date.now()}`;
    const projectId = `one-click-video-project-${Date.now()}`;
    await addCreativeInsight(orgId, {
      projectId,
      source: 'video-teardown',
      platform: 'TikTok Shop',
      title: 'Fast proof teardown',
      hookType: 'proof',
      pacing: 'fast',
      reusableAngle: 'Open with the visible result and rebuild the proof sequence with owned footage.',
      metrics: { views: 91000, sales: 320, revenue: 18400 },
      teardown: {
        sceneBeats: ['result first', 'problem context', 'product proof', 'CTA'],
        textOverlays: ['see the result first'],
        complianceNotes: ['Structure only; no copied footage or captions.'],
      },
    });

    const operation = await createOneClickVideoOperation(orgId, {
      projectId,
      productName: 'Foldable Desk Lamp',
      category: 'home office',
      platforms: ['TikTok Shop', 'Instagram Reels'],
      references: ['https://example.test/video-reference'],
      productAssets: ['https://cdn.example.test/lamp.png'],
      providerConfigured: false,
      legalConsent: true,
    });

    expect(operation.workflow.asset.source).toBe('industrial-video-workflow');
    expect(operation.autoCreated).toEqual(expect.arrayContaining([
      expect.stringMatching(/^workflow_asset:/),
      expect.stringContaining('distribution_plan:'),
      expect.stringContaining('dispatch:'),
      expect.stringContaining('queue_item:provider_gate:30'),
    ]));
    expect(operation.queueItem).toMatchObject({
      stage: 'provider_gate',
      remixPlan: expect.arrayContaining([
        expect.objectContaining({ source: 'creative-opportunity' }),
      ]),
    });
    expect(operation.capabilityStates).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'compose', status: 'internal_ready' }),
      expect.objectContaining({ id: 'create', status: 'internal_ready' }),
      expect.objectContaining({ id: 'cut', status: 'internal_ready' }),
      expect.objectContaining({ id: 'ai_video_analysis', status: 'internal_ready' }),
      expect.objectContaining({ id: 'one_click_video', status: 'provider_gated' }),
      expect.objectContaining({ id: 'ad_delivery', status: 'provider_gated' }),
      expect.objectContaining({ id: 'scale_claims', status: 'provider_gated' }),
    ]));
    expect(operation.externalRequirements).toEqual(expect.arrayContaining([
      expect.stringContaining('real video generation/editing provider'),
      expect.stringContaining('Ad account authorization'),
      expect.stringContaining('Audited historical production'),
    ]));
    expect(operation.scaleClaimGuards).toEqual(expect.arrayContaining([
      expect.objectContaining({ requestedBenchmark: '91M+ creative output', canDisplay: false }),
      expect.objectContaining({ requestedBenchmark: '42M+ video distribution', canDisplay: false }),
    ]));
    expect(operation.commerciallyExecutable).toBe(false);
    expect(operation.operatorSummary).toContain('external provider/platform gates');
  });

  it('submits provider-ready video workflows into a real execution ledger without fabricating results', async () => {
    const orgId = `video-provider-execution-${Date.now()}`;
    const projectId = `video-provider-execution-project-${Date.now()}`;
    const gated = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Desk Lamp',
      platforms: ['TikTok Shop'],
    });
    const blocked = await submitVideoProviderExecution(orgId, {
      projectId,
      sourceHandoffAssetId: gated.asset.id,
      dispatchId: gated.distributionDispatches[0].id,
      providerName: 'configured-video-provider',
      requestPayload: { ratio: '9:16' },
    });
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockedReasons).toContain('workflow_not_provider_ready');

    const ready = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Desk Lamp',
      platforms: ['TikTok Shop'],
      references: ['https://example.test/reference-video'],
      productAssets: ['https://cdn.example.test/lamp.png'],
      providerConfigured: true,
      legalConsent: true,
    });
    const submitted = await submitVideoProviderExecution(orgId, {
      projectId,
      sourceHandoffAssetId: ready.asset.id,
      dispatchId: ready.distributionDispatches[0].id,
      providerName: 'configured-video-provider',
      taskId: 'provider-video-task-1',
      requestPayload: { ratio: '9:16', durationSeconds: 15 },
      maxCostCents: 5000,
      estimatedCostCents: 1200,
    });

    expect(submitted.status).toBe('submitted');
    expect(submitted.blockedReasons).toEqual([]);
    expect(submitted.taskId).toBe('provider-video-task-1');
    expect(submitted.callbackNonce).toMatch(/^vpcn_/);
    await expect(listVideoProviderExecutions(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ taskId: 'provider-video-task-1', status: 'submitted' })]),
    );
    const queue = await getIndustrialVideoProductionQueue(orgId, projectId);
    const readyItem = queue.items.find(item => item.assetId === ready.asset.id);
    expect(queue.providerExecutionCount).toBe(2);
    expect(queue.submittedProviderExecutionCount).toBe(1);
    expect(readyItem?.providerExecutionCount).toBe(1);
    expect(readyItem?.submittedProviderExecutionCount).toBe(1);
    expect(readyItem?.completedProviderExecutionCount).toBe(0);
    expect(readyItem?.handoffPacket.executionTrace).toContain('provider_execution:provider-video-task-1:submitted');
    expect(readyItem?.runbookActions.map(action => action.id)).toContain('submit-provider-execution');
    expect(readyItem?.resultAssetCount).toBe(0);
  });

  it('executes the real video provider submit adapter without leaking provider tokens', async () => {
    const orgId = `video-provider-submit-${Date.now()}`;
    const projectId = `video-provider-submit-project-${Date.now()}`;
    const ready = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Magnetic Phone Mount',
      platforms: ['TikTok Shop'],
      references: ['https://example.test/reference-video'],
      productAssets: ['https://cdn.example.test/mount.png'],
      providerConfigured: true,
      legalConsent: true,
    });

    const blocked = await executeVideoProviderSubmission(orgId, {
      projectId,
      sourceHandoffAssetId: ready.asset.id,
      dispatchId: ready.distributionDispatches[0].id,
      requestPayload: { ratio: '9:16', durationSeconds: 15 },
    });
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockedReasons).toEqual(expect.arrayContaining([
      'video_provider_submit_endpoint_not_configured',
      'video_provider_submit_token_not_configured',
    ]));

    const providerToken = 'provider-token-should-not-leak';
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const requestBody = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
      expect(init?.headers).toMatchObject({ Authorization: `Bearer ${providerToken}` });
      expect(requestBody).toMatchObject({
        action: 'video-provider-submit',
        projectId,
        sourceHandoffAssetId: ready.asset.id,
        dispatchId: ready.distributionDispatches[0].id,
      });
      expect(String(requestBody.callbackNonce)).toMatch(/^vpcn_/);
      return new Response(JSON.stringify({ taskId: 'real-provider-task-1', estimatedCostCents: 1800 }), { status: 200 });
    }) as unknown as typeof fetch;

    const submitted = await executeVideoProviderSubmission(orgId, {
      projectId,
      sourceHandoffAssetId: ready.asset.id,
      dispatchId: ready.distributionDispatches[0].id,
      providerName: 'real-video-provider',
      requestPayload: { ratio: '9:16', durationSeconds: 15 },
      maxCostCents: 5000,
      estimatedCostCents: 1400,
      providerEndpoint: 'https://provider.example.test/video/submit',
      providerToken,
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(submitted.status).toBe('submitted');
    expect(submitted.execution?.status).toBe('submitted');
    expect(submitted.execution?.taskId).toBe('real-provider-task-1');
    expect(submitted.execution?.callbackNonce).toMatch(/^vpcn_/);
    expect(JSON.stringify(submitted)).not.toContain(providerToken);

    const queue = await getIndustrialVideoProductionQueue(orgId, projectId);
    expect(queue.submittedProviderExecutionCount).toBe(1);
    expect(queue.items[0].handoffPacket.executionTrace).toContain('provider_execution:real-provider-task-1:submitted');
  });

  it('records failed video provider submissions instead of pretending provider output exists', async () => {
    const orgId = `video-provider-submit-fail-${Date.now()}`;
    const projectId = `video-provider-submit-fail-project-${Date.now()}`;
    const ready = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Desk Cable Organizer',
      platforms: ['TikTok Shop'],
      references: ['https://example.test/reference-video'],
      productAssets: ['https://cdn.example.test/cable.png'],
      providerConfigured: true,
      legalConsent: true,
    });

    const failed = await executeVideoProviderSubmission(orgId, {
      projectId,
      sourceHandoffAssetId: ready.asset.id,
      dispatchId: ready.distributionDispatches[0].id,
      requestPayload: { ratio: '9:16' },
      providerEndpoint: 'https://provider.example.test/video/submit',
      providerToken: 'provider-token-should-not-leak',
      fetcher: (async () => new Response(JSON.stringify({ error: 'quota exceeded' }), { status: 429 })) as typeof fetch,
    });

    expect(failed.status).toBe('failed');
    expect(failed.providerStatus).toBe(429);
    expect(failed.blockedReasons).toContain('video_provider_submit_http_429');
    expect(failed.execution?.status).toBe('failed');
    expect(failed.execution?.resultUrls).toEqual([]);
    expect(JSON.stringify(failed)).not.toContain('provider-token-should-not-leak');

    const queue = await getIndustrialVideoProductionQueue(orgId, projectId);
    expect(queue.failedProviderExecutionCount).toBe(1);
    expect(queue.retryableProviderExecutionCount).toBe(1);
    expect(queue.resultAssetCount).toBe(0);
    expect(queue.items[0].providerRecovery).toMatchObject({
      retryableExecutionCount: 1,
      latestFailedTaskId: failed.execution?.taskId,
      failedReasons: expect.arrayContaining(['Video provider submit returned HTTP 429.']),
    });
    expect(queue.items[0].runbookActions.map(action => action.id)).toContain('retry-provider-execution');
  });

  it('processes provider callbacks with result URLs, failure states, and cost guardrails', async () => {
    const orgId = `video-provider-callback-${Date.now()}`;
    const projectId = `video-provider-callback-project-${Date.now()}`;
    const ready = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Travel Mug',
      platforms: ['TikTok Shop'],
      references: ['https://example.test/reference-video'],
      productAssets: ['https://cdn.example.test/mug.png'],
      providerConfigured: true,
      legalConsent: true,
    });

    const overBudget = await submitVideoProviderExecution(orgId, {
      projectId,
      sourceHandoffAssetId: ready.asset.id,
      dispatchId: ready.distributionDispatches[0].id,
      providerName: 'configured-video-provider',
      taskId: 'over-budget-task',
      requestPayload: { ratio: '9:16' },
      maxCostCents: 500,
      estimatedCostCents: 900,
    });
    expect(overBudget.status).toBe('blocked');
    expect(overBudget.blockedReasons).toContain('estimated_cost_exceeds_budget');

    const submitted = await submitVideoProviderExecution(orgId, {
      projectId,
      sourceHandoffAssetId: ready.asset.id,
      dispatchId: ready.distributionDispatches[0].id,
      providerName: 'configured-video-provider',
      taskId: 'provider-callback-task',
      requestPayload: { ratio: '9:16', durationSeconds: 15 },
      maxCostCents: 5000,
      estimatedCostCents: 1400,
    });
    const running = await updateVideoProviderExecution(orgId, {
      projectId,
      taskId: submitted.taskId,
      status: 'running',
      callbackNonce: submitted.callbackNonce,
    });
    expect(running?.status).toBe('running');
    expect(running?.callbackCount).toBe(1);

    const missingResult = await updateVideoProviderExecution(orgId, {
      projectId,
      taskId: submitted.taskId,
      status: 'completed',
      resultUrls: [],
      callbackNonce: submitted.callbackNonce,
    });
    expect(missingResult?.status).toBe('failed');
    expect(missingResult?.blockedReasons).toContain('completed_callback_missing_result_url');

    const second = await submitVideoProviderExecution(orgId, {
      projectId,
      sourceHandoffAssetId: ready.asset.id,
      dispatchId: ready.distributionDispatches[0].id,
      providerName: 'configured-video-provider',
      taskId: 'provider-callback-task-2',
      requestPayload: { ratio: '9:16', durationSeconds: 15 },
      maxCostCents: 5000,
      estimatedCostCents: 1400,
    });
    const completed = await updateVideoProviderExecution(orgId, {
      projectId,
      executionId: second.id,
      status: 'completed',
      resultUrls: ['https://cdn.example.test/provider-result.mp4'],
      actualCostCents: 1600,
      callbackNonce: second.callbackNonce,
    });
    expect(completed?.status).toBe('completed');
    expect(completed?.resultUrls).toEqual(['https://cdn.example.test/provider-result.mp4']);
    expect(completed?.resultAssetIds).toHaveLength(1);
    expect(completed?.reviewPortalUrls[0]).toContain('/review/');

    const repeatedCompleted = await updateVideoProviderExecution(orgId, {
      projectId,
      executionId: second.id,
      status: 'completed',
      resultUrls: ['https://cdn.example.test/provider-result.mp4'],
      actualCostCents: 1600,
      callbackNonce: second.callbackNonce,
    });
    expect(repeatedCompleted?.status).toBe('completed');
    expect(repeatedCompleted?.resultAssetIds).toEqual(completed?.resultAssetIds);
    expect(repeatedCompleted?.reviewPortalUrls).toEqual(completed?.reviewPortalUrls);
    expect(repeatedCompleted?.callbackCount).toBe((completed?.callbackCount || 0) + 1);

    const lateFailure = await updateVideoProviderExecution(orgId, {
      projectId,
      executionId: second.id,
      status: 'failed',
      errorMessage: 'late provider failure should not regress a completed asset',
      callbackNonce: second.callbackNonce,
    });
    expect(lateFailure?.status).toBe('completed');
    expect(lateFailure?.blockedReasons).toContain('terminal_callback_ignored');

    const queue = await getIndustrialVideoProductionQueue(orgId, projectId);
    expect(queue.providerExecutionCount).toBe(3);
    expect(queue.completedProviderExecutionCount).toBe(1);
    expect(queue.failedProviderExecutionCount).toBe(2);
    expect(queue.retryableProviderExecutionCount).toBe(1);
    expect(queue.resultAssetCount).toBe(1);
    expect(queue.clientReviewCount).toBe(1);
    expect(queue.items[0].resultUrls).toContain('https://cdn.example.test/provider-result.mp4');
    expect(queue.items[0].handoffPacket.executionTrace).toContain('provider_execution:provider-callback-task-2:completed');
    expect(queue.items[0].handoffPacket.executionTrace.some(item => item.startsWith('result_asset:'))).toBe(true);
  });

  it('injects creative intelligence opportunities into the video script and storyboard pack', async () => {
    const orgId = `video-creative-depth-${Date.now()}`;
    const projectId = `video-creative-project-${Date.now()}`;
    await addCreativeInsight(orgId, {
      projectId,
      source: 'video-teardown',
      platform: 'TikTok Shop',
      title: 'Proof-first shelf teardown',
      hookType: 'proof',
      pacing: 'fast',
      reusableAngle: 'Open with the organized result before explaining the storage product.',
      metrics: { views: 42000, sales: 180, revenue: 9600 },
      teardown: {
        sceneBeats: ['organized result', 'messy before', 'product proof', 'CTA'],
        textOverlays: ['save the shelf setup'],
        complianceNotes: ['Use structure only; rebuild footage and captions.'],
      },
    });

    const result = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Stackable Storage Box',
      category: 'home storage',
      platforms: ['TikTok Shop'],
      references: ['https://example.test/ref'],
      productAssets: ['https://cdn.example.test/box.png'],
    });

    const script = result.pack.artifacts.find(artifact => artifact.title === 'Script Pack')?.content || '';
    const storyboard = result.pack.artifacts.find(artifact => artifact.title === 'Storyboard')?.content || '';
    const brief = result.pack.artifacts.find(artifact => artifact.title === 'Campaign Video Brief')?.content || '';

    expect(script).toContain('Open with the organized result before explaining the storage product.');
    expect(script).toContain('creative_insight_id=');
    expect(storyboard).toContain('creative_insight_id=');
    expect(brief).toContain('Creative insights: 1');
    const remix = result.pack.artifacts.find(artifact => artifact.title === 'Smart Remix Plan')?.content || '';
    expect(result.pack.remixPlan[0]).toMatchObject({
      source: 'creative-opportunity',
      label: 'TikTok Shop proof_test 变体',
    });
    expect(remix).toContain('Cut plan:');
    expect(remix).toContain('creative_insight_id=');
    expect(result.asset.evidence).toContain('Creative opportunities: 1');
    expect(result.asset.evidence).toContain('Remix variants: 2');
    expect(result.asset.evidence).toContain('Remix: TikTok Shop proof_test 变体 / creative-opportunity');
    expect(result.asset.evidence).toContain('Remix: TikTok Shop 打法簇混剪 / pattern-cluster');
    expect(result.asset.evidence).toContain('Top hook: proof');

    const queue = await getIndustrialVideoProductionQueue(orgId, projectId);
    expect(queue.items[0].remixPlan[0]).toMatchObject({
      label: 'TikTok Shop proof_test 变体',
      source: 'creative-opportunity',
    });
  });

  it('serves the video workflow bridge through an API without exposing secrets', async () => {
    const orgId = `video-api-${Date.now()}`;
    const response = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        projectId: 'launch-video-1',
        productName: 'Travel Storage Bag',
        category: 'travel',
        platforms: ['TikTok Shop'],
        providerConfigured: true,
        legalConsent: false,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.pack.mode).toBe('handoff_only');
    expect(body.asset.source).toBe('industrial-video-workflow');
    expect(body.distributionPlans).toHaveLength(1);
    expect(body.queue.itemCount).toBe(1);
    expectNoSecretMaterial(body);
  });

  it('serves one-click video operation through the API as a gated internal orchestration result', async () => {
    const orgId = `one-click-video-api-${Date.now()}`;
    const response = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        action: 'create-one-click-operation',
        projectId: 'one-click-api-project',
        productName: 'Travel Makeup Pouch',
        category: 'travel',
        platforms: ['TikTok Shop', 'Instagram Reels'],
        references: ['https://example.test/ref-video'],
        productAssets: ['https://cdn.example.test/pouch.png'],
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.operation.workflow.asset.source).toBe('industrial-video-workflow');
    expect(body.operation.queue.itemCount).toBe(1);
    expect(body.operation.capabilityStates).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'one_click_video', status: 'provider_gated' }),
      expect.objectContaining({ id: 'scale_claims', status: 'provider_gated' }),
    ]));
    expect(body.operation.externalRequirements).toEqual(expect.arrayContaining([
      expect.stringContaining('real video generation/editing provider'),
    ]));
    expect(body.operation.commerciallyExecutable).toBe(false);
    expectNoSecretMaterial(body);
  });

  it('serves real video provider submission through the API from server-side env only', async () => {
    const orgId = `video-submit-api-${Date.now()}`;
    const projectId = 'video-submit-api-project';
    const providerToken = 'provider-token-should-not-leak';
    vi.stubEnv('VIDEO_PROVIDER_SUBMIT_ENDPOINT', 'https://provider.example.test/video/submit');
    vi.stubEnv('VIDEO_PROVIDER_SUBMIT_TOKEN', providerToken);
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({ Authorization: `Bearer ${providerToken}` });
      return new Response(JSON.stringify({ taskId: 'api-real-provider-task', estimatedCostCents: 1500 }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const createRes = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        projectId,
        productName: 'Foldable Storage Bin',
        platforms: ['TikTok Shop'],
        references: ['https://example.test/ref'],
        productAssets: ['https://cdn.example.test/bin.png'],
        providerConfigured: true,
        legalConsent: true,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const createBody = await createRes.json();

    const submitRes = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        action: 'execute-provider-submission',
        projectId,
        sourceHandoffAssetId: createBody.asset.id,
        dispatchId: createBody.distributionDispatches[0].id,
        requestPayload: { ratio: '9:16', durationSeconds: 15 },
        maxCostCents: 5000,
        estimatedCostCents: 1200,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const submitBody = await submitRes.json();

    expect(submitRes.status).toBe(201);
    expect(submitBody.submission.status).toBe('submitted');
    expect(submitBody.submission.execution.taskId).toBe('api-real-provider-task');
    expect(submitBody.queue.submittedProviderExecutionCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(submitBody)).not.toContain(providerToken);
  });

  it('serves provider callbacks through the API without accepting fake completed results', async () => {
    const orgId = `video-callback-api-${Date.now()}`;
    const projectId = 'video-callback-api-project';
    const createRes = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        projectId,
        productName: 'Portable Blender',
        platforms: ['TikTok Shop'],
        references: ['https://example.test/ref'],
        productAssets: ['https://cdn.example.test/blender.png'],
        providerConfigured: true,
        legalConsent: true,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const createBody = await createRes.json();

    const submitRes = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        action: 'submit-provider-execution',
        projectId,
        sourceHandoffAssetId: createBody.asset.id,
        dispatchId: createBody.distributionDispatches[0].id,
        taskId: 'api-provider-task',
        maxCostCents: 5000,
        estimatedCostCents: 1200,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const submitBody = await submitRes.json();
    expect(submitRes.status).toBe(201);
    expect(submitBody.execution.status).toBe('submitted');

    const unsignedBeforeConfigRes = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        action: 'provider-callback',
        projectId,
        taskId: 'api-provider-task',
        status: 'running',
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const unsignedBeforeConfigBody = await unsignedBeforeConfigRes.json();
    expect(unsignedBeforeConfigRes.status).toBe(503);
    expect(unsignedBeforeConfigBody.error).toBe('video_provider_signature_not_configured');

    vi.stubEnv('VIDEO_PROVIDER_WEBHOOK_SECRET', videoWebhookSecret);

    const unsignedRes = await POST(buildSignedVideoWebhookRequest(orgId, {
      action: 'provider-callback',
      projectId,
      taskId: 'api-provider-task',
      status: 'running',
    }, null));
    const unsignedBody = await unsignedRes.json();
    expect(unsignedRes.status).toBe(403);
    expect(unsignedBody.error).toBe('video_provider_signature_required');

    const wrongSignatureRes = await POST(buildSignedVideoWebhookRequest(orgId, {
      action: 'provider-callback',
      projectId,
      taskId: 'api-provider-task',
      status: 'running',
    }, `sha256=${'0'.repeat(64)}`));
    const wrongSignatureBody = await wrongSignatureRes.json();
    expect(wrongSignatureRes.status).toBe(403);
    expect(wrongSignatureBody.error).toBe('video_provider_signature_invalid');

    const missingNonceRes = await POST(buildSignedVideoWebhookRequest(orgId, {
        action: 'provider-callback',
        projectId,
        taskId: 'api-provider-task',
        status: 'running',
      }));
    const missingNonceBody = await missingNonceRes.json();
    expect(missingNonceRes.status).toBe(403);
    expect(missingNonceBody.error).toBe('video_provider_callback_denied');

    const fakeCompletedRes = await POST(buildSignedVideoWebhookRequest(orgId, {
        action: 'provider-callback',
        projectId,
        taskId: 'api-provider-task',
        status: 'completed',
        resultUrls: [],
        callbackNonce: submitBody.execution.callbackNonce,
      }));
    const fakeCompletedBody = await fakeCompletedRes.json();
    expect(fakeCompletedRes.status).toBe(409);
    expect(fakeCompletedBody.execution.status).toBe('failed');
    expect(fakeCompletedBody.execution.blockedReasons).toContain('completed_callback_missing_result_url');

    const secondSubmitRes = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        action: 'submit-provider-execution',
        projectId,
        sourceHandoffAssetId: createBody.asset.id,
        dispatchId: createBody.distributionDispatches[0].id,
        taskId: 'api-provider-task-2',
        maxCostCents: 5000,
        estimatedCostCents: 1200,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const secondSubmitBody = await secondSubmitRes.json();
    expect(secondSubmitRes.status).toBe(201);

    const completedRes = await POST(buildSignedVideoWebhookRequest(orgId, {
        action: 'provider-callback',
        projectId,
        taskId: 'api-provider-task-2',
        status: 'completed',
        resultUrls: ['https://cdn.example.test/api-provider-task-2.mp4'],
        actualCostCents: 1400,
        callbackNonce: secondSubmitBody.execution.callbackNonce,
      }));
    const completedBody = await completedRes.json();
    expect(completedRes.status).toBe(200);
    expect(completedBody.execution.status).toBe('completed');
    expect(completedBody.execution.resultAssetIds).toHaveLength(1);
    expect(completedBody.execution.reviewPortalUrls[0]).toContain('/review/');
    expect(completedBody.queue.completedProviderExecutionCount).toBe(1);
    expect(completedBody.queue.resultAssetCount).toBe(1);
    expect(completedBody.queue.clientReviewCount).toBe(1);
    expect(completedBody.queue.items[0].resultUrls).toContain('https://cdn.example.test/api-provider-task-2.mp4');
  });

  it('returns operator-readable validation errors for missing video workflow input', async () => {
    const res = await POST(new Request('http://localhost/api/industrial-chain/video-workflow', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'missing-product' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('video_workflow_required');
    expect(body.message).toContain('产品名');
  });

  it('connects workflow handoff, production result, review link, and client approval in the queue', async () => {
    const orgId = `video-review-loop-${Date.now()}`;
    const projectId = `video-review-project-${Date.now()}`;
    const workflow = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Travel Storage Bag',
      references: ['https://example.test/ref-video'],
      productAssets: ['https://cdn.example.test/bag.png'],
      platforms: ['TikTok Shop'],
      providerConfigured: true,
      legalConsent: true,
    });

    const result = await ingestIndustrialProductionResult(orgId, {
      projectId,
      sourceHandoffAssetId: workflow.asset.id,
      dispatchId: workflow.distributionDispatches[0].id,
      channel: 'TikTok Shop',
      createReviewLinks: true,
      task: {
        taskId: 'kz-video-review',
        status: 'completed',
        assetUrls: ['https://cdn.example.test/review-video.mp4'],
      },
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].deliveryStatus).toBe('client_review');
    expect(result.reviewLinks).toHaveLength(1);
    expect(result.reviewLinks[0].status).toBe('active');

    const pendingQueue = await getIndustrialVideoProductionQueue(orgId, projectId);
    expect(pendingQueue.resultAssetCount).toBe(1);
    expect(pendingQueue.clientReviewCount).toBe(1);
    expect(pendingQueue.approvedDeliverableCount).toBe(0);
    expect(pendingQueue.items[0]).toMatchObject({
      assetId: workflow.asset.id,
      stage: 'client_review',
      priority: 'high',
      resultAssetCount: 1,
      clientReviewAssetCount: 1,
      approvedDeliverableCount: 0,
      loopCompletionScore: 65,
    });
    expect(pendingQueue.items[0].reviewLinks[0].token).toBe(result.reviewLinks[0].token);
    expect(pendingQueue.items[0].handoffPacket.reviewPortalUrls).toEqual([`/review/${result.reviewLinks[0].token}`]);
    expect(pendingQueue.items[0].handoffPacket.missingEvidence).toContain('Missing client approval or revision decision.');
    expect(pendingQueue.items[0].nextActions).toContain('Send the review portal link to the client and capture approval or revision feedback.');

    const approval = await approveIndustrialReviewLink(result.reviewLinks[0].token, { approvalName: 'Buyer Ops' });
    expect(approval?.approvedNow).toBe(true);

    const approvedQueue = await getIndustrialVideoProductionQueue(orgId, projectId);
    expect(approvedQueue.clientReviewCount).toBe(1);
    expect(approvedQueue.approvedDeliverableCount).toBe(1);
    expect(approvedQueue.averageLoopCompletionScore).toBe(85);
    expect(approvedQueue.items[0].stage).toBe('approved');
    expect(approvedQueue.items[0].handoffPacket.missingEvidence).toEqual(['Missing post-publish performance return.']);
    expect(approvedQueue.items[0].runbookActions.map(action => action.id)).toContain('import-performance-return');
    expect(approvedQueue.items[0].reviewLinks[0].status).toBe('approved');
    expect(approvedQueue.items[0].blockers).not.toContain('Produced video assets are waiting for client review approval.');
  });

  it('serves the video production queue through GET', async () => {
    const orgId = `video-queue-api-${Date.now()}`;
    const projectId = 'video-queue-project';
    await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Mini Projector',
      references: ['https://example.test/ref'],
      productAssets: ['https://cdn.example.test/projector.png'],
      platforms: ['TikTok Shop'],
    });

    const res = await GET(new Request(`http://localhost/api/industrial-chain/video-workflow?projectId=${projectId}`, {
      headers: { 'x-tenant-id': orgId },
    }) as unknown as Parameters<typeof GET>[0]);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.queue.itemCount).toBe(1);
    expect(body.queue.items[0].channels).toContain('TikTok Shop');
  });
});
