import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get credentials from environment variables
  const validUsername = process.env.AUTH_USERNAME || 'admin';
  const validPassword = process.env.AUTH_PASSWORD || 'changeme';

  // Get the Authorization header
  const authHeader = request.headers.get('authorization');

  // If no auth header, prompt for credentials
  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Bank of Dad"',
      },
    });
  }

  // Parse Basic Auth credentials
  const auth = authHeader.split(' ')[1];
  const [username, password] = Buffer.from(auth, 'base64').toString().split(':');

  // Verify credentials
  if (username === validUsername && password === validPassword) {
    return NextResponse.next();
  }

  // Invalid credentials
  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Bank of Dad"',
    },
  });
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
