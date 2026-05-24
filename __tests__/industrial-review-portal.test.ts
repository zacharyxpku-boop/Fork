import { describe, expect, it } from 'vitest';
import {
  addContentAsset,
  getContentAsset,
  getIndustrializationSnapshot,
} from '@/lib/industrial-chain-store';
import {
  appendIndustrialReviewFeedback,
  approveIndustrialReviewLink,
  createIndustrialReviewLink,
  getIndustrialReviewLink,
  getIndustrialReviewPortalView,
  revokeIndustrialReviewLink,
} from '@/lib/industrial-review-portal';
import {
  evaluateAssetPermissionAccess,
  listAssetPermissionAccessAudits,
  listAssetPermissions,
} from '@/lib/asset-permission-ledger';
import { GET as GET_LINKS, PATCH as PATCH_LINKS, POST as POST_LINKS } from '@/app/api/industrial-chain/review-links/route';
import { GET as GET_REVIEW } from '@/app/api/industrial-chain/review/[token]/route';
import { POST as POST_FEEDBACK } from '@/app/api/industrial-chain/review/[token]/feedback/route';
import { POST as POST_APPROVE } from '@/app/api/industrial-chain/review/[token]/approve/route';

function params(token: string) {
  return { params: Promise.resolve({ token }) };
}

