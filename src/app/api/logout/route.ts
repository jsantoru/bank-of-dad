import { NextResponse } from 'next/server';

export async function GET() {
  // Return 401 to clear the browser's Basic Auth cache
  return new NextResponse('Logged out', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Bank of Dad"',
    },
  });
}
