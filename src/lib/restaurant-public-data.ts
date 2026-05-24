import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantPublicSample = {
  id: string;
  name: string;
  city: string;
  district: string;
  area: string;
  scenario: string;
  cuisine: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  publicSignals: string[];
  importReadiness: 'sample-ready' | 'needs-merchant-confirmation';
  source: {
    name: string;
    url: string;
    license: string;
    capturedAt: string;
  };
  suggestedOffer: string;
  suggestedAudience: string;
  suggestedChannels: string;
  suggestedEvidence: string;
};

export type RestaurantPublicSampleImportRow = {
  restaurant: string;
  city: string;
  area: string;
  scenario: string;
  cuisine: string;
  latitude: string;
  longitude: string;
  source: string;
  license: string;
  suggestedOffer: string;
  suggestedAudience: string;
  evidenceBoundary: string;
};

export type RestaurantExternalDataSource = {
  name: string;
  status: 'public-sample-ready' | 'requires-api-key' | 'requires-merchant-account' | 'manual-import-only';
  canUseNow: boolean;
  usefulFor: string;
  internalFallback: string;
  externalRequirement: string;
};

export type RestaurantExternalSetupNeed = {
  title: string;
  neededFromUser: string;
  unlocks: string;
  internalFallback: string;
};

export const RESTAURANT_PUBLIC_SAMPLES: RestaurantPublicSample[] = [
  {
    id: 'osm-node-476781766',
    name: '必胜客',
    city: '上海',
    district: '人民广场',
    area: '上海人民广场附近',
    scenario: '工作日晚餐 / 商圈双人餐',
    cuisine: 'pizza',
    coordinates: { lat: 31.2378562, lon: 121.4766473 },
    publicSignals: ['公开餐饮 POI', '连锁品牌', '商圈客流', 'cuisine=pizza'],
    importReadiness: 'needs-merchant-confirmation',
    source: {
      name: 'OpenStreetMap / Overpass API',
      url: 'https://www.openstreetmap.org/node/476781766',
      license: 'ODbL',
      capturedAt: '2026-05-22T17:45:31Z',
    },
    suggestedOffer: '工作日晚餐双人披萨套餐',
    suggestedAudience: '人民广场附近下班双人餐和商圈逛街客',
    suggestedChannels: '大众点评 / 小红书 / 微信社群',
    suggestedEvidence: 'OSM 餐饮 POI、公开门店名称、经纬度和 cuisine；仍需门店补菜单、价格、图片、活动边界和真实发布凭证。',
  },
  {
    id: 'osm-node-638736460',
    name: '国际饭店',
    city: '上海',
    district: '人民广场',
    area: '上海人民广场附近',
    scenario: '地标打卡 / 下午茶或晚餐',
    cuisine: 'hotel restaurant',
    coordinates: { lat: 31.2354192, lon: 121.4671723 },
    publicSignals: ['公开餐饮 POI', '地标位置', 'wheelchair=yes'],
    importReadiness: 'needs-merchant-confirmation',
    source: {
      name: 'OpenStreetMap / Overpass API',
      url: 'https://www.openstreetmap.org/node/638736460',
      license: 'ODbL',
      capturedAt: '2026-05-22T17:45:31Z',
    },
    suggestedOffer: '老牌地标下午茶或晚餐活动',
    suggestedAudience: '南京西路游客、本地聚餐客和地标打卡客',
    suggestedChannels: '大众点评 / 小红书 / 抖音',
    suggestedEvidence: 'OSM 餐饮 POI、公开门店名称、地标位置和无障碍标签；仍需门店确认活动、菜单和图片授权。',
  },
  {
    id: 'osm-node-600243400',
    name: '大董烤鸭团结湖分店',
    city: '北京',
    district: '三里屯 / 团结湖',
    area: '北京三里屯附近',
    scenario: '京味正餐 / 外地客宴请',
    cuisine: 'chinese',
    coordinates: { lat: 39.9313007, lon: 116.4562015 },
    publicSignals: ['公开餐饮 POI', 'cuisine=chinese', 'opening_hours=11:00-22:00', '商圈邻近'],
    importReadiness: 'needs-merchant-confirmation',
    source: {
      name: 'OpenStreetMap / Overpass API',
      url: 'https://www.openstreetmap.org/node/600243400',
      license: 'ODbL',
      capturedAt: '2026-05-22T17:45:31Z',
    },
    suggestedOffer: '外地客烤鸭宴请套餐',
    suggestedAudience: '三里屯周边商务宴请、朋友聚餐和来京游客',
    suggestedChannels: '大众点评 / 小红书 / 抖音 / 微信社群',
    suggestedEvidence: 'OSM 餐饮 POI、公开门店名称、经纬度、菜系和营业时间标签；仍需门店补套餐规则、可用时段、图片和核销凭证。',
  },
  {
    id: 'osm-node-513237820',
    name: '麻辣诱惑',
    city: '北京',
    district: '三里屯',
    area: '北京三里屯附近',
    scenario: '朋友聚餐 / 重口味社交',
    cuisine: 'sichuan-style',
    coordinates: { lat: 39.9330396, lon: 116.4481455 },
    publicSignals: ['公开餐饮 POI', '商圈邻近', '门店名称'],
    importReadiness: 'needs-merchant-confirmation',
    source: {
      name: 'OpenStreetMap / Overpass API',
      url: 'https://www.openstreetmap.org/node/513237820',
      license: 'ODbL',
      capturedAt: '2026-05-22T17:45:31Z',
    },
    suggestedOffer: '朋友聚餐川味分享套餐',
    suggestedAudience: '三里屯附近年轻朋友聚餐、下班小聚和重口味餐饮客',
    suggestedChannels: '小红书 / 抖音 / 微信社群',
    suggestedEvidence: 'OSM 餐饮 POI、公开门店名称和经纬度；仍需门店补真实菜品、辣度边界、价格和发布凭证。',
  },
  {
    id: 'osm-node-3096606612',
    name: '御素阁',
    city: '成都',
    district: '春熙路 / 太古里',
    area: '成都太古里附近',
    scenario: '素食聚餐 / 商场到店',
    cuisine: 'regional vegetarian',
    coordinates: { lat: 30.6565996, lon: 104.0746426 },
    publicSignals: ['公开餐饮 POI', 'vegetarian=only', 'vegan=yes', 'capacity=100'],
    importReadiness: 'needs-merchant-confirmation',
    source: {
      name: 'OpenStreetMap / Overpass API',
      url: 'https://www.openstreetmap.org/node/3096606612',
      license: 'ODbL',
      capturedAt: '2026-05-22T17:45:31Z',
    },
    suggestedOffer: '商场素食聚餐套餐',
    suggestedAudience: '春熙路商场客、素食客、轻负担聚餐人群',
    suggestedChannels: '小红书 / 大众点评 / 微信社群',
    suggestedEvidence: 'OSM 餐饮 POI、公开门店名称、经纬度、素食标签和容量标签；仍需门店补菜单、价格、图片授权和真实到店反馈。',
  },
  {
    id: 'osm-node-4314179090',
    name: '康二姐串串',
    city: '成都',
    district: '太古里周边',
    area: '成都太古里附近',
    scenario: '夜宵 / 串串打卡',
    cuisine: 'barbecue',
    coordinates: { lat: 30.6625535, lon: 104.087944 },
    publicSignals: ['公开餐饮 POI', 'cuisine=barbecue', 'wheelchair=limited'],
    importReadiness: 'needs-merchant-confirmation',
    source: {
      name: 'OpenStreetMap / Overpass API',
      url: 'https://www.openstreetmap.org/node/4314179090',
      license: 'ODbL',
      capturedAt: '2026-05-22T17:45:31Z',
    },
    suggestedOffer: '串串夜宵双人到店套餐',
    suggestedAudience: '太古里周边夜宵客、游客和本地朋友聚餐客',
    suggestedChannels: '抖音 / 小红书 / 微信社群',
    suggestedEvidence: 'OSM 餐饮 POI、公开门店名称、经纬度和菜系标签；仍需门店确认营业时段、客单、菜品图和发布截图。',
  },
  {
    id: 'osm-node-3262643367',
    name: '椒堂米粉',
    city: '广州',
    district: '天河城',
    area: '广州天河城附近',
    scenario: '工作日快餐 / 商场简餐',
    cuisine: 'rice noodles',
    coordinates: { lat: 23.1316749, lon: 113.3254713 },
    publicSignals: ['公开餐饮 POI', '商圈邻近', '门店名称'],
    importReadiness: 'needs-merchant-confirmation',
    source: {
      name: 'OpenStreetMap / Overpass API',
      url: 'https://www.openstreetmap.org/node/3262643367',
      license: 'ODbL',
      capturedAt: '2026-05-22T17:45:31Z',
    },
    suggestedOffer: '工作日午餐米粉加小食套餐',
    suggestedAudience: '天河城附近上班族、商场简餐客和午餐高峰人群',
    suggestedChannels: '大众点评 / 微信社群 / 小红书',
    suggestedEvidence: 'OSM 餐饮 POI、公开门店名称和经纬度；仍需门店补菜单、价格、出餐速度、图片和核销记录。',
  },
  {
    id: 'osm-node-3645923094',
    name: '真过瘾新疆大盘鸡',
    city: '广州',
    district: '天河',
    area: '广州天河城附近',
    scenario: '朋友聚餐 / 份量型正餐',
    cuisine: 'chinese',
    coordinates: { lat: 23.1317877, lon: 113.3165907 },
    publicSignals: ['公开餐饮 POI', 'cuisine=chinese', '商圈邻近'],
    importReadiness: 'needs-merchant-confirmation',
    source: {
      name: 'OpenStreetMap / Overpass API',
      url: 'https://www.openstreetmap.org/node/3645923094',
      license: 'ODbL',
      capturedAt: '2026-05-22T17:45:31Z',
    },
    suggestedOffer: '大盘鸡多人分享套餐',
    suggestedAudience: '天河附近朋友聚餐、下班正餐和份量敏感客群',
    suggestedChannels: '大众点评 / 抖音 / 微信社群',
    suggestedEvidence: 'OSM 餐饮 POI、公开门店名称、经纬度和菜系标签；仍需门店补菜品规格、价格、可预约时段和真实反馈。',
  },
];

