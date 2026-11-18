import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase()
  const pathname = request.nextUrl.pathname
  const userSessionCookie = request.cookies.get('dosyora_user_session')?.value
  const adminSessionCookie = request.cookies.get('dosyora_admin_session')?.value

  const isTebligatHost = host === 'tebligat.dosyora.com' || host.startsWith('tebligat.')

  // tebligat.dosyora.com yönlendirme mantığı:
  // Bu adres doğrudan Tebligat menüsüne yönlendirsin
  if (isTebligatHost) {
    // API ve statik dosyaları atla
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
      return NextResponse.next()
    }

    // Oturum yoksa login'e yönlendir
    if (!userSessionCookie && !adminSessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', `https://${host}/tebligat`)
      return NextResponse.redirect(loginUrl)
    }

    // Oturum varsa ve tebligat menüsünde değilse doğrudan tebligat menüsüne yönlendir
    if (pathname !== '/tebligat' && pathname !== '/portal/tebligat') {
      const tebligatUrl = new URL('/tebligat', request.url)
      return NextResponse.redirect(tebligatUrl)
    }

    return NextResponse.next()
  }

  // /portal ve /tebligat koruması
  if (pathname.startsWith('/portal') || pathname.startsWith('/tebligat')) {
    if (!userSessionCookie && !adminSessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
