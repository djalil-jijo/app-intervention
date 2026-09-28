import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function verifyTokenBasic(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  
  // 3-part unified token [payload, timestamp, sig]
  if (parts.length === 3) {
    const timestamp = parseInt(parts[1], 10);
    if (isNaN(timestamp)) return false;
    const ageInSeconds = (Date.now() - timestamp) / 1000;
    return ageInSeconds >= 0 && ageInSeconds <= 60 * 60 * 24 * 7;
  }

  // 2-part legacy token [timestamp, sig]
  if (parts.length === 2) {
    const timestamp = parseInt(parts[0], 10);
    if (isNaN(timestamp)) return false;
    const ageInSeconds = (Date.now() - timestamp) / 1000;
    return ageInSeconds >= 0 && ageInSeconds <= 60 * 60 * 24;
  }

  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('it_tasker_session')?.value || request.cookies.get('admin_session')?.value;
  const isAuthenticated = verifyTokenBasic(token);

  // Protect /admin/* routes except /admin/login
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
