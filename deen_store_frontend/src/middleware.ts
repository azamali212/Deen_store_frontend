import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth checks for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Always allow access to login page
  if (pathname.startsWith('/shopinity_admin_login')) {
    return NextResponse.next();
  }

  // Protect dashboard routes - this will be handled client-side
  const protectedPaths = ['/dashboard', '/role', '/permissions'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    // Client-side will handle the actual redirect if not authenticated
    return NextResponse.next();
  }

  return NextResponse.next();
}