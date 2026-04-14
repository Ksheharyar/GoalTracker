import { NextResponse } from 'next/server';

const protectedPrefixes = ['/dashboard', '/analytics', '/goals'];

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth_token');

  if (!authToken) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analytics/:path*', '/goals/:path*'],
};