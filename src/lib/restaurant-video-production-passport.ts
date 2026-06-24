import type { RestaurantContentDeliveryPack } from './restaurant-content-delivery-pack';

export type RestaurantVideoProductionPassportStageId =
  | 'script'
  | 'materials'
  | 'external-video-gate'
  | 'finished-video'
  | 'manager-review'
  | 'publish-proof'
  | 'recover-review';

export type RestaurantVideoProductionPassportStatus = 'ready' | 'needs-evidence' | 'external-gated' | 'blocked';

export type RestaurantVideoProductionPassportStage = {
  id: RestaurantVideoProductionPassportStageId;
  title: string;
  status: RestaurantVideoProductionPassportStatus;
  owner: '运营' | '店长' | '剪辑负责人' | '发布负责人' | '复盘负责人';
  input: string;
  output: string;
  evidenceRequired: string[];
  nextAction: string;
};

export type RestaurantVideoProductionPassport = {
  ok: true;
  payloadShape: 'restaurant-video-production-passport-v1';
  title: string;
  summary: {
    totalStages: number;
    readyStages: number;
    evidenceMissing: number;
    externalGated: number;
    canClaimFinishedVideo: boolean;
    canMoveToPublishProof: boolean;
  };
  stages: RestaurantVideoProductionPassportStage[];
  ownerChecklist: Array<{
    owner: RestaurantVideoProductionPassportStage['owner'];
    action: string;
    evidenceRequired: string;
  }>;
  stopLines: string[];
};

function statusFor(value: boolean, external = false): RestaurantVideoProductionPassportStatus {
  if (value) return 'ready';
  return external ? 'external-gated' : 'needs-evidence';
}

function firstScriptTitle(pack: RestaurantContentDeliveryPack): string {
  return pack.scripts[0]?.title || '待补短视频脚本';
}

export function buildRestaurantVideoProductionPassport(input: {
  contentPack: RestaurantContentDeliveryPack;
  externalVideoChannelReady?: boolean;
  finishedVideoUrl?: string;
  finishedVideoScreenshotId?: string;
  managerApproved?: boolean;
  publishProofReady?: boolean;
  recoveredAggregateReady?: boolean;
}): RestaurantVideoProductionPassport {
  const hasScript = input.contentPack.scripts.length > 0;
  const hasMaterials = input.contentPack.brollChecklist.length > 0 && input.contentPack.managerReviewChecklist.length > 0;
  const externalReady = Boolean(input.externalVideoChannelReady);
  const hasFinishedVideo = Boolean(input.finishedVideoUrl || input.finishedVideoScreenshotId);
  const managerApproved = Boolean(input.managerApproved);
  const publishProofReady = Boolean(input.publishProofReady);
  const recoveredAggregateReady = Boolean(input.recoveredAggregateReady);

  const stages: RestaurantVideoProductionPassportStage[] = [
    {
      id: 'script',
      title: '脚本与分镜',
      status: statusFor(hasScript),
      owner: '运营',
      input: input.contentPack.inputSummary.join(' / '),
      output: `${input.contentPack.scripts.length} 条可审短视频脚本`,
      evidenceRequired: ['脚本标题、开场、分镜、口播和 CTA'],
      nextAction: hasScript ? `把「${firstScriptTitle(input.contentPack)}」交给店长审核。` : '先生成可审短视频脚本。',
    },
    {
      id: 'materials',
      title: '素材清单',
      status: statusFor(hasMaterials),
      owner: '店长',
      input: '门头、菜品、菜单、活动边界和门店确认项',
      output: `${input.contentPack.brollChecklist.length} 项镜头素材要求`,
      evidenceRequired: ['菜品图授权', '菜单或券包截图', '价格/库存/核销边界'],
      nextAction: hasMaterials ? '补齐可拍镜头和不能写错的门店事实。' : '先列出菜品、菜单和门店素材。',
    },
    {
      id: 'external-video-gate',
      title: '外部视频通道',
      status: statusFor(externalReady, true),
      owner: '剪辑负责人',
      input: '脚本、素材、字体/音乐授权、剪辑任务说明',
      output: externalReady ? '外部视频通道资料可复核' : '只保留人工剪辑交接单',
      evidenceRequired: ['剪辑负责人', '素材授权', '成片回填方式'],
      nextAction: externalReady ? '按任务说明进入剪辑执行。' : '先按人工交接单剪辑，不说视频已经完成。',
    },
    {
      id: 'finished-video',
      title: '成片凭证',
      status: hasFinishedVideo ? 'ready' : externalReady ? 'needs-evidence' : 'external-gated',
      owner: '剪辑负责人',
      input: '外部视频通道或人工剪辑结果',
      output: hasFinishedVideo ? '成片链接或截图已回填' : '等待成片链接或截图',
      evidenceRequired: ['成片链接或截图', '版本号', '剪辑负责人'],
      nextAction: hasFinishedVideo ? '交给店长做最终审核。' : '回填成片链接或截图后再进入审核。',
    },
    {
      id: 'manager-review',
      title: '店长审核',
      status: statusFor(managerApproved),
      owner: '店长',
      input: '成片、脚本、活动边界和门店事实',
      output: managerApproved ? '店长已允许进入发布安排' : '等待店长确认',
      evidenceRequired: ['菜品事实确认', '价格/核销确认', '禁用表达确认'],
      nextAction: managerApproved ? '进入发布证明排期。' : '店长确认后才安排发布。',
    },
    {
      id: 'publish-proof',
      title: '发布证明',
      status: statusFor(publishProofReady),
      owner: '发布负责人',
      input: '已审核成片和目标渠道',
      output: publishProofReady ? '发布链接、截图和时间已回填' : '等待发布链接、截图和时间',
      evidenceRequired: ['公开链接或截图', '发布时间', '负责人'],
      nextAction: publishProofReady ? '进入回流复盘。' : '只排期，不说已经发布完成。',
    },
    {
      id: 'recover-review',
      title: '回流复盘',
      status: statusFor(recoveredAggregateReady),
      owner: '复盘负责人',
      input: '发布证明、预约/领券/咨询/评价/到店意向聚合',
      output: recoveredAggregateReady ? '可进入下一轮复盘建议' : '等待脱敏反馈汇总',
      evidenceRequired: ['脱敏反馈汇总', '发布证明', '店长确认'],
      nextAction: recoveredAggregateReady ? '判断下一轮放大、继续验证或暂停。' : '只收聚合数量，不收顾客身份或聊天原文。',
    },
  ];

  const readyStages = stages.filter(stage => stage.status === 'ready').length;
  const externalGated = stages.filter(stage => stage.status === 'external-gated').length;
  const evidenceMissing = stages.filter(stage => stage.status === 'needs-evidence' || stage.status === 'blocked').length;

  return {
    ok: true,
    payloadShape: 'restaurant-video-production-passport-v1',
    title: `${input.contentPack.title} - 视频生产护照`,
    summary: {
      totalStages: stages.length,
      readyStages,
      evidenceMissing,
      externalGated,
      canClaimFinishedVideo: hasFinishedVideo && externalReady,
      canMoveToPublishProof: hasFinishedVideo && managerApproved,
    },
    stages,
    ownerChecklist: stages
      .filter(stage => stage.status !== 'ready')
      .map(stage => ({
        owner: stage.owner,
        action: stage.nextAction,
        evidenceRequired: stage.evidenceRequired[0],
      })),
    stopLines: [
      '没有外部视频通道资料和成片凭证，不宣称一键成片完成。',
      '没有店长审核，不安排公开发布。',
      '没有发布链接、截图、发布时间和负责人，不宣称发布完成。',
      '没有脱敏反馈汇总，不宣称真实经营归因。',
      '不保存顾客身份、聊天原文、券码、订单明细或收银明细。',
    ],
  };
}
