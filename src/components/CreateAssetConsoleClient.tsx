'use client';

import { useState, type FormEvent } from 'react';

import { FactoryFriendTrialExperience } from '@/components/FactoryFriendTrialExperience';
import { FactoryVariantConsole } from '@/components/FactoryVariantConsole';
import type { IndustrializationSnapshot } from '@/lib/industrial-chain-store';
import type { FactoryUiVariantId } from '@/lib/factory-readiness-view';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

type CreatePlaybook = {
  title: string;
  primaryAction: string;
  proofToCheck: string;
  handoffBoundary: string;
  cards: string[];
};

export type CreateBrandProductionCheck = {
  stage: string;
  ready: boolean;
  evidence: string;
  next: string;
};

const CREATE_VARIANTS: Record<FactoryUiVariantId, {
  label: string;
  audience: string;
  headline: string;
  body: string;
  firstAction: string;
  stopLine: string;
}> = {
  partner: {
    label: '合作者视角',
    audience: '看 Wenai 是否把 brief、脚本、素材、生产交接和客户验收串成 Create 层能力。',
    headline: 'Create 不是一键生成按钮，而是可追溯的资产生产账本。',
    body: '这一层把商品 brief、benchmark、脚本、图片/视频资产、production handoff、版权状态和客户交付状态放在同一条链路里，避免只有前端按钮没有真实生产记录。',
    firstAction: '先看资产账本是否覆盖 brief、benchmark、视觉资产和交付物，再判断是否可以接真实视频/图片 provider。',
    stopLine: '没有 provider token、素材授权、对象存储和客户验收前，不能宣称稳定一键生成或批量混剪。',
  },
  operator: {
    label: '运营视角',
    audience: '给内部运营补材料、补脚本、补版权、补生产交接和交付状态。',
    headline: 'Create 的运营任务是把“素材还差什么”变成可执行队列。',
    body: '运营每天只看缺口：有没有 brief、benchmark、图片/视频资产、是否可复用、版权是否清楚、客户交付是否已批准。',
    firstAction: '先补 next actions 里最前面的缺口；资产没审批或版权未清楚时，不要推进分发计划。',
    stopLine: '外部 provider 未接入时，只能创建生产交接包和结果回填入口，不能标记自动生成完成。',
  },
  friend_trial: {
    label: '朋友试用视角',
    audience: '给非技术朋友看能不能从一个商品需求得到可审核的生产包。',
    headline: '朋友只需要看到：输入商品、生成生产包、等待结果、进入审核。',
    body: '这一视角把 provider、对象存储、DLP、版权和 CRM 术语放到后台边界里，前台只展示清楚的下一步。',
    firstAction: '先创建一个商品 brief、一个参考 benchmark 和一个待生产脚本；没有真实成品 URL 时不展示“已生成”。',
    stopLine: '没有真实成品和审核入口时，只能试用 Create 流程，不能试用自动成片效果。',
  },
};

function createScore(snapshot: IndustrializationSnapshot | null) {
  if (!snapshot) return 0;
  return [
    snapshot.assetCount > 0,
    snapshot.approvedAssetCount > 0,
    snapshot.reusableAssetCount > 0,
    snapshot.rightsIssueAssetCount === 0,
    snapshot.deliverableAssetCount > 0,
    snapshot.clientReviewAssetCount > 0,
    snapshot.approvedDeliverableCount > 0,
  ].filter(Boolean).length;
}

export function buildCreateBrandProductionChecks(snapshot: IndustrializationSnapshot | null): CreateBrandProductionCheck[] {
  const assetCount = snapshot?.assetCount || 0;
  const approvedCount = snapshot?.approvedAssetCount || 0;
  const reusableCount = snapshot?.reusableAssetCount || 0;
  const rightsIssues = snapshot?.rightsIssueAssetCount || 0;
  const governanceIssues = snapshot?.assetGovernanceIssueCount || 0;
  const deliverables = snapshot?.deliverableAssetCount || 0;
  const reviewCount = snapshot?.clientReviewAssetCount || 0;
  const approvedDeliverables = snapshot?.approvedDeliverableCount || 0;
  const handoffReady = (snapshot?.planCount || 0) > 0 || (snapshot?.nextRoundAssetPlanCount || 0) > 0;

  return [
    {
      stage: '品牌资产与素材权属',
      ready: assetCount > 0 && rightsIssues === 0,
      evidence: `资产 ${assetCount} / 版权问题 ${rightsIssues}`,
      next: rightsIssues === 0 && assetCount > 0
        ? '继续把品牌 kit、产品图、禁用表达和素材授权写进生产约束。'
        : '先补品牌资产和权属证明；没有素材授权不能进入批量生成。',
    },
    {
      stage: '模板与版本矩阵',
      ready: reusableCount > 0,
      evidence: `可复用资产 ${reusableCount} / 已审批 ${approvedCount}`,
      next: reusableCount > 0
        ? '把可复用结构转成多平台模板、脚本骨架、封面和短视频版本矩阵。'
        : '先沉淀可复用脚本、视觉结构和平台尺寸模板。',
    },
    {
      stage: '生产交接与 provider 门禁',
      ready: handoffReady && deliverables > 0,
      evidence: `分发/下一轮计划 ${snapshot?.planCount || 0}/${snapshot?.nextRoundAssetPlanCount || 0} / 交付物 ${deliverables}`,
      next: deliverables > 0
        ? '继续接 provider callback、成本上限、失败重试和结果入库。'
        : '先把 brief、script、visual asset 转成生产 handoff；没有 provider 回调不宣称自动成片。',
    },
    {
      stage: '客户审核与批准',
      ready: reviewCount > 0 && approvedDeliverables > 0,
      evidence: `客户审核 ${reviewCount} / 客户批准 ${approvedDeliverables}`,
      next: reviewCount > 0
        ? '把客户反馈、批准、返修和过期状态写回生产包。'
        : '先生成 review token；没有客户审核入口不能给朋友零解释试用。',
    },
    {
      stage: '治理与发布前停止线',
      ready: governanceIssues === 0 && rightsIssues === 0,
      evidence: `治理问题 ${governanceIssues} / 版权问题 ${rightsIssues}`,
      next: governanceIssues === 0 && rightsIssues === 0
        ? '可以进入 Cast/Manage 的发布门禁和权限审计。'
        : '先处理版权、DLP、水印、对象存储和权限问题；不能把草稿当成成品。',
    },
  ];
}

