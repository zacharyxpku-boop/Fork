import { getKuaiziServerConfig } from '@/lib/kuaizi-server';
import { buildPlatformConnectorReadiness } from '@/lib/platform-connector-readiness';

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function buildReadinessInput(env: NodeJS.ProcessEnv = process.env) {
  const aiConfigured = hasValue(env.AI_API_KEY);
  return {
    aiConfigured,
    storageConfigured: hasValue(env.UPSTASH_REDIS_REST_URL) && hasValue(env.UPSTASH_REDIS_REST_TOKEN),
    kuaiziConfigured: Boolean(getKuaiziServerConfig(env)),
    imageConfigured: aiConfigured && env.WANX_DISABLED !== '1',
    videoConfigured: hasValue(env.HAPPYHORSE_API_KEY) || aiConfigured,
    videoTeardownConfigured: hasValue(env.GEMINI_API_KEY),
    performanceImportAvailable: true,
    commerceChainAvailable: true,
    industrialChainAvailable: true,
    distributionExecutionAvailable: true,
    platformConnectors: buildPlatformConnectorReadiness(env),
    emailConfigured: hasValue(env.RESEND_API_KEY) || hasValue(env.SENDGRID_API_KEY),
    authConfigured: hasValue(env.JWT_SECRET),
  };
}
