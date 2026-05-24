import { buildRestaurantClawSkillCatalog, type RestaurantClawModule, type RestaurantClawSkillCatalog, type RestaurantClawSkillStatus } from '@/lib/restaurant-claw-skill-catalog';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantClawSkillWorkbenchItem = {
  id: string;
  moduleId: string;
  moduleName: string;
  skillName: string;
  owner: RestaurantClawModule['owner'];
  status: RestaurantClawSkillStatus;
  canRunNow: boolean;
  inputRequired: string[];
  generatedOutput: string[];
  evidenceRequired: string[];
  nextAction: string;
};

export type RestaurantClawSkillWorkbench = {
  ok: true;
  payloadShape: 'restaurant-claw-skill-workbench-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  mode: 'internal-execution-ready' | 'training-and-provider-gated';
  summary: {
    modules: number;
    selectedSkills: number;
    runnableNow: number;
    trainingNeeded: number;
    providerGated: number;
    deliverables: number;
  };
  selectedModules: Array<{
    id: string;
    name: string;
    job: string;
    owner: RestaurantClawModule['owner'];
    runnableSkills: number;
    blockedSkills: number;
  }>;
  workbench: RestaurantClawSkillWorkbenchItem[];
  deliverables: Array<{
    id: string;
    title: string;
    owner: RestaurantClawModule['owner'];
    status: 'ready-now' | 'needs-training' | 'provider-gated';
    contents: string[];
    acceptance: string;
  }>;
  commandScript: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

const DEFAULT_MODULES = [
  'menu-engineering',
  'local-life-content',
  'private-domain',
  'coupon-redemption',
  'pos-analytics',
  'agent-ops',
];

function clean(value: unknown, fallback: string, max = 120) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function selectedModules(catalog: RestaurantClawSkillCatalog, ids?: string[]) {
  const wanted = new Set((ids && ids.length ? ids : DEFAULT_MODULES).map(id => id.trim()).filter(Boolean));
  const modules = catalog.modules.filter(module => wanted.has(module.id));
  return modules.length ? modules : catalog.modules.slice(0, 6);
}

function itemForSkill(input: {
  module: RestaurantClawModule;
  skill: RestaurantClawModule['skills'][number];
  restaurant: string;
  offer: string;
  audience: string;
  channels: string;
  visitReason: string;
  constraints: string;
  evidence: string;
}): RestaurantClawSkillWorkbenchItem {
  const canRunNow = input.skill.status === 'internal-ready';
  const trainingNeeded = input.skill.status === 'training-needed';
  return {
    id: `workbench-${input.skill.id}`,
    moduleId: input.module.id,
    moduleName: input.module.name,
    skillName: input.skill.name,
    owner: input.module.owner,
    status: input.skill.status,
    canRunNow,
    inputRequired: [
      `restaurant: ${input.restaurant}`,
      `offer: ${input.offer}`,
      `audience: ${input.audience}`,
      `channels: ${input.channels}`,
      `visit reason: ${input.visitReason}`,
      `constraints: ${input.constraints}`,
      `evidence: ${input.evidence}`,
    ],
    generatedOutput: canRunNow
      ? [
          `${input.module.name} task brief for ${input.restaurant} / ${input.offer}`,
          `owner handoff: ${input.module.owner}`,
          `next proof to collect: ${input.skill.evidence}`,
        ]
      : trainingNeeded
        ? [
            `${input.module.name} training material request`,
            'collect 3 merchant-approved examples, forbidden claims and review notes',
          ]
        : [
            `${input.module.name} provider unlock request`,
            'keep execution blocked until provider health, merchant authorization or data contract is ready',
          ],
    evidenceRequired: canRunNow
      ? [input.skill.evidence, 'merchant/operator confirmation before external action']
      : trainingNeeded
        ? ['training sample', 'forbidden expression list', 'merchant-approved review note']
        : ['provider health ready', 'merchant authorization or approved data contract', 'signed receipt/callback path'],
    nextAction: canRunNow
      ? `Run this internal ${input.module.name} skill now and keep the output in review state.`
      : trainingNeeded
        ? `Train ${input.skill.name} with merchant-approved samples before treating it as reusable.`
        : `Unlock provider gates before ${input.skill.name} can claim real external execution.`,
  };
}

function buildDeliverables(items: RestaurantClawSkillWorkbenchItem[], restaurant: string, offer: string): RestaurantClawSkillWorkbench['deliverables'] {
  const runnable = items.filter(item => item.canRunNow);
  const training = items.filter(item => item.status === 'training-needed');
  const provider = items.filter(item => item.status === 'provider-gated');
  return [
    {
      id: 'internal-store-task-pack',
      title: `${restaurant} / ${offer} internal task pack`,
      owner: 'ops',
      status: runnable.length ? 'ready-now' : 'needs-training',
      contents: runnable.slice(0, 6).map(item => `${item.moduleName}: ${item.skillName}`),
      acceptance: 'Every output has owner, evidence requirement and review state; no external publish or data claim is made.',
    },
    {
      id: 'training-backlog',
      title: 'Skill training backlog',
      owner: 'marketing',
      status: training.length ? 'needs-training' : 'ready-now',
      contents: training.slice(0, 6).map(item => `${item.moduleName}: ${item.nextAction}`),
      acceptance: 'Samples are merchant-approved and contain no secret, customer PII, private messages or raw POS rows.',
    },
    {
      id: 'provider-unlock-backlog',
      title: 'Provider unlock backlog',
      owner: 'tech',
      status: provider.length ? 'provider-gated' : 'ready-now',
      contents: provider.slice(0, 6).map(item => `${item.moduleName}: ${item.evidenceRequired.join(' + ')}`),
      acceptance: 'Provider health, merchant authorization, data contract and signed callback are ready before claiming automation.',
    },
  ];
}

export function buildRestaurantClawSkillWorkbench(input: RestaurantTrialIntake & {
  moduleIds?: string[];
  catalog?: RestaurantClawSkillCatalog;
  now?: Date;
} = {}): RestaurantClawSkillWorkbench {
  const catalog = input.catalog || buildRestaurantClawSkillCatalog();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const audience = clean(input.audience, 'nearby diners');
  const channels = clean(input.channels, 'Dianping / Xiaohongshu / Douyin / WeChat group');
  const visitReason = clean(input.visitReason, 'clear visit reason pending');
  const constraints = clean(input.constraints, 'merchant must confirm price, stock and forbidden claims');
  const evidence = clean(input.evidence, 'menu screenshot, dish photo, offer rule or public proof link pending', 180);
  const modules = selectedModules(catalog, input.moduleIds);
  const workbench = modules.flatMap(module => module.skills.map(skill => itemForSkill({
    module,
    skill,
    restaurant,
    offer,
    audience,
    channels,
    visitReason,
    constraints,
    evidence,
  })));
  const runnableNow = workbench.filter(item => item.canRunNow).length;
  const trainingNeeded = workbench.filter(item => item.status === 'training-needed').length;
  const providerGated = workbench.filter(item => item.status === 'provider-gated').length;
  const deliverables = buildDeliverables(workbench, restaurant, offer);

  return {
    ok: true,
    payloadShape: 'restaurant-claw-skill-workbench-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurant,
    offer,
    mode: providerGated || trainingNeeded ? 'training-and-provider-gated' : 'internal-execution-ready',
    summary: {
      modules: modules.length,
      selectedSkills: workbench.length,
      runnableNow,
      trainingNeeded,
      providerGated,
      deliverables: deliverables.length,
    },
    selectedModules: modules.map(module => ({
      id: module.id,
      name: module.name,
      job: module.job,
      owner: module.owner,
      runnableSkills: module.skills.filter(skill => skill.status === 'internal-ready').length,
      blockedSkills: module.skills.filter(skill => skill.status !== 'internal-ready').length,
    })),
    workbench,
    deliverables,
    commandScript: [
      `Start with ${restaurant} / ${offer}.`,
      `Run ${runnableNow} internal skills first: intake, diagnosis, content draft, checklist and owner handoff.`,
      `${trainingNeeded} skills need merchant-approved training samples before reuse.`,
      `${providerGated} skills stay blocked until provider health, merchant grant, POS/coupon/member data contract and signed callback are ready.`,
    ],
    externalRequired: Array.from(new Set(workbench
      .filter(item => item.status === 'provider-gated')
      .flatMap(item => item.evidenceRequired))).slice(0, 8),
    safetyBoundary: 'Skill Workbench turns the Claw-style restaurant skill catalog into internal task packs, training requests and provider unlock requests. It does not log in, publish, contact customers, read private messages, redeem coupons, expose secrets or claim operating results without accepted evidence and external authorization.',
  };
}
