import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
};

const redirectToRoleHome = (role: string, request: NextRequest) => {
  const target = role === 'ADMIN' ? '/admin' : '/user';
  const url = new URL(target, request.url);
  return NextResponse.redirect(url);
};

export function proxy(request: NextRequest) {
  if (!JWT_SECRET) return redirectToLogin(request);

  const token = request.cookies.get('auth_token')?.value;
  if (!token) return redirectToLogin(request);

  let payload: { role?: string } = {};
  try {
    payload = jwt.verify(token, JWT_SECRET) as { role?: string };
  } catch (error) {
    console.error('JWT verification failed', error);
    return redirectToLogin(request);
  }

  const path = request.nextUrl.pathname;

  if (path.startsWith('/admin')) {
    if (payload.role !== 'ADMIN') return redirectToRoleHome(payload.role ?? '', request);
  }

  if (path.startsWith('/user')) {
    if (payload.role !== 'USER') return redirectToRoleHome(payload.role ?? '', request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
