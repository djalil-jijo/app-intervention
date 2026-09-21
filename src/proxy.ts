import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_session';

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Max age 24 hours
  const ageInSeconds = (Date.now() - timestamp) / 1000;
  return ageInSeconds >= 0 && ageInSeconds <= 60 * 60 * 24;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = verifyToken(token);

  // Protect all /admin/* routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated user from /admin/login to /admin/dashboard
  if (pathname === '/admin/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
