import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: { mode: 'always' },
  localeDetection: false
})

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // // Redirect /de/... về /
  // if (pathname.startsWith('/de')) {
  //   const url = req.nextUrl.clone()
  //   url.pathname = pathname.replace(/^\/de/, '') || '/'
  //   return NextResponse.redirect(url)
  // }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|txt|xml|mp4|webm|ogg|mp3|wav|pdf|woff|ttf|eot)).*)'
  ]
}
