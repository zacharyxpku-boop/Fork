import { RESTAURANT_EXTERNAL_DATA_SOURCES } from '@/lib/restaurant-public-data';
import { buildRestaurantPublicProfileIntake, type RestaurantPublicProfileIntakeReport } from '@/lib/restaurant-public-profile-intake';

export type RestaurantPublicIntelligenceBrief = {
  ok: true;
  payloadShape: 'restaurant-public-intelligence-brief-v1';
  generatedAt: string;
  profile: RestaurantPublicProfileIntakeReport['profile'];
  readiness: {
    usableFields: number;
    missingFields: number;
    internalActions: number;
    externalGates: number;
    canStartTrial: boolean;
  };
  platformProfiles: Array<{
    platform: 'dianping-meituan' | 'xiaohongshu' | 'douyin' | 'wechat-community' | 'poi-map';
    job: string;
    usableNow: boolean;
    evidenceNow: string[];
    missingForRealRun: string[];
    nextAction: string;
  }>;
  materialChecklist: Array<{
    id: string;
    label: string;
    status: 'ready' | 'missing' | 'external-required';
    owner: 'merchant' | 'ops' | 'runtime-admin';
    nextAction: string;
  }>;
  sourcePlan: Array<{
    name: string;
    status: string;
    canUseNow: boolean;
    usefulFor: string;
    nextAction: string;
  }>;
  operatorScript: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: string | undefined, fallback: string) {
  return value && value.trim() ? value.trim() : fallback;
}

function hasField(profile: RestaurantPublicProfileIntakeReport, field: string) {
  return profile.fields.some(item => item.field === field && item.confidence !== 'missing' && item.value);
}

