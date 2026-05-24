import { createHmac, timingSafeEqual } from 'node:crypto';

export type RestaurantAgentCallbackVerification = {
  ok: boolean;
  status: 202 | 401 | 503;
  message: string;
  secretConfigured: boolean;
};

export function signRestaurantAgentCallback(rawBody: string, secret: string): string {
  const digest = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  return `sha256=${digest}`;
}

export function verifyRestaurantAgentCallback(rawBody: string, signature: string | null, secret = process.env.RESTAURANT_AGENT_CALLBACK_SECRET): RestaurantAgentCallbackVerification {
  if (!secret?.trim()) {
    return {
      ok: false,
      status: 503,
      message: 'RESTAURANT_AGENT_CALLBACK_SECRET is missing; external runtime receipts are not accepted.',
      secretConfigured: false,
    };
  }

  if (!signature?.startsWith('sha256=')) {
    return {
      ok: false,
      status: 401,
      message: 'Missing x-restaurant-agent-signature sha256 signature.',
      secretConfigured: true,
    };
  }

  const expected = signRestaurantAgentCallback(rawBody, secret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  const ok = expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);

  return {
    ok,
    status: ok ? 202 : 401,
    message: ok ? 'External runtime receipt signature accepted.' : 'External runtime receipt signature mismatch.',
    secretConfigured: true,
  };
}
