import { NextResponse } from 'next/server'

export async function middleware(req) {
  const url = req.nextUrl.clone()

  console.log('🔒 Middleware triggered for:', url.pathname)

  // Protect admin routes
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    // Check if user has session cookie
    const sessionToken = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token')
    
    if (!sessionToken) {
      console.log('❌ No session found, redirecting to home')
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // For now, let the page handle the admin check
    // Since we can't easily verify admin status in middleware with database sessions
    console.log('✅ Session found, allowing access (page will verify admin status)')
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
