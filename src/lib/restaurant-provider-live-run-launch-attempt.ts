import type { RestaurantRuntimeBridgeResult } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantProviderLiveRunGate } from '@/lib/restaurant-provider-live-run-gate';

export type RestaurantProviderLiveRunLaunchAttempt = {
  ok: true;
  payloadShape: 'restaurant-provider-live-run-launch-attempt-v1';
  generatedAt: string;
  verdict:
    | 'forward-real-provider-now'
    | 'forward-supervised-browser-now'
    | 'run-simulator-only'
    | 'already-waiting-receipt'
    | 'already-closeout-ready'
    | 'blocked-before-launch';
  summary: {
    launchMode: RestaurantProviderLiveRunGate['firstLiveAction']['mode'];
    canForwardNow: boolean;
    bridgeForwarded: boolean;
    runMustStayOpenUntilReceipt: boolean;
    canClaimExternalAutomation: false;
  };
  selected: {
    providerTarget: string;
    packageId: string;
    gatewayId: string;
    endpoint: string;
    bodyShape: RestaurantProviderLiveRunGate['firstLiveAction']['bodyShape'];
  };
  operatorDecision: {
    primaryAction: string;
    blockedBy?: RestaurantProviderLiveRunGate['launchChecklist'][number]['id'];
    owner: RestaurantProviderLiveRunGate['launchChecklist'][number]['owner'];
    evidenceRequired: string[];
    stopLine: string;
  };
  bridgeAttempt?: Pick<RestaurantRuntimeBridgeResult, 'ok' | 'target' | 'status' | 'endpoint' | 'externalRunId' | 'message' | 'audit'>;
  closeoutExpectation: {
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    acceptedResult: string[];
    memoryRule: string;
  };
  externalRequired: string[];
  safetyBoundary: string;
};

function firstBlockingGate(gate: RestaurantProviderLiveRunGate) {
  return gate.launchChecklist.find(item => item.id !== 'claim-boundary' && item.status === 'blocked')
    || gate.launchChecklist.find(item => item.id !== 'claim-boundary' && item.status === 'waiting')
    || gate.launchChecklist.find(item => item.id === 'claim-boundary');
}

function verdictFor(input: {
  gate: RestaurantProviderLiveRunGate;
  bridgeAttempt?: RestaurantRuntimeBridgeResult;
}): RestaurantProviderLiveRunLaunchAttempt['verdict'] {
  if (input.gate.verdict === 'accepted-closeout-ready') return 'already-closeout-ready';
  if (input.gate.verdict === 'waiting-provider-receipt') return 'already-waiting-receipt';
  if (input.bridgeAttempt?.status === 'forwarded') return 'forward-real-provider-now';
  if (input.gate.summary.canStartRealProviderNow) return 'forward-real-provider-now';
  if (input.gate.summary.canStartSupervisedBrowserNow) return 'forward-supervised-browser-now';
  if (input.gate.verdict === 'simulator-only') return 'run-simulator-only';
  return 'blocked-before-launch';
}

export function buildRestaurantProviderLiveRunLaunchAttempt(input: {
  providerLiveRunGate: RestaurantProviderLiveRunGate;
  bridgeAttempt?: RestaurantRuntimeBridgeResult;
  now?: Date;
}): RestaurantProviderLiveRunLaunchAttempt {
  const now = input.now || new Date();
  const gate = input.providerLiveRunGate;
  const verdict = verdictFor({ gate, bridgeAttempt: input.bridgeAttempt });
  const blocked = firstBlockingGate(gate);
  const canForwardNow = verdict === 'forward-real-provider-now' || verdict === 'forward-supervised-browser-now';

  const primaryAction = verdict === 'forward-real-provider-now'
    ? '提交恰好一个脱敏外部通道包，然后等待签名外部回执。'
    : verdict === 'forward-supervised-browser-now'
      ? '提交浏览器网关请求和操作手册 id，遇到登录、验证码、私密数据或未审批页面立即停止。'
      : verdict === 'run-simulator-only'
        ? '跑模拟器路径，并补齐缺失的外部通道密钥、店长授权和回调配置。'
        : verdict === 'already-waiting-receipt'
          ? '不要重复提交，等待签名外部通道回执或解除阻塞项。'
          : verdict === 'already-closeout-ready'
            ? '将已接受回执转入试跑后复盘和下轮训练。'
            : blocked?.nextAction || '满足第一个阻塞启动条件后再尝试真实试跑。';

  return {
    ok: true,
    payloadShape: 'restaurant-provider-live-run-launch-attempt-v1',
    generatedAt: now.toISOString(),
    verdict,
    summary: {
      launchMode: gate.firstLiveAction.mode,
      canForwardNow,
      bridgeForwarded: input.bridgeAttempt?.status === 'forwarded',
      runMustStayOpenUntilReceipt: canForwardNow || verdict === 'already-waiting-receipt',
      canClaimExternalAutomation: false,
    },
    selected: {
      providerTarget: gate.selectedRun.providerTarget,
      packageId: gate.selectedRun.packageId,
      gatewayId: gate.selectedRun.gatewayId,
      endpoint: gate.firstLiveAction.endpoint,
      bodyShape: gate.firstLiveAction.bodyShape,
    },
    operatorDecision: {
      primaryAction,
      blockedBy: canForwardNow ? undefined : blocked?.id,
      owner: blocked?.owner || 'ops',
      evidenceRequired: canForwardNow
        ? gate.firstLiveAction.acceptedResult
        : blocked?.evidence.length ? blocked.evidence : gate.externalRequired.slice(0, 5),
      stopLine: canForwardNow
        ? '签名回执被接受前不宣称成功。'
        : blocked?.stopLine || '未满足外部通道条件前不得启动真实试跑。',
    },
    bridgeAttempt: input.bridgeAttempt ? {
      ok: input.bridgeAttempt.ok,
      target: input.bridgeAttempt.target,
      status: input.bridgeAttempt.status,
      endpoint: input.bridgeAttempt.endpoint,
      externalRunId: input.bridgeAttempt.externalRunId,
      message: input.bridgeAttempt.message,
      audit: input.bridgeAttempt.audit,
    } : undefined,
    closeoutExpectation: {
      callbackAction: gate.selectedRun.callbackAction,
      callbackHeader: gate.selectedRun.callbackHeader,
      acceptedResult: gate.firstLiveAction.acceptedResult,
      memoryRule: '只有已接受的签名回执和脱敏汇总计数才能训练下一轮。',
    },
    externalRequired: canForwardNow
      ? ['签名外部回执回调', '公开凭证 URL 或截图 id', '已接受的外部通道结算']
      : gate.externalRequired,
    safetyBoundary: '外部通道真实试跑启动记录是一份启动决策记录。不凭空创建执行、不自动发布、不触达客户、不核销券码、不读取私信、不暴露密钥、不拉取原始 POS 明细、不宣称生产自动化。试跑在签名外部回执被接受前保持开放。',
  };
}
