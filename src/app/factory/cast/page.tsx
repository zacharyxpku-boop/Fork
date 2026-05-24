import type { Metadata } from 'next';

import { CastDistributionConsoleClient } from '@/components/CastDistributionConsoleClient';
import { normalizeFactoryUiVariantId } from '@/lib/factory-readiness-view';
import { getChannelAccountSnapshot } from '@/lib/channel-account-ledger';
import { pickRestaurantTrialIntake, type RestaurantTrialSearchParams } from '@/lib/restaurant-trial-intake';

export const metadata: Metadata = {
  title: '同城发布控制台 | Wenai',
  description: '把门店账号、发布槽位、发布链接、截图凭证和到店反馈串成可验证的同城发布工作台。',
};

export default async function CastFactoryPage({
  searchParams,
}: {
  searchParams?: Promise<RestaurantTrialSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const projectId = params.projectId || 'default-project';
  const selectedVariantId = normalizeFactoryUiVariantId(params.variant);
  const snapshot = await getChannelAccountSnapshot('anon', projectId);

  return (
    <CastDistributionConsoleClient
      initialProjectId={projectId}
      initialIntake={pickRestaurantTrialIntake(params)}
      initialSnapshot={snapshot}
      selectedVariantId={selectedVariantId}
    />
  );
}