export const RESTAURANT_EXTERNAL_DATA_SOURCES: RestaurantExternalDataSource[] = [
  {
    name: 'OpenStreetMap / Overpass',
    status: 'public-sample-ready',
    canUseNow: true,
    usefulFor: '公开 POI、门店名称、位置、cuisine / amenity 等基础字段',
    internalFallback: '可作为样例门店与外部数据导入格式，不代表门店授权或平台运营数据。',
    externalRequirement: '使用时保留 ODbL attribution；生产环境需要缓存策略、变更时间和数据来源展示。',
  },
  {
    name: '大众点评 / 美团',
    status: 'requires-merchant-account',
    canUseNow: false,
    usefulFor: '门店页、评价、团购券、核销、预约和发布证明',
    internalFallback: '先手工回填门店链接、截图、券规则和核销表格。',
    externalRequirement: '需要商家账号、平台授权、合规的数据使用范围和回调 / 导出方式。',
  },
  {
    name: '小红书 / 抖音',
    status: 'requires-merchant-account',
    canUseNow: false,
    usefulFor: '本地内容发布链接、笔记 / 视频反馈、私信或线索回收',
    internalFallback: '先手工记录发布链接、截图、评论摘录和私信咨询数量。',
    externalRequirement: '需要账号授权、开放平台能力、内容 ID、数据同步频率和审核边界。',
  },
  {
    name: '高德 / 百度 / Google Places / Yelp',
    status: 'requires-api-key',
    canUseNow: false,
    usefulFor: 'POI 搜索、地址补全、营业时间、分类和地理范围筛选',
    internalFallback: '先用公开样例或客户填写的门店资料，不把地址补全伪装成实时地图接入。',
    externalRequirement: '需要 API key、配额、费用评估、缓存规则、服务条款审查和地区可用性确认。',
  },
  {
    name: 'POS / 收银 / 会员 / 库存',
    status: 'manual-import-only',
    canUseNow: false,
    usefulFor: '营业额、桌数、客单、菜品销量、券核销、会员复购和缺货',
    internalFallback: '先导入 CSV/表格摘要，只做证据账本和任务分配，不做自动经营结论。',
    externalRequirement: '需要门店提供导出样表、字段字典、脱敏规则和系统账号或 API。',
  },
];

