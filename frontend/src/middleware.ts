import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtClaims {
  sub: string;
  email: string;
  role: 'SUPER_ADMIN' | 'FACULTY' | 'STUDENT' | 'GUEST';
  exp: number;
}

/**
 * Decode JWT payload without verifying signature.
 * Works in the Edge runtime (no Node.js crypto or npm packages needed).
 */
function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    // Convert base64url → base64
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

/** Which roles may access each route prefix. */
const ROUTE_ROLES: Array<{ prefix: string; allowed: JwtClaims['role'][] }> = [
  { prefix: '/admin',   allowed: ['SUPER_ADMIN'] },
  { prefix: '/faculty', allowed: ['SUPER_ADMIN', 'FACULTY'] },
  { prefix: '/student', allowed: ['SUPER_ADMIN', 'FACULTY', 'STUDENT'] },
];

/** Default home for each role after a forced redirect. */
const ROLE_HOME: Record<JwtClaims['role'], string> = {
  SUPER_ADMIN: '/admin',
  FACULTY:     '/faculty',
  STUDENT:     '/student',
  GUEST:       '/',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const route = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
  if (!route) return NextResponse.next();

  const tokenCookie = request.cookies.get('access_token');
  if (!tokenCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const claims = decodeJwtPayload(tokenCookie.value);

  // Malformed token → treat as unauthenticated
  if (!claims) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  // Expired token → redirect to login
  if (claims.exp && Date.now() / 1000 > claims.exp) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  // Wrong role → redirect to the user's correct dashboard
  if (!route.allowed.includes(claims.role)) {
    const correctHome = ROLE_HOME[claims.role] ?? '/';
    return NextResponse.redirect(new URL(correctHome, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/faculty/:path*', '/student/:path*'],
};
