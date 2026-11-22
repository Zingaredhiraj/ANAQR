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
  { prefix: '/admin', allowed: ['SUPER_ADMIN'] },
  { prefix: '/faculty', allowed: ['SUPER_ADMIN', 'FACULTY'] },
  { prefix: '/student', allowed: ['SUPER_ADMIN', 'FACULTY', 'STUDENT'] },
];

/** Default home for each role after a forced redirect. */
const ROLE_HOME: Record<JwtClaims['role'], string> = {
  SUPER_ADMIN: '/admin',
  FACULTY: '/faculty',
  STUDENT: '/student',
  GUEST: '/',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const tokenCookie = request.cookies.get('access_token');
  const claims = tokenCookie?.value ? decodeJwtPayload(tokenCookie.value) : null;
  const isTokenValid = claims && (!claims.exp || Date.now() / 1000 <= claims.exp);

  // If already authenticated user visits /login or /register, redirect to their role home
  if (pathname === '/login' || pathname === '/register') {
    if (isTokenValid && claims) {
      const home = ROLE_HOME[claims.role] ?? '/';
      return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  const route = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
  if (!route) return NextResponse.next();

  // If unauthenticated or token expired on protected routes
  if (!tokenCookie?.value || !isTokenValid || !claims) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    const response = NextResponse.redirect(loginUrl);
    if (tokenCookie?.value) {
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
    }
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
  matcher: ['/admin/:path*', '/faculty/:path*', '/student/:path*', '/login', '/register'],
};