export const RESTAURANT_EXTERNAL_SETUP_NEEDS: RestaurantExternalSetupNeed[] = [
  {
    title: '真实门店基础档案',
    neededFromUser: '门店名称、地址、营业时间、主推菜、价格、活动边界、可用图片授权。',
    unlocks: '把公开样例替换成客户真实试用数据，并生成可执行内容和到店跟进任务。',
    internalFallback: '继续使用 OSM 样例和手工表单演示，不宣称已获得真实门店授权。',
  },
  {
    title: '平台商家账号或发布凭证',
    neededFromUser: '大众点评/美团、小红书、抖音、微信社群的商家后台权限，或发布链接和截图。',
    unlocks: '把“待发布/待回填”推进到真实发布证明、评论反馈和私信线索台账。',
    internalFallback: '先保留链接/截图输入框和证据账本，由人工回填。',
  },
  {
    title: '地图或 POI API key',
    neededFromUser: '高德、百度、Google Places、Yelp 等 API key、配额、地区和用途确认。',
    unlocks: '批量搜索门店、地址补全、营业时间核对和商圈半径筛选。',
    internalFallback: '只使用可归因公开样例和客户手工录入数据。',
  },
  {
    title: 'POS / 会员 / 库存样表',
    neededFromUser: '脱敏 CSV/Excel、字段说明、导出频率、核销口径和负责人。',
    unlocks: '把内容任务和真实经营反馈连起来，但仍以证据账本呈现，不编造增长结论。',
    internalFallback: '先维护手工导入清单和“不得自动判断”的审计边界。',
  },
];

