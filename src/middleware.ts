import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware API_URL:', process.env.API_URL)
  
  // Check if the request is for the API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiUrl = process.env.API_URL
    if (!apiUrl) {
      console.error('API_URL environment variable is not set')
      return NextResponse.error()
    }

    // Construct the target URL
    const targetUrl = new URL(request.nextUrl.pathname, apiUrl)
    targetUrl.search = request.nextUrl.search
    
    // Copy all headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-next-proxy-debug', 'true')
    requestHeaders.set('x-forwarded-host', process.env.FORWARDED_HOST || request.headers.get('host') || '')
    requestHeaders.set('x-forwarded-proto', process.env.FORWARDED_PROTO || 'http')

    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders
      }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
