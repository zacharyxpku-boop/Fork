import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, buildReadinessInput } from '@/app/api/readiness/route';
import { createAssetAccessGrant, recordAssetPermissionAccessAudit, upsertAssetPermission, upsertAssetSecurityPolicy, upsertAssetStorageObject } from '@/lib/asset-permission-ledger';
import { upsertChannelAccount, upsertChannelAdCampaign } from '@/lib/channel-account-ledger';
import { addCreativeInsight } from '@/lib/creative-intelligence';
import { importCreativeMonitorSignal, runCreativeMonitoringHarvest, runCreativeSourceSync, upsertCreativeCollectorAdapter, upsertCreativeMonitor, upsertCreativeSource } from '@/lib/creative-monitoring';
import { approveIndustrialReviewLink } from '@/lib/industrial-review-portal';
import { createIndustrialVideoWorkflow, submitVideoProviderExecution, updateVideoProviderExecution } from '@/lib/industrial-video-workflow';
import {
  addContentAsset,
  addDistributionPlan,
  addPerformanceReturn,
  createDistributionDispatch,
  updateContentAssetDelivery,
  updateDistributionDispatch,
} from '@/lib/industrial-chain-store';
import { evaluatePerformanceImport, parsePerformanceCsv } from '@/lib/performance-import';
import { buildPlatformConnectorReadiness } from '@/lib/platform-connector-readiness';
import { evaluateProductReadiness } from '@/lib/product-readiness';
import { upsertScaleClaimRecord } from '@/lib/scale-claim-ledger';

afterEach(() => {
  vi.unstubAllEnvs();
});

const completePlatformConnectors = buildPlatformConnectorReadiness({
  TIKTOK_OAUTH_CLIENT_ID: 'client-id',
  TIKTOK_OAUTH_CLIENT_SECRET: 'client-secret',
  TIKTOK_ACCESS_TOKEN: 'access-token',
  TIKTOK_ADVERTISER_ID: 'advertiser-id',
  TIKTOK_PUBLISH_ACCESS_TOKEN: 'publish-token',
  PLATFORM_ANALYTICS_SYNC_ENABLED: '1',
  TIKTOK_ANALYTICS_ACCESS_TOKEN: 'analytics-token',
  ENTERPRISE_ASSET_RBAC_ENABLED: '1',
  ASSET_CLOUD_BUCKET: 'asset-bucket',
  VIDEO_PROVIDER_WEBHOOK_SECRET: 'webhook-secret',
});

