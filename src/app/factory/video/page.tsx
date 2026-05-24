import type { Metadata } from 'next';

import { VideoProductionQueueClient } from '@/components/VideoProductionQueueClient';
import { normalizeFactoryUiVariantId } from '@/lib/factory-readiness-view';
import { getIndustrialVideoProductionQueue } from '@/lib/industrial-video-workflow';
import { pickRestaurantTrialIntake, type RestaurantTrialSearchParams } from '@/lib/restaurant-trial-intake';

export const metadata: Metadata = {
  title: '本地内容生产队列 | Wenai',
  description: '把到店理由、菜品素材、门店审核、内容草稿、发布计划和反馈回流串成可执行队列。',
};

export default async function VideoFactoryPage({
  searchParams,
}: {
  searchParams?: Promise<RestaurantTrialSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const projectId = params.projectId || 'default-project';
  const selectedVariantId = normalizeFactoryUiVariantId(params.variant);
  const queue = await getIndustrialVideoProductionQueue('anon', projectId);
  return (
    <VideoProductionQueueClient
      initialProjectId={projectId}
      initialIntake={pickRestaurantTrialIntake(params)}
      initialQueue={queue}
      selectedVariantId={selectedVariantId}
    />
  );
}
