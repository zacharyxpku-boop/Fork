import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import IndustrialReviewTokenPage from '@/app/review/[token]/page';
import {
  IndustrialReviewPortalClient,
  buildClientReviewPassport,
  buildReviewCrmHandoffPacket,
  buildReviewCommercialAcceptanceChecks,
  buildReviewVariantPlaybook,
} from '@/components/IndustrialReviewPortalClient';
import { addContentAsset } from '@/lib/industrial-chain-store';
import { createIndustrialReviewLink, revokeIndustrialReviewLink } from '@/lib/industrial-review-portal';
import { listAssetPermissionAccessAudits } from '@/lib/asset-permission-ledger';

describe('industrial review page', () => {
  it('renders a no-login client review portal shell for a token', async () => {
    const page = await IndustrialReviewTokenPage({
      params: Promise.resolve({ token: 'wrv_test_token' }),
    });
    const html = renderToStaticMarkup(page);
    expect(html).toContain('Wenai 客户审核');
    expect(html).toContain('朋友试用审核');
    expect(html).toContain('批准并写回状态');
    expect(html).toContain('批准后本链接会锁定');
    expect(html).toContain('提交反馈');
    expect(html).toContain('没有找到这条审核链接');
    expect(html).toContain('客户验收清单');
    expect(html).toContain('零解释验收流程');
    expect(html).toContain('不懂生产链路也能独立完成审核');
    expect(html).toContain('审核链接尚未加载');
    expect(html).toContain('下一步');
    expect(html).toContain('确认链接');
    expect(html).toContain('等待交付物');
    expect(html).toContain('联系运营');
  });

  it('renders the unified review variant switcher', () => {
    const html = renderToStaticMarkup(<IndustrialReviewPortalClient
      token="wrv_variant_token"
      initialVariant="operator"
      initialPayload={{
        review: {
          token: 'wrv_variant_token',
          projectId: 'variant-project',
          assetId: 'variant-asset',
          assetTitle: '运营需要接力的客户审核',
          deliverableUrl: 'https://cdn.example.test/variant.mp4',
          expiresAt: new Date(Date.now() + 86400_000).toISOString(),
          status: 'active',
          feedbackCount: 1,
        },
        feedback: [{
          id: 'fb-variant',
          authorName: 'Buyer',
          type: 'change',
          body: '请替换开头字幕。',
          createdAt: new Date().toISOString(),
        }],
      }}
    />);

    expect(html).toContain('Review Variant');
    expect(html).toContain('朋友试用版');
    expect(html).toContain('运营工作台版');
    expect(html).toContain('合作者/投资人版');
    expect(html).toContain('当前选择：<span class="font-semibold text-white">运营工作台版</span>');
    expect(html).toContain('当前视角任务卡');
    expect(html).toContain('Review Action Playbook');
    expect(html).toContain('客户交付护照');
    expect(html).toContain('Review Commercial Acceptance Board');
    expect(html).toContain('Review CRM Handoff Packet');
    expect(html).toContain('客户动作进入 CRM/分发/复盘承接包');
    expect(html).toContain('客户审核商用品质验收板');
    expect(html).toContain('预览可用门禁');
    expect(html).toContain('反馈写回门禁');
    expect(html).toContain('批准锁定门禁');
    expect(html).toContain('异常保护门禁');
    expect(html).toContain('下游交接门禁');
    expect(html).toContain('客户不需要解释，也不会误批空交付或旧版本');
    expect(html).toContain('一眼判断：能不能看、能不能改、能不能批、批完去哪');
    expect(html).toContain('可打开交付物');
    expect(html).toContain('可提交反馈');
    expect(html).toContain('可在确认后批准');
    expect(html).toContain('运营承接下一步');
    expect(html).toContain('把客户动作接回运营链路');
    expect(html).toContain('反馈是否进入生产记录');
    expect(html).toContain('/review/wrv_variant_token?variant=friend_trial');
    expect(html).toContain('/review/wrv_variant_token?variant=operator');
    expect(html).toContain('/review/wrv_variant_token?variant=partner');
    expect(html).toContain('每次客户动作都要进入生产记录、CRM 交接、分发门禁或复盘回流');
    expect(html).not.toContain('provider token');
  });

  it('builds review variant playbooks from approval, feedback, and deliverable evidence', () => {
    const review = {
      token: 'wrv_playbook_token',
      projectId: 'review-playbook-project',
      assetId: 'asset-playbook',
      assetTitle: 'Review playbook video',
      deliverableUrl: 'https://cdn.example.test/playbook.mp4',
      expiresAt: new Date(Date.now() + 86400_000).toISOString(),
      status: 'active' as const,
      feedbackCount: 1,
    };

    expect(buildReviewVariantPlaybook(review, 'operator', true, 1)).toEqual(expect.objectContaining({
      title: '运营承接下一步',
      primaryAction: expect.stringContaining('客户反馈转成返修任务'),
      proofToCheck: expect.stringContaining('review token'),
      handoffBoundary: expect.stringContaining('未批准前不放行分发'),
      cards: expect.arrayContaining([
        expect.stringContaining('项目 review-playbook-project / 资产 asset-playbook'),
      ]),
    }));
    expect(buildReviewVariantPlaybook(review, 'friend_trial', true, 1)).toEqual(expect.objectContaining({
      title: '朋友试用下一步',
      handoffBoundary: expect.stringContaining('朋友不需要理解 provider'),
    }));
    expect(buildReviewVariantPlaybook({ ...review, status: 'approved' as const, approvalName: 'Buyer Ops', approvedAt: new Date().toISOString() }, 'partner', true, 0)).toEqual(expect.objectContaining({
      title: '合作者证据链下一步',
      primaryAction: expect.stringContaining('证明 Manage 闭环成立'),
      handoffBoundary: expect.stringContaining('不能宣称交付已完成'),
    }));
  });

  it('builds a zero-explanation client review passport for client and operator handoff', () => {
    const activeReview = {
      token: 'passport-active',
      projectId: 'passport-project',
      assetId: 'passport-asset',
      assetTitle: 'Passport asset',
      deliverableUrl: 'https://cdn.example.test/passport.mp4',
      expiresAt: new Date(Date.now() + 86400_000).toISOString(),
      status: 'active' as const,
      feedbackCount: 0,
    };

    expect(buildClientReviewPassport(activeReview, true, 0)).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: '预览状态', value: '可打开交付物', tone: 'ready' }),
      expect.objectContaining({ title: '反馈入口', value: '可提交反馈', detail: expect.stringContaining('有问题就写清楚') }),
      expect.objectContaining({ title: '批准门禁', value: '可在确认后批准', detail: expect.stringContaining('写回生产') }),
      expect.objectContaining({ title: '后续流向', value: '等待客户动作' }),
    ]));
    expect(buildClientReviewPassport({ ...activeReview, deliverableUrl: undefined }, false, 1)).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: '预览状态', value: '待补交付物', detail: expect.stringContaining('不能完成验收') }),
      expect.objectContaining({ title: '批准门禁', value: '暂不可批准' }),
    ]));
    expect(buildClientReviewPassport({ ...activeReview, status: 'approved' as const, approvalName: 'Buyer Ops' }, true, 0)).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: '批准门禁', value: '已批准', detail: expect.stringContaining('Buyer Ops') }),
      expect.objectContaining({ title: '后续流向', value: '进入分发/CRM/回流' }),
    ]));
    expect(buildClientReviewPassport({ ...activeReview, status: 'revoked' as const }, true, 0)).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: '反馈入口', value: '只读留档' }),
      expect.objectContaining({ title: '后续流向', value: '等待新链接' }),
    ]));
  });

  it('builds commercial acceptance checks for Clico-style client review handoff', () => {
    const activeReview = {
      token: 'acceptance-active',
      projectId: 'acceptance-project',
      assetId: 'acceptance-asset',
      assetTitle: 'Acceptance video',
      deliverableUrl: 'https://cdn.example.test/acceptance.mp4',
      expiresAt: new Date(Date.now() + 86400_000).toISOString(),
      status: 'active' as const,
      canSubmitFeedback: true,
      canApprove: true,
      clientChecklist: [
        { label: '交付物可查看', state: 'ok' as const, detail: '可以预览。' },
        { label: '审核链接可写入', state: 'ok' as const, detail: '可以提交反馈或批准。' },
      ],
      clientDecision: {
        primaryActionLabel: '确认无误后批准',
        primaryActionState: 'approve' as const,
        operatorNextStep: '批准后进入分发。',
        evidenceToCheck: ['画面内容'],
      },
      feedbackCount: 0,
    };

    expect(buildReviewCommercialAcceptanceChecks(activeReview, true, 0)).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: '预览可用门禁', ready: true }),
      expect.objectContaining({ gate: '反馈写回门禁', ready: true }),
      expect.objectContaining({ gate: '批准锁定门禁', ready: true }),
      expect.objectContaining({ gate: '异常保护门禁', ready: true }),
      expect.objectContaining({ gate: '下游交接门禁', ready: false }),
    ]));

    const approvedChecks = buildReviewCommercialAcceptanceChecks({
      ...activeReview,
      status: 'approved',
      approvalName: 'Buyer Ops',
      approvedAt: new Date().toISOString(),
    }, true, 1);
    expect(approvedChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: '批准锁定门禁', ready: true, evidence: expect.stringContaining('Buyer Ops') }),
      expect.objectContaining({ gate: '下游交接门禁', ready: true, operatorHandoff: expect.stringContaining('CRM handoff') }),
    ]));

    const missingDeliverableChecks = buildReviewCommercialAcceptanceChecks({
      ...activeReview,
      deliverableUrl: undefined,
      canApprove: false,
    }, false, 0);
    expect(missingDeliverableChecks.find(check => check.gate === '预览可用门禁')).toEqual(expect.objectContaining({
      ready: false,
      clientInstruction: expect.stringContaining('不要批准'),
    }));
  });

  it('builds CRM handoff packets from review states without pretending external automation', () => {
    const activeReview = {
      token: 'crm-handoff-active',
      projectId: 'crm-project',
      assetId: 'crm-asset',
      assetTitle: 'CRM handoff asset',
      deliverableUrl: 'https://cdn.example.test/crm.mp4',
      expiresAt: new Date(Date.now() + 86400_000).toISOString(),
      status: 'active' as const,
      feedbackCount: 0,
    };

    expect(buildReviewCrmHandoffPacket(undefined, false, 0)).toEqual([
      expect.objectContaining({
        lane: '审核入口未加载',
        ready: false,
        releaseGate: expect.stringContaining('有效 review token'),
      }),
    ]);
    expect(buildReviewCrmHandoffPacket({ ...activeReview, deliverableUrl: undefined }, false, 0)).toEqual([
      expect.objectContaining({
        lane: '交付物补链',
        ready: false,
        owner: '生产运营',
        releaseGate: expect.stringContaining('批准与分发都保持关闭'),
      }),
    ]);
    expect(buildReviewCrmHandoffPacket(activeReview, true, 2)).toEqual([
      expect.objectContaining({
        lane: '返修任务承接',
        ready: false,
        owner: '生产/剪辑运营',
        nextAction: expect.stringContaining('返修任务'),
      }),
    ]);
    expect(buildReviewCrmHandoffPacket({ ...activeReview, status: 'approved', approvalName: 'Buyer Ops' }, true, 1)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        lane: 'CRM 成交/交付承接',
        ready: true,
        owner: 'CRM/销售运营',
        evidence: expect.stringContaining('Buyer Ops'),
      }),
      expect.objectContaining({
        lane: '分发与投放放行',
        ready: true,
        releaseGate: expect.stringContaining('自动发布仍等待 OAuth'),
      }),
      expect.objectContaining({
        lane: '复盘回流',
        ready: true,
        releaseGate: expect.stringContaining('analytics sync'),
      }),
    ]));
  });

  it('keeps the review client focused on feedback and approval actions', () => {
    const html = renderToStaticMarkup(<IndustrialReviewPortalClient
      token="wrv_static_token"
      initialPayload={{
        review: {
          token: 'wrv_static_token',
          projectId: 'review-project',
          assetId: 'asset-without-url',
          assetTitle: '待补齐链接的交付物',
          expiresAt: new Date(Date.now() + 86400_000).toISOString(),
          status: 'active',
          feedbackCount: 0,
        },
        feedback: [],
      }}
    />);
    expect(html).toContain('朋友试用审核');
    expect(html).toContain('不用懂后台，只做验收');
    expect(html).toContain('页面会把不能批准的情况拦住');
    expect(html).toContain('能不能打开交付物');
    expect(html).toContain('交付物预览');
    expect(html).toContain('批准交付');
    expect(html).toContain('有问题就提交修改意见');
    expect(html).toContain('我已检查交付物');
    expect(html).toContain('暂未附加预览链接');
    expect(html).toContain('交付物链接缺失，先不要批准');
    expect(html).toContain('暂不能批准');
    expect(html).toContain('不要批准，直到运营补齐');
    expect(html).toContain('待补齐');
    expect(html).toContain('先看交付物');
    expect(html).toContain('提交问题');
    expect(html).toContain('确认后批准');
    expect(html).toContain('补齐交付物前，批准按钮会保持不可用');
    expect(html).not.toContain('系统写回回执');
    expect(html).not.toContain('客户验收作战卡');
    expect(html).not.toContain('API key');
  });

  it('renders client-readable review guidance from server-provided status fields', () => {
    const html = renderToStaticMarkup(<IndustrialReviewPortalClient
      token="wrv_guidance_token"
      initialVariant="operator"
      initialPayload={{
        review: {
          token: 'wrv_guidance_token',
          projectId: 'guidance-project',
          assetId: 'guidance-asset',
          assetTitle: '客户可读审核指引',
          deliverableUrl: 'https://cdn.example.test/guidance.mp4',
          expiresAt: new Date(Date.now() + 86400_000).toISOString(),
          status: 'active',
          statusLabel: '待客户验收',
          clientHeadline: '请先预览交付物，再选择反馈或批准',
          clientRisk: '批准会写回生产链路，并作为后续分发依据。',
          supportAction: '如果看不懂或打不开时，请先提交问题反馈，不要勉强批准。',
          nextAction: '请先预览交付物，再选择反馈或批准',
          clientDecision: {
            primaryActionLabel: '确认无误后批准',
            primaryActionState: 'approve',
            operatorNextStep: '批准后进入分发、CRM 交接和表现回流。',
            evidenceToCheck: ['画面内容', '商品信息', '平台适配'],
          },
          canSubmitFeedback: true,
          canApprove: true,
          feedbackCount: 0,
        },
        feedback: [],
      }}
    />);
    expect(html).toContain('请先预览交付物，再选择反馈或批准');
    expect(html).toContain('批准会写回生产链路');
    expect(html).toContain('如果看不懂或打不开时，请先提交问题反馈');
    expect(html).toContain('不要勉强批准');
    expect(html).toContain('客户当前应该做什么');
    expect(html).toContain('这页只让客户做两件事：反馈或批准');
    expect(html).toContain('先打开交付物');
    expect(html).toContain('只看四件事');
    expect(html).toContain('有问题写具体');
    expect(html).toContain('确认无误再批准');
    expect(html).toContain('确认无误后批准');
    expect(html).toContain('可以批准');
    expect(html).toContain('运营下一步');
    expect(html).toContain('批准前核对证据');
    expect(html).toContain('画面内容');
    expect(html).toContain('商品信息');
    expect(html).toContain('平台适配');
    expect(html).toContain('客户交接闭环');
    expect(html).toContain('系统写回回执');
    expect(html).toContain('客户每一步都会落到可追踪的运营链路');
    expect(html).toContain('Review CRM Handoff Packet');
    expect(html).toContain('客户动作进入 CRM/分发/复盘承接包');
    expect(html).toContain('客户时间线');
    expect(html).toContain('负责人');
    expect(html).toContain('放行门禁');
    expect(html).toContain('生产记录');
    expect(html).toContain('CRM 交接');
    expect(html).toContain('分发门禁');
    expect(html).toContain('表现回流');
    expect(html).toContain('客户验收作战卡');
    expect(html).toContain('Clico 式客户前台');
    expect(html).toContain('客户只做判断');
    expect(html).toContain('运营承接修改');
    expect(html).toContain('批准才放行');
    expect(html).toContain('证据留在系统');
    expect(html).toContain('本页不要求客户理解 provider、ledger 或后台任务');
    expect(html).toContain('客户只判断交付是否可用');
    expect(html).toContain('未批准前不进入自动分发');
    expect(html).toContain('你先查看');
    expect(html).toContain('有问题就反馈');
    expect(html).toContain('没问题再批准');
    expect(html).toContain('后续可追踪');
    expect(html).not.toContain('primaryActionState');
  });

  it('renders friend-safe escalation instructions from the server view', () => {
    const html = renderToStaticMarkup(<IndustrialReviewPortalClient
      token="wrv_friend_safe"
      initialPayload={{
        review: {
          token: 'wrv_friend_safe',
          projectId: 'friend-safe-project',
          assetId: 'friend-safe-asset',
          assetTitle: '朋友可独立审核的成片',
          expiresAt: new Date(Date.now() + 86400_000).toISOString(),
          status: 'active',
          feedbackCount: 0,
          clientChecklist: [
            { label: '交付物可查看', state: 'warn', detail: '当前没有交付物链接，不能完成验收。' },
            { label: '审核链接可写入', state: 'ok', detail: '可以提交反馈；满足条件时也可以批准。' },
          ],
          clientDecision: {
            primaryActionLabel: '先提交问题反馈',
            primaryActionState: 'feedback',
            disabledReason: '交付物链接缺失，不能批准。',
            operatorNextStep: '补齐预览或下载链接，并重新通知客户验收。',
            evidenceToCheck: ['交付物链接', '预览可打开', '版本说明'],
          },
          escalationMessage: '发给运营：审核码 wrv_friend_safe 缺少可打开的交付物链接，请补齐预览或下载链接后再让我验收。',
        },
        feedback: [],
      }}
    />);
    expect(html).toContain('朋友试用不会卡住的处理卡');
    expect(html).toContain('卡住时直接发给运营');
    expect(html).toContain('交付物可查看');
    expect(html).toContain('当前没有交付物链接，不能完成验收。');
    expect(html).toContain('客户当前应该做什么');
    expect(html).toContain('先提交问题反馈');
    expect(html).toContain('先反馈');
    expect(html).toContain('不能继续的原因：交付物链接缺失，不能批准。');
    expect(html).toContain('补齐预览或下载链接，并重新通知客户验收。');
    expect(html).toContain('审核码 wrv_friend_safe 缺少可打开的交付物链接');
    expect(html).toContain('你先反馈');
    expect(html).toContain('系统会拦截');
    expect(html).toContain('数据不丢');
  });

  it('renders media preview and read-only approved state from a real review token', async () => {
    const orgId = `review-page-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId: 'review-page-project',
      type: 'video',
      title: '已批准上线视频',
      url: 'https://cdn.example.test/launch.mp4',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Ready for client approval.',
    });
    const link = await createIndustrialReviewLink(orgId, { assetId: asset.id });
    const approvedAt = new Date().toISOString();

    const html = renderToStaticMarkup(<IndustrialReviewPortalClient
      token={link!.token}
      initialVariant="operator"
      initialPayload={{
        review: {
          token: link!.token,
          projectId: link!.projectId,
          assetId: link!.assetId,
          assetTitle: link!.assetTitle,
          deliverableUrl: link!.deliverableUrl,
          expiresAt: link!.expiresAt,
          status: 'approved',
          feedbackCount: 0,
          approvedAt,
          approvalName: 'Buyer Ops',
        },
        feedback: [],
      }}
    />);
    expect(html).toContain('已批准上线视频');
    expect(html).toContain('该交付物已经批准');
    expect(html).toContain('已完成验收');
    expect(html).toContain('生产链路会进入分发');
    expect(html).toContain('交付物已批准，下一步由运营进入分发');
    expect(html).toContain('已满足');
    expect(html).toContain('已放行');
    expect(html).toContain('上线后的平台指标会回到复盘和品牌学习档案');
    expect(html).toContain('Buyer Ops');
    expect(html).toContain('https://cdn.example.test/launch.mp4');
    expect(html).toContain('已批准');
    expect(html).toContain('只读留档');
    expect(html).toContain('不再接受新的修改意见');
    expect(html).toContain('你已完成');
    expect(html).toContain('系统已写回');
    expect(html).toContain('数据留档');
  });

  it('audits server-rendered review page views through asset permission checks', async () => {
    const orgId = `review-page-audit-${Date.now()}`;
    const projectId = 'review-page-audit-project';
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: '需要客户查看的成片',
      url: 'https://cdn.example.test/audit-video.mp4',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Ready for server-rendered review.',
    });
    const link = await createIndustrialReviewLink(orgId, { assetId: asset.id });

    const page = await IndustrialReviewTokenPage({
      params: Promise.resolve({ token: link!.token }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('需要客户查看的成片');
    await expect(listAssetPermissionAccessAudits(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: asset.id,
          action: 'view',
          operation: 'client_review_page_render',
          allowed: true,
        }),
      ]),
    );
  });

  it('does not server-render expired or revoked review payloads', async () => {
    const orgId = `review-page-locked-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId: 'review-page-locked-project',
      type: 'video',
      title: '不应继续展示的成片',
      url: 'https://cdn.example.test/locked-video.mp4',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Should not render after lock.',
    });
    const expired = await createIndustrialReviewLink(orgId, {
      assetId: asset.id,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const revokable = await createIndustrialReviewLink(orgId, { assetId: asset.id });
    await revokeIndustrialReviewLink(orgId, revokable!.token);

    const expiredPage = await IndustrialReviewTokenPage({
      params: Promise.resolve({ token: expired!.token }),
    });
    const expiredHtml = renderToStaticMarkup(expiredPage);
    expect(expiredHtml).toContain('该审核链接已经过期');
    expect(expiredHtml).toContain('链接已过期');
    expect(expiredHtml).toContain('重新发起审核');
    expect(expiredHtml).not.toContain('不应继续展示的成片');
    expect(expiredHtml).not.toContain('https://cdn.example.test/locked-video.mp4');

    const revokedPage = await IndustrialReviewTokenPage({
      params: Promise.resolve({ token: revokable!.token }),
    });
    const revokedHtml = renderToStaticMarkup(revokedPage);
    expect(revokedHtml).toContain('该审核链接已经撤销');
    expect(revokedHtml).toContain('链接已撤销');
    expect(revokedHtml).toContain('等待新链接');
    expect(revokedHtml).not.toContain('不应继续展示的成片');
    expect(revokedHtml).not.toContain('https://cdn.example.test/locked-video.mp4');
  });

  it('keeps locked review payloads readable after client-side API errors', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/IndustrialReviewPortalClient.tsx'), 'utf8');

    expect(source).toContain("if (error === 'expired') return map.review_expired;");
    expect(source).toContain("if (error === 'revoked') return map.review_revoked;");
    expect(source).toContain('function reviewPayloadFromResponse');
    expect(source).toContain('setPayload(reviewPayloadFromResponse(data));');
    expect(source).toContain('if (nextPayload) setPayload(nextPayload);');
  });

  it('renders a client acceptance receipt when the server provides one', () => {
    const html = renderToStaticMarkup(<IndustrialReviewPortalClient
      token="wrv_receipt_token"
      initialPayload={{
        review: {
          token: 'wrv_receipt_token',
          projectId: 'receipt-project',
          assetId: 'receipt-asset',
          assetTitle: 'Receipt asset',
          deliverableUrl: 'https://cdn.example.test/receipt.mp4',
          expiresAt: new Date(Date.now() + 86400_000).toISOString(),
          status: 'active',
          feedbackCount: 0,
          clientReceipt: {
            title: '客户验收回执',
            summary: '客户当前可以查看交付物，并决定是反馈还是批准。',
            nextStep: '批准后进入分发、CRM 交接和表现回流。',
            operatorRecipient: '运营 / 客服',
            evidenceToCheck: ['交付物链接', '客户确认记录'],
            shareNote: '把这张回执发给客户或运营：审核码 wrv_receipt_token 可继续验收。',
          },
        },
        feedback: [],
      }}
    />);

    expect(html).toContain('客户验收回执');
    expect(html).toContain('交给：运营 / 客服');
    expect(html).toContain('批准后进入分发、CRM 交接和表现回流');
    expect(html).toContain('审核码 wrv_receipt_token');
  });
});
