import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['de','en'],
 
  // Used when no locale matches
  defaultLocale: 'de',
  localePrefix: 'always',
});

export const locales = ['de','en'] as const
export const defaultLocale = 'de'
export const localePrefix = 'always'