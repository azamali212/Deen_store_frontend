// middleware.ts - UPDATED
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const generateTabId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Define protected routes for different user types
const ADMIN_PROTECTED_PATHS = ['/dashboard', '/role', '/permissions', '/admin'];
const CUSTOMER_PROTECTED_PATHS = ['/userInterface', '/customer'];
const ALL_PROTECTED_PATHS = [...ADMIN_PROTECTED_PATHS, ...CUSTOMER_PROTECTED_PATHS];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Get auth data from cookies
  const authToken = request.cookies.get('auth_token')?.value;
  const userGuard = request.cookies.get('user_guard')?.value; // 'admin' or 'customer'
  const currentTabId = request.cookies.get('currentTabId')?.value;

  console.log('Middleware - Path:', pathname, 'Guard:', userGuard, 'Has token:', !!authToken);

  // Skip auth checks for API routes, login page, and public assets
  if (
    pathname.startsWith('/api') || 
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  // Redirect old admin login route to new one
  if (pathname === '/shopinity_admin_login') {
    const newUrl = new URL('/login?portal=admin', request.url);
    return NextResponse.redirect(newUrl);
  }

  // Check if the current path is protected
  const isProtected = ALL_PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isAdminPath = ADMIN_PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isCustomerPath = CUSTOMER_PROTECTED_PATHS.some(path => pathname.startsWith(path));

  if (isProtected) {
    // If no auth token, redirect to login
    if (!authToken) {
      console.log('No auth token, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      
      // Only set redirect if it's not already a redirect loop
      if (!pathname.startsWith('/login')) {
        loginUrl.searchParams.set('redirect', pathname);
      }
      
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    if (isAdminPath && userGuard !== 'admin') {
      console.log('Customer trying to access admin route, redirecting to customer page');
      return NextResponse.redirect(new URL('/userInterface', request.url));
    }

    if (isCustomerPath && userGuard !== 'customer') {
      console.log('Admin trying to access customer route, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // User has proper access, allow
    const response = NextResponse.next();
    
    // Ensure tab ID exists
    if (!currentTabId) {
      response.cookies.set('currentTabId', generateTabId(), {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });
    }
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};