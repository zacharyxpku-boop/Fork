import type { RestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import type { RestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import type { RestaurantClawSkillExecutionLedger } from '@/lib/restaurant-claw-skill-execution-store';
import type { RestaurantCommandRoute } from '@/lib/restaurant-command-router';
import type { RestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training';
import type { RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantAiEmployeeMemoryCard = {
  id: string;
  title: string;
  status: 'ready' | 'waiting-evidence' | 'waiting-provider' | 'blocked' | 'remembered';
  owner: 'ai-employee' | 'ops' | 'store-manager' | 'runtime-admin' | 'merchant';
  detail: string;
  nextAction: string;
  evidenceRequired: string;
  externalRequired: string[];
};

export type RestaurantAiEmployeeMemoryPack = {
  ok: true;
  payloadShape: 'restaurant-ai-employee-memory-pack-v1';
  generatedAt: string;
  employee: {
    name: 'Wenai Store Operator';
    role: 'resident-restaurant-ai-employee';
    mode: RestaurantAgentCommandCenter['mode'] | 'memory-only';
    safeToAutonomouslyRun: boolean;
  };
  summary: {
    memoryCards: number;
    rememberedFacts: number;
    trainingReady: number;
    trainingMissingMaterials: number;
    providerGates: number;
    openTasks: number;
    nextWakeups: number;
    externalRequired: number;
  };
  memoryCards: RestaurantAiEmployeeMemoryCard[];
  trainingProgress: {
    payloadShape: RestaurantCapabilityTrainingPlan['payloadShape'];
    activationReady: number;
    trainableNow: number;
    providerGated: number;
    nextInternalTraining: RestaurantCapabilityTrainingPlan['nextInternalTraining'];
    externalSetupRequests: RestaurantCapabilityTrainingPlan['externalSetupRequests'];
  };
  nextWakeups: Array<{
    id: string;
    owner: string;
    dueWindow: string;
    trigger: string;
    action: string;
    evidenceRequired: string;
  }>;
  residentEmployeeBrief: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

type MemoryPackInput = RestaurantTrialIntake & {
  commandRoute?: RestaurantCommandRoute;
  commandCenter?: RestaurantAgentCommandCenter;
  capabilityTrainingPlan: RestaurantCapabilityTrainingPlan;
  providerSetupState: Pick<RestaurantProviderSetupStateSummary, 'summary' | 'provided' | 'safetyBoundary'>;
  storeManagerTaskQueue: Pick<RestaurantStoreManagerTaskQueue, 'summary' | 'tasks' | 'nextAction' | 'safetyBoundary'>;
  storeManagerTaskWatcher: Pick<RestaurantStoreManagerTaskWatcher, 'summary' | 'wakeups' | 'externalRequired' | 'safetyBoundary'>;
  channelDeliveryReport?: Pick<RestaurantAgentChannelDeliveryReport, 'summary' | 'latest' | 'latestAcknowledgements' | 'externalRequired' | 'safetyBoundary'>;
  clawSkillExecutionLedger?: Pick<RestaurantClawSkillExecutionLedger, 'summary' | 'latest' | 'nextAction' | 'safetyBoundary'>;
  now?: Date;
};

function clean(value: unknown, fallback: string, max = 140): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 10): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function providerGateCount(input: MemoryPackInput): number {
  return Math.max(
    input.commandCenter?.summary.providerGates || 0,
    input.providerSetupState.summary.configuredEnvKeys > 0 ? 0 : 1,
    input.capabilityTrainingPlan.summary.missingExternalProviderCount,
  );
}

function buildMemoryCards(input: MemoryPackInput): RestaurantAiEmployeeMemoryCard[] {
  const restaurant = clean(input.restaurant, input.commandCenter?.restaurant || 'Trial restaurant');
  const offer = clean(input.offer, input.commandCenter?.offer || 'Today featured set meal');
  const route = input.commandRoute;
  const commandCenter = input.commandCenter;
  const task = input.storeManagerTaskQueue.tasks[0];
  const wakeup = input.storeManagerTaskWatcher.wakeups[0];
  const channelAttempt = input.channelDeliveryReport?.latest[0];
  const providerGates = providerGateCount(input);
  const trainingMissing = input.capabilityTrainingPlan.summary.missingTrainingMaterialCount;
  const executionRecord = input.clawSkillExecutionLedger?.latest[0];

  return [
    {
      id: 'restaurant-offer-memory',
      title: 'Restaurant and offer memory',
      status: 'remembered',
      owner: 'ai-employee',
      detail: `${restaurant} / ${offer}`,
      nextAction: commandCenter?.nextAction || 'Run the first governed restaurant trial before claiming external execution.',
      evidenceRequired: commandCenter?.currentEvidence || 'merchant-approved restaurant profile, offer, audience, channel and proof requirement',
      externalRequired: [],
    },
    {
      id: 'command-route-memory',
      title: 'Latest command route',
      status: route?.verdict === 'blocked-sensitive'
        ? 'blocked'
        : route?.verdict === 'provider-gated'
          ? 'waiting-provider'
          : route?.verdict === 'needs-evidence'
            ? 'waiting-evidence'
            : 'remembered',
      owner: route?.primaryAction.owner === 'community-ops' || route?.primaryAction.owner === 'finance' ? 'ops' : route?.primaryAction.owner || 'ai-employee',
      detail: route
        ? `${route.intent} -> ${route.primaryAction.clientAction} (${route.verdict})`
        : 'No natural-language restaurant command has been routed in this session.',
      nextAction: route?.primaryAction.reason || 'Route one merchant command into internal work, proof requirements and provider gates.',
      evidenceRequired: route?.primaryAction.evidenceRequired.join(' / ') || 'sanitized merchant command without secrets, PII, private chats or raw POS rows',
      externalRequired: route?.externalRequired.slice(0, 4) || [],
    },
    {
      id: 'training-progress-memory',
      title: 'Skill training progress',
      status: trainingMissing > 0 ? 'waiting-evidence' : input.capabilityTrainingPlan.summary.providerGated > 0 ? 'waiting-provider' : 'ready',
      owner: 'ops',
      detail: `${input.capabilityTrainingPlan.summary.activationReady}/${input.capabilityTrainingPlan.summary.total} capabilities activation-ready; ${trainingMissing} material gaps.`,
      nextAction: input.capabilityTrainingPlan.nextInternalTraining[0]
        ? `Train ${input.capabilityTrainingPlan.nextInternalTraining[0].capabilityId}: ${input.capabilityTrainingPlan.nextInternalTraining[0].material}`
        : 'Move provider-gated capabilities into setup review.',
      evidenceRequired: input.capabilityTrainingPlan.nextInternalTraining[0]?.material || 'accepted capability training record',
      externalRequired: input.capabilityTrainingPlan.externalSetupRequests.slice(0, 4).map(item => item.provider),
    },
    {
      id: 'provider-gates-memory',
      title: 'Provider and authorization gates',
      status: providerGates > 0 ? 'waiting-provider' : 'ready',
      owner: 'runtime-admin',
      detail: `${input.providerSetupState.summary.configuredEnvKeys} env keys, ${input.providerSetupState.summary.merchantApprovals} approvals, ${input.providerSetupState.summary.dataContracts} data contracts remembered.`,
      nextAction: providerGates > 0
        ? 'Collect server-side provider config, merchant authorization, callback receipt and POS/data contract before external automation.'
        : 'Run provider health checks and keep secret values server-side.',
      evidenceRequired: 'configured key names, merchant grant, isolated browser profile id, callback test receipt and sanitized data contract',
      externalRequired: unique([
        ...input.capabilityTrainingPlan.externalSetupRequests.map(item => item.provider),
        ...(route?.externalRequired || []),
      ], 5),
    },
    {
      id: 'store-manager-task-memory',
      title: 'Store manager task memory',
      status: input.storeManagerTaskQueue.summary.blocked > 0
        ? 'blocked'
        : input.storeManagerTaskQueue.summary.needsEvidence > 0
          ? 'waiting-evidence'
          : input.storeManagerTaskQueue.summary.open > 0
            ? 'remembered'
            : 'ready',
      owner: 'store-manager',
      detail: `${input.storeManagerTaskQueue.summary.total} tasks; ${input.storeManagerTaskQueue.summary.open} open; ${input.storeManagerTaskQueue.summary.blocked} blocked.`,
      nextAction: wakeup?.nextAction || task?.action || input.storeManagerTaskQueue.nextAction,
      evidenceRequired: wakeup?.evidenceRequired || task?.evidenceRequired || 'owner closeout with accepted proof or sanitized aggregate evidence',
      externalRequired: input.storeManagerTaskWatcher.externalRequired.slice(0, 3),
    },
    {
      id: 'channel-delivery-memory',
      title: 'Channel delivery memory',
      status: (input.channelDeliveryReport?.summary.blocked || 0) + (input.channelDeliveryReport?.summary.failed || 0) > 0
        ? 'blocked'
        : (input.channelDeliveryReport?.summary.total || 0) > 0
          ? 'remembered'
          : 'waiting-provider',
      owner: 'runtime-admin',
      detail: `${input.channelDeliveryReport?.summary.total || 0} attempts, ${input.channelDeliveryReport?.summary.acknowledged || 0} acknowledged.`,
      nextAction: channelAttempt?.nextAction || 'Use staff-channel handoff internally; external delivery needs approved WeCom, Feishu, DingTalk or SMS provider.',
      evidenceRequired: channelAttempt?.providerEvidence || 'staff-only message preview, attempt id, acknowledgement or manual handoff note',
      externalRequired: input.channelDeliveryReport?.externalRequired.slice(0, 3) || ['approved staff notification provider'],
    },
    {
      id: 'skill-execution-memory',
      title: 'Claw-style skill execution memory',
      status: (input.clawSkillExecutionLedger?.summary.total || 0) > 0 ? 'remembered' : 'waiting-evidence',
      owner: 'ops',
      detail: `${input.clawSkillExecutionLedger?.summary.total || 0} skill execution records remembered.`,
      nextAction: executionRecord?.nextAction || input.clawSkillExecutionLedger?.nextAction || 'Run a governed skill pack before forwarding any external task.',
      evidenceRequired: executionRecord?.evidenceRequired.join(' / ') || 'skill execution record, deliverables and owner closeout',
      externalRequired: [],
    },
  ];
}

function buildWakeups(input: MemoryPackInput): RestaurantAiEmployeeMemoryPack['nextWakeups'] {
  const taskWakeups = input.storeManagerTaskWatcher.wakeups.slice(0, 4).map(wakeup => ({
    id: wakeup.id,
    owner: wakeup.owner,
    dueWindow: wakeup.priority === 'high' ? 'now' : wakeup.priority === 'medium' ? 'next shift' : 'next daily review',
    trigger: wakeup.reason,
    action: wakeup.nextAction,
    evidenceRequired: wakeup.evidenceRequired,
  }));

  const trainingWakeups = input.capabilityTrainingPlan.nextInternalTraining.slice(0, 2).map(item => ({
    id: `training-${item.capabilityId}-${item.material}`,
    owner: item.owner,
    dueWindow: 'before next customer trial',
    trigger: `Capability ${item.capabilityId} is missing training material.`,
    action: `Add accepted training evidence for ${item.material}.`,
    evidenceRequired: item.material,
  }));

  const providerWakeups = input.capabilityTrainingPlan.externalSetupRequests.slice(0, 2).map(item => ({
    id: `provider-${item.capabilityId}-${item.provider}`,
    owner: item.owner,
    dueWindow: 'before external automation',
    trigger: `Capability ${item.capabilityId} is provider-gated.`,
    action: `Collect setup evidence for ${item.provider}; never paste secret values into the client.`,
    evidenceRequired: 'server-side config name, merchant authorization and callback/data contract receipt',
  }));

  return [...taskWakeups, ...trainingWakeups, ...providerWakeups].slice(0, 8);
}

export function buildRestaurantAiEmployeeMemoryPack(input: MemoryPackInput): RestaurantAiEmployeeMemoryPack {
  const now = input.now || new Date();
  const memoryCards = buildMemoryCards(input);
  const nextWakeups = buildWakeups(input);
  const externalRequired = unique(memoryCards.flatMap(card => card.externalRequired), 12);
  const safeToAutonomouslyRun =
    externalRequired.length === 0 &&
    input.storeManagerTaskQueue.summary.blocked === 0 &&
    input.commandRoute?.verdict !== 'blocked-sensitive';

  return {
    ok: true,
    payloadShape: 'restaurant-ai-employee-memory-pack-v1',
    generatedAt: now.toISOString(),
    employee: {
      name: 'Wenai Store Operator',
      role: 'resident-restaurant-ai-employee',
      mode: input.commandCenter?.mode || 'memory-only',
      safeToAutonomouslyRun,
    },
    summary: {
      memoryCards: memoryCards.length,
      rememberedFacts: memoryCards.filter(card => card.status === 'remembered' || card.status === 'ready').length,
      trainingReady: input.capabilityTrainingPlan.summary.activationReady,
      trainingMissingMaterials: input.capabilityTrainingPlan.summary.missingTrainingMaterialCount,
      providerGates: providerGateCount(input),
      openTasks: input.storeManagerTaskQueue.summary.open + input.storeManagerTaskQueue.summary.needsEvidence + input.storeManagerTaskQueue.summary.readyForProvider,
      nextWakeups: nextWakeups.length,
      externalRequired: externalRequired.length,
    },
    memoryCards,
    trainingProgress: {
      payloadShape: input.capabilityTrainingPlan.payloadShape,
      activationReady: input.capabilityTrainingPlan.summary.activationReady,
      trainableNow: input.capabilityTrainingPlan.summary.trainableNow,
      providerGated: input.capabilityTrainingPlan.summary.providerGated,
      nextInternalTraining: input.capabilityTrainingPlan.nextInternalTraining.slice(0, 6),
      externalSetupRequests: input.capabilityTrainingPlan.externalSetupRequests.slice(0, 6),
    },
    nextWakeups,
    residentEmployeeBrief: [
      `Mode ${input.commandCenter?.mode || 'memory-only'}; ${memoryCards.length} memory cards; ${nextWakeups.length} wakeups.`,
      safeToAutonomouslyRun
        ? 'Internal-only autonomous run is allowed because no external gates are active in this pack.'
        : 'Autonomy is gated: run only internal preparation until evidence, provider grants and merchant data contracts are ready.',
      'Use this pack as the next-loop brief for a resident browser/runtime agent, not as proof of real publish, acquisition, redemption or POS analysis.',
    ],
    externalRequired,
    safetyBoundary: 'AI Employee Memory Pack remembers only sanitized operating state, training progress, owner tasks and provider gate labels. It does not log in, publish, contact customers, read private messages, redeem coupons, pull raw POS rows, expose secrets, store browser profiles, or claim automated acquisition/true operating impact without provider receipts, merchant authorization and data contracts.',
  };
}
