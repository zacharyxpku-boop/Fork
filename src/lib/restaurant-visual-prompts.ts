import { SHARED_RULES, type RestaurantContentIntake } from '@/lib/restaurant-content-prompts';

export type RestaurantPosterKind = 'dish-hero' | 'dining-scene' | 'promo-poster' | 'group-card';
export type RestaurantPosterStyle = 'appetite' | 'mood' | 'street';

export interface RestaurantPosterSpec {
  kind: RestaurantPosterKind;
  style: RestaurantPosterStyle;
  label: string;
  styleLabel: string;
  usage: string;
  prompt: string;
}

/**
 * 生图 prompt 公式：主体描述 + 菜系画面语言 + 构图 + 光线 + 氛围 + 质感 + 负面约束。
 * 画面语言按菜系切换：面食的"汤汁油亮"放到奶茶店就是灾难，所以先识别菜系。
 */

type CuisineKey = 'noodle' | 'hotpot' | 'bbq' | 'drink' | 'bakery' | 'homestyle' | 'japanese' | 'western';

interface CuisineLanguage {
  /** 食物本体的诱人细节词 */
  appeal: string;
  /** 典型食器与桌面 */
  tableware: string;
  /** 默认光线氛围 */
  lighting: string;
}

const CUISINE_LANGUAGE: Record<CuisineKey, CuisineLanguage> = {
  noodle: {
    appeal: '汤汁油亮，热气升腾，面条根根分明，葱花辣油点缀',
    tableware: '粗陶大碗，木筷搭在碗沿，深色哑光桌面',
    lighting: '暖黄侧光，蒸汽在逆光中清晰可见',
  },
  hotpot: {
    appeal: '红油翻滚冒泡，辣椒花椒漂浮，毛肚黄喉鲜嫩欲滴，蒸汽弥漫',
    tableware: '鸳鸯锅居中，四周摆满色彩丰富的菜盘，金属锅圈反光',
    lighting: '暖红色调，锅底火光映照，热闹聚餐氛围',
  },
  bbq: {
    appeal: '炭火炙烤滋滋冒油，肉串焦香微焦边缘，孜然辣椒面撒落瞬间',
    tableware: '金属烤签，不锈钢托盘，旁边冰镇饮料杯壁挂水珠',
    lighting: '夜市暖橙灯光，炭火红光，烟火气十足',
  },
  drink: {
    appeal: '杯壁挂着细密水珠，分层渐变色泽通透，顶部奶盖绵密，珍珠圆润',
    tableware: '高透明杯，斜插粗吸管，浅色大理石或原木桌面',
    lighting: '明亮清新自然光，背景奶白或浅色，日系小清新',
  },
  bakery: {
    appeal: '表皮金黄酥脆，撕开内部组织拉丝蓬松，糖霜或黄油光泽',
    tableware: '原木砧板或白瓷盘，亚麻餐布，旁配一杯咖啡',
    lighting: '清晨柔和窗光，奶油色调，温暖治愈',
  },
  homestyle: {
    appeal: '锅气十足，酱色红亮，食材分明，米饭粒粒可见',
    tableware: '白瓷盘青花碗，家常木桌，配一碗冒热气的米饭',
    lighting: '自然日光，家的温暖感，真实不过度修饰',
  },
  japanese: {
    appeal: '食材色泽鲜亮排列工整，刺身纹理清晰，寿司饭粒晶莹',
    tableware: '黑色岩板或原木托盘，留白构图，一抹绿芥末点缀',
    lighting: '低调侧光，日式侘寂美学，深色背景',
  },
  western: {
    appeal: '酱汁艺术摆盘，牛排切面粉嫩多汁，配菜色彩点缀',
    tableware: '白色大圆盘留白摆盘，银质刀叉，红酒杯虚化在侧',
    lighting: '餐厅暖光，浅景深，精致格调',
  },
};

