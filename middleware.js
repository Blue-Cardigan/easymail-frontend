import { NextResponse } from 'next/server'

export function middleware(request) {
  const path = request.nextUrl.pathname

  if (path.startsWith('/admin')) {
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}