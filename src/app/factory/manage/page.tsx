import type { Metadata } from 'next';

import { ManageOperationsConsoleClient } from '@/components/ManageOperationsConsoleClient';
import { getAssetPermissionSnapshot } from '@/lib/asset-permission-ledger';
import { normalizeFactoryUiVariantId } from '@/lib/factory-readiness-view';
import { getIndustrializationSnapshot } from '@/lib/industrial-chain-store';
import { pickRestaurantTrialIntake, type RestaurantTrialSearchParams } from '@/lib/restaurant-trial-intake';

export const metadata: Metadata = {
  title: '到店跟进控制台 | Wenai',
  description: '把门店确认、发布凭证、预约、团购券领取、私信咨询和社群跟进串成可验证的到店跟进工作台。',
};

export default async function ManageFactoryPage({
  searchParams,
}: {
  searchParams?: Promise<RestaurantTrialSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const projectId = params.projectId || 'default-project';
  const selectedVariantId = normalizeFactoryUiVariantId(params.variant);
  const [industrialSnapshot, permissionSnapshot] = await Promise.all([
    getIndustrializationSnapshot('anon', projectId),
    getAssetPermissionSnapshot('anon', projectId),
  ]);

  return (
    <ManageOperationsConsoleClient
      initialProjectId={projectId}
      initialIndustrialSnapshot={industrialSnapshot}
      initialIntake={pickRestaurantTrialIntake(params)}
      initialPermissionSnapshot={permissionSnapshot}
      selectedVariantId={selectedVariantId}
    />
  );
}
