import { SHARED_RULES, type RestaurantContentIntake } from '@/lib/restaurant-content-prompts';

export type RestaurantPosterKind = 'dish-hero' | 'dining-scene' | 'promo-poster' | 'group-card';

export interface RestaurantPosterSpec {
  kind: RestaurantPosterKind;
  label: string;
  usage: string;
  prompt: string;
}

const POSTER_TEMPLATES: Record<RestaurantPosterKind, { label: string; usage: string; scene: string }> = {
  'dish-hero': {
    label: '菜品特写主图',
    usage: '点评首图、外卖头图',
    scene: '美食摄影特写，俯视 45 度，深色哑光餐桌，一碗主角菜品居中占画面 70%，热气微微升腾，汤汁油亮，葱花辣油点缀清晰可见，浅景深背景虚化，暖色侧光，质感拉满，无文字无水印',
  },
  'dining-scene': {
    label: '就餐场景图',
    usage: '小红书探店配图',
    scene: '两人晚餐场景，木质餐桌摆着主角菜品和配餐饮品，背景是温暖灯光的小馆内景，轻微虚化的食客人影，生活方式摄影风格，自然抓拍感，黄昏暖调，无文字无水印',
  },
  'promo-poster': {
    label: '套餐氛围海报',
    usage: '门店灯箱、社群海报底图（文字后期加）',
    scene: '餐饮宣传海报构图，主角菜品斜上 45 度特写置于画面右下，左上留出大面积干净负空间用于后期排版文字，深红与暖黄的中式餐饮配色，背景虚化的辣椒花椒食材元素，商业美食摄影，无文字无水印',
  },
  'group-card': {
    label: '社群分享卡',
    usage: '微信群、朋友圈配图',
    scene: '手机竖屏比例的美食照片，一双筷子正夹起主角菜品，特写动势，背景是店内暖光，烟火气十足，像顾客随手拍但构图讲究，真实感强，无文字无水印',
  },
};

function dishDescription(intake: RestaurantContentIntake): string {
  const offer = (intake.offer || '招牌菜品').replace(/[¥￥]\s?\d+(?:\.\d+)?/g, '').trim();
  const freebie = intake.freebie ? `，旁边配${intake.freebie}` : '';
  return `${offer}${freebie}`;
}

export function buildPosterSpec(intake: RestaurantContentIntake, kind: RestaurantPosterKind): RestaurantPosterSpec {
  const template = POSTER_TEMPLATES[kind];
  const dish = dishDescription(intake);
  return {
    kind,
    label: template.label,
    usage: template.usage,
    prompt: `${template.scene}。主角菜品：${dish}。`,
  };
}

export function buildAllPosterSpecs(intake: RestaurantContentIntake): RestaurantPosterSpec[] {
  return (Object.keys(POSTER_TEMPLATES) as RestaurantPosterKind[]).map(kind => buildPosterSpec(intake, kind));
}

/** 让 DeepSeek 写一份可直接贴进即梦（Seedance）的专业视频生成稿。 */
export function buildVideoPromptRequest(
  intake: RestaurantContentIntake,
  angle?: { angle: string; hook: string },
): { system: string; user: string } {
  const system = [
    '你是餐饮短视频的 AI 视频生成提示词专家，精通即梦 Seedance 类文生视频工具的提示词写法：明确的镜头运动（推拉摇移）、分镜时序、画面主体、光线氛围、节奏控制，单条视频 5-10 秒。',
    `门店信息：\n门店：${intake.restaurant || '餐饮门店'}\n主推：${intake.offer || '招牌菜品'}${intake.freebie ? `\n赠品：${intake.freebie}` : ''}`,
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