export function buildCreateVariantPlaybook(
  snapshot: IndustrializationSnapshot | null,
  variant: FactoryUiVariantId,
): CreatePlaybook {
  const assetCount = snapshot?.assetCount || 0;
  const approvedCount = snapshot?.approvedAssetCount || 0;
  const reusableCount = snapshot?.reusableAssetCount || 0;
  const rightsIssues = snapshot?.rightsIssueAssetCount || 0;
  const deliverables = snapshot?.deliverableAssetCount || 0;
  const reviewCount = snapshot?.clientReviewAssetCount || 0;
  const approvedDeliverables = snapshot?.approvedDeliverableCount || 0;
  const deliveryIssues = snapshot?.deliveryIssueCount || 0;
  const gaps = snapshot?.missingLinks || [];
  const score = createScore(snapshot);

  if (variant === 'operator') {
    return {
      title: 'Create 运营动作剧本',
      primaryAction: gaps.length
        ? `先处理生产缺口：${gaps[0]}。`
        : '可以进入生产 handoff、成品回填、客户 review 和下一轮分发计划。',
      proofToCheck: '每个素材都要能追到 asset id、类型、证据、审批、版权、复用状态和客户交付状态。',
      handoffBoundary: 'provider、对象存储和客户验收未接入前，只能走生产交接和人工回填，不能标记自动生成完成。',
      cards: [
        `资产 ${assetCount} / 已审批 ${approvedCount} / 可复用 ${reusableCount}`,
        `版权问题 ${rightsIssues} / 交付物 ${deliverables} / 交付问题 ${deliveryIssues}`,
        `客户审核 ${reviewCount} / 客户批准 ${approvedDeliverables} / Create score ${score}/7`,
      ],
    };
  }

  if (variant === 'friend_trial') {
    const readyForTrial = assetCount > 0 && rightsIssues === 0;
    return {
      title: '朋友试用 Create 路径',
      primaryAction: readyForTrial
        ? '可以让朋友从商品 brief 看见脚本和素材包；没有成品时明确标注“待生产”。'
        : '先补商品 brief、参考 benchmark 和可授权素材，否则朋友会不知道系统到底产出了什么。',
      proofToCheck: '朋友只看三项：输入是否明确、生产包是否完整、有没有可打开的成品或审核入口。',
      handoffBoundary: '没有真实成品 URL、review token 和客户批准前，不要把 Create 包装成一键视频已完成。',
      cards: [
        `资产包 ${assetCount}`,
        `版权问题 ${rightsIssues}`,
        `审核入口 ${reviewCount} / 已批准 ${approvedDeliverables}`,
      ],
    };
  }

  return {
    title: 'Create 商业验收剧本',
    primaryAction: score >= 5
      ? '可以进入真实 provider 和企业云资产接入验收，重点检查回调、存储、权限和成本控制。'
      : '先补内部资产账本、生产交接、版权审批和客户交付闭环，再谈一键视频或智能混剪能力。',
    proofToCheck: '合作者要看到 brief、benchmark、script、visual asset、production handoff、delivery review 和权限审计在同一项目里闭环。',
    handoffBoundary: '一键视频、智能混剪和批量生成必须等待真实 provider、素材授权、对象存储、签名 URL、DLP 和客户验收接入。',
    cards: [
      `Create readiness ${score}/7`,
      `资产 ${assetCount} / 交付物 ${deliverables} / 客户批准 ${approvedDeliverables}`,
      `版权问题 ${rightsIssues} / 资产治理问题 ${snapshot?.assetGovernanceIssueCount || 0}`,
    ],
  };
}