const CUISINE_KEYWORDS: Array<[CuisineKey, string[]]> = [
  ['hotpot', ['火锅', '串串', '冒菜', '麻辣烫', '钵钵鸡', '鸳鸯锅']],
  ['bbq', ['烧烤', '烤串', '烤肉', '炸串', '烤鱼', '小龙虾']],
  ['drink', ['奶茶', '咖啡', '果茶', '柠檬茶', '酸奶', '饮品', '奶盖', '杨枝甘露']],
  ['bakery', ['面包', '蛋糕', '烘焙', '甜品', '可颂', '吐司', '司康', '贝果']],
  ['japanese', ['寿司', '刺身', '日料', '拉面', '居酒屋', '丼', '天妇罗']],
  ['western', ['牛排', '意面', '披萨', '西餐', '汉堡', '沙拉', '焗']],
  ['noodle', ['面', '粉', '馄饨', '饺子', '米线', '抄手', '河粉']],
];

export function detectCuisine(text: string): CuisineKey {
  for (const [cuisine, keywords] of CUISINE_KEYWORDS) {
    if (keywords.some(keyword => text.includes(keyword))) return cuisine;
  }
  return 'homestyle';
}

interface PosterTemplate {
  label: string;
  usage: string;
  /** 按风格给出构图与氛围（菜系语言在组装时注入） */
  styles: Record<RestaurantPosterStyle, { styleLabel: string; composition: string }>;
}

const POSTER_TEMPLATES: Record<RestaurantPosterKind, PosterTemplate> = {
  'dish-hero': {
    label: '菜品特写主图',
    usage: '点评首图、外卖头图',
    styles: {
      appetite: {
        styleLabel: '食欲暴击',
        composition: '美食摄影特写，俯视 45 度，主角占画面 70%，浅景深背景虚化，微距级质感，商业美食大片',
      },
      mood: {
        styleLabel: '高级质感',
        composition: '低调暗色调美食摄影，侧逆光勾勒轮廓，大面积深色负空间，主角居于黄金分割点，电影感',
      },
      street: {
        styleLabel: '烟火市井',
        composition: '平视近景，主角放在略显使用痕迹的店内餐桌上，背景虚化的店面环境，纪实摄影风格，真实生活感',
      },
    },
  },
  'dining-scene': {
    label: '就餐场景图',
    usage: '小红书探店配图',
    styles: {
      appetite: {
        styleLabel: '聚餐热闹',
        composition: '两三人聚餐场景俯拍，餐桌摆满主角和配餐，多只手伸向食物的动态瞬间，热闹真实',
      },
      mood: {
        styleLabel: '一人食治愈',
        composition: '单人就餐侧拍，主角居前景，窗边座位，窗外光线柔和洒入，孤独美食家氛围，治愈系',
      },
      street: {
        styleLabel: '探店实拍',
        composition: '手机竖屏视角，餐桌第一人称视角拍摄，主角居中，背景是店内灯光人影虚化，像顾客随手拍但构图讲究',
      },
    },
  },
  'promo-poster': {
    label: '套餐氛围海报',
    usage: '门店灯箱、社群海报底图（文字后期加）',
    styles: {
      appetite: {
        styleLabel: '经典促销',
        composition: '商业海报构图，主角斜置画面右下 45 度特写，左上留大面积干净负空间供后期排版，深红暖黄中式餐饮配色',
      },
      mood: {
        styleLabel: '极简高级',
        composition: '极简海报构图，主角小而精居中下方，大面积纯色背景留白，轻奢餐饮品牌感，顶部留出标题区',
      },
      street: {
        styleLabel: '手写黑板风',
        composition: '主角置于木质托盘，背景是深绿黑板质感墙面（无文字），周围散落食材元素，咖啡馆手作氛围，左侧留排版空间',
      },
    },
  },
  'group-card': {
    label: '社群分享卡',
    usage: '微信群、朋友圈配图',
    styles: {
      appetite: {
        styleLabel: '夹起瞬间',
        composition: '手机竖屏比例，筷子或叉子夹起主角的特写动势，正要入口的瞬间感，背景店内暖光虚化',
      },
      mood: {
        styleLabel: '今日限定',
        composition: '竖屏构图，主角配一张空白小立牌（无文字）置于桌面，似在宣告今日限定，简洁日系',
      },
      street: {
        styleLabel: '出餐口实拍',
        composition: '竖屏，后厨出餐口刚端出的主角，背景是忙碌后厨虚影和蒸汽，新鲜出锅的即时感',
      },
    },
  },
};

