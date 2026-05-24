import type { Metadata } from 'next';

import { CreativeMonitoringConsoleClient } from '@/components/CreativeMonitoringConsoleClient';
import { normalizeFactoryUiVariantId } from '@/lib/factory-readiness-view';
import { pickRestaurantTrialIntake, type RestaurantTrialSearchParams } from '@/lib/restaurant-trial-intake';

export const metadata: Metadata = {
  title: '到店理由情报台 | Wenai',
  description: '把同城门店、点评反馈、榜单趋势和用餐场景拆成可复用的到店理由账本。',
};

export default async function CreativeFactoryPage({
  searchParams,
}: {
  searchParams?: Promise<RestaurantTrialSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedVariantId = normalizeFactoryUiVariantId(params.variant);
  return (
    <CreativeMonitoringConsoleClient
      initialProjectId={params.projectId || 'default-project'}
      initialIntake={pickRestaurantTrialIntake(params)}
      selectedVariantId={selectedVariantId}
    />
  );
}
