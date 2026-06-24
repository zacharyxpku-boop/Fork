import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ManageFactoryPage from '@/app/factory/manage/page';
import { ManageOperationsConsoleClient, buildAssetEnforcementChecks, buildManageOperatingChecks, buildManageVariantPlaybook } from '@/components/ManageOperationsConsoleClient';
import type { AssetPermissionSnapshot } from '@/lib/asset-permission-ledger';
import type { IndustrializationSnapshot } from '@/lib/industrial-chain-store';

function industrial(overrides: Partial<IndustrializationSnapshot> = {}): IndustrializationSnapshot {
  return {
    orgId: 'test-org',
    projectId: 'manage-project',
    assetCount: 0,
    reportAssetCount: 0,
    approvedAssetCount: 0,
    reusableAssetCount: 0,
    blockedAssetCount: 0,
    rightsIssueAssetCount: 0,
    assetGovernanceIssueCount: 0,
    deliverableAssetCount: 0,
    clientReviewAssetCount: 0,
    approvedDeliverableCount: 0,
    revisionRequestedCount: 0,
    deliveryIssueCount: 0,
    planCount: 0,
    draftPlanCount: 0,
    nextRoundAssetPlanCount: 0,
    readyPlanCount: 0,
    dispatchCount: 0,
    executableDispatchCount: 0,
    publishedDispatchCount: 0,
    publishedWithEvidenceCount: 0,
    missingPublishEvidenceCount: 0,
    overdueReviewDispatchCount: 0,
    measuredDispatchCount: 0,
    performanceReturnCount: 0,
    scaleDecisionCount: 0,
    assetMatchAmbiguousCount: 0,
    assetMatchUnmatchedCount: 0,
    assetMatchIssueCount: 0,
    missingLinks: ['Missing distribution plan'],
    nextActions: ['Close gap: Missing distribution plan'],
    ...overrides,
  };
}

function permission(overrides: Partial<AssetPermissionSnapshot> = {}): AssetPermissionSnapshot {
  return {
    orgId: 'test-org',
    projectId: 'manage-project',
    permissionRecordCount: 0,
    governedAssetCount: 0,
    shareableAssetCount: 0,
    downloadableAssetCount: 0,
    storageObjectCount: 0,
    downloadableObjectCount: 0,
    shareableObjectCount: 0,
    missingStorageObjectCount: 0,
    activeAccessGrantCount: 0,
    expiredAccessGrantCount: 0,
    revokedAccessGrantCount: 0,
    expiredPermissionCount: 0,
    clientReviewScopeCount: 0,
    securityPolicyCount: 0,
    watermarkRequiredCount: 0,
    watermarkAppliedCount: 0,
    dlpPassedPolicyCount: 0,
    dlpFailedPolicyCount: 0,
    publicShareBlockedCount: 0,
    retentionPolicyCount: 0,
    auditEventCount: 0,
    accessAuditEventCount: 0,
    downloadableAccessReadyCount: 0,
    shareableAccessReadyCount: 0,
    assetAccessStates: [],
    missingLinks: ['Missing enterprise asset permission ledger'],
    nextActions: ['Close asset permission gap: Missing enterprise asset permission ledger'],
    ...overrides,
  };
}

