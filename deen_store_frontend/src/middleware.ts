// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/admin/login",
  "/customer/login",
  "/otp",
  "/",
  "/api/debug-tokens", // Add debug endpoint
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  console.log(`Middleware checking: ${pathname}`);
  
  // ✅ Allow public auth routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    console.log(`Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Get tokens from cookies
  const adminToken = req.cookies.get("admin_access_token")?.value;
  const customerToken = req.cookies.get("customer_access_token")?.value;
  
  console.log(`Tokens found - Admin: ${!!adminToken}, Customer: ${!!customerToken}`);
  
  // Check dashboard routes (ADMIN)
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    console.log(`Checking dashboard access for ${pathname}`);
    
    if (!adminToken) {
      console.log(`No admin token found for ${pathname}, redirecting to admin login`);
      url.pathname = "/admin/login";
      
      // Also set a header to indicate redirect reason
      const response = NextResponse.redirect(url);
      response.headers.set("x-redirect-reason", "no-admin-token");
      return response;
    }
    
    console.log(`Admin token found, allowing access to ${pathname}`);
    return NextResponse.next();
  }
  
  // Check userInterface routes (CUSTOMER)
  if (pathname === "/userInterface" || pathname.startsWith("/userInterface/")) {
    console.log(`Checking userInterface access for ${pathname}`);
    
    if (!customerToken) {
      console.log(`No customer token found for ${pathname}, redirecting to customer login`);
      url.pathname = "/customer/login";
      
      const response = NextResponse.redirect(url);
      response.headers.set("x-redirect-reason", "no-customer-token");
      return response;
    }
    
    console.log(`Customer token found, allowing access to ${pathname}`);
    return NextResponse.next();
  }
  
  // Check if accessing admin routes
  if (pathname.startsWith("/admin")) {
    if (!adminToken) {
      console.log(`No admin token for admin route ${pathname}, redirecting`);
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  
  // Check if accessing customer routes
  if (pathname.startsWith("/customer")) {
    if (!customerToken) {
      console.log(`No customer token for customer route ${pathname}, redirecting`);
      url.pathname = "/customer/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
  
  // Redirect authenticated users away from login pages
  if (pathname === "/admin/login" && adminToken) {
    console.log(`Admin already logged in, redirecting from ${pathname} to dashboard`);
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  
  if (pathname === "/customer/login" && customerToken) {
    console.log(`Customer already logged in, redirecting from ${pathname} to userInterface`);
    url.pathname = "/userInterface";
    return NextResponse.redirect(url);
  }

  // For any other protected routes, check for any token
  if (!adminToken && !customerToken) {
    console.log(`No tokens found for ${pathname}, redirecting to customer login`);
    url.pathname = "/customer/login";
    return NextResponse.redirect(url);
  }

  console.log(`Allowing access to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/userInterface",
    "/userInterface/:path*",
    "/admin/login",
    "/customer/login",
    "/api/:path*", // Also protect API routes if needed
  ],
};