// app/api/clear-cache/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ success: true });
  
  // Set headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Accel-Expires', '0');
  
  return response;
}