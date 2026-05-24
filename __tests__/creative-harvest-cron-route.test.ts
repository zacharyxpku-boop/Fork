import { describe, expect, it, afterEach } from 'vitest';

import {
  GET as creativeHarvestCronGET,
  POST as creativeHarvestCronPOST,
} from '@/app/api/cron/creative-harvest/route';
import {
  getCreativeMonitoringSnapshot,
  listCreativeMonitoringProjects,
  upsertCreativeMonitor,
} from '@/lib/creative-monitoring';

const originalCronSecret = process.env.CRON_SECRET;

afterEach(() => {
  if (originalCronSecret === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = originalCronSecret;
  }
});

describe('creative harvest cron route', () => {
  it('requires the cron secret when configured', async () => {
    process.env.CRON_SECRET = 'cron-secret-for-test';

    const res = await creativeHarvestCronGET(new Request('http://localhost/api/cron/creative-harvest', {
      headers: { 'x-tenant-id': 'org-cron-auth' },
    }) as unknown as Parameters<typeof creativeHarvestCronGET>[0]);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.message).toContain('定时任务密钥');
  });

  it('runs scheduled creative harvest for discovered projects without inventing observations', async () => {
    delete process.env.CRON_SECRET;
    const orgId = `org-creative-cron-${Date.now()}`;
    const projectId = `project-creative-cron-${Date.now()}`;
    const monitor = await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'video_keyword',
      platform: 'TikTok Shop',
      target: 'travel storage viral teardown',
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
      cadenceHours: 12,
    });

    await expect(listCreativeMonitoringProjects(orgId)).resolves.toContain(projectId);

    const res = await creativeHarvestCronGET(new Request('http://localhost/api/cron/creative-harvest', {
      headers: { 'x-tenant-id': orgId },
    }) as unknown as Parameters<typeof creativeHarvestCronGET>[0]);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.projectCount).toBeGreaterThanOrEqual(1);
    const run = body.runs.find((item: { projectId: string }) => item.projectId === projectId);
    expect(run.run.dueTaskCount).toBeGreaterThanOrEqual(1);
    expect(run.run.importedInsightIds).toHaveLength(0);
    expect(run.run.missingObservationMonitorIds).toContain(monitor.id);
    expect(run.nextAction).toContain('等待采集器或运营补回真实观察');
    expect(run.collectorTargetCount).toBeGreaterThanOrEqual(1);
    expect(run.collectorRunPlan.retryTargetCount).toBeGreaterThanOrEqual(1);
    expect(run.collectorRunPlan.targets[0]).toMatchObject({
      monitorId: monitor.id,
      attempt: 2,
      priority: 'high',
    });

    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.harvestRunCount).toBeGreaterThanOrEqual(1);
    expect(snapshot.multimodalTeardownReady).toBe(true);
  });

  it('ingests collector observations and materializes video teardown learning through POST', async () => {
    delete process.env.CRON_SECRET;
    const orgId = `org-creative-collector-${Date.now()}`;
    const projectId = `project-creative-collector-${Date.now()}`;
    const monitor = await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'video_keyword',
      platform: 'TikTok Shop',
      target: 'travel packing proof video',
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
      cadenceHours: 12,
    });

    const res = await creativeHarvestCronPOST(new Request('http://localhost/api/cron/creative-harvest', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        projectId,
        observations: [{
          monitorId: monitor.id,
          title: 'Travel packing proof teardown',
          url: 'https://video.example.test/travel-proof',
          hookType: 'proof',
          pacing: 'fast',
          reusableAngle: 'Open with packed-bag proof, then show the storage sequence without copying source wording.',
          proofPoint: 'Shows before/after suitcase capacity in the first three seconds.',
          sceneBeats: ['packed suitcase proof', 'compression close-up', 'shop CTA'],
          transcriptSummary: 'The video starts with a packed suitcase proof before explaining the organizer.',
          detectedObjects: ['suitcase', 'packing cube'],
          audioCue: 'fast upbeat cut',
          textOverlays: ['before', 'after', 'pack more'],
          metrics: { views: 88000, saves: 2400 },
        }],
      }),
    }) as unknown as Parameters<typeof creativeHarvestCronPOST>[0]);
    const body = await res.json();

    expect(res.status).toBe(201);
    const run = body.runs[0];
    expect(run.run.importedInsightIds).toHaveLength(1);
    expect(run.run.brandLearningAssetIds).toHaveLength(2);
    expect(run.run.brandLearningDistributionPlanId).toBeTruthy();
    expect(run.creativeSnapshot.teardownCount).toBe(1);
    expect(run.nextAction).toContain('已写入洞察');
    expect(run.collectorRunPlan.targetCount).toBe(0);

    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.harvestedInsightCount).toBe(1);
    expect(snapshot.missingLinks).not.toContain('Missing scheduled creative harvest run evidence');
  });

  it('rejects empty collector POST bodies so fake harvests are not created as insights', async () => {
    delete process.env.CRON_SECRET;
    const res = await creativeHarvestCronPOST(new Request('http://localhost/api/cron/creative-harvest', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'empty-collector-project', observations: [] }),
    }) as unknown as Parameters<typeof creativeHarvestCronPOST>[0]);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('collector_observations_required');
    expect(body.message).toContain('不要伪造洞察');
  });
});
