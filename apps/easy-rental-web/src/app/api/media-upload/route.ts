import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:8081';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('Authorization') || request.headers.get('authorization') || '';
  const formData = await request.formData();

  const backendResponse = await fetch(`${BACKEND_URL}/api/media/upload`, {
    method: 'POST',
    headers: {
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body: formData,
  });

  const text = await backendResponse.text();
  console.log('[media-upload] backend status:', backendResponse.status);
  console.log('[media-upload] backend body:', text);
  let data: unknown = null;
  try { data = JSON.parse(text); } catch { /* not JSON */ }
  return NextResponse.json(data ?? {}, { status: backendResponse.status });
}
