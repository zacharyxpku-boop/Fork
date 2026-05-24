import { RESTAURANT_PUBLIC_SAMPLES, type RestaurantPublicSample } from '@/lib/restaurant-public-data';

export type RestaurantPublicProfileField = {
  field: 'restaurant' | 'city' | 'area' | 'scenario' | 'cuisine' | 'coordinates' | 'sourceUrl' | 'suggestedOffer' | 'suggestedAudience';
  value: string;
  confidence: 'public-sample' | 'manual-public' | 'missing';
  evidence: string;
};

export type RestaurantPublicProfileIntakeReport = {
  ok: true;
  intakeId: string;
  mode: 'public-sample' | 'manual-public-profile';
  canUseNow: boolean;
  profile: {
    restaurant: string;
    city: string;
    area: string;
    cuisine: string;
    scenario: string;
    suggestedOffer: string;
    suggestedAudience: string;
    sourceUrl?: string;
  };
  fields: RestaurantPublicProfileField[];
  evidenceLedger: Array<{
    source: string;
    license: string;
    capturedAt: string;
    boundary: string;
  }>;
  memoryUpserts: Array<{
    entity: 'Restaurant' | 'Offer';
    key: string;
    write: string;
    nextUse: string;
  }>;
  blockedExternal: string[];
  missingForActivation: string[];
  safetyBoundary: string;
};

function stableId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 41 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback = '', max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function parseManualProfile(text: string): Partial<RestaurantPublicProfileIntakeReport['profile']> {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const read = (labels: string[]) => {
    const line = lines.find(item => labels.some(label => item.startsWith(`${label}:`) || item.startsWith(`${label}：`)));
    return line ? cleanText(line.split(/[:：]/).slice(1).join(':'), '', 120) : '';
  };
  return {
    restaurant: read(['restaurant', '餐厅', '门店', 'name']),
    city: read(['city', '城市']),
    area: read(['area', '商圈', '地址']),
    cuisine: read(['cuisine', '菜系']),
    scenario: read(['scenario', '场景']),
    suggestedOffer: read(['offer', '套餐', '活动']),
    suggestedAudience: read(['audience', '客群']),
    sourceUrl: read(['url', 'source', '公开链接']),
  };
}

function findSample(input: { sampleId?: string; sourceUrl?: string; restaurant?: string }): RestaurantPublicSample | undefined {
  const sampleId = cleanText(input.sampleId);
  const sourceUrl = cleanText(input.sourceUrl, '', 240);
  const restaurant = cleanText(input.restaurant);
  return RESTAURANT_PUBLIC_SAMPLES.find(sample => {
    if (sampleId && sample.id === sampleId) return true;
    if (sourceUrl && sample.source.url === sourceUrl) return true;
    if (restaurant && sample.name === restaurant) return true;
    return false;
  });
}

function isPublicUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    return [
      'openstreetmap.org',
      'www.openstreetmap.org',
      'dianping.com',
      'www.dianping.com',
      'meituan.com',
      'www.meituan.com',
      'xiaohongshu.com',
      'www.xiaohongshu.com',
      'douyin.com',
      'www.douyin.com',
    ].some(allowed => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function field(field: RestaurantPublicProfileField['field'], value: string, confidence: RestaurantPublicProfileField['confidence'], evidence: string): RestaurantPublicProfileField {
  return { field, value, confidence: value ? confidence : 'missing', evidence };
}

export function buildRestaurantPublicProfileIntake(input: {
  sampleId?: string;
  restaurant?: string;
  city?: string;
  area?: string;
  cuisine?: string;
  scenario?: string;
  sourceUrl?: string;
  suggestedOffer?: string;
  suggestedAudience?: string;
  manualText?: string;
} = {}): RestaurantPublicProfileIntakeReport {
  const manual = parseManualProfile(typeof input.manualText === 'string' ? input.manualText.slice(0, 1200) : '');
  const sample = findSample({ sampleId: input.sampleId, sourceUrl: input.sourceUrl || manual.sourceUrl, restaurant: input.restaurant || manual.restaurant });
  const mode = sample ? 'public-sample' : 'manual-public-profile';
  const sourceUrl = sample?.source.url || cleanText(input.sourceUrl || manual.sourceUrl, '', 240);
  const publicUrl = isPublicUrl(sourceUrl);
  const restaurant = sample?.name || cleanText(input.restaurant || manual.restaurant, '待确认门店');
  const city = sample?.city || cleanText(input.city || manual.city, '待确认城市');
  const area = sample?.area || cleanText(input.area || manual.area, '待确认商圈');
  const cuisine = sample?.cuisine || cleanText(input.cuisine || manual.cuisine, '待确认菜系');
  const scenario = sample?.scenario || cleanText(input.scenario || manual.scenario, '待确认用餐场景');
  const suggestedOffer = sample?.suggestedOffer || cleanText(input.suggestedOffer || manual.suggestedOffer, '待确认主推套餐');
  const suggestedAudience = sample?.suggestedAudience || cleanText(input.suggestedAudience || manual.suggestedAudience, '待确认目标客群');
  const confidence: RestaurantPublicProfileField['confidence'] = sample ? 'public-sample' : 'manual-public';
  const evidence = sample
    ? `${sample.source.name} / ${sample.source.license} / ${sample.source.url}`
    : publicUrl
      ? `manual public URL / ${sourceUrl}`
      : 'manual text; public URL missing or not allowlisted';
  const profile = { restaurant, city, area, cuisine, scenario, suggestedOffer, suggestedAudience, sourceUrl: sourceUrl || undefined };
  const fields: RestaurantPublicProfileField[] = [
    field('restaurant', restaurant, confidence, evidence),
    field('city', city, confidence, evidence),
    field('area', area, confidence, evidence),
    field('scenario', scenario, confidence, evidence),
    field('cuisine', cuisine, confidence, evidence),
    field('coordinates', sample ? `${sample.coordinates.lat.toFixed(6)},${sample.coordinates.lon.toFixed(6)}` : '', sample ? 'public-sample' : 'missing', evidence),
    field('sourceUrl', sourceUrl, publicUrl || sample ? confidence : 'missing', evidence),
    field('suggestedOffer', suggestedOffer, confidence, evidence),
    field('suggestedAudience', suggestedAudience, confidence, evidence),
  ];
  const missingForActivation = [
    restaurant === '待确认门店' ? 'restaurant_name' : '',
    suggestedOffer === '待确认主推套餐' ? 'offer_or_menu' : '',
    sourceUrl && !publicUrl && !sample ? 'allowlisted_public_url' : '',
    'merchant_menu_prices',
    'authorized_food_photos',
    'campaign_rules',
    'publish_receipt_or_screenshot',
  ].filter(Boolean);

  return {
    ok: true,
    intakeId: `public-profile-${stableId(JSON.stringify(profile))}`,
    mode,
    canUseNow: Boolean(sample || publicUrl || restaurant !== '待确认门店'),
    profile,
    fields,
    evidenceLedger: [
      {
        source: sample?.source.name || (publicUrl ? 'Manual public URL' : 'Manual text'),
        license: sample?.source.license || 'user-provided-public-or-manual',
        capturedAt: sample?.source.capturedAt || new Date(0).toISOString(),
        boundary: sample
          ? '公开 POI 样例只证明基础门店资料，不代表商家授权、平台接入或经营效果。'
          : '手工公开资料只能进入草稿和记忆，不自动打开平台、不抓取后台、不生成经营结论。',
      },
    ],
    memoryUpserts: [
      {
        entity: 'Restaurant',
        key: restaurant,
        write: `${city} / ${area} / ${cuisine} / ${scenario}`,
        nextUse: '用于本地内容计划、门店场景和公开资料缺口提示。',
      },
      {
        entity: 'Offer',
        key: `${restaurant}:${suggestedOffer}`,
        write: `${suggestedOffer} -> ${suggestedAudience}`,
        nextUse: '用于生成菜品卖点、渠道草稿和待补证据清单。',
      },
    ],
    blockedExternal: [
      'merchant platform profile sync requires merchant authorization',
      'review/comment/private-message collection is not allowed from public intake',
      'POS redemption and revenue analysis require POS export/API',
      'auto publish requires runtime, operator approval and signed receipt callback',
    ],
    missingForActivation,
    safetyBoundary: 'Public profile intake 只使用公开样例、白名单公开 URL 或客户手工文本；不登录平台、不绕过验证码、不读取私信、不采集手机号/微信号/订单/POS 明细，也不声称已自动获客或核销。',
  };
}
