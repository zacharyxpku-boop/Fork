import type { RestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import type { RestaurantPublicProfileIntakeReport } from '@/lib/restaurant-public-profile-intake';

export type RestaurantPublicSourceHarvestTarget = {
  id: string;
  platform: string;
  mode: 'public-search' | 'merchant-upload' | 'provider-required';
  query: string;
  fields: string[];
  evidenceRequired: string[];
  canRunInternally: boolean;
  nextAction: string;
};

export type RestaurantPublicSourceHarvestPack = {
  ok: true;
  payloadShape: 'restaurant-public-source-harvest-pack-v1';
  generatedAt: string;
  profileId: string;
  restaurant: string;
  verdict: 'ready-for-public-harvest' | 'needs-merchant-input' | 'provider-required';
  summary: {
    targets: number;
    internalTargets: number;
    merchantUploads: number;
    providerRequired: number;
    normalizedFields: number;
  };
  targets: RestaurantPublicSourceHarvestTarget[];
  normalizedImportTemplate: Array<{
    field: string;
    currentValue: string;
    source: string;
    requiredFor: string;
  }>;
  browserRunnerInstructions: string[];
  merchantAsk: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: string | undefined, fallback: string) {
  return value && value.trim() ? value.trim().replace(/\s+/g, ' ').slice(0, 160) : fallback;
}

function target(input: RestaurantPublicSourceHarvestTarget): RestaurantPublicSourceHarvestTarget {
  return input;
}

function sourceFor(profile: RestaurantPublicProfileIntakeReport, field: string) {
  return profile.fields.find(item => item.field === field)?.evidence || profile.evidenceLedger[0]?.source || 'manual';
}

export function buildRestaurantPublicSourceHarvestPack(input: {
  publicProfile: RestaurantPublicProfileIntakeReport;
  publicIntelligenceBrief: RestaurantPublicIntelligenceBrief;
  now?: Date;
}): RestaurantPublicSourceHarvestPack {
  const restaurant = clean(input.publicProfile.profile.restaurant, 'trial restaurant');
  const city = clean(input.publicProfile.profile.city, 'city');
  const area = clean(input.publicProfile.profile.area, 'area');
  const cuisine = clean(input.publicProfile.profile.cuisine, 'cuisine');
  const offer = clean(input.publicProfile.profile.suggestedOffer, 'featured offer');
  const sourceUrl = input.publicProfile.profile.sourceUrl;
  const canStartTrial = input.publicIntelligenceBrief.readiness.canStartTrial;

  const targets = [
    target({
      id: 'poi-identity',
      platform: 'public map / POI',
      mode: sourceUrl ? 'public-search' : 'merchant-upload',
      query: sourceUrl || `${city} ${area} ${restaurant} ${cuisine}`,
      fields: ['store name', 'city', 'area', 'address/POI', 'cuisine', 'opening scene'],
      evidenceRequired: ['public URL or screenshot', 'source name', 'captured timestamp'],
      canRunInternally: Boolean(sourceUrl || restaurant),
      nextAction: sourceUrl
        ? 'Use the public URL as attribution-backed context; do not treat it as merchant authorization.'
        : 'Ask merchant for one public store URL or address screenshot before browser harvest.',
    }),
    target({
      id: 'dianping-meituan-proof',
      platform: 'Dianping / Meituan',
      mode: 'provider-required',
      query: `${restaurant} ${city} ${area} ${offer}`,
      fields: ['public store page', 'menu/coupon boundary', 'publish proof', 'coupon claim or redemption export'],
      evidenceRequired: ['merchant authorization', 'public proof link or screenshot', 'redemption export if claiming redemption'],
      canRunInternally: false,
      nextAction: 'Prepare the query and material checklist now; real sync/publish/redemption needs merchant platform authorization.',
    }),
    target({
      id: 'xiaohongshu-local-content',
      platform: 'Xiaohongshu',
      mode: canStartTrial ? 'public-search' : 'merchant-upload',
      query: `${city} ${area} ${cuisine} ${offer} 探店`,
      fields: ['local dining scene', 'dish angle', 'photo requirements', 'published note proof'],
      evidenceRequired: ['authorized photos', 'draft approval', 'public note URL or screenshot'],
      canRunInternally: canStartTrial,
      nextAction: canStartTrial
        ? 'Create a public-search brief and draft; keep publishing proof as a separate receipt.'
        : 'Collect restaurant, offer and scene before creating Xiaohongshu harvest tasks.',
    }),
    target({
      id: 'douyin-short-video',
      platform: 'Douyin',
      mode: canStartTrial ? 'public-search' : 'merchant-upload',
      query: `${city} ${area} ${restaurant} ${offer} 短视频`,
      fields: ['shot list', 'hook angle', 'public video URL', 'aggregate comment/inquiry count'],
      evidenceRequired: ['real clips or authorized footage', 'operator approval', 'public video receipt'],
      canRunInternally: canStartTrial,
      nextAction: 'Harvest only public inspiration and proof fields; private comments/messages require merchant-controlled aggregate summary.',
    }),
    target({
      id: 'wechat-community-followup',
      platform: 'WeChat community',
      mode: 'merchant-upload',
      query: `${restaurant} ${offer} 社群跟进`,
      fields: ['group owner', 'booking sheet', 'coupon claim sheet', 'manual closeout summary'],
      evidenceRequired: ['merchant-provided aggregate sheet', 'staff owner', 'consent boundary'],
      canRunInternally: false,
      nextAction: 'Use a merchant-provided aggregate sheet; do not scrape or read private group messages.',
    }),
  ];

  const normalizedImportTemplate = [
    { field: 'restaurant', currentValue: restaurant, source: sourceFor(input.publicProfile, 'restaurant'), requiredFor: 'all content and proof tasks' },
    { field: 'city_area', currentValue: `${city} / ${area}`, source: sourceFor(input.publicProfile, 'area'), requiredFor: 'local search and audience context' },
    { field: 'cuisine', currentValue: cuisine, source: sourceFor(input.publicProfile, 'cuisine'), requiredFor: 'menu angle and competitor context' },
    { field: 'offer', currentValue: offer, source: sourceFor(input.publicProfile, 'suggestedOffer'), requiredFor: 'campaign draft and receipt matching' },
    { field: 'source_url', currentValue: sourceUrl || 'missing', source: sourceFor(input.publicProfile, 'sourceUrl'), requiredFor: 'public attribution and browser runner seed' },
  ];

  const internalTargets = targets.filter(item => item.canRunInternally).length;
  const merchantUploads = targets.filter(item => item.mode === 'merchant-upload').length;
  const providerRequired = targets.filter(item => item.mode === 'provider-required').length;
  const verdict: RestaurantPublicSourceHarvestPack['verdict'] = providerRequired > 0
    ? 'provider-required'
    : merchantUploads > 0
      ? 'needs-merchant-input'
      : 'ready-for-public-harvest';

  return {
    ok: true,
    payloadShape: 'restaurant-public-source-harvest-pack-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    profileId: input.publicProfile.intakeId,
    restaurant,
    verdict,
    summary: {
      targets: targets.length,
      internalTargets,
      merchantUploads,
      providerRequired,
      normalizedFields: normalizedImportTemplate.length,
    },
    targets,
    normalizedImportTemplate,
    browserRunnerInstructions: [
      'Use only public-search targets and allowlisted public URLs as browser seeds.',
      'Capture URL, screenshot id, timestamp, platform and extracted fields; never capture cookies, tokens, passwords, phone numbers or private messages.',
      'Send results back as public-profile/manual evidence first; publish, redemption and lead actions require separate provider receipts.',
    ],
    merchantAsk: input.publicIntelligenceBrief.materialChecklist
      .filter(item => item.status !== 'ready')
      .map(item => `${item.owner}: ${item.label} -> ${item.nextAction}`)
      .slice(0, 8),
    externalRequired: Array.from(new Set([
      ...input.publicProfile.blockedExternal,
      ...targets.filter(item => !item.canRunInternally).map(item => item.nextAction),
    ])).slice(0, 10),
    safetyBoundary: 'Public Source Harvest Pack plans public-source collection and merchant uploads only. It does not bypass logins, scrape private messages, collect customer identifiers, publish content, redeem coupons, pull POS rows, or turn public search context into real business results.',
  };
}
