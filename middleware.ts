import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
 import { getToken } from 'next-auth/jwt'
import authMiddleware from 'next-auth/middleware'
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })
    const url = request.nextUrl
    
    if(token && 
        (
          url.pathname === '/sign-in' ||
          url.pathname === '/sign-up' ||
          url.pathname === '/' ||
          url.pathname.startsWith('/verify')
        )
    )
    {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    if(!token && url.pathname.startsWith('/dashboard'))
    {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    return NextResponse.next()
}
 
export const config = {
  matcher: ['/sign-in',
    '/sign-up',
    '/',
    '/dashboard/:path*',
    '/verify/:path'
  ],
}