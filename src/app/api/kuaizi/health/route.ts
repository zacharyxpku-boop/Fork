import { NextRequest, NextResponse } from 'next/server';
import { checkKuaiziHealth } from '@/lib/kuaizi-server';

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
  const result = await checkKuaiziHealth({ dryRun });
  const status = result.configured === false ? 503 : 200;
  return NextResponse.json(result, { status });
}