export function publicSampleToTrialIntake(sample: RestaurantPublicSample): Required<Pick<RestaurantTrialIntake, 'restaurant' | 'offer' | 'audience' | 'channels' | 'evidence'>> {
  return {
    restaurant: sample.name,
    offer: sample.suggestedOffer,
    audience: sample.suggestedAudience,
    channels: sample.suggestedChannels,
    evidence: sample.suggestedEvidence,
  };
}

export function getRestaurantPublicSamplesByCity(city: string): RestaurantPublicSample[] {
  if (city === '全部') return RESTAURANT_PUBLIC_SAMPLES;
  return RESTAURANT_PUBLIC_SAMPLES.filter(sample => sample.city === city);
}

export function getRestaurantPublicSampleCities(): string[] {
  return ['全部', ...Array.from(new Set(RESTAURANT_PUBLIC_SAMPLES.map(sample => sample.city)))];
}

export function getRestaurantPublicSampleImportRows(samples: RestaurantPublicSample[] = RESTAURANT_PUBLIC_SAMPLES): RestaurantPublicSampleImportRow[] {
  return samples.map(sample => ({
    restaurant: sample.name,
    city: sample.city,
    area: sample.area,
    scenario: sample.scenario,
    cuisine: sample.cuisine,
    latitude: sample.coordinates.lat.toFixed(6),
    longitude: sample.coordinates.lon.toFixed(6),
    source: `${sample.source.name} ${sample.source.url}`,
    license: sample.source.license,
    suggestedOffer: sample.suggestedOffer,
    suggestedAudience: sample.suggestedAudience,
    evidenceBoundary: sample.suggestedEvidence,
  }));
}
