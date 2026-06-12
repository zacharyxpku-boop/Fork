import { NextRequest, NextResponse } from 'next/server';
import { appendRestaurantStoreMemory, listRestaurantStoreMemory, type RestaurantStoreMemoryKind } from '@/lib/restaurant-store-memory';
import { accessDeniedMessage, resolveTrialAccess, tenantScopedKey, TRIAL_TOKEN_HEADER } from '@/lib/trial-access-guard';

interface MemoryRequestBody {
  action?: 'append' | 'list';
  restaurant?: string;
  kind?: RestaurantStoreMemoryKind;
  note?: string;
  source?: 'owner' | 'proof-backfill' | 'revision';
}

export async function POST(request: NextRequest) {
  let body: MemoryRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }
  const restaurant = (body.restaurant || '').trim();
  if (!restaurant) {
    return NextResponse.json({ ok: false, error: 'missing-restaurant' }, { status: 400 });
  }

  const access = resolveTrialAccess(request.headers.get(TRIAL_TOKEN_HEADER));
  // 记忆读写不消耗 LLM 限额，只验口令身份；当日限额用完仍可读写记忆。
  if (!access.allowed && access.reason !== 'daily-limit-reached') {
    return NextResponse.json({ ok: false, error: `access-${access.reason}`, message: accessDeniedMessage(access.reason) }, { status: 401 });
  }
  const scopedRestaurant = tenantScopedKey(access.tenant, restaurant);

  if (body.action === 'list') {
    return NextResponse.json({ ok: true, entries: listRestaurantStoreMemory(scopedRestaurant) });
  }

  const result = appendRestaurantStoreMemory({
    restaurant: scopedRestaurant,
    kind: body.kind || 'campaign-note',
    note: body.note || '',
    source: body.source,
  });
  if (!result.ok) {
    const messages: Record<string, string> = {
      'empty-note': '备注是空的，没有写入。',
      'pii-blocked': '检测到疑似顾客个人信息（手机号/微信号/证件号），门店记忆不存这些，请改成经营事实再记。',
      'unknown-kind': '记忆类型不认识。',
    };
    return NextResponse.json({ ok: false, error: result.reason, message: messages[result.reason] }, { status: 400 });
  }
  return NextResponse.json({ ok: true, entry: result.entry });
}