export function CreateAssetConsoleClient({
  initialProjectId = 'default-project',
  initialSnapshot = null,
  selectedVariantId = 'partner',
  initialIntake = {},
}: {
  initialProjectId?: string;
  initialSnapshot?: IndustrializationSnapshot | null;
  selectedVariantId?: FactoryUiVariantId;
  initialIntake?: RestaurantTrialIntake;
}) {
  const [projectId, setProjectId] = useState(initialProjectId);
  const [snapshot, setSnapshot] = useState<IndustrializationSnapshot | null>(initialSnapshot);
  const [productName, setProductName] = useState('双人酸菜鱼套餐');
  const [benchmarkUrl, setBenchmarkUrl] = useState('https://example.test/dianping-local-post');
  const [scriptTitle, setScriptTitle] = useState('酸菜鱼双人餐 15 秒到店脚本');
  const [visualTitle, setVisualTitle] = useState('门头与菜品图素材包');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedVariant = CREATE_VARIANTS[selectedVariantId];
  const playbook = buildCreateVariantPlaybook(snapshot, selectedVariantId);
  const productionChecks = buildCreateBrandProductionChecks(snapshot);
  const nextActions = snapshot?.nextActions || [];
  const gaps = snapshot?.missingLinks || [];

  async function refresh(nextProjectId = projectId) {
    setLoading(true);
    const res = await fetch(`/api/industrial-chain?projectId=${encodeURIComponent(nextProjectId || 'default-project')}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.message || data.error || 'Create 数据刷新失败');
      return;
    }
    setError('');
    setSnapshot(data.snapshot);
  }

  async function addAsset(asset: Record<string, unknown>) {
    const res = await fetch('/api/industrial-chain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'asset', asset: { projectId: projectId || 'default-project', ...asset } }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || data.error || '资产写入失败');
    }
  }

  async function seedCreatePackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setNotice('');
    setError('');
    try {
      await addAsset({
        type: 'brief',
        title: `${productName} production brief`,
        evidence: '商品定位、目标平台、核心卖点、禁用表达和验收口径已进入 Create brief。',
        tags: ['create-brief', 'operator-ready'],
        approvalStatus: 'approved',
        rightsStatus: 'owned',
      });
      await addAsset({
        type: 'benchmark',
        title: `${productName} benchmark reference`,
        url: benchmarkUrl,
        evidence: '参考链接仅用于结构拆解；不复刻竞品素材和原文表达。',
        tags: ['benchmark', 'hook-reference'],
        approvalStatus: 'approved',
        rightsStatus: 'licensed',
      });
      await addAsset({
        type: 'script',
        title: scriptTitle,
        evidence: '脚本包含 hook、scene beats、proof point、CTA 和风险边界，可交给视频工厂继续生产。',
        tags: ['script', 'production-handoff'],
        approvalStatus: 'approved',
        rightsStatus: 'owned',
      });
      await addAsset({
        type: 'image',
        title: visualTitle,
        evidence: '视觉资产占位已授权进入生产包；真实成品仍需 provider 或人工设计回填。',
        tags: ['visual-asset', 'needs-provider-result'],
        approvalStatus: 'review',
        rightsStatus: 'needs_review',
      });
      await refresh(projectId);
      setNotice('已写入 Create 生产包：brief、benchmark、script、visual asset。视觉资产保持待审核，不伪装成成品。');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create 生产包写入失败');
    } finally {
      setLoading(false);
    }
  }

  if ((selectedVariantId as FactoryUiVariantId) === 'friend_trial') {
    const assetCount = snapshot?.assetCount || 0;
    const reusableCount = snapshot?.reusableAssetCount || 0;
    const reviewCount = snapshot?.clientReviewAssetCount || 0;
    const readyChecks = productionChecks.filter(item => item.ready).length;
    const intakeChecklist = [
      { title: '菜品图 / 门店图', body: assetCount > 0 ? `${assetCount} 个素材已记录` : '等待上传或粘贴真实素材链接', ready: assetCount > 0 },
      { title: '套餐说明 / 活动边界', body: '价格、可用时段、限量和核销规则需要门店确认', ready: false },
      { title: '禁用表达 / 食安红线', body: '功效、最低价、食材来源和过敏原不能由系统自动编造', ready: false },
      { title: '授权确认 / 审核入口', body: reviewCount > 0 ? `${reviewCount} 组待门店审核` : '等待负责人确认素材可用', ready: reviewCount > 0 },
    ];
    const restaurantProductionChecks = productionChecks.slice(0, 4).map(item => ({
      ...item,
      stage: item.stage
        .replace('客户审核与批准', '门店审核与确认')
        .replace('生产交接与 provider 门禁', '内容交接与外部制作门禁'),
      evidence: item.evidence
        .replace('客户审核', '门店审核')
        .replace('客户批准', '门店确认'),
      next: item.next
        .replace('客户反馈、批准、返修和过期状态', '门店反馈、确认、返修和过期状态')
        .replace('review token', '门店审核入口')
        .replace('客户审核入口', '门店审核入口')
        .replace('provider callback', '外部制作回调')
        .replace('provider 回调', '外部制作回调'),
    }));

    return (
      <FactoryFriendTrialExperience
        active="create"
        title="把菜品和门店资料变成本地内容素材"
        subtitle="菜品图、门店环境、套餐卖点、口播、授权和活动边界，整理成短视频和图文能直接用的素材货架。"
        metrics={[
          { label: '门店素材', value: assetCount > 0 ? `${assetCount} 个` : '待上传', detail: '菜品/环境/口播', tone: assetCount > 0 ? 'emerald' : 'slate' },
          { label: '可复用', value: reusableCount > 0 ? `${reusableCount} 个` : '待沉淀', detail: '下轮继续用', tone: reusableCount > 0 ? 'emerald' : 'amber' },
          { label: '待门店看', value: reviewCount > 0 ? `${reviewCount} 组` : '待创建', detail: '审核入口', tone: 'amber' },
        ]}
        funnel={[
          { label: 'Brief', value: 88 },
          { label: '素材', value: 76 },
          { label: '授权', value: 64 },
          { label: '生产', value: 52 },
          { label: '审核', value: 44 },
        ]}
        actions={[
          { role: '餐饮客户', title: '补门店资料', value: '上传菜品图、套餐卖点、门店图和禁用表达', href: '#create-seed' },
          { role: '运营', title: '检查素材', value: '确认素材和活动边界可用再进入内容生产', href: '#asset-evidence' },
          { role: '剪辑', title: '进入内容', value: '用已确认素材生成本地内容草稿', href: '/factory/video?variant=friend_trial' },
        ]}
        intake={initialIntake}
        nextHref="/factory/video?variant=friend_trial"
        nextLabel="去批量剪"
      >
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form id="create-seed" onSubmit={seedCreatePackage} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Asset Builder</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">新增内容资产</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">生产前准备</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['项目', projectId, setProjectId],
                ['菜品/套餐', productName, setProductName],
                ['参考链接', benchmarkUrl, setBenchmarkUrl],
                ['脚本标题', scriptTitle, setScriptTitle],
                ['素材标题', visualTitle, setVisualTitle],
              ].map(([label, value, setter]) => (
                <label className="text-sm text-slate-700" key={String(label)}>
                  {String(label)}
                  <input
                    value={String(value)}
                    onChange={event => (setter as (value: string) => void)(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-400"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={loading} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500">
                写入菜品素材
              </button>
              <button type="button" onClick={() => refresh()} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:text-slate-400">
                刷新
              </button>
            </div>
            {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          </form>

          <section id="asset-evidence" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-950">资产状态</h2>
              <span className="text-xs font-medium text-slate-500">{readyChecks}/{productionChecks.length} 就绪</span>
            </div>
            <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-2">
              {intakeChecklist.map(item => (
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={item.title}>
                  <div className={`text-xs font-semibold ${item.ready ? 'text-emerald-700' : 'text-amber-700'}`}>{item.ready ? '已记录' : '待补齐'}</div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{item.body}</p>
                </article>
              ))}
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {restaurantProductionChecks.map(item => (
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={item.stage}>
                  <div className={`text-xs font-semibold ${item.ready ? 'text-emerald-700' : 'text-amber-700'}`}>{item.ready ? '已准备' : '待补齐'}</div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-950">{item.stage}</h3>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-200">
                    <div className={`h-1.5 rounded-full ${item.ready ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: item.ready ? '100%' : '56%' }} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </FactoryFriendTrialExperience>
    );
  }

  if ((selectedVariantId as FactoryUiVariantId) === 'friend_trial') {
    const readyChecks = productionChecks.filter(item => item.ready).length;
    const createLogs = [
      {
        time: '13:22:18',
        level: 'INFO',
        text: `项目 ${projectId} 已索引 ${snapshot?.assetCount || 0} 个 Create 资产。`,
      },
      {
        time: '13:18:44',
        level: snapshot && (snapshot.rightsIssueAssetCount > 0 || snapshot.assetGovernanceIssueCount > 0) ? 'ERR' : 'INFO',
        text: `版权问题 ${snapshot?.rightsIssueAssetCount || 0} 项，治理问题 ${snapshot?.assetGovernanceIssueCount || 0} 项。`,
      },
      {
        time: '13:10:03',
        level: 'WARN',
        text: `客户审核 ${snapshot?.clientReviewAssetCount || 0} 个，已批准 ${snapshot?.approvedDeliverableCount || 0} 个；没有 review token 前不开放朋友验收。`,
      },
      {
        time: '13:02:51',
        level: 'INFO',
        text: 'Create 只写入 brief、benchmark、script 和 visual asset，不伪装 provider 已生成成品。',
      },
    ];
    const externalGates = [
      { title: '素材授权', detail: `版权问题 ${snapshot?.rightsIssueAssetCount || 0} / 治理问题 ${snapshot?.assetGovernanceIssueCount || 0}`, blocked: (snapshot?.rightsIssueAssetCount || 0) > 0 || (snapshot?.assetGovernanceIssueCount || 0) > 0 },
      { title: '对象存储', detail: '真实文件存储、签名 URL、DLP 仍需外部配置。', blocked: true },
      { title: '视频 Provider', detail: '真实成片仍需剪辑/生成 provider 回调。', blocked: true },
      { title: '平台账号', detail: '分发与自动发布需要 OAuth 授权。', blocked: true },
      { title: 'Analytics Sync', detail: '表现回流管道未接通前只做内部证据。', blocked: true },
    ];
    const evidenceRows = [
      { module: 'Brief', source: `${projectId || 'default-project'}`, status: snapshot?.assetCount ? '内部已索引' : '待写入', audit: `${snapshot?.assetCount || 0} assets` },
      { module: 'Script', source: 'Create Seed', status: snapshot?.reusableAssetCount ? '可复用' : '待沉淀', audit: `${snapshot?.reusableAssetCount || 0} reusable` },
      { module: 'Visual', source: 'Asset ledger', status: snapshot?.rightsIssueAssetCount ? '需审计' : '可进生产包', audit: `${snapshot?.rightsIssueAssetCount || 0} rights issues` },
      { module: 'Review', source: 'Client handoff', status: snapshot?.clientReviewAssetCount ? '有入口' : '待生成', audit: `${snapshot?.clientReviewAssetCount || 0} review tokens` },
    ];
    const readinessRows = productionChecks.map(item => ({
      module: item.stage,
      progress: item.ready ? 100 : 55,
      status: item.ready ? '已就绪' : '补证据',
      evidence: item.evidence,
      ready: item.ready,
    }));

    return (
      <main className="min-h-screen bg-[#f3f4f6] p-4 text-neutral-900 sm:p-6">
        <div className="mx-auto max-w-[1400px]">
          <section className="overflow-hidden rounded-lg border border-neutral-200 bg-[#fafafa] shadow-sm">
            <div className="grid min-h-[calc(100vh-3rem)] lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="flex flex-col border-r border-neutral-200 bg-white">
                <div className="border-b border-neutral-100 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 text-sm font-semibold text-white">W</div>
                    <div>
                      <div className="text-base font-semibold text-neutral-900">Wenai</div>
                      <div className="text-xs text-neutral-500">资产生产工厂</div>
                    </div>
                  </div>
                </div>
                <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                  {['指挥中心', '视频工坊', '创意洞察', '资产生产', '分发运营', '效果回流', '客户移交'].map((label, index) => (
                    <div
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${index === 3 ? 'border-l-2 border-neutral-900 bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'}`}
                      key={label}
                    >
                      <span className="size-2 rounded-full bg-neutral-400" />
                      <span>{label}</span>
                    </div>
                  ))}
                </nav>
                <div className="border-t border-neutral-100 p-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 text-sm font-semibold text-white">A</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-neutral-900">Wenai Admin</div>
                      <div className="text-xs text-neutral-500">工作空间</div>
                    </div>
                    <span className="text-neutral-400">⌄</span>
                  </div>
                </div>
              </aside>

              <div className="min-w-0">
                <header className="flex flex-col gap-4 border-b border-neutral-200 bg-white px-6 py-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-neutral-500">Wenai Asset Factory</p>
                    <h2 className="text-balance text-3xl font-semibold text-neutral-950 sm:text-4xl">朋友试用 Create 路径</h2>
                    <p className="max-h-11 max-w-3xl overflow-hidden text-pretty text-sm leading-5 text-neutral-600">
                      {selectedVariant.headline} {selectedVariant.body}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      内部资产账本
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      provider-gated
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                      {readyChecks}/{productionChecks.length} checks
                    </span>
                  </div>
                </header>

                <div className="space-y-6 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <a href="#create-seed" className="inline-flex items-center rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800">创建资产</a>
                      <a href="#asset-evidence" className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50">查看证据</a>
                      <a href="#create-readiness" className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50">Readiness</a>
                    </div>
                    <div className="text-xs font-medium text-neutral-500">No fake provider · No fake OAuth · Ledger first</div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: '资产包', value: String(snapshot?.assetCount || 0), detail: `已审批 ${snapshot?.approvedAssetCount || 0} · 可复用 ${snapshot?.reusableAssetCount || 0}` },
                      { label: '版权治理', value: String(snapshot?.rightsIssueAssetCount || 0), detail: `治理问题 ${snapshot?.assetGovernanceIssueCount || 0}` },
                      { label: '交付物', value: String(snapshot?.deliverableAssetCount || 0), detail: `客户审核 ${snapshot?.clientReviewAssetCount || 0}` },
                      { label: '已批准', value: String(snapshot?.approvedDeliverableCount || 0), detail: '客户批准写回生产链路' },
                    ].map(card => (
                      <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm" key={card.label}>
                        <div className="text-xs font-semibold uppercase text-neutral-500">{card.label}</div>
                        <div className="mt-3 text-3xl font-semibold tabular-nums text-neutral-950">{card.value}</div>
                        <p className="mt-2 text-sm leading-5 text-neutral-600">{card.detail}</p>
                      </article>
                    ))}
                  </div>

                  <section className="grid gap-6 xl:grid-cols-[minmax(360px,0.72fr)_minmax(0,1fr)]">
                    <form id="create-seed" onSubmit={seedCreatePackage} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-500">Create Seed</p>
                          <h2 className="mt-2 text-lg font-semibold text-neutral-950">补一个可追溯生产包</h2>
                          <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-neutral-600">
                            一次写入 brief、benchmark、script 和 visual asset；视觉资产保持待审核，避免把 provider-gated 结果伪装成成品。
                          </p>
                        </div>
                        <span className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">provider-gated</span>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {[
                          ['项目', projectId, setProjectId],
                          ['商品', productName, setProductName],
                          ['参考 benchmark URL', benchmarkUrl, setBenchmarkUrl],
                          ['脚本标题', scriptTitle, setScriptTitle],
                          ['视觉资产标题', visualTitle, setVisualTitle],
                        ].map(([label, value, setter]) => (
                          <label className="text-sm text-neutral-700" key={String(label)}>
                            {String(label)}
                            <input
                              value={String(value)}
                              onChange={event => (setter as (value: string) => void)(event.target.value)}
                              className="mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-neutral-950 outline-none focus:border-neutral-400"
                            />
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button disabled={loading} className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-200 disabled:text-neutral-500">
                          写入 Create 生产包
                        </button>
                        <button type="button" onClick={() => refresh()} disabled={loading} className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 disabled:text-neutral-400">
                          刷新 Create 状态
                        </button>
                      </div>
                      {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
                      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
                    </form>

                    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-500">Operation Queue</p>
                          <h2 className="mt-2 text-lg font-semibold text-neutral-950">Create 缺口与操作</h2>
                        </div>
                        <div className="text-xs text-neutral-500">{nextActions.length || 2} actions</div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {(nextActions.length ? nextActions : [
                          selectedVariant.firstAction,
                          selectedVariant.stopLine,
                        ]).map(item => (
                          <div key={item} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">{item}</div>
                        ))}
                      </div>
                    </section>
                  </section>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                    <section className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-5">
                        <div>
                          <p className="text-xs uppercase text-neutral-500">{playbook.title}</p>
                          <h3 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-neutral-950">{CREATE_VARIANTS.friend_trial.headline}</h3>
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">{playbook.primaryAction}</p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          {Object.entries(CREATE_VARIANTS).map(([id, variant]) => (
                            <a
                              aria-current={id === selectedVariantId ? 'page' : undefined}
                              className={`min-h-28 rounded-2xl border p-4 text-left transition ${id === selectedVariantId ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-white'}`}
                              href={`/factory/create?projectId=${encodeURIComponent(projectId)}&variant=${id}`}
                              key={id}
                            >
                              <span className="block text-sm font-semibold">{variant.label}</span>
                              <span className={`mt-2 block text-xs leading-5 ${id === selectedVariantId ? 'text-white/75' : 'text-neutral-500'}`}>{variant.audience}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                          <div className="text-xs font-semibold uppercase text-neutral-500">证据检查</div>
                          <p className="mt-2 text-sm leading-6 text-cyan-700">{playbook.proofToCheck}</p>
                        </div>
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                          <div className="text-xs font-semibold uppercase text-neutral-500">停止线</div>
                          <p className="mt-2 text-sm leading-6 text-rose-700">{playbook.handoffBoundary}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                          <div className="text-xs font-semibold uppercase text-neutral-500">朋友只看三项</div>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">输入是否明确、生产包是否完整、有没有可打开的成品或审核入口。</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        {playbook.cards.map(card => (
                          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-600" key={card}>
                            {card}
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="space-y-6">
                      <section className="rounded-[1.75rem] border border-neutral-200 bg-[#0f172a] p-5 text-slate-300 shadow-sm">
                        <div className="flex items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
                          <div>
                            <p className="text-xs uppercase text-slate-400">Terminal // Create Logs</p>
                            <h3 className="mt-2 text-lg font-semibold text-white">SYSTEM LOGS</h3>
                          </div>
                          <span className="text-xs font-medium text-emerald-400">Live</span>
                        </div>
                        <div className="mt-4 space-y-3 font-mono text-xs leading-6">
                          {createLogs.map(entry => (
                            <p key={`${entry.time}-${entry.level}`}>
                              <span className="mr-2 text-slate-500">[{entry.time}]</span>
                              <span className={`mr-2 ${entry.level === 'WARN' ? 'text-amber-400' : entry.level === 'ERR' ? 'text-rose-400' : 'text-sky-400'}`}>[{entry.level}]</span>
                              <span className="text-slate-200">{entry.text}</span>
                            </p>
                          ))}
                          <p className="pt-2">
                            <span className="text-emerald-400">assets@wenai-core:~#</span>{' '}
                            <span className="inline-block h-4 w-2 animate-pulse align-middle bg-slate-400" />
                          </p>
                        </div>
                      </section>

                      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase text-neutral-500">External Gates</p>
                            <h3 className="mt-2 text-lg font-semibold text-neutral-950">关键外部门禁</h3>
                          </div>
                          <div className="text-xs font-medium text-neutral-500">{externalGates.filter(gate => gate.blocked).length}/5 blocked</div>
                        </div>
                        <div className="mt-4 grid gap-3">
                          {externalGates.map(item => (
                            <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3" key={item.title}>
                              <div>
                                <div className="text-sm font-semibold text-neutral-950">{item.title}</div>
                                <div className="mt-0.5 text-xs text-neutral-500">{item.detail}</div>
                              </div>
                              <span className={`rounded-md px-2 py-1 text-[11px] font-medium ${item.blocked ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {item.blocked ? '阻断' : 'OK'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>

                  <section className="grid gap-6 xl:grid-cols-2">
                    <div id="asset-evidence" className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-500">Evidence Layer</p>
                          <h2 className="mt-1 text-sm font-semibold text-neutral-950">近期资产证据层</h2>
                        </div>
                        <span className="text-xs font-medium text-neutral-500">{snapshot?.assetCount || 0} assets</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                            <tr>
                              <th className="border-b border-neutral-200 px-5 py-3 font-semibold">模块</th>
                              <th className="border-b border-neutral-200 px-5 py-3 font-semibold">来源</th>
                              <th className="border-b border-neutral-200 px-5 py-3 font-semibold">状态</th>
                              <th className="border-b border-neutral-200 px-5 py-3 font-semibold">审计记录</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-neutral-700">
                            {evidenceRows.map(row => (
                              <tr className="hover:bg-neutral-50" key={row.module}>
                                <td className="px-5 py-3 font-mono text-xs text-neutral-950">{row.module}</td>
                                <td className="px-5 py-3">{row.source}</td>
                                <td className="px-5 py-3">
                                  <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-medium ${row.status.includes('待') || row.status.includes('需') ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                    {row.status}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-neutral-500">{row.audit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div id="create-readiness" className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-500">Readiness Table</p>
                          <h2 className="mt-1 text-sm font-semibold text-neutral-950">模块准备度</h2>
                        </div>
                        <span className="text-xs font-medium text-neutral-500">{readyChecks}/{productionChecks.length} ready</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
                            <tr>
                              <th className="border-b border-neutral-200 px-5 py-3 font-semibold">链路模块</th>
                              <th className="border-b border-neutral-200 px-5 py-3 font-semibold">完成度</th>
                              <th className="border-b border-neutral-200 px-5 py-3 text-right font-semibold">状态</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-neutral-700">
                            {readinessRows.map(row => (
                              <tr className="hover:bg-neutral-50" key={row.module}>
                                <td className="max-w-[260px] px-5 py-3">
                                  <div className="font-medium text-neutral-950">{row.module}</div>
                                  <div className="mt-1 truncate text-xs text-neutral-500">{row.evidence}</div>
                                </td>
                                <td className="px-5 py-3">
                                  <div className="h-1.5 w-full rounded-full bg-neutral-200">
                                    <div className={`h-1.5 rounded-full ${row.ready ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${row.progress}%` }} />
                                  </div>
                                </td>
                                <td className={`px-5 py-3 text-right text-xs font-semibold ${row.ready ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {row.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Creatopy / Pencil 参考层</p>
                        <h2 className="mt-2 text-xl font-semibold text-neutral-950">品牌安全批量生产验收板</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                          这里把品牌资产、素材权属、模板复用、版本矩阵、provider 门禁、客户审核和发布前停止线放到同一块板上；缺一项就不宣称一键视频或批量混剪。
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-neutral-700">{readyChecks}/{productionChecks.length} 就绪</div>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-5">
                      {productionChecks.map(item => (
                        <article className={`rounded-2xl border p-4 ${item.ready ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-neutral-50'}`} key={item.stage}>
                          <div className={`text-xs font-semibold ${item.ready ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {item.ready ? '已具备证据' : '继续补证据'}
                          </div>
                          <h3 className="mt-2 text-sm font-semibold text-neutral-950">{item.stage}</h3>
                          <p className="mt-2 text-xs leading-5 text-neutral-600">{item.evidence}</p>
                          <p className="mt-2 text-xs leading-5 text-neutral-500">{item.next}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0d09] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[8px] border border-amber-200/15 bg-[#1a150d] p-5 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Create Asset Variant</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">资产生产控制台</h1>
              <p className="mt-3 text-sm leading-6 text-amber-50/75">{selectedVariant.headline}</p>
              <p className="mt-2 text-sm leading-6 text-white/55">{selectedVariant.body}</p>
            </div>
          </div>
        </section>

        <FactoryVariantConsole
          accent="amber"
          basePath="/factory/create"
          evidenceCards={playbook.cards}
          eyebrow="Create Action Playbook"
          firstScreen={selectedVariant.body}
          nextAction={selectedVariant.firstAction}
          primaryAction={playbook.primaryAction}
          projectId={projectId}
          proofFocus={playbook.proofToCheck}
          selectedVariantId={selectedVariantId}
          stopLine={playbook.handoffBoundary}
          title={playbook.title}
          variants={CREATE_VARIANTS}
        />

        <section className="rounded-[8px] border border-amber-200/15 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Creatopy / Pencil 参考层</p>
              <h2 className="mt-2 text-xl font-semibold">品牌安全批量生产验收板</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                这里把品牌资产、素材权属、模板复用、版本矩阵、provider 门禁、客户审核和发布前停止线放到同一块板上；缺一项就不宣称一键视频或批量混剪。
              </p>
            </div>
            <div className="text-sm font-semibold text-amber-100">
              {productionChecks.filter(item => item.ready).length}/{productionChecks.length} 就绪
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {productionChecks.map(item => (
              <article className={`rounded-[8px] border p-4 ${
                item.ready ? 'border-amber-200/25 bg-amber-300/10' : 'border-red-200/20 bg-red-300/10'
              }`} key={item.stage}>
                <div className={`text-xs font-semibold ${item.ready ? 'text-amber-100' : 'text-red-100'}`}>
                  {item.ready ? '已具备证据' : '继续补证据'}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{item.stage}</h3>
                <p className="mt-2 text-xs leading-5 text-white/60">{item.evidence}</p>
                <p className="mt-2 text-xs leading-5 text-white/45">{item.next}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <form onSubmit={seedCreatePackage} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Create Seed</p>
            <h2 className="mt-2 text-xl font-semibold">补一个可追溯生产包</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">一次写入 brief、benchmark、script 和 visual asset；视觉资产保持待审核，避免把 provider-gated 结果伪装成成品。</p>
            <div className="mt-4 grid gap-3">
              <label className="text-sm text-white/70">
                项目
                <input value={projectId} onChange={event => setProjectId(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300" />
              </label>
              <label className="text-sm text-white/70">
                商品
                <input value={productName} onChange={event => setProductName(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300" />
              </label>
              <label className="text-sm text-white/70">
                参考 benchmark URL
                <input value={benchmarkUrl} onChange={event => setBenchmarkUrl(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300" />
              </label>
              <label className="text-sm text-white/70">
                脚本标题
                <input value={scriptTitle} onChange={event => setScriptTitle(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300" />
              </label>
              <label className="text-sm text-white/70">
                视觉资产标题
                <input value={visualTitle} onChange={event => setVisualTitle(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-amber-300" />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={loading} className="rounded-[6px] bg-amber-300 px-4 py-2 text-sm font-semibold text-[#0f0d09] disabled:opacity-50">
                写入 Create 生产包
              </button>
              <button type="button" onClick={() => refresh()} disabled={loading} className="rounded-[6px] border border-white/15 px-4 py-2 text-sm text-white/80 disabled:opacity-50">
                刷新 Create 状态
              </button>
            </div>
            {notice ? <p className="mt-3 text-sm text-amber-100">{notice}</p> : null}
            {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
          </form>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Assets</p>
            <div className="mt-3 text-3xl font-semibold">{snapshot?.assetCount || 0}</div>
            <p className="mt-2 text-sm text-white/60">已审批 {snapshot?.approvedAssetCount || 0} · 可复用 {snapshot?.reusableAssetCount || 0}</p>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Governance</p>
            <div className="mt-3 text-3xl font-semibold">{snapshot?.rightsIssueAssetCount || 0}</div>
            <p className="mt-2 text-sm text-white/60">版权问题 · 治理问题 {snapshot?.assetGovernanceIssueCount || 0}</p>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Delivery</p>
            <div className="mt-3 text-3xl font-semibold">{snapshot?.deliverableAssetCount || 0}</div>
            <p className="mt-2 text-sm text-white/60">客户审核 {snapshot?.clientReviewAssetCount || 0} · 已批准 {snapshot?.approvedDeliverableCount || 0}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold">Create 缺口</h2>
            <div className="mt-3 space-y-2">
              {(gaps.length ? gaps : ['内部 Create 账本当前没有阻断项，下一步是接真实 provider、对象存储和客户验收。']).map(item => (
                <div key={item} className="rounded-[6px] border border-white/10 bg-black/20 p-3 text-sm text-white/70">{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold">下一步队列</h2>
            <div className="mt-3 space-y-2">
              {(nextActions.length ? nextActions : [
                selectedVariant.firstAction,
                selectedVariant.stopLine,
              ]).map(item => (
                <div key={item} className="rounded-[6px] border border-white/10 bg-black/20 p-3 text-sm text-white/70">{item}</div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
