import type { ProductReadinessReport, ReadinessStatus } from '@/lib/product-readiness';

type FactoryCapability = {
  title: string;
  layer: string;
  internal: string;
  external: string;
};

export type FactoryUiVariantId = 'partner' | 'operator' | 'friend_trial';

export const FACTORY_UI_VARIANT_IDS: FactoryUiVariantId[] = ['partner', 'operator', 'friend_trial'];

export type FactoryUiVariant = {
  id: FactoryUiVariantId;
  label: string;
  audience: string;
  focus: string;
  firstAction: string;
  stopLine: string;
};

export function normalizeFactoryUiVariantId(value?: string | string[] | null): FactoryUiVariantId {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (normalized === 'operator' || normalized === 'friend_trial' || normalized === 'partner') return normalized;
  return 'partner';
}

export function buildFactoryUiVariants(report: Pick<ProductReadinessReport, 'uiVariants'>): FactoryUiVariant[] {
  return report.uiVariants.map(variant => ({
    id: normalizeFactoryUiVariantId(variant.id),
    label: variant.label,
    audience: variant.audience,
    focus: variant.firstScreen,
    firstAction: variant.primaryAction,
    stopLine: variant.stopLine,
  }));
}

export function orderFactoryUiVariants(
  variants: FactoryUiVariant[],
  selectedVariantId: FactoryUiVariantId,
): FactoryUiVariant[] {
  return [...variants].sort((left, right) => {
    if (left.id === selectedVariantId) return -1;
    if (right.id === selectedVariantId) return 1;
    return FACTORY_UI_VARIANT_IDS.indexOf(left.id) - FACTORY_UI_VARIANT_IDS.indexOf(right.id);
  });
}

function statusLabel(status: ReadinessStatus) {
  if (status === 'implemented') return '内部证据较完整';
  if (status === 'partial') return '部分具备';
  if (status === 'missing') return '缺能力';
  return '伪功能风险';
}

export function buildFactoryOperatingLayers(report: Pick<ProductReadinessReport, 'productBlueprint'>) {
  return report.productBlueprint.map(layer => ({
    name: layer.id,
    title: layer.id === 'Compose'
      ? '创意情报'
      : layer.id === 'Create'
        ? '资产生产'
        : layer.id === 'Cut'
          ? '视频混剪'
          : layer.id === 'Cast'
          ? '同城发布'
            : '管理验收',
    body: layer.target,
    href: layer.id === 'Compose'
      ? '/factory/creative'
      : layer.id === 'Cut'
        ? '/factory/video'
        : layer.id === 'Cast'
          ? '/factory/cast'
          : layer.id === 'Create'
            ? '/factory/create'
          : layer.id === 'Manage'
            ? '/factory/manage'
            : '/factory',
    state: `${statusLabel(layer.currentStatus)}：${layer.stopLine}`,
    evidence: layer.evidence,
  }));
}

export function buildFactoryReadinessSlices(report: Pick<ProductReadinessReport, 'productBlueprint' | 'externalRequirements' | 'scaleClaimGuards'>) {
  const internalItems = report.productBlueprint.map(layer => `${layer.id}: ${layer.internalCapability}`);
  const externalItems = report.externalRequirements
    .filter(item => item.status !== 'configured')
    .slice(0, 6)
    .map(item => `${item.label}: ${item.requiredInputs.slice(0, 2).join(' / ')}`);
  const blockedClaims = report.scaleClaimGuards
    .filter(item => !item.canDisplay)
    .map(item => item.requestedBenchmark);

  return [
    {
      title: '内部继续做',
      items: internalItems,
    },
    {
      title: '外部接入后做',
      items: externalItems.length > 0 ? externalItems : ['真实平台授权、视频 provider、商户活动权限、平台反馈回流和企业云资产均已配置后再验收。'],
    },
    {
      title: '现在不能宣称',
      items: ['筷子等价', '自动优化', '平台级外部发布完成', ...blockedClaims.map(item => `${item} 自有规模`)],
    },
  ];
}

export function buildFactoryMobileCapabilities(report: Pick<ProductReadinessReport, 'productBlueprint'>): FactoryCapability[] {
  const byLayer = new Map(report.productBlueprint.map(layer => [layer.id, layer]));
  const compose = byLayer.get('Compose');
  const cut = byLayer.get('Cut');
  const cast = byLayer.get('Cast');
  const manage = byLayer.get('Manage');

  return [
    {
      title: '全网灵感管理',
      layer: 'Compose',
      internal: compose?.internalCapability || '创意洞察、竞品账号、榜单和品牌学习进入统一账本。',
      external: compose?.externalGate || '需要授权账号源、榜单源和多模态解析 provider。',
    },
    {
      title: '热门视频解析',
      layer: 'Compose / Cut',
      internal: compose?.target || '沉淀 hook、scene beat、proof point、CTA 和风险边界。',
      external: compose?.stopLine || '没有持续来源和解析证据前不能宣称全网自动监控。',
    },
    {
      title: '批量混剪',
      layer: 'Cut',
      internal: cut?.internalCapability || '视频 workflow、剪辑包、人工试跑和成片回灌链路已可演示。',
      external: cut?.externalGate || '需要剪辑/渲染 provider、素材授权和回调。',
    },
    {
      title: '矩阵宝 / PubPal',
      layer: 'Cast',
      internal: cast?.internalCapability || '账号矩阵、发布槽位、dispatch 和证据回填已建账本。',
      external: cast?.externalGate || '需要平台授权、上传发布权限和平台回执。',
    },
    {
      title: '活动发布',
      layer: 'Cast',
      internal: cast?.target || '门店活动账本、预算门禁、发布证据和反馈回流。',
      external: cast?.stopLine || '没有商户授权和发布凭证前不能宣称外部发布已完成。',
    },
    {
      title: '企业数据安全',
      layer: 'Manage',
      internal: manage?.internalCapability || 'RBAC、DLP、水印、留存、访问审计和客户 review 写回。',
      external: manage?.externalGate || '需要对象存储、签名 URL、团队空间和下载/share enforcement。',
    },
  ];
}