describe('manage operations console page', () => {
  it('renders the Manage variant UI and links all role variants', async () => {
    const page = await ManageFactoryPage({
      searchParams: Promise.resolve({ projectId: 'launch-manage', variant: 'operator' }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('交付管理控制台');
    expect(html).toContain('门店交付管理视角');
    expect(html).toContain('运营动作剧本');
    expect(html).toContain('Manage 运营动作剧本');
    expect(html).toContain('餐饮交付与负责人承接看板');
    expect(html).toContain('发布/交付门禁矩阵');
    expect(html).toContain('发布证明与交付访问门禁');
    expect(html).toContain('下载、分享、发布和交付');
    expect(html).toContain('默认阻断');
    expect(html).toContain('补门店交付策略');
    expect(html).toContain('客户审核权限、受控分享对象、安全策略、DLP、水印和留存规则');
    expect(html).toContain('/factory/manage?projectId=launch-manage&amp;variant=partner');
    expect(html).toContain('/factory/manage?projectId=launch-manage&amp;variant=friend_trial');
  });

  it('renders distinct partner and friend trial Manage variants', () => {
    const industrialReady = industrial({
      clientReviewAssetCount: 1,
      approvedDeliverableCount: 1,
      performanceReturnCount: 1,
      scaleDecisionCount: 1,
      missingLinks: [],
      nextActions: [],
    });
    const permissionReady = permission({
      permissionRecordCount: 2,
      securityPolicyCount: 2,
      dlpPassedPolicyCount: 2,
      auditEventCount: 2,
      accessAuditEventCount: 1,
      clientReviewScopeCount: 1,
      missingLinks: [],
      nextActions: [],
    });

    const partnerHtml = renderToStaticMarkup(
      <ManageOperationsConsoleClient initialProjectId="partner-manage" initialIndustrialSnapshot={industrialReady} initialPermissionSnapshot={permissionReady} selectedVariantId="partner" />,
    );
    const friendHtml = renderToStaticMarkup(
      <ManageOperationsConsoleClient initialProjectId="friend-manage" initialIndustrialSnapshot={industrialReady} initialPermissionSnapshot={permissionReady} selectedVariantId="friend_trial" />,
    );

    expect(partnerHtml).toContain('合作者视角');
    expect(partnerHtml).toContain('Manage 商业验收剧本');
    expect(partnerHtml).toContain('企业云资产、到店跟进同步和平台/社群反馈回流');
    expect(partnerHtml).toContain('企业云盘、团队空间、自动到店跟进');

    expect(friendHtml).toContain('门店下一步怎么跟进');
    expect(friendHtml).toContain('餐饮门店增长工作台');
    expect(friendHtml).toContain('餐饮客户可试用工作台');
    expect(friendHtml).toContain('把发布证明和到店反馈交给负责人');
    expect(friendHtml).toContain('跟进处理路径');
    expect(friendHtml).toContain('今天该推什么菜');
    expect(friendHtml).toContain('内容发完有没有用');
    expect(friendHtml).toContain('谁继续跟到店');
    expect(friendHtml).toContain('到店理由');
    expect(friendHtml).toContain('菜品素材');
    expect(friendHtml).toContain('本地内容');
    expect(friendHtml).toContain('同城发布');
    expect(friendHtml).toContain('预约回收');
    expect(friendHtml).toContain('到店跟进');
    expect(friendHtml).toContain('三类人各看一件事');
    expect(friendHtml).toContain('少解释，直接看动作');
    expect(friendHtml).toContain('去多平台发 +');
    expect(friendHtml).toContain('/factory/cast?variant=friend_trial');
    expect(friendHtml).toContain('能力边界');
    expect(friendHtml).toContain('缺发布链接或截图');
    expect(friendHtml).toContain('只展示已确认结果');
    expect(friendHtml).toContain('店长任务队列');
    expect(friendHtml).toContain('不保存私信原文 / 手机号 / 微信号 / POS 明细');
    expect(friendHtml).toContain('发布证明、预约/券领取/私信聚合、门店确认和复盘动作');
    expect(friendHtml).toContain('发布证明');
    expect(friendHtml).toContain('效果优化表');
    expect(friendHtml).toContain('今天要确认的事');
    expect(friendHtml).toContain('到店跟进面板');
    expect(friendHtml).toContain('查看可跟进清单');
    expect(friendHtml).toContain('查看完整服务链路');
  });

  it('builds role-specific Manage playbooks from review, permission, and audit evidence', () => {
    const blockedIndustrial = industrial();
    const blockedPermission = permission();
    const readyIndustrial = industrial({
      clientReviewAssetCount: 1,
      approvedDeliverableCount: 1,
      performanceReturnCount: 1,
      missingLinks: [],
      nextActions: [],
    });
    const readyPermission = permission({
      permissionRecordCount: 1,
      securityPolicyCount: 1,
      dlpPassedPolicyCount: 1,
      auditEventCount: 1,
      accessAuditEventCount: 1,
      missingLinks: [],
      nextActions: [],
    });

    expect(buildManageVariantPlaybook(blockedIndustrial, blockedPermission, 'operator')).toEqual(expect.objectContaining({
      title: 'Manage 运营动作剧本',
      primaryAction: expect.stringContaining('Missing distribution plan'),
      handoffBoundary: expect.stringContaining('手工交接'),
    }));

    expect(buildManageVariantPlaybook(readyIndustrial, readyPermission, 'partner')).toEqual(expect.objectContaining({
      title: 'Manage 商业验收剧本',
      primaryAction: expect.stringContaining('企业云资产'),
      cards: expect.arrayContaining([
        expect.stringContaining('Manage readiness 7/7'),
      ]),
    }));

    expect(buildManageVariantPlaybook(readyIndustrial, readyPermission, 'friend_trial')).toEqual(expect.objectContaining({
      title: '朋友试用 Manage 路径',
      proofToCheck: expect.stringContaining('朋友只看三项'),
    }));
  });

  it('builds restaurant Manage operating checks from review, security, audit, and return evidence', () => {
    const readyIndustrial = industrial({
      clientReviewAssetCount: 1,
      approvedDeliverableCount: 1,
      performanceReturnCount: 1,
      scaleDecisionCount: 1,
      missingLinks: [],
      nextActions: [],
    });
    const readyPermission = permission({
      permissionRecordCount: 1,
      clientReviewScopeCount: 1,
      securityPolicyCount: 1,
      watermarkRequiredCount: 1,
      watermarkAppliedCount: 1,
      dlpPassedPolicyCount: 1,
      retentionPolicyCount: 1,
      auditEventCount: 1,
      accessAuditEventCount: 1,
      missingLinks: [],
      nextActions: [],
    });

    expect(buildManageOperatingChecks(readyIndustrial, readyPermission)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: '客户审核入口',
        ready: true,
      }),
      expect.objectContaining({
        stage: '客户批准与交付',
        ready: true,
      }),
      expect.objectContaining({
        stage: '权限范围与受控分享',
        ready: true,
      }),
      expect.objectContaining({
        stage: 'DLP / 水印 / 留存',
        ready: true,
      }),
      expect.objectContaining({
        stage: '访问审计',
        ready: true,
      }),
      expect.objectContaining({
        stage: '表现回流与复盘',
        ready: true,
      }),
      expect.objectContaining({
        stage: '到店跟进 / 下一步队列',
        ready: true,
      }),
    ]));
  });

  it('builds asset enforcement checks that fail closed before download, share, and publish flow', () => {
    const blockedPermission = permission({
      permissionRecordCount: 1,
      downloadableAssetCount: 1,
      shareableAssetCount: 1,
      storageObjectCount: 0,
      missingStorageObjectCount: 1,
      assetAccessStates: [{
        assetId: 'asset-blocked',
        hasActivePermission: true,
        canDownload: true,
        canShare: true,
        hasStorageObject: false,
        hasSecurityPolicy: false,
        hasActiveDownloadGrant: false,
        hasActiveShareGrant: false,
        downloadableAccessReady: false,
        shareableAccessReady: false,
        blockers: ['missing_storage_object', 'missing_download_grant'],
      }],
      missingLinks: ['Download/share permission missing storage object (1)'],
    });

    expect(buildAssetEnforcementChecks(blockedPermission)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        gate: '下载前门禁',
        ready: false,
        stopLine: expect.stringContaining('默认不返回下载内容'),
      }),
      expect.objectContaining({
        gate: '分享前门禁',
        ready: false,
        stopLine: expect.stringContaining('默认不生成公开分享'),
      }),
      expect.objectContaining({
        gate: '发布/交付 fail-closed',
        ready: false,
        evidence: expect.stringContaining('阻断项 2'),
      }),
    ]));

    const readyPermission = permission({
      permissionRecordCount: 1,
      downloadableAssetCount: 1,
      shareableAssetCount: 1,
      storageObjectCount: 1,
      missingStorageObjectCount: 0,
      activeAccessGrantCount: 2,
      securityPolicyCount: 1,
      watermarkRequiredCount: 1,
      watermarkAppliedCount: 1,
      dlpPassedPolicyCount: 1,
      retentionPolicyCount: 1,
      accessAuditEventCount: 1,
      downloadableAccessReadyCount: 1,
      shareableAccessReadyCount: 1,
      assetAccessStates: [{
        assetId: 'asset-ready',
        hasActivePermission: true,
        canDownload: true,
        canShare: true,
        hasStorageObject: true,
        hasSecurityPolicy: true,
        hasActiveDownloadGrant: true,
        hasActiveShareGrant: true,
        downloadableAccessReady: true,
        shareableAccessReady: true,
        blockers: [],
      }],
      missingLinks: [],
      nextActions: [],
    });

    expect(buildAssetEnforcementChecks(readyPermission)).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: '下载前门禁', ready: true }),
      expect.objectContaining({ gate: '分享前门禁', ready: true }),
      expect.objectContaining({ gate: '对象与安全策略', ready: true }),
      expect.objectContaining({ gate: '访问审计', ready: true }),
    ]));
  });
});