describe('industrial review portal', () => {
  it('creates a tokenized review link and uses client feedback to request revision', async () => {
    const orgId = `review-portal-${Date.now()}`;
    const projectId = `review-project-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Client review video',
      url: 'https://cdn.example/video.mp4',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Provider result ready for client review',
      deliveryStatus: 'internal_review',
    });

    const link = await createIndustrialReviewLink(orgId, { assetId: asset.id, ttlDays: 7 });
    expect(link?.token).toMatch(/^wrv_/);
    expect(getIndustrialReviewPortalView(link!).status).toBe('active');

    const reviewingAsset = await getContentAsset(orgId, asset.id);
    expect(reviewingAsset?.deliveryStatus).toBe('client_review');
    expect(reviewingAsset?.clientReviewUrl).toBe(`/review/${link!.token}`);
    expect(reviewingAsset?.clientReviewUrl).toContain(link!.token);
    await expect(evaluateAssetPermissionAccess(orgId, {
      projectId,
      assetId: asset.id,
      action: 'approve',
      role: 'client',
    })).resolves.toMatchObject({ allowed: true });

    const feedback = await appendIndustrialReviewFeedback(link!.token, {
      authorName: 'Buyer',
      type: 'change',
      body: 'Opening shot needs the actual product label.',
    });
    expect(feedback?.record.feedback).toHaveLength(1);
    const revisionAsset = await getContentAsset(orgId, asset.id);
    expect(revisionAsset?.deliveryStatus).toBe('revision_requested');
    expect(revisionAsset?.revisionReason).toContain('actual product label');
  });

  it('creates a client-review scoped asset permission when a review link is issued', async () => {
    const orgId = `review-permission-${Date.now()}`;
    const projectId = `review-permission-project-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'image',
      title: 'Review still',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Provider result ready.',
    });

    const link = await createIndustrialReviewLink(orgId, { assetId: asset.id, ttlDays: 3 });
    const permissions = await listAssetPermissions(orgId, projectId);
    expect(permissions).toHaveLength(1);
    expect(permissions[0]).toMatchObject({
      assetId: asset.id,
      scope: 'client_review',
      roles: expect.arrayContaining(['client']),
      allowedActions: expect.arrayContaining(['view', 'share', 'approve']),
      expiresAt: link?.expiresAt,
    });
  });

  it('returns client-readable review guidance for active, locked, and missing-deliverable states', async () => {
    const orgId = `review-guidance-${Date.now()}`;
    const projectId = 'review-guidance-project';
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: '客户可读审核指引视频',
      url: 'https://cdn.example.test/guidance.mp4',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Ready for client guidance.',
    });
    const active = await createIndustrialReviewLink(orgId, { assetId: asset.id });
    const activeView = getIndustrialReviewPortalView(active!);
    expect(activeView.clientReceipt).toMatchObject({
      title: '客户验收回执',
      operatorRecipient: '运营 / 客服',
    });
    expect(activeView.clientHeadline).toBe('请先预览交付物，再选择反馈或批准');
    expect(activeView.clientRisk).toContain('批准会写回生产链路');
    expect(activeView.supportAction).toContain('不要勉强批准');
    expect(activeView.clientChecklist.map(item => item.label)).toEqual([
      '交付物可查看',
      '审核链接可写入',
      '反馈是否已处理',
      '批准后动作',
    ]);
    expect(activeView.escalationMessage).toContain(`审核码 ${active!.token} 可以验收`);

    await appendIndustrialReviewFeedback(active!.token, {
      authorName: 'Buyer',
      type: 'change',
      body: '请先修改标题。',
    });
    const feedbackView = getIndustrialReviewPortalView((await getIndustrialReviewLink(active!.token))!);
    expect(feedbackView.clientReceipt.summary).toContain('客户已提交反馈');
    expect(feedbackView.clientHeadline).toBe('已有反馈记录，请先确认修改是否完成');
    expect(feedbackView.supportAction).toContain('确认修改点已处理');
    expect(feedbackView.clientChecklist.find(item => item.label === '反馈是否已处理')?.state).toBe('warn');
    expect(feedbackView.escalationMessage).toContain('已有修改反馈');

    const approved = await approveIndustrialReviewLink(active!.token, { approvalName: 'Buyer' });
    const approvedView = getIndustrialReviewPortalView(approved!.record);
    expect(approvedView.clientReceipt.summary).toContain('已由 Buyer 批准');
    expect(approvedView.clientHeadline).toBe('已完成验收，结果已锁定');
    expect(approvedView.clientRisk).toContain('只读');
    expect(approvedView.clientChecklist.find(item => item.label === '批准后动作')?.state).toBe('locked');
    expect(approvedView.escalationMessage).toContain('已由 Buyer 批准');

    const noUrlAsset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: '缺少交付链接的视频',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Missing deliverable URL.',
    });
    const missingUrl = await createIndustrialReviewLink(orgId, { assetId: noUrlAsset.id });
    const missingUrlView = getIndustrialReviewPortalView(missingUrl!);
    expect(missingUrlView.clientReceipt.summary).toContain('缺少可打开的交付物链接');
    expect(missingUrlView.clientHeadline).toBe('交付物还没准备好，先不要批准');
    expect(missingUrlView.clientRisk).toContain('批准会被系统阻止');
    expect(missingUrlView.clientChecklist.find(item => item.label === '交付物可查看')?.state).toBe('warn');
    expect(missingUrlView.escalationMessage).toContain('缺少可打开的交付物链接');

    const expired = await createIndustrialReviewLink(orgId, {
      assetId: asset.id,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const expiredView = getIndustrialReviewPortalView(expired!);
    expect(expiredView.clientReceipt.summary).toContain('审核链接已过期');
    expect(expiredView.clientHeadline).toBe('审核链接已过期，请不要继续验收');
    expect(expiredView.supportAction).toBe('请联系运营重新生成审核链接。');
    expect(expiredView.clientChecklist.find(item => item.label === '审核链接可写入')?.state).toBe('locked');
    expect(expiredView.escalationMessage).toContain('已过期，请重新生成审核链接');

    const revoked = await createIndustrialReviewLink(orgId, { assetId: asset.id });
    const revokedRecord = await revokeIndustrialReviewLink(orgId, revoked!.token);
    const revokedView = getIndustrialReviewPortalView(revokedRecord!);
    expect(revokedView.clientReceipt.summary).toContain('审核链接已撤销');
    expect(revokedView.clientHeadline).toBe('审核链接已撤销，请等待新链接');
    expect(revokedView.clientRisk).toContain('版本混淆');
    expect(revokedView.escalationMessage).toContain('已撤销，请发送新的审核链接');
  });

  it('approves a deliverable through review token and clears delivery readiness', async () => {
    const orgId = `review-approve-${Date.now()}`;
    const projectId = `approve-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Produced video',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Provider result URL',
      deliveryStatus: 'client_review',
    });
    const link = await createIndustrialReviewLink(orgId, { assetId: asset.id });
    const pendingSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(pendingSnapshot.deliveryIssueCount).toBe(1);

    const approved = await approveIndustrialReviewLink(link!.token, { approvalName: 'Buyer Ops' });
    expect(approved?.approvedNow).toBe(true);
    expect(approved?.asset?.deliveryStatus).toBe('approved');
    expect(approved?.record.feedback.at(-1)?.type).toBe('approval');

    const approvedSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(approvedSnapshot.approvedDeliverableCount).toBe(1);
    expect(approvedSnapshot.deliveryIssueCount).toBe(0);
    await expect(listAssetPermissionAccessAudits(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: asset.id,
          action: 'approve',
          operation: 'client_review_approve',
          allowed: true,
        }),
      ]),
    );

    const duplicate = await approveIndustrialReviewLink(link!.token, { approvalName: 'Buyer Ops' });
    expect(duplicate?.approvedNow).toBe(false);
    expect(duplicate?.status).toBe('approved');
  });

  it('serves review link, feedback, approval, revoke, and expiry through API routes', async () => {
    const headers = { 'x-org-id': `review-api-${Date.now()}` };
    const projectId = 'review-api-project';
    const orgId = headers['x-org-id'];
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'API review video',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Provider result URL',
    });

    const createRes = await POST_LINKS(new Request('http://localhost/api/industrial-chain/review-links', {
      method: 'POST',
      headers,
      body: JSON.stringify({ assetId: asset.id, ttlDays: 14 }),
    }) as unknown as Parameters<typeof POST_LINKS>[0]);
    const createBody = await createRes.json();
    const token = createBody.reviewLink.token as string;
    expect(createRes.status).toBe(201);
    expect(createBody.reviewLink.status).toBe('active');

    const reviewRes = await GET_REVIEW(new Request(`http://localhost/api/industrial-chain/review/${token}`) as unknown as Parameters<typeof GET_REVIEW>[0], params(token));
    const reviewBody = await reviewRes.json();
    expect(reviewBody.review.assetTitle).toBe('API review video');
    expect(reviewBody.review).toMatchObject({
      statusLabel: '待客户验收',
      canSubmitFeedback: true,
      canApprove: false,
      interactionLockedReason: '交付物链接缺失，批准按钮保持关闭。',
    });
    expect(reviewBody.review.nextAction).toContain('交付物链接缺失');
    await expect(listAssetPermissionAccessAudits(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: asset.id,
          action: 'view',
          operation: 'client_review_view',
          allowed: true,
        }),
      ]),
    );

    const feedbackRes = await POST_FEEDBACK(new Request(`http://localhost/api/industrial-chain/review/${token}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ authorName: 'Buyer', type: 'comment', body: 'Looks good; checking legal.' }),
    }) as unknown as Parameters<typeof POST_FEEDBACK>[0], params(token));
    const feedbackBody = await feedbackRes.json();
    expect(feedbackBody.feedbackCount).toBe(1);

    const approveRes = await POST_APPROVE(new Request(`http://localhost/api/industrial-chain/review/${token}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvalName: 'Buyer' }),
    }) as unknown as Parameters<typeof POST_APPROVE>[0], params(token));
    const approveBody = await approveRes.json();
    expect(approveBody.asset.deliveryStatus).toBe('approved');
    expect(approveBody.review).toMatchObject({
      statusLabel: '已批准交付',
      canSubmitFeedback: false,
      canApprove: false,
    });
    expect(approveBody.review.nextAction).toContain('分发');
    await expect(listAssetPermissionAccessAudits(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: asset.id,
          action: 'approve',
          operation: 'client_review_approve',
          allowed: true,
        }),
      ]),
    );

    const duplicateRes = await POST_APPROVE(new Request(`http://localhost/api/industrial-chain/review/${token}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvalName: 'Buyer' }),
    }) as unknown as Parameters<typeof POST_APPROVE>[0], params(token));
    const duplicateBody = await duplicateRes.json();
    expect(duplicateRes.status).toBe(409);
    expect(duplicateBody.error).toBe('already_approved');
    expect(duplicateBody.review.interactionLockedReason).toContain('只读');

    const listRes = await GET_LINKS(new Request(`http://localhost/api/industrial-chain/review-links?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET_LINKS>[0]);
    const listBody = await listRes.json();
    expect(listBody.links).toHaveLength(1);

    const expiring = await createIndustrialReviewLink(orgId, {
      assetId: asset.id,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const expiredFeedback = await POST_FEEDBACK(new Request(`http://localhost/api/industrial-chain/review/${expiring!.token}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ authorName: 'Buyer', type: 'comment', body: 'late feedback' }),
    }) as unknown as Parameters<typeof POST_FEEDBACK>[0], params(expiring!.token));
    const expiredFeedbackBody = await expiredFeedback.json();
    expect(expiredFeedback.status).toBe(410);
    expect(expiredFeedbackBody.error).toBe('expired');
    expect(expiredFeedbackBody.review.statusLabel).toBe('链接已过期');
    expect(expiredFeedbackBody.review.nextAction).toContain('重新生成审核链接');
    const expiredReview = await GET_REVIEW(new Request(`http://localhost/api/industrial-chain/review/${expiring!.token}`) as unknown as Parameters<typeof GET_REVIEW>[0], params(expiring!.token));
    const expiredReviewBody = await expiredReview.json();
    expect(expiredReview.status).toBe(410);
    expect(expiredReviewBody.error).toBe('review_expired');
    expect(expiredReviewBody.feedback).toEqual([]);
    expect(expiredReviewBody.review.statusLabel).toBe('链接已过期');
    expect(expiredReviewBody.review.canSubmitFeedback).toBe(false);

    const revokable = await createIndustrialReviewLink(orgId, { assetId: asset.id });
    const revokeRes = await PATCH_LINKS(new Request('http://localhost/api/industrial-chain/review-links', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ token: revokable!.token, action: 'revoke' }),
    }) as unknown as Parameters<typeof PATCH_LINKS>[0]);
    expect(revokeRes.status).toBe(200);
    const missingRevokeRes = await PATCH_LINKS(new Request('http://localhost/api/industrial-chain/review-links', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ token: 'missing-review-token', action: 'revoke' }),
    }) as unknown as Parameters<typeof PATCH_LINKS>[0]);
    const missingRevokeBody = await missingRevokeRes.json();
    expect(missingRevokeRes.status).toBe(404);
    expect(missingRevokeBody.message).toContain('没有找到该客户审核链接');
    const revokedApproval = await POST_APPROVE(new Request(`http://localhost/api/industrial-chain/review/${revokable!.token}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approvalName: 'Buyer' }),
    }) as unknown as Parameters<typeof POST_APPROVE>[0], params(revokable!.token));
    expect(revokedApproval.status).toBe(410);
    const revokedApprovalBody = await revokedApproval.json();
    expect(revokedApprovalBody.review.statusLabel).toBe('链接已撤销');
    const revokedReview = await GET_REVIEW(new Request(`http://localhost/api/industrial-chain/review/${revokable!.token}`) as unknown as Parameters<typeof GET_REVIEW>[0], params(revokable!.token));
    const revokedReviewBody = await revokedReview.json();
    expect(revokedReview.status).toBe(410);
    expect(revokedReviewBody.error).toBe('review_revoked');
    expect(revokedReviewBody.review.nextAction).toContain('新的审核链接');

    const missingFeedback = await POST_FEEDBACK(new Request('http://localhost/api/industrial-chain/review/missing-review-token/feedback', {
      method: 'POST',
      body: JSON.stringify({ authorName: 'Buyer', type: 'comment', body: 'missing link feedback' }),
    }) as unknown as Parameters<typeof POST_FEEDBACK>[0], params('missing-review-token'));
    const missingFeedbackBody = await missingFeedback.json();
    expect(missingFeedback.status).toBe(404);
    expect(missingFeedbackBody.message).toContain('没有找到该审核链接');
  });
});