const NEGATIVE_RULES = '画面中不出现任何文字、价格、水印、logo，不出现清晰人脸';

function dishDescription(intake: RestaurantContentIntake): string {
  const offer = (intake.offer || '招牌菜品').replace(/[¥￥]\s?\d+(?:\.\d+)?/g, '').trim();
  const freebie = intake.freebie ? `，旁边配${intake.freebie}` : '';
  return `${offer}${freebie}`;
}

export function buildPosterSpec(
  intake: RestaurantContentIntake,
  kind: RestaurantPosterKind,
  style: RestaurantPosterStyle = 'appetite',
): RestaurantPosterSpec {
  const template = POSTER_TEMPLATES[kind];
  const styleSpec = template.styles[style] || template.styles.appetite;
  const cuisine = CUISINE_LANGUAGE[detectCuisine(intake.offer || '')];
  const dish = dishDescription(intake);
  const prompt = [
    styleSpec.composition,
    `主角：${dish}，${cuisine.appeal}`,
    cuisine.tableware,
    cuisine.lighting,
    NEGATIVE_RULES,
  ].join('。') + '。';
  return {
    kind,
    style,
    label: template.label,
    styleLabel: styleSpec.styleLabel,
    usage: template.usage,
    prompt,
  };
}

export const POSTER_STYLES: RestaurantPosterStyle[] = ['appetite', 'mood', 'street'];

export function nextPosterStyle(current: RestaurantPosterStyle): RestaurantPosterStyle {
  const index = POSTER_STYLES.indexOf(current);
  const next = POSTER_STYLES[(index + 1) % POSTER_STYLES.length];
  return next ?? 'appetite';
}

export function buildAllPosterSpecs(intake: RestaurantContentIntake): RestaurantPosterSpec[] {
  return (Object.keys(POSTER_TEMPLATES) as RestaurantPosterKind[]).map(kind => buildPosterSpec(intake, kind));
}

/** 让 DeepSeek 写一份可直接贴进即梦（Seedance）的专业视频生成稿。 */
export function buildVideoPromptRequest(
  intake: RestaurantContentIntake,
  angle?: { angle: string; hook: string },
): { system: string; user: string } {
  const cuisine = CUISINE_LANGUAGE[detectCuisine(intake.offer || '')];
  const system = [
    '你是餐饮短视频的 AI 视频生成提示词专家，精通即梦 Seedance 类文生视频工具的提示词写法：明确的镜头运动（推拉摇移）、分镜时序、画面主体、光线氛围、节奏控制，单条视频 5-10 秒。',
    `门店信息：\n门店：${intake.restaurant || '餐饮门店'}\n主推：${intake.offer || '招牌菜品'}${intake.freebie ? `\n赠品：${intake.freebie}` : ''}`,
    `这个品类的画面语言（写分镜时贯彻）：${cuisine.appeal}；${cuisine.tableware}；${cuisine.lighting}。`,
    SHARED_RULES,
  ].join('\n\n');
  const focus = angle ? `本条视频的内容角度：${angle.angle}，开头钩子：${angle.hook}。` : '本条视频目标：让刷到的人想立刻来吃这道主推菜。';
  const user = `${focus}
写一份可以直接粘贴到即梦/Seedance 的视频生成提示词。要求：
- 总时长 5-10 秒，2-4 个分镜，每个分镜标注时长和镜头运动（如：推近/环绕/跟拍）
- 画面只围绕菜品、制作过程、就餐氛围，不出现具体人脸特写
- 描述具体：食材色泽、热气、汤汁、动作细节
- 画面中不出现任何文字和价格（文字后期剪辑加）
- 最后附一行"建议配音口播"，15 字以内
输出 JSON：{"video_prompt":"完整的即梦提示词","voiceover":"建议口播","duration":"建议总时长"}`;
  return { system, user };
}
