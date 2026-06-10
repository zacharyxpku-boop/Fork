import { NextRequest, NextResponse } from 'next/server';
import { appendRestaurantStoreMemory, listRestaurantStoreMemory, type RestaurantStoreMemoryKind } from '@/lib/restaurant-store-memory';

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

  if (body.action === 'list') {
    return NextResponse.json({ ok: true, entries: listRestaurantStoreMemory(restaurant) });
  }

  const result = appendRestaurantStoreMemory({
    restaurant,
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
