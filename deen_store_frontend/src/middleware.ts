// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add this function to your middleware file
const generateTabId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth checks for API routes and login page
  if (pathname.startsWith('/api') || pathname.startsWith('/shopinity_admin_login')) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  const protectedPaths = ['/dashboard', '/role', '/permissions'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    const tabId = request.cookies.get('currentTabId')?.value || '';
    const response = NextResponse.next();
    
    if (!tabId) {
      response.cookies.set('currentTabId', generateTabId(), {
        httpOnly: true,
        sameSite: 'strict'
      });
    }
    
    return response;
  }

  return NextResponse.next();
}