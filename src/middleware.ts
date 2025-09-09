import createMiddleware from 'next-intl/middleware'
import { locales, localePrefix } from './i18n/routing'

export default createMiddleware({
  locales,
  defaultLocale: 'de',
  localePrefix,
})

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
}
