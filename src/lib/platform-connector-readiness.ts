export interface PlatformConnectorReadiness {
  oauthConfigured: boolean;
  adAccountConfigured: boolean;
  autoPublishConfigured: boolean;
  analyticsSyncConfigured: boolean;
  enterpriseAssetPermissionsConfigured: boolean;
  videoWebhookSignatureConfigured: boolean;
  platformAutomationReady: boolean;
  configuredCapabilities: string[];
  missingCapabilities: string[];
}

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function hasPair(left: string | undefined, right: string | undefined) {
  return hasValue(left) && hasValue(right);
}

export function buildPlatformConnectorReadiness(env: Partial<NodeJS.ProcessEnv> = process.env): PlatformConnectorReadiness {
  const oauthConfigured =
    hasPair(env.TIKTOK_OAUTH_CLIENT_ID, env.TIKTOK_OAUTH_CLIENT_SECRET) ||
    hasPair(env.META_APP_ID, env.META_APP_SECRET) ||
    hasPair(env.GOOGLE_OAUTH_CLIENT_ID, env.GOOGLE_OAUTH_CLIENT_SECRET);

  const adAccountConfigured =
    hasPair(env.TIKTOK_ACCESS_TOKEN, env.TIKTOK_ADVERTISER_ID) ||
    hasPair(env.META_ADS_ACCESS_TOKEN, env.META_AD_ACCOUNT_ID) ||
    (hasValue(env.GOOGLE_ADS_DEVELOPER_TOKEN) && hasValue(env.GOOGLE_ADS_CUSTOMER_ID));

  const autoPublishConfigured =
    hasValue(env.TIKTOK_PUBLISH_ACCESS_TOKEN) ||
    hasValue(env.META_PAGE_ACCESS_TOKEN) ||
    hasPair(env.YOUTUBE_UPLOAD_CLIENT_ID, env.YOUTUBE_UPLOAD_CLIENT_SECRET);

  const analyticsSyncConfigured =
    env.PLATFORM_ANALYTICS_SYNC_ENABLED === '1' &&
    (
      hasValue(env.TIKTOK_ANALYTICS_ACCESS_TOKEN) ||
      hasValue(env.META_ADS_ACCESS_TOKEN) ||
      hasValue(env.GOOGLE_ADS_DEVELOPER_TOKEN)
    );

  const enterpriseAssetPermissionsConfigured =
    env.ENTERPRISE_ASSET_RBAC_ENABLED === '1' &&
    (hasValue(env.ASSET_CLOUD_BUCKET) || hasValue(env.ASSET_CLOUD_PROJECT_ID));

  const videoWebhookSignatureConfigured = hasValue(env.VIDEO_PROVIDER_WEBHOOK_SECRET);

  const capabilities = [
    ['oauthConfigured', oauthConfigured],
    ['adAccountConfigured', adAccountConfigured],
    ['autoPublishConfigured', autoPublishConfigured],
    ['analyticsSyncConfigured', analyticsSyncConfigured],
    ['enterpriseAssetPermissionsConfigured', enterpriseAssetPermissionsConfigured],
    ['videoWebhookSignatureConfigured', videoWebhookSignatureConfigured],
  ] as const;

  return {
    oauthConfigured,
    adAccountConfigured,
    autoPublishConfigured,
    analyticsSyncConfigured,
    enterpriseAssetPermissionsConfigured,
    videoWebhookSignatureConfigured,
    platformAutomationReady: capabilities.every(([, ok]) => ok),
    configuredCapabilities: capabilities.filter(([, ok]) => ok).map(([name]) => name),
    missingCapabilities: capabilities.filter(([, ok]) => !ok).map(([name]) => name),
  };
}
