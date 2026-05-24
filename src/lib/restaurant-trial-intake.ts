export type RestaurantTrialIntake = Partial<{
  restaurant: string;
  offer: string;
  audience: string;
  channels: string;
  visitReason: string;
  constraints: string;
  evidence: string;
}>;

const RESTAURANT_TRIAL_INTAKE_KEYS: Array<keyof RestaurantTrialIntake> = [
  'restaurant',
  'offer',
  'audience',
  'channels',
  'visitReason',
  'constraints',
  'evidence',
];

export type RestaurantTrialSearchParams = RestaurantTrialIntake & {
  projectId?: string;
  variant?: string;
};

export function pickRestaurantTrialIntake(params: RestaurantTrialSearchParams = {}): RestaurantTrialIntake {
  return RESTAURANT_TRIAL_INTAKE_KEYS.reduce<RestaurantTrialIntake>((intake, key) => {
    const value = params[key];
    if (typeof value === 'string' && value.trim()) {
      intake[key] = value.trim();
    }
    return intake;
  }, {});
}

export function appendRestaurantTrialIntake(href: string, intake: RestaurantTrialIntake = {}) {
  if (!href.startsWith('/factory')) return href;

  const url = new URL(href, 'https://wenai.local');
  RESTAURANT_TRIAL_INTAKE_KEYS.forEach(key => {
    const value = intake[key];
    if (value) url.searchParams.set(key, value);
  });

  return `${url.pathname}${url.search}`;
}
