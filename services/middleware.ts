import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/');

  // Jika tidak ada token dan bukan halaman auth, redirect ke login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Jika ada token dan mencoba akses halaman auth, redirect ke home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Tentukan path mana yang akan diproses oleh middleware
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};