import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get credentials from environment variables
  const adminUsername = process.env.AUTH_USERNAME || 'admin';
  const adminPassword = process.env.AUTH_PASSWORD || 'changeme';
  const readonlyUsername = process.env.AUTH_READONLY_USERNAME;
  const readonlyPassword = process.env.AUTH_READONLY_PASSWORD;

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

  // Check if admin credentials
  const isAdmin = username === adminUsername && password === adminPassword;

  // Check if read-only credentials (only if read-only creds are configured)
  const isReadOnly = readonlyUsername && readonlyPassword &&
                     username === readonlyUsername && password === readonlyPassword;

  // If valid credentials
  if (isAdmin || isReadOnly) {
    // For read-only users on POST requests, add a header to indicate read-only mode
    // This allows the server action to handle the error gracefully with a nice message
    if (isReadOnly && request.method === 'POST') {
      const response = NextResponse.next();
      response.headers.set('x-readonly-mode', 'true');
      return response;
    }

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