export function buildRestaurantPublicIntelligenceBrief(input: {
  publicProfile?: RestaurantPublicProfileIntakeReport;
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
  now?: Date;
} = {}): RestaurantPublicIntelligenceBrief {
  const now = input.now || new Date();
  const publicProfile = input.publicProfile || buildRestaurantPublicProfileIntake(input);
  const restaurant = clean(publicProfile.profile.restaurant, 'trial restaurant');
  const offer = clean(publicProfile.profile.suggestedOffer, 'today offer');
  const scenario = clean(publicProfile.profile.scenario, 'local dining scenario');
  const usableFields = publicProfile.fields.filter(item => item.confidence !== 'missing').length;
  const missingFields = publicProfile.fields.length - usableFields;
  const hasRestaurant = hasField(publicProfile, 'restaurant');
  const hasSource = hasField(publicProfile, 'sourceUrl') || hasField(publicProfile, 'coordinates');
  const hasOffer = hasField(publicProfile, 'suggestedOffer');
  const canStartTrial = hasRestaurant && hasOffer;

  const platformProfiles: RestaurantPublicIntelligenceBrief['platformProfiles'] = [
    {
      platform: 'dianping-meituan',
      job: 'Turn public store identity and menu rules into local search, coupon and reservation proof tasks.',
      usableNow: hasRestaurant && hasSource,
      evidenceNow: publicProfile.evidenceLedger.map(item => `${item.source} / ${item.license}`).slice(0, 2),
      missingForRealRun: ['merchant backend authorization', 'group-buy coupon rules', 'publish link or screenshot', 'redemption export'],
      nextAction: hasSource
        ? `Prepare a Dianping/Meituan proof slot for ${restaurant}; ask merchant to attach menu price, coupon boundary and publish proof.`
        : 'Ask merchant for an allowlisted public store URL before creating platform proof tasks.',
    },
    {
      platform: 'xiaohongshu',
      job: 'Convert dining scenario, dish angle and authorized photos into local note drafts and feedback receipts.',
      usableNow: canStartTrial,
      evidenceNow: [scenario, offer].filter(Boolean),
      missingForRealRun: ['authorized dish photos', 'store environment photos', 'published note URL', 'comment or inquiry summary'],
      nextAction: `Draft a scenario-first note around ${scenario}; keep it in review until photos and publish receipt are attached.`,
    },
    {
      platform: 'douyin',
      job: 'Create short-video shot plan and receipt checklist for visit reason, offer boundary and comment/private inquiry follow-up.',
      usableNow: canStartTrial,
      evidenceNow: [restaurant, offer],
      missingForRealRun: ['real video clips', 'operator approval', 'published video URL', 'aggregate comment/inquiry count'],
      nextAction: `Build a 15-second shot list for ${offer}; do not claim posting until a public video receipt exists.`,
    },
    {
      platform: 'wechat-community',
      job: 'Prepare staff-owned group message, booking sheet and closeout evidence without scraping private chats.',
      usableNow: canStartTrial,
      evidenceNow: [restaurant, offer],
      missingForRealRun: ['staff group owner', 'booking sheet', 'customer consent boundary', 'manual closeout summary'],
      nextAction: 'Create an internal staff handoff and booking-sheet template; private group content stays manual and aggregate-only.',
    },
    {
      platform: 'poi-map',
      job: 'Use public POI as attribution-backed store identity, location and radius context.',
      usableNow: hasSource,
      evidenceNow: publicProfile.fields.filter(item => ['coordinates', 'sourceUrl', 'area'].includes(item.field) && item.confidence !== 'missing').map(item => `${item.field}: ${item.value}`),
      missingForRealRun: ['production map API key if batch search is needed', 'cache policy', 'attribution display'],
      nextAction: hasSource
        ? 'Keep POI attribution in the evidence ledger and use it only as context, not as merchant authorization.'
        : 'Use manual store text until a public POI URL or map API provider is configured.',
    },
  ];

  const materialChecklist: RestaurantPublicIntelligenceBrief['materialChecklist'] = [
    {
      id: 'store-identity',
      label: 'Store identity and local scene',
      status: canStartTrial ? 'ready' : 'missing',
      owner: 'ops',
      nextAction: canStartTrial ? 'Use profile in trial content and proof tasks.' : 'Collect restaurant name, offer and target dining scene.',
    },
    {
      id: 'menu-price',
      label: 'Menu, price and campaign boundary',
      status: publicProfile.missingForActivation.includes('merchant_menu_prices') ? 'missing' : 'ready',
      owner: 'merchant',
      nextAction: 'Merchant must confirm menu price, availability, limit, validity period and forbidden claims.',
    },
    {
      id: 'photo-rights',
      label: 'Authorized dish and store photos',
      status: publicProfile.missingForActivation.includes('authorized_food_photos') ? 'missing' : 'ready',
      owner: 'merchant',
      nextAction: 'Attach authorized photos or mark content as copy-only until photos are approved.',
    },
    {
      id: 'platform-proof',
      label: 'Publishing proof and feedback receipt',
      status: publicProfile.missingForActivation.includes('publish_receipt_or_screenshot') ? 'missing' : 'ready',
      owner: 'ops',
      nextAction: 'Collect public URL, screenshot, receipt id or signed callback before claiming external execution.',
    },
    {
      id: 'provider-runtime',
      label: 'Provider runtime, merchant grant and callback',
      status: 'external-required',
      owner: 'runtime-admin',
      nextAction: 'Configure OpenClaw/Hermes/Lobu runtime, isolated browser profile, merchant authorization and callback secret before real automation.',
    },
  ];

  const sourcePlan = RESTAURANT_EXTERNAL_DATA_SOURCES.map(source => ({
    name: source.name,
    status: source.status,
    canUseNow: source.canUseNow,
    usefulFor: source.usefulFor,
    nextAction: source.canUseNow ? source.internalFallback : source.externalRequirement,
  }));

  return {
    ok: true,
    payloadShape: 'restaurant-public-intelligence-brief-v1',
    generatedAt: now.toISOString(),
    profile: publicProfile.profile,
    readiness: {
      usableFields,
      missingFields,
      internalActions: platformProfiles.filter(item => item.usableNow).length,
      externalGates: materialChecklist.filter(item => item.status === 'external-required').length + publicProfile.blockedExternal.length,
      canStartTrial,
    },
    platformProfiles,
    materialChecklist,
    sourcePlan,
    operatorScript: [
      `${restaurant}: public profile can start ${canStartTrial ? 'a controlled trial' : 'only a draft'} for ${offer}.`,
      `Use public evidence for context only; merchant must confirm menu, price, photos, campaign boundary and proof.`,
      'Do not promise auto-publish, acquisition, redemption or operating lift until provider runtime, merchant grant, callback and POS contracts are configured.',
    ],
    externalRequired: Array.from(new Set([
      ...publicProfile.blockedExternal,
      ...materialChecklist.filter(item => item.status !== 'ready').map(item => item.nextAction),
      ...sourcePlan.filter(item => !item.canUseNow).map(item => item.nextAction),
    ])).slice(0, 10),
    safetyBoundary: 'Public Intelligence Brief converts public or merchant-provided store facts into internal trial tasks, material gaps and provider requirements. It does not scrape private data, log in, publish, collect private messages, redeem coupons, pull POS rows or infer real business results without accepted receipts.',
  };
}
