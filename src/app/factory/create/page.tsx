import type { Metadata } from 'next';

import { CreateAssetConsoleClient } from '@/components/CreateAssetConsoleClient';
import { normalizeFactoryUiVariantId } from '@/lib/factory-readiness-view';
import { getIndustrializationSnapshot } from '@/lib/industrial-chain-store';
import { pickRestaurantTrialIntake, type RestaurantTrialSearchParams } from '@/lib/restaurant-trial-intake';

export const metadata: Metadata = {
  title: '菜品素材控制台 | Wenai',
  description: '把菜品图、门店图、套餐说明、活动边界、授权确认和门店审核串成可验证的素材工作台。',
};

export default async function CreateFactoryPage({
  searchParams,
}: {
  searchParams?: Promise<RestaurantTrialSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const projectId = params.projectId || 'default-project';
  const selectedVariantId = normalizeFactoryUiVariantId(params.variant);
  const snapshot = await getIndustrializationSnapshot('anon', projectId);

  return (
    <CreateAssetConsoleClient
      initialProjectId={projectId}
      initialIntake={pickRestaurantTrialIntake(params)}
      initialSnapshot={snapshot}
      selectedVariantId={selectedVariantId}
    />
  );
}