describe('product readiness against Kuaizi benchmark', () => {
  it('keeps provider-gated distribution as a visible competitor gap instead of pretending parity', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      platformConnectors: completePlatformConnectors,
      emailConfigured: true,
      authConfigured: true,
    });

    expect(report.verdict).toBe('conditional');
    expect(report.score).toBeGreaterThanOrEqual(82);
    expect(report.features.some(feature => feature.name === 'Distribution and ad authorization')).toBe(true);
    expect(report.workflows.find(workflow => workflow.name.includes('Distribution -> ad account'))?.ok).toBe(true);
    expect(report.issues.some(issue => issue.priority === 'P2' && issue.title.includes('分发'))).toBe(true);
  });

  it('flags provider-gated production as friend-trial risk without creating P0 blockers', () => {
    const report = evaluateProductReadiness({
      aiConfigured: false,
      storageConfigured: false,
      kuaiziConfigured: false,
      imageConfigured: false,
      videoConfigured: false,
      videoTeardownConfigured: false,
      performanceImportAvailable: false,
      commerceChainAvailable: false,
      industrialChainAvailable: false,
      distributionExecutionAvailable: false,
      emailConfigured: false,
      authConfigured: false,
    });

    expect(report.verdict).toBe('fail');
    expect(report.issues.some(issue => issue.priority === 'P0')).toBe(false);
    expect(report.friendTrialRisks.length).toBeGreaterThan(0);
    expect(report.friendTrialRisks.map(issue => issue.priority)).not.toContain('P2');
  });

  it('builds readiness input from server-side env only', () => {
    vi.stubEnv('AI_API_KEY', 'dashscope-key');
    vi.stubEnv('KUAIZI_API_KEY', 'kuaizi-key');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example.test');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'redis-token');
    vi.stubEnv('JWT_SECRET', 'jwt-secret');
    vi.stubEnv('TIKTOK_OAUTH_CLIENT_ID', 'client-id');
    vi.stubEnv('TIKTOK_OAUTH_CLIENT_SECRET', 'client-secret');
    vi.stubEnv('TIKTOK_ACCESS_TOKEN', 'access-token');
    vi.stubEnv('TIKTOK_ADVERTISER_ID', 'advertiser-id');
    vi.stubEnv('TIKTOK_PUBLISH_ACCESS_TOKEN', 'publish-token');
    vi.stubEnv('PLATFORM_ANALYTICS_SYNC_ENABLED', '1');
    vi.stubEnv('TIKTOK_ANALYTICS_ACCESS_TOKEN', 'analytics-token');
    vi.stubEnv('ENTERPRISE_ASSET_RBAC_ENABLED', '1');
    vi.stubEnv('ASSET_CLOUD_BUCKET', 'asset-bucket');
    vi.stubEnv('VIDEO_PROVIDER_WEBHOOK_SECRET', 'webhook-secret');

    expect(buildReadinessInput()).toMatchObject({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      platformConnectors: {
        platformAutomationReady: true,
        missingCapabilities: [],
        videoWebhookSignatureConfigured: true,
      },
      authConfigured: true,
    });
  });

  it('tracks platform connector automation without leaking secret values', () => {
    const readiness = buildPlatformConnectorReadiness({
      TIKTOK_OAUTH_CLIENT_ID: 'client-id',
      TIKTOK_OAUTH_CLIENT_SECRET: 'oauth-secret-should-not-leak',
      TIKTOK_ACCESS_TOKEN: 'ad-token-should-not-leak',
      TIKTOK_ADVERTISER_ID: 'advertiser-id',
      TIKTOK_PUBLISH_ACCESS_TOKEN: 'publish-secret-should-not-leak',
      PLATFORM_ANALYTICS_SYNC_ENABLED: '1',
      TIKTOK_ANALYTICS_ACCESS_TOKEN: 'analytics-secret-should-not-leak',
      ENTERPRISE_ASSET_RBAC_ENABLED: '1',
      ASSET_CLOUD_PROJECT_ID: 'asset-project',
      VIDEO_PROVIDER_WEBHOOK_SECRET: 'webhook-secret-should-not-leak',
    });
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      platformConnectors: readiness,
      emailConfigured: true,
      authConfigured: true,
    });

    expect(readiness.platformAutomationReady).toBe(true);
    expect(report.features.find(feature => feature.name === 'Platform connector automation ledger')?.status).toBe('implemented');
    expect(report.workflows.find(workflow => workflow.name.includes('Platform OAuth'))?.ok).toBe(true);
    expect(JSON.stringify(report)).not.toContain('oauth-secret-should-not-leak');
    expect(JSON.stringify(report)).not.toContain('ad-token-should-not-leak');
    expect(JSON.stringify(report)).not.toContain('publish-secret-should-not-leak');
    expect(JSON.stringify(report)).not.toContain('webhook-secret-should-not-leak');
  });

  it('blocks Kuaizi parity when platform connector automation is incomplete', () => {
    const readiness = buildPlatformConnectorReadiness({
      TIKTOK_OAUTH_CLIENT_ID: 'client-id',
      TIKTOK_OAUTH_CLIENT_SECRET: 'client-secret',
    });
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      platformConnectors: readiness,
      emailConfigured: true,
      authConfigured: true,
    });

    expect(readiness.platformAutomationReady).toBe(false);
    expect(readiness.missingCapabilities).toContain('adAccountConfigured');
    expect(readiness.missingCapabilities).toContain('videoWebhookSignatureConfigured');
    expect(report.verdict).toBe('conditional');
    expect(report.friendTrialRisks.some(issue => issue.title.includes('platform automation'))).toBe(true);
    expect(report.competitor.find(item => item.name === 'Platform automation depth')?.gap).toBe('severe');
  });

  it('returns a concrete external integration packet instead of leaving provider gaps as prose', () => {
    const readiness = buildPlatformConnectorReadiness({
      TIKTOK_OAUTH_CLIENT_ID: 'client-id',
      TIKTOK_OAUTH_CLIENT_SECRET: 'client-secret',
    });
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: false,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: false,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      platformConnectors: readiness,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'external-packet-org',
        projectId: 'external-packet-project',
        assetCount: 1,
        planCount: 1,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        measuredDispatchCount: 0,
        performanceReturnCount: 0,
        scaleDecisionCount: 0,
        missingLinks: ['Missing provider execution evidence'],
        nextActions: ['Attach provider credentials'],
      },
    });

    expect(report.externalRequirements).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'video-provider-submit-callback',
        category: 'video_provider',
        status: 'missing',
        materialPriority: 'P0',
        unlocks: expect.stringContaining('One-click video'),
        blockedGate: expect.stringContaining('Create/Cut remain production handoff'),
        missingImpact: expect.stringContaining('stable video factory'),
        operatorAction: expect.stringContaining('provider submit endpoint'),
        acceptanceEvidence: expect.stringContaining('provider task id'),
        requiredInputs: expect.arrayContaining(['provider submit endpoint', 'server-side provider token', 'webhook signing secret']),
        releaseChecks: expect.arrayContaining([
          'Material is configured in a secure server-side location.',
          'Sandbox or least-privilege access is available before production access.',
          'A verifiable callback, receipt, ledger, or audit event proves the integration.',
        ]),
      }),
      expect.objectContaining({
        id: 'platform-oauth-account-pool',
        category: 'platform_oauth',
        status: 'configured',
      }),
      expect.objectContaining({
        id: 'ad-account-authorization',
        category: 'ad_delivery',
        status: 'missing',
      }),
      expect.objectContaining({
        id: 'audited-scale-ledger',
        category: 'scale_claims',
        status: 'evidence_required',
        materialPriority: 'P1',
        unlocks: expect.stringContaining('Wenai-owned creative output'),
        blockedGate: expect.stringContaining('competitor benchmarks'),
        securityBoundary: expect.stringContaining('Do not convert competitor public numbers into Wenai-owned claims'),
        releaseChecks: expect.arrayContaining([
          expect.stringContaining('benchmark-only'),
        ]),
      }),
    ]));
    expect(report.materialGateSummary).toEqual(expect.objectContaining({
      total: 8,
      configured: expect.any(Number),
      missingP0: expect.any(Number),
      missingP1: expect.any(Number),
      blocksCommercialLaunch: true,
      evidence: expect.stringContaining('missingP0='),
      nextMaterialPacks: expect.arrayContaining([
        expect.stringContaining('P0: Real video generation/editing provider'),
      ]),
    }));
    expect(report.scaleClaimGuards).toEqual(expect.arrayContaining([
      expect.objectContaining({ requestedBenchmark: '91M+ creative output', canDisplay: false }),
      expect.objectContaining({ requestedBenchmark: '42M+ video distribution', canDisplay: false }),
    ]));
    expect(JSON.stringify(report)).not.toContain('client-secret');
  });

  it('publishes the final product blueprint, competitor references, and UI variant guides as structured readiness data', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: false,
      videoTeardownConfigured: false,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      platformConnectors: buildPlatformConnectorReadiness({
        TIKTOK_OAUTH_CLIENT_ID: 'client-id',
        TIKTOK_OAUTH_CLIENT_SECRET: 'client-secret',
      }),
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'variant-org',
        projectId: 'variant-project',
        assetCount: 1,
        governedAssetCount: 1,
        planCount: 1,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        measuredDispatchCount: 0,
        performanceReturnCount: 0,
        scaleDecisionCount: 0,
        creativeInsightCount: 2,
        creativeSourceDepthScore: 40,
        channelAccountCount: 1,
        channelReadyAdCampaignCount: 0,
        assetPermissionAccessAuditEventCount: 1,
        missingLinks: ['No measured dispatch yet'],
        nextActions: ['Import performance return'],
      },
    });

    expect(report.productBlueprint.map(layer => layer.id)).toEqual(['Compose', 'Create', 'Cut', 'Cast', 'Manage']);
    expect(report.productBlueprint.find(layer => layer.id === 'Cut')).toMatchObject({
      currentStatus: 'partial',
    });
    expect(report.productBlueprint.find(layer => layer.id === 'Manage')?.stopLine).toContain('91M+ creative output');
    expect(report.alternativeReferences.map(reference => reference.name)).toEqual(expect.arrayContaining([
      'Hookshot / Hookly',
      'Hooksy / Hooked',
      'Omneky',
      'AdHawk / AI Media Buyer',
      'Creatify / UGC video ads',
      'Marpipe / catalog creative testing',
      'Pencil / generative ad creative',
      'Smartly.io / creative-media-intelligence',
      'VidMob / creative analytics',
      'Creatopy / brand-safe ad generation',
      'Superads / creative insights',
    ]));
    expect(report.alternativeReferences.find(reference => reference.name === 'Omneky')?.wenaiDecision).toContain('campaign ledger');
    expect(report.alternativeReferences.find(reference => reference.name === 'Creatify / UGC video ads')?.boundary).toContain('provider 回调');
    expect(report.alternativeReferences.find(reference => reference.name === 'Marpipe / catalog creative testing')?.wenaiDecision).toContain('SKU feed');
    expect(report.alternativeReferences.find(reference => reference.name === 'Pencil / generative ad creative')?.wenaiDecision).toContain('品牌学习档案');
    expect(report.alternativeReferences.find(reference => reference.name === 'VidMob / creative analytics')?.wenaiDecision).toContain('AI 视频分析');
    expect(report.alternativeReferences.find(reference => reference.name === 'Creatopy / brand-safe ad generation')?.wenaiDecision).toContain('品牌资产');
    expect(report.alternativeReferences.find(reference => reference.name === 'Superads / creative insights')?.wenaiDecision).toContain('跨平台性能信号');
    expect(report.uiVariants.map(variant => variant.id)).toEqual(['partner', 'operator', 'friend_trial']);
    expect(report.uiVariants.find(variant => variant.id === 'friend_trial')?.stopLine).toContain('环境变量');
    expect(JSON.stringify(report)).not.toContain('client-secret');
  });

  it('serves the product maturity report through /api/readiness', async () => {
    vi.stubEnv('AI_API_KEY', '');
    vi.stubEnv('KUAIZI_API_KEY', 'kz_live_secret_should_not_leak');
    vi.stubEnv('TIKTOK_OAUTH_CLIENT_SECRET', 'oauth_secret_should_not_leak');
    vi.stubEnv('TIKTOK_ACCESS_TOKEN', 'ad_token_should_not_leak');

    const response = await GET(new NextRequest('http://localhost/api/readiness'));
    const body = await response.json();

    expect(body.benchmark).toBe('kuaizi');
    expect(body.report.features.length).toBeGreaterThan(5);
    expect(body.report.competitor.length).toBeGreaterThan(0);
    expect(body.report.externalRequirements.map((item: { id: string }) => item.id)).toEqual(expect.arrayContaining([
      'video-provider-submit-callback',
      'multimodal-video-parser',
      'platform-oauth-account-pool',
      'ad-account-authorization',
      'platform-auto-publish',
      'platform-analytics-sync',
      'enterprise-asset-cloud',
      'audited-scale-ledger',
    ]));
    expect(body.report.externalRequirements).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'platform-analytics-sync',
        materialPriority: 'P1',
        unlocks: expect.stringContaining('Scheduled metric sync'),
        missingImpact: expect.stringContaining('learning loop'),
        securityBoundary: expect.stringContaining('Secrets must be configured server-side'),
        releaseChecks: expect.arrayContaining([
          expect.stringContaining('Sandbox or least-privilege access'),
        ]),
      }),
      expect.objectContaining({
        id: 'enterprise-asset-cloud',
        materialPriority: 'P1',
        blockedGate: expect.stringContaining('internal permission ledger'),
        operatorAction: expect.stringContaining('isolated bucket'),
      }),
    ]));
    expect(body.report.materialGateSummary).toEqual(expect.objectContaining({
      total: 8,
      blocksCommercialLaunch: true,
      evidence: expect.stringContaining('configured='),
      nextMaterialPacks: expect.arrayContaining([
        expect.stringContaining('P0:'),
      ]),
    }));
    expect(body.report.scaleClaimGuards).toEqual(expect.arrayContaining([
      expect.objectContaining({ requestedBenchmark: '91M+ creative output', canDisplay: false }),
      expect.objectContaining({ requestedBenchmark: '42M+ video distribution', canDisplay: false }),
    ]));
    expect(body.report.productBlueprint.map((item: { id: string }) => item.id)).toEqual(['Compose', 'Create', 'Cut', 'Cast', 'Manage']);
    expect(body.report.alternativeReferences.map((item: { name: string }) => item.name)).toEqual(expect.arrayContaining([
      'Hookshot / Hookly',
      'Omneky',
      'AdHawk / AI Media Buyer',
      'Creatify / UGC video ads',
      'Marpipe / catalog creative testing',
      'Pencil / generative ad creative',
    ]));
    expect(body.report.uiVariants.map((item: { id: string }) => item.id)).toEqual(expect.arrayContaining([
      'partner',
      'operator',
      'friend_trial',
    ]));
    expect(JSON.stringify(body)).not.toContain('kz_live_secret_should_not_leak');
    expect(JSON.stringify(body)).not.toContain('oauth_secret_should_not_leak');
    expect(JSON.stringify(body)).not.toContain('ad_token_should_not_leak');
  });

  it('uses project-level industrial evidence when projectId is supplied', async () => {
    const orgId = `readiness-org-${Date.now()}`;
    const projectId = `readiness-project-${Date.now()}`;
    const video = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Launch video',
      evidence: 'Produced asset URL accepted by client',
    });
    await updateContentAssetDelivery(orgId, video.id, {
      deliveryStatus: 'approved',
      clientApprovedAt: new Date().toISOString(),
      evidence: 'Client approved in review portal.',
    });
    await addContentAsset(orgId, { projectId, type: 'brief', title: 'Production brief', evidence: 'SKU claim sheet' });
    await addContentAsset(orgId, { projectId, type: 'benchmark', title: 'Benchmark', evidence: 'Competitor hook matrix' });
    const workflow = await createIndustrialVideoWorkflow(orgId, {
      projectId,
      productName: 'Launch video workflow',
      references: ['https://example.test/reference-video'],
      productAssets: ['https://cdn.example.test/product.png'],
      platforms: ['TikTok Shop'],
      providerConfigured: true,
      legalConsent: true,
    });
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: workflow.asset.id,
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
      auditNote: 'Video workflow source asset can publish completed provider results.',
      actor: 'ops',
    });
    await upsertAssetStorageObject(orgId, {
      projectId,
      assetId: workflow.asset.id,
      provider: 'external',
      objectKey: `readiness/${workflow.asset.id}`,
      contentType: 'video/mp4',
      byteSize: 4096,
      downloadUrl: 'https://cdn.example.test/workflow-source.mp4',
      shareUrl: 'https://cdn.example.test/share/workflow-source',
    });
    await createAssetAccessGrant(orgId, {
      projectId,
      assetId: workflow.asset.id,
      action: 'download',
      role: 'distribution',
      maxUses: 5,
    });
    await upsertAssetSecurityPolicy(orgId, {
      projectId,
      assetId: workflow.asset.id,
      watermarkRequired: true,
      watermarkApplied: true,
      dlpScanStatus: 'passed',
      publicShareAllowed: false,
      retentionDays: 365,
      auditNote: 'Workflow source asset passed DLP and watermark checks.',
    });
    const providerExecution = await submitVideoProviderExecution(orgId, {
      projectId,
      sourceHandoffAssetId: workflow.asset.id,
      dispatchId: workflow.distributionDispatches[0].id,
      providerName: 'configured-video-provider',
      taskId: 'readiness-provider-task',
      requestPayload: { ratio: '9:16', durationSeconds: 15 },
      maxCostCents: 5000,
      estimatedCostCents: 1200,
    });
    const completedProviderExecution = await updateVideoProviderExecution(orgId, {
      projectId,
      executionId: providerExecution.id,
      status: 'completed',
      resultUrls: ['https://cdn.example.test/readiness-video.mp4'],
      actualCostCents: 1500,
      callbackNonce: providerExecution.callbackNonce,
    });
    for (const assetId of completedProviderExecution?.resultAssetIds || []) {
      await upsertAssetSecurityPolicy(orgId, {
        projectId,
        assetId,
        watermarkRequired: true,
        watermarkApplied: true,
        dlpScanStatus: 'passed',
        publicShareAllowed: false,
        retentionDays: 365,
        auditNote: 'Provider result asset passed review portal security checks.',
      });
    }
    const reviewToken = completedProviderExecution?.reviewPortalUrls[0]?.replace('/review/', '');
    expect(reviewToken).toBeTruthy();
    await approveIndustrialReviewLink(reviewToken!, { approvalName: 'Buyer Ops' });
    await updateDistributionDispatch(orgId, workflow.distributionDispatches[0].id, {
      status: 'measured',
      evidenceUrls: ['https://example.test/video/post'],
      resultUrls: ['https://example.test/video/report'],
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [video.id],
      status: 'ready',
    });
    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });
    await updateDistributionDispatch(orgId, dispatch.id, {
      status: 'measured',
      evidenceUrls: ['https://example.test/post'],
      resultUrls: ['https://example.test/report'],
    });
    const report = evaluatePerformanceImport(parsePerformanceCsv(`sku,asset,platform,impressions,clicks,spend,orders,revenue
sku-1,${video.id},TikTok,10000,300,120,12,560`));
    await addPerformanceReturn(orgId, { projectId, dispatchId: dispatch.id, report });
    const performanceReportAsset = await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance return report',
      source: 'performance-import',
      evidence: 'Rows: 1\nScale: 1\nRevenue: 560',
    });
    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [performanceReportAsset.id, video.id],
      status: 'draft',
      owner: 'ops',
    });
    await addCreativeInsight(orgId, {
      projectId,
      source: 'competitor-account',
      platform: 'TikTok Shop',
      title: 'Competitor demo hook',
      hookType: 'demo',
      pacing: 'fast',
      reusableAngle: 'Open with the problem scene and switch to the SKU proof by second three.',
      metrics: { views: 12000, sales: 120 },
    });
    await addCreativeInsight(orgId, {
      projectId,
      source: 'trend-rank',
      platform: 'TikTok Shop',
      title: 'Category rank hook',
      hookType: 'proof',
      pacing: 'medium',
      reusableAngle: 'Use category proof as the setup before showing the product variant.',
      metrics: { views: 20000, revenue: 9000 },
    });
    const competitorMonitor = await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'competitor_account',
      platform: 'TikTok Shop',
      target: '@operator-competitor',
      cadenceHours: 24,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });
    await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'trend_rank',
      platform: 'TikTok Shop',
      target: 'category rank videos',
      cadenceHours: 24,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });
    await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'video_keyword',
      platform: 'TikTok Shop',
      target: 'category teardown videos',
      cadenceHours: 24,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });
    await importCreativeMonitorSignal(orgId, {
      monitorId: competitorMonitor.id,
      title: 'Monitored proof hook',
      hookType: 'proof',
      pacing: 'fast',
      reusableAngle: 'Use monitored proof hook as the next first-three-seconds test.',
      metrics: { views: 30000, sales: 80 },
    });
    await runCreativeMonitoringHarvest(orgId, {
      projectId,
      observations: [{
        type: 'video_keyword',
        platform: 'TikTok Shop',
        target: 'category teardown videos',
        title: 'Monitored category teardown',
        hookType: 'proof',
        pacing: 'fast',
        reusableAngle: 'Use proof-first video structure while rebuilding all scenes and claims.',
        proofPoint: 'Visible before/after appears in the opening beat.',
        cta: 'Shop the launch SKU.',
        metrics: { views: 44000, saves: 1200 },
        teardown: {
          openingHook: 'Problem frame and proof result appear before product detail.',
          sceneBeats: ['problem frame', 'proof result', 'product demo', 'CTA'],
          proofMoment: 'Before/after proof is visible by second two.',
          productMoment: 'SKU enters after proof result.',
          ctaMoment: 'CTA overlay closes the video.',
          textOverlays: ['before', 'after', 'shop'],
          complianceNotes: ['Do not copy footage or captions.'],
        },
      }],
    });
    await upsertCreativeCollectorAdapter(orgId, {
      projectId,
      mode: 'provider',
      providerName: 'authorized-video-rank-collector',
      endpointConfigured: true,
      authConfigured: true,
      supportedMonitorTypes: ['competitor_account', 'trend_rank', 'video_keyword'],
      lastHeartbeatAt: new Date().toISOString(),
    });
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'account_tracking',
      platform: 'TikTok Shop',
      providerName: 'authorized-account-tracker',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: '@operator-competitor, @adjacent-a, @adjacent-b',
      lastSyncAt: new Date().toISOString(),
    });
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'trend_rank',
      platform: 'TikTok Shop',
      providerName: 'authorized-rank-feed',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: 'category rank videos and top seller feed',
      lastSyncAt: new Date().toISOString(),
    });
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'video_teardown',
      platform: 'TikTok Shop',
      providerName: 'authorized-multimodal-parser',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: 'category teardown videos and licensed short video samples',
      lastSyncAt: new Date().toISOString(),
    });
    await runCreativeSourceSync(orgId, {
      projectId,
      observations: [
        {
          type: 'competitor_account',
          platform: 'TikTok Shop',
          target: '@operator-competitor',
          title: 'Provider account source sync proof',
          hookType: 'proof',
          pacing: 'fast',
          reusableAngle: 'Use the provider account signal as a first-frame proof test without copying expression.',
          metrics: { views: 31000, sales: 82 },
        },
        {
          type: 'trend_rank',
          platform: 'TikTok Shop',
          target: 'category rank videos',
          title: 'Provider rank source sync proof',
          hookType: 'comparison',
          pacing: 'fast',
          reusableAngle: 'Use rank movement as a comparison angle for the next batch.',
          metrics: { views: 36000, revenue: 9600 },
        },
        {
          type: 'video_keyword',
          platform: 'TikTok Shop',
          target: 'category teardown videos',
          title: 'Provider multimodal teardown sync proof',
          hookType: 'demo',
          pacing: 'fast',
          reusableAngle: 'Use the multimodal beat order only and rebuild all creative assets.',
          sceneBeats: ['problem frame', 'proof result', 'product demo', 'CTA'],
          transcriptSummary: 'Provider parser extracted problem, proof, product, and CTA beats.',
          metrics: { views: 46000, saves: 1250 },
        },
      ],
    });
    await runCreativeSourceSync(orgId, {
      projectId,
      now: new Date(Date.now() + 25 * 60 * 60 * 1000),
      observations: [
        {
          type: 'competitor_account',
          platform: 'TikTok Shop',
          target: '@operator-competitor',
          title: 'Provider account source repeat proof',
          hookType: 'proof',
          pacing: 'fast',
          reusableAngle: 'Use a repeated account source signal to validate the first-frame proof pattern.',
          metrics: { views: 33000, sales: 86 },
        },
        {
          type: 'trend_rank',
          platform: 'TikTok Shop',
          target: 'category rank videos',
          title: 'Provider rank source repeat proof',
          hookType: 'comparison',
          pacing: 'fast',
          reusableAngle: 'Use repeated rank movement as stronger evidence for the comparison angle.',
          metrics: { views: 39000, revenue: 9900 },
        },
        {
          type: 'video_keyword',
          platform: 'TikTok Shop',
          target: 'category teardown videos',
          title: 'Provider multimodal teardown repeat proof',
          hookType: 'demo',
          pacing: 'fast',
          reusableAngle: 'Use the repeated multimodal beat order as evidence for the remix batch.',
          sceneBeats: ['problem frame', 'proof result', 'product demo', 'CTA'],
          transcriptSummary: 'Second provider parser run extracted problem, proof, product, and CTA beats.',
          detectedObjects: ['launch SKU', 'demo scene'],
          metrics: { views: 49000, saves: 1320 },
        },
      ],
    });
    await upsertChannelAccount(orgId, {
      projectId,
      platform: 'TikTok Shop',
      handle: '@operator',
      authorizationStatus: 'manual_ready',
      healthStatus: 'healthy',
      dailyPublishLimit: 3,
      scheduledCount: 1,
    });
    await upsertChannelAdCampaign(orgId, {
      projectId,
      platform: 'TikTok Shop',
      campaignName: 'Launch paid boost',
      objective: 'sales',
      status: 'active',
      budgetCents: 50000,
      spendCents: 12000,
      evidenceUrl: 'https://ads.example.test/campaign/launch',
      metrics: { impressions: 12000, clicks: 360, conversions: 12, revenueCents: 56000 },
    });
    const permission = await upsertAssetPermission(orgId, {
      projectId,
      assetId: video.id,
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'admin', 'creative', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
      auditNote: 'Distribution-ready asset permission policy.',
    });
    await upsertAssetStorageObject(orgId, {
      projectId,
      assetId: video.id,
      provider: 'external',
      objectKey: `readiness/${video.id}`,
      contentType: 'video/mp4',
      byteSize: 8192,
      downloadUrl: 'https://cdn.example.test/launch-video.mp4',
      shareUrl: 'https://cdn.example.test/share/launch-video',
    });
    await createAssetAccessGrant(orgId, {
      projectId,
      assetId: video.id,
      action: 'share',
      role: 'distribution',
      maxUses: 5,
    });
    await upsertAssetSecurityPolicy(orgId, {
      projectId,
      assetId: video.id,
      watermarkRequired: true,
      watermarkApplied: true,
      dlpScanStatus: 'passed',
      publicShareAllowed: false,
      retentionDays: 365,
      auditNote: 'Approved delivery asset passed enterprise security checks.',
    });
    await recordAssetPermissionAccessAudit(orgId, {
      projectId,
      assetId: video.id,
      action: 'publish',
      role: 'distribution',
      operation: 'readiness_publish_gate',
      allowed: true,
      reason: 'allowed',
      record: permission,
    });
    await upsertScaleClaimRecord(orgId, {
      projectId,
      metric: 'creative_output',
      count: 91_000_000,
      platform: 'TikTok Shop',
      source: 'audited-ledger',
      dateRange: '2026-01-01 to 2026-03-31',
      dedupeRule: 'asset_id + platform_post_id + date_range',
      evidenceUrl: 'https://audit.example.test/wenai/creative-output',
      auditorNote: 'Customer confirmed deduped Wenai creative output ledger.',
    });
    await upsertScaleClaimRecord(orgId, {
      projectId,
      metric: 'video_distribution',
      count: 42_000_000,
      platform: 'TikTok Shop',
      source: 'audited-ledger',
      dateRange: '2026-01-01 to 2026-03-31',
      dedupeRule: 'dispatch_id + platform_post_id + date_range',
      evidenceUrl: 'https://audit.example.test/wenai/video-distribution',
      auditorNote: 'Customer confirmed deduped Wenai video distribution ledger.',
    });

    const response = await GET(new NextRequest(`http://localhost/api/readiness?projectId=${projectId}`, {
      headers: { 'x-tenant-id': orgId },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.projectId).toBe(projectId);
    expect(body.report.projectReadiness).toMatchObject({
      verdict: 'pass',
      score: 100,
    });
    expect(body.report.projectReadiness.evidence).toContain('performanceReturns=1');
    const evidenceNumber = (prefix: string) => {
      const item = body.report.projectReadiness.evidence.find((value: string) => value.startsWith(prefix));
      return Number(String(item || '').split('=')[1] || 0);
    };
    expect(evidenceNumber('reportAssets=')).toBeGreaterThanOrEqual(1);
    expect(evidenceNumber('nextRoundAssetPlans=')).toBeGreaterThanOrEqual(1);
    expect(evidenceNumber('creativeInsights=')).toBeGreaterThanOrEqual(4);
    expect(evidenceNumber('creativeOpportunities=')).toBeGreaterThanOrEqual(4);
    expect(body.report.projectReadiness.evidence.some((item: string) => item.startsWith('creativeAverageConfidence='))).toBe(true);
    expect(evidenceNumber('creativePatternClusters=')).toBeGreaterThanOrEqual(1);
    expect(evidenceNumber('creativeCrossSourcePatterns=')).toBeGreaterThanOrEqual(1);
    expect(evidenceNumber('creativeMoatScore=')).toBeGreaterThanOrEqual(60);
    expect(body.report.projectReadiness.evidence).toContain('creativeMonitors=3');
    expect(evidenceNumber('creativeImportedMonitorSignals=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('creativeHarvestRuns=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('creativeHarvestedInsights=')).toBeGreaterThanOrEqual(1);
    expect(body.report.projectReadiness.evidence).toContain('creativeCollectorAdapter=provider_ready');
    expect(body.report.projectReadiness.evidence).toContain('creativeCollectorProviderReady=1');
    expect(body.report.projectReadiness.evidence).toContain('creativeSources=3');
    expect(body.report.projectReadiness.evidence).toContain('creativeProviderReadySources=3');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceSyncRuns=2');
    expect(body.report.projectReadiness.evidence).toContain('creativeProviderSourceFresh=3');
    expect(body.report.projectReadiness.evidence).toContain('creativeProviderSourceFailures=0');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceSyncCoverageScore=100');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceSyncAccountObservations=1');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceSyncTrendRankObservations=1');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceSyncVideoTeardowns=1');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceSyncMultimodalParsed=1');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceObservations=6');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceRepeatSources=3');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceScaleScore=100');
    expect(body.report.projectReadiness.evidence).toContain('creativeSourceDepthScore=100');
    expect(body.report.projectReadiness.evidence).toContain('creativeReadySourceHealthCards=3');
    expect(body.report.projectReadiness.evidence).toContain('creativeAccountCoverageTargets=3');
    expect(evidenceNumber('creativeTrendRankCoverageSignals=')).toBeGreaterThanOrEqual(3);
    expect(body.report.projectReadiness.evidence).toContain('creativeVideoTeardownRepeatReady=1');
    expect(body.report.projectReadiness.evidence).toContain('creativeAccountTrackingSourceReady=1');
    expect(body.report.projectReadiness.evidence).toContain('creativeTrendRankSourceReady=1');
    expect(body.report.projectReadiness.evidence).toContain('creativeVideoTeardownSourceReady=1');
    expect(body.report.projectReadiness.evidence).toContain('channelAccounts=1');
    expect(body.report.projectReadiness.evidence).toContain('channelAdCampaigns=1');
    expect(body.report.projectReadiness.evidence).toContain('channelReadyAdCampaigns=1');
    expect(body.report.projectReadiness.evidence).toContain('channelAdBudgetCents=50000');
    expect(body.report.projectReadiness.evidence).toContain('channelAdEvidence=1');
    expect(evidenceNumber('assetPermissionRecords=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('assetPermissionAccessAuditEvents=')).toBeGreaterThanOrEqual(1);
    expect(evidenceNumber('assetStorageObjects=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('assetMissingStorageObjects=')).toBe(0);
    expect(evidenceNumber('assetSecurityPolicies=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('assetWatermarkRequired=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('assetWatermarkApplied=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('assetDlpPassedPolicies=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('assetDlpFailedPolicies=')).toBe(0);
    expect(evidenceNumber('assetPublicShareBlocked=')).toBeGreaterThanOrEqual(2);
    expect(evidenceNumber('assetRetentionPolicies=')).toBeGreaterThanOrEqual(2);
    expect(body.scaleClaims).toMatchObject({
      projectId,
      creativeOutputCount: 91_000_000,
      videoDistributionCount: 42_000_000,
      canDisplayCreativeBenchmark: true,
      canDisplayVideoBenchmark: true,
    });
    expect(body.report.projectReadiness.evidence).toContain('auditedWenaiCreativeOutput=91000000');
    expect(body.report.projectReadiness.evidence).toContain('auditedWenaiVideoDistribution=42000000');
    expect(body.report.projectReadiness.evidence).toContain('auditedScaleDedupeReady=1');
    expect(body.report.scaleClaimGuards).toEqual(expect.arrayContaining([
      expect.objectContaining({ requestedBenchmark: '91M+ creative output', canDisplay: true }),
      expect.objectContaining({ requestedBenchmark: '42M+ video distribution', canDisplay: true }),
    ]));
    expect(evidenceNumber('activeAssetAccessGrants=')).toBeGreaterThanOrEqual(2);
    expect(body.report.projectReadiness.evidence).toContain('videoQueueItems=1');
    expect(body.report.projectReadiness.evidence).toContain('videoProviderExecutions=1');
    expect(body.report.projectReadiness.evidence).toContain('videoSubmittedProviderExecutions=0');
    expect(body.report.projectReadiness.evidence).toContain('videoCompletedProviderExecutions=1');
    expect(body.report.projectReadiness.evidence).toContain('videoFailedProviderExecutions=0');
    expect(body.report.projectReadiness.evidence).toContain('videoResultAssets=1');
    expect(body.report.projectReadiness.evidence).toContain('videoClientReviews=1');
    expect(body.report.projectReadiness.evidence).toContain('videoApprovedDeliverables=1');
    expect(body.report.projectReadiness.evidence).toContain('videoMeasured=1');
    expect(body.report.projectReadiness.evidence).toContain('videoAverageLoopScore=100');
    expect(body.report.projectReadiness.evidence).toContain('brandLearningWinningAssets=1');
    expect(body.videoProductionQueue.averageLoopCompletionScore).toBe(100);
    expect(body.brandLearning.missingLinks).toEqual([]);
    expect(body.report.projectReadiness.evidence.some((item: string) => item.startsWith('brandLearningRules='))).toBe(true);
    expect(body.report.issues.some((issue: { title: string }) => issue.title.includes('项目级内容工业化'))).toBe(false);
    expect(JSON.stringify(body)).not.toContain('kz_live_secret_should_not_leak');
  });

  it('does not pass project readiness when performance has no report asset evidence', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'org-no-report',
        projectId: 'project-no-report',
        assetCount: 3,
        reportAssetCount: 0,
        planCount: 1,
        draftPlanCount: 0,
        nextRoundAssetPlanCount: 0,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        measuredDispatchCount: 1,
        performanceReturnCount: 1,
        scaleDecisionCount: 0,
        missingLinks: ['Missing performance or CRM report asset'],
        nextActions: ['Close gap: Missing performance or CRM report asset'],
      },
    });

    expect(report.projectReadiness?.verdict).not.toBe('pass');
    expect(report.projectReadiness?.missingLinks).toContain('Missing performance or CRM report asset');
  });

  it('does not pass project readiness when scale plans only carry report assets', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'org-report-only-plan',
        projectId: 'project-report-only-plan',
        assetCount: 4,
        reportAssetCount: 1,
        planCount: 2,
        draftPlanCount: 1,
        nextRoundAssetPlanCount: 0,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        measuredDispatchCount: 1,
        performanceReturnCount: 1,
        scaleDecisionCount: 1,
        missingLinks: ['Missing winning asset reuse in next-round distribution plan'],
        nextActions: ['Close gap: Missing winning asset reuse in next-round distribution plan'],
      },
    });

    expect(report.projectReadiness?.verdict).not.toBe('pass');
    expect(report.projectReadiness?.missingLinks).toContain('Missing winning asset reuse in next-round distribution plan');
  });

  it('does not pass project readiness when only part of scale decisions have winning asset reuse', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'org-partial-scale-lineage',
        projectId: 'project-partial-scale-lineage',
        assetCount: 5,
        reportAssetCount: 1,
        planCount: 3,
        draftPlanCount: 2,
        nextRoundAssetPlanCount: 1,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        measuredDispatchCount: 1,
        performanceReturnCount: 1,
        scaleDecisionCount: 2,
        missingLinks: ['Missing winning asset reuse in next-round distribution plan (1/2)'],
        nextActions: ['Close gap: Missing winning asset reuse in next-round distribution plan (1/2)'],
      },
    });

    expect(report.projectReadiness?.verdict).not.toBe('pass');
    expect(report.projectReadiness?.evidence).toContain('scaleDecisions=2');
    expect(report.projectReadiness?.evidence).toContain('nextRoundAssetPlans=1');
  });

  it('does not pass project readiness when scaled performance has unresolved asset attribution', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'org-attribution-gap',
        projectId: 'project-attribution-gap',
        assetCount: 5,
        reportAssetCount: 1,
        planCount: 2,
        draftPlanCount: 1,
        nextRoundAssetPlanCount: 1,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        measuredDispatchCount: 1,
        performanceReturnCount: 1,
        scaleDecisionCount: 1,
        assetMatchAmbiguousCount: 1,
        assetMatchUnmatchedCount: 0,
        assetMatchIssueCount: 1,
        missingLinks: ['Unresolved performance asset attribution (ambiguous=1; unmatched=0)'],
        nextActions: ['Close gap: Unresolved performance asset attribution (ambiguous=1; unmatched=0)'],
      },
    });

    expect(report.projectReadiness?.verdict).not.toBe('pass');
    expect(report.projectReadiness?.evidence).toContain('assetMatchIssues=1');
    expect(report.projectReadiness?.missingLinks).toContain('Unresolved performance asset attribution (ambiguous=1; unmatched=0)');
  });

  it('does not pass project readiness when executable plans use unapproved or rights-unready assets', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'org-asset-governance',
        projectId: 'project-asset-governance',
        assetCount: 4,
        reportAssetCount: 1,
        approvedAssetCount: 3,
        reusableAssetCount: 4,
        blockedAssetCount: 0,
        rightsIssueAssetCount: 1,
        assetGovernanceIssueCount: 1,
        planCount: 2,
        draftPlanCount: 1,
        nextRoundAssetPlanCount: 0,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        measuredDispatchCount: 1,
        performanceReturnCount: 1,
        scaleDecisionCount: 0,
        missingLinks: ['Distribution uses blocked or rights-unready asset (1)'],
        nextActions: ['Close gap: Distribution uses blocked or rights-unready asset (1)'],
      },
    });

    expect(report.projectReadiness?.verdict).not.toBe('pass');
    expect(report.projectReadiness?.evidence).toContain('assetGovernanceIssues=1');
    expect(report.projectReadiness?.missingLinks).toContain('Distribution uses blocked or rights-unready asset (1)');
  });

  it('does not pass project readiness when published dispatch lacks evidence or overdue performance import', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'org-publish-evidence',
        projectId: 'project-publish-evidence',
        assetCount: 4,
        reportAssetCount: 1,
        approvedAssetCount: 4,
        reusableAssetCount: 4,
        blockedAssetCount: 0,
        rightsIssueAssetCount: 0,
        assetGovernanceIssueCount: 0,
        deliverableAssetCount: 1,
        clientReviewAssetCount: 1,
        approvedDeliverableCount: 0,
        revisionRequestedCount: 0,
        deliveryIssueCount: 1,
        planCount: 2,
        draftPlanCount: 1,
        nextRoundAssetPlanCount: 0,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        publishedDispatchCount: 1,
        publishedWithEvidenceCount: 0,
        missingPublishEvidenceCount: 1,
        overdueReviewDispatchCount: 1,
        measuredDispatchCount: 0,
        performanceReturnCount: 0,
        scaleDecisionCount: 0,
        missingLinks: [
          'Published dispatch missing evidence URL (1)',
          'Published dispatch overdue for performance import (1)',
          'No dispatch has measured performance evidence yet',
          'Production deliverables missing client approval (0/1)',
        ],
        nextActions: ['Close gap: Published dispatch missing evidence URL (1)'],
      },
    });

    expect(report.projectReadiness?.verdict).not.toBe('pass');
    expect(report.projectReadiness?.evidence).toContain('missingPublishEvidence=1');
    expect(report.projectReadiness?.evidence).toContain('overdueReviews=1');
    expect(report.projectReadiness?.evidence).toContain('deliveryIssues=1');
    expect(report.projectReadiness?.missingLinks).toContain('Published dispatch missing evidence URL (1)');
  });

  it('flags a thin project ledger as a project-level maturity risk', () => {
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId: 'org-risk',
        projectId: 'project-risk',
        assetCount: 1,
        reportAssetCount: 0,
        planCount: 0,
        draftPlanCount: 0,
        nextRoundAssetPlanCount: 0,
        readyPlanCount: 0,
        dispatchCount: 0,
        executableDispatchCount: 0,
        measuredDispatchCount: 0,
        performanceReturnCount: 0,
        scaleDecisionCount: 0,
        missingLinks: ['Missing distribution plan'],
        nextActions: ['Close gap: Missing distribution plan'],
      },
    });

    expect(report.projectReadiness?.verdict).toBe('fail');
    expect(report.friendTrialRisks.some(issue => issue.title.includes('项目级内容工业化'))).toBe(true);
  });
});
