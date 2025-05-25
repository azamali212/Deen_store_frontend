import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Redirect to dashboard if already logged in and accessing login page
  if (pathname.startsWith('/shopinity_admin_login') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect /dashboard and /role routes
  const protectedPaths = ['/dashboard', '/role'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/shopinity_admin_login', request.url));
  }

  return NextResponse.next();
}