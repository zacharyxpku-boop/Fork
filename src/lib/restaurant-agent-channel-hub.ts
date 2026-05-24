import type { RestaurantActivationCockpit } from '@/lib/restaurant-activation-cockpit';
import { buildRestaurantActivationCockpit } from '@/lib/restaurant-activation-cockpit';
import type { RestaurantAiEmployeeInbox } from '@/lib/restaurant-ai-employee-inbox';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantAgentChannelStatus = 'internal-handoff' | 'provider-ready' | 'provider-gated';

export type RestaurantAgentChannel = {
  id: 'webchat' | 'wecom' | 'feishu' | 'dingtalk' | 'sms';
  name: string;
  status: RestaurantAgentChannelStatus;
  customerUse: string;
  configuredEvidence: string;
  internalFallback: string;
  externalRequired: string[];
  safetyBoundary: string;
};

export type RestaurantAgentScheduleStatus = 'ready-internal' | 'provider-gated';

export type RestaurantAgentScheduledJob = {
  id: string;
  title: string;
  cadence: string;
  status: RestaurantAgentScheduleStatus;
  trigger: string;
  action: string;
  evidenceRequired: string[];
  owner: 'Wenai Store Operator' | 'store-manager' | 'ops' | 'runtime-admin';
  externalRequired: string[];
};

