import createMiddleware from 'next-intl/middleware'
import { locales, localePrefix,defaultLocale } from './i18n/routing'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  localeDetection: true
})

export const config = {
  // matcher: [
  //   '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|txt|xml|mp4|webm|ogg|mp3|wav|pdf|woff|ttf|eot)).*)'
  // ]
  matcher: ['/((?!api|_next|.*\\..*).*)']
}