export type RestaurantAgentChannelHub = {
  ok: true;
  payloadShape: 'restaurant-agent-channel-hub-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    channels: number;
    providerReadyChannels: number;
    providerGatedChannels: number;
    internalHandoffChannels: number;
    scheduledJobs: number;
    readyInternalJobs: number;
    providerGatedJobs: number;
    missingExternalItems: number;
  };
  channels: RestaurantAgentChannel[];
  scheduledJobs: RestaurantAgentScheduledJob[];
  commandSuggestions: Array<{
    command: string;
    routeTo: string;
    expectedEvidence: string;
  }>;
  activationSnapshot: Pick<RestaurantActivationCockpit, 'payloadShape' | 'summary' | 'answerForCustomer'>;
  inboxSnapshot?: Pick<RestaurantAiEmployeeInbox, 'payloadShape' | 'summary' | 'nextWakeup'>;
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function hasValue(env: EnvMap, key: string) {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function envEvidence(env: EnvMap, key: string) {
  return hasValue(env, key) ? `${key}=configured` : `${key}=missing`;
}

function channel(input: RestaurantAgentChannel): RestaurantAgentChannel {
  return input;
}

function schedule(input: RestaurantAgentScheduledJob): RestaurantAgentScheduledJob {
  return input;
}

function channelStatus(env: EnvMap, key: string, approvalKey?: string): RestaurantAgentChannelStatus {
  if (!hasValue(env, key)) return 'provider-gated';
  if (approvalKey && env[approvalKey] !== 'approved') return 'internal-handoff';
  return 'provider-ready';
}

function unique(values: string[]) {
  return values.filter((item, index, list) => item.trim() && list.indexOf(item) === index);
}

export function buildRestaurantAgentChannelHub(input: RestaurantTrialIntake & {
  env?: EnvMap;
  now?: Date;
  inbox?: RestaurantAiEmployeeInbox;
  activationCockpit?: RestaurantActivationCockpit;
} = {}): RestaurantAgentChannelHub {
  const now = input.now || new Date();
  const env = input.env || process.env;
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const activationCockpit = input.activationCockpit || buildRestaurantActivationCockpit({ restaurant, offer, env, now });

  const channels = [
    channel({
      id: 'webchat',
      name: 'Trial web command panel',
      status: 'internal-handoff',
      customerUse: 'Customer can issue restaurant tasks from the current trial workspace without connecting an external chat app.',
      configuredEvidence: 'built-in trial panel',
      internalFallback: 'Create command payload, owner, evidence requirements and next action inside Command Center.',
      externalRequired: [],
      safetyBoundary: 'The web panel does not send external messages or read private customer chats.',
    }),
    channel({
      id: 'wecom',
      name: 'WeCom / WeChat work group',
      status: channelStatus(env, 'RESTAURANT_AGENT_WECOM_WEBHOOK_URL', 'RESTAURANT_AGENT_CHANNEL_APPROVAL'),
      customerUse: 'Store manager can ask the AI employee to prepare today offers, follow up coupon claims and summarize closeout tasks from the work group.',
      configuredEvidence: envEvidence(env, 'RESTAURANT_AGENT_WECOM_WEBHOOK_URL'),
      internalFallback: 'Generate copy-ready staff messages and audit log entries for manual posting.',
      externalRequired: ['RESTAURANT_AGENT_WECOM_WEBHOOK_URL', 'RESTAURANT_AGENT_CHANNEL_APPROVAL=approved', 'merchant-approved recipient roles'],
      safetyBoundary: 'Only merchant-approved staff group messages are allowed; customer WeChat ids and private chats stay out of scope.',
    }),
    channel({
      id: 'feishu',
      name: 'Feishu shift command channel',
      status: channelStatus(env, 'RESTAURANT_AGENT_FEISHU_WEBHOOK_URL', 'RESTAURANT_AGENT_CHANNEL_APPROVAL'),
      customerUse: 'Ops can receive scheduled prep, lunch pulse, dinner push and closeout prompts in the team workspace.',
      configuredEvidence: envEvidence(env, 'RESTAURANT_AGENT_FEISHU_WEBHOOK_URL'),
      internalFallback: 'Keep scheduled jobs visible in the workspace and export a manual handoff.',
      externalRequired: ['RESTAURANT_AGENT_FEISHU_WEBHOOK_URL', 'RESTAURANT_AGENT_CHANNEL_APPROVAL=approved'],
      safetyBoundary: 'No customer PII, raw order rows, cookies or platform credentials are sent to Feishu.',
    }),
    channel({
      id: 'dingtalk',
      name: 'DingTalk manager alerts',
      status: channelStatus(env, 'RESTAURANT_AGENT_DINGTALK_WEBHOOK_URL', 'RESTAURANT_AGENT_CHANNEL_APPROVAL'),
      customerUse: 'Regional manager can receive blocker, recovery and data-gap alerts without opening the trial page.',
      configuredEvidence: envEvidence(env, 'RESTAURANT_AGENT_DINGTALK_WEBHOOK_URL'),
      internalFallback: 'Surface alerts in AI employee inbox and Command Center.',
      externalRequired: ['RESTAURANT_AGENT_DINGTALK_WEBHOOK_URL', 'RESTAURANT_AGENT_CHANNEL_APPROVAL=approved'],
      safetyBoundary: 'Alerts contain task ids, owners and aggregate evidence only.',
    }),
    channel({
      id: 'sms',
      name: 'SMS/phone provider for staff only',
      status: channelStatus(env, 'RESTAURANT_AGENT_STAFF_SMS_PROVIDER', 'RESTAURANT_STAFF_NOTIFY_APPROVAL'),
      customerUse: 'Critical staff reminders can be delivered when work-chat is unavailable.',
      configuredEvidence: envEvidence(env, 'RESTAURANT_AGENT_STAFF_SMS_PROVIDER'),
      internalFallback: 'Draft staff reminder text and keep it manual-copy only.',
      externalRequired: ['RESTAURANT_AGENT_STAFF_SMS_PROVIDER', 'RESTAURANT_STAFF_NOTIFY_APPROVAL=approved', 'merchant staff recipient map'],
      safetyBoundary: 'Staff SMS never contacts customers, never stores phone numbers in the client payload and never authorizes marketing outreach.',
    }),
  ];

  const publishLane = activationCockpit.lanes.find(item => item.id === 'publish-and-proof');
  const leadLane = activationCockpit.lanes.find(item => item.id === 'lead-and-community-followup');
  const operatingLane = activationCockpit.lanes.find(item => item.id === 'redemption-and-operating-analysis');
  const runtimeLane = activationCockpit.lanes.find(item => item.id === 'resident-agent-runtime');

  const schedules = [
    schedule({
      id: 'morning-prep',
      title: 'Morning menu and evidence prep',
      cadence: 'daily 09:30 local',
      status: 'ready-internal',
      trigger: `${restaurant} opens today planning window`,
      action: `Prepare ${offer} copy, material checklist, channel plan and approval reminders.`,
      evidenceRequired: ['menu photo or item list', 'price and constraints', 'owner approval'],
      owner: 'Wenai Store Operator',
      externalRequired: [],
    }),
    schedule({
      id: 'lunch-pulse',
      title: 'Lunch signal pulse',
      cadence: 'daily 14:00 local',
      status: leadLane?.status === 'provider-gated' ? 'provider-gated' : 'ready-internal',
      trigger: 'reservation, coupon claim, inquiry or visit-intent evidence arrives',
      action: 'Summarize aggregate signals and route store-manager follow-up tasks.',
      evidenceRequired: ['source channel', 'time window', 'aggregate count', 'owner'],
      owner: 'store-manager',
      externalRequired: leadLane?.externalRequired.slice(0, 4) || [],
    }),
    schedule({
      id: 'dinner-publish-window',
      title: 'Dinner publish and proof window',
      cadence: 'daily 16:30 local',
      status: publishLane?.status === 'provider-gated' ? 'provider-gated' : 'ready-internal',
      trigger: 'approved dish/offer content enters the publish window',
      action: 'Forward governed runbook to browser runtime or generate manual publish checklist.',
      evidenceRequired: ['approved content id', 'target platform', 'posted link or screenshot id', 'externalRunId'],
      owner: 'ops',
      externalRequired: publishLane?.externalRequired.slice(0, 4) || [],
    }),
    schedule({
      id: 'night-closeout',
      title: 'Night operating closeout',
      cadence: 'daily 22:30 local',
      status: operatingLane?.status === 'provider-gated' ? 'provider-gated' : 'ready-internal',
      trigger: 'accepted receipt, POS import or manual aggregate arrives',
      action: 'Produce source-bound operating questions, anomalies and next-shift actions.',
      evidenceRequired: ['accepted receipt', 'POS aggregate batch', 'field dictionary', 'owner'],
      owner: 'Wenai Store Operator',
      externalRequired: operatingLane?.externalRequired.slice(0, 4) || [],
    }),
    schedule({
      id: 'runtime-heartbeat',
      title: 'Runtime and inbox heartbeat',
      cadence: 'every 60 minutes',
      status: runtimeLane?.status === 'provider-gated' ? 'provider-gated' : 'ready-internal',
      trigger: 'AI employee inbox, browser session or external callback becomes stale',
      action: 'Check runtime health, stale tasks, blocker owners and next wakeup.',
      evidenceRequired: ['runtime probe', 'browser session health', 'latest callback or blocker reason'],
      owner: 'runtime-admin',
      externalRequired: runtimeLane?.externalRequired.slice(0, 4) || [],
    }),
  ];

  const externalRequired = unique([
    ...channels.flatMap(item => item.status === 'provider-ready' ? [] : item.externalRequired),
    ...schedules.flatMap(item => item.status === 'ready-internal' ? [] : item.externalRequired),
  ]).slice(0, 12);

  return {
    ok: true,
    payloadShape: 'restaurant-agent-channel-hub-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    summary: {
      channels: channels.length,
      providerReadyChannels: channels.filter(item => item.status === 'provider-ready').length,
      providerGatedChannels: channels.filter(item => item.status === 'provider-gated').length,
      internalHandoffChannels: channels.filter(item => item.status === 'internal-handoff').length,
      scheduledJobs: schedules.length,
      readyInternalJobs: schedules.filter(item => item.status === 'ready-internal').length,
      providerGatedJobs: schedules.filter(item => item.status === 'provider-gated').length,
      missingExternalItems: externalRequired.length,
    },
    channels,
    scheduledJobs: schedules,
    commandSuggestions: [
      {
        command: `今晚把 ${offer} 做成到店活动，先给我可发版和发布证据要求`,
        routeTo: 'publish-and-proof',
        expectedEvidence: 'approved content id, target platform and receipt schema',
      },
      {
        command: '把今天领券和到店意向整理成店长待办',
        routeTo: 'lead-and-community-followup',
        expectedEvidence: 'aggregate lead counts, channel and owner',
      },
      {
        command: '收盘后告诉我哪些菜品、核销和库存异常需要明天处理',
        routeTo: 'redemption-and-operating-analysis',
        expectedEvidence: 'POS aggregate batch, field dictionary and accepted receipt',
      },
    ],
    activationSnapshot: {
      payloadShape: activationCockpit.payloadShape,
      summary: activationCockpit.summary,
      answerForCustomer: activationCockpit.answerForCustomer,
    },
    inboxSnapshot: input.inbox ? {
      payloadShape: input.inbox.payloadShape,
      summary: input.inbox.summary,
      nextWakeup: input.inbox.nextWakeup,
    } : undefined,
    externalRequired,
    safetyBoundary: 'Channel Hub models chat channels and scheduled jobs only. It does not send messages without provider configuration and merchant approval, does not contact customers, does not read private chats, does not expose webhook URLs or tokens, and does not turn scheduled drafts into real publishing, redemption or operating claims without accepted evidence.',
  };
}
