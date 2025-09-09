import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'de'],
 
  // Used when no locale matches
  defaultLocale: 'de',
  localePrefix: 'as-needed',
});

export const locales = ['en', 'de'] as const
export const defaultLocale = 'de'
export const localePrefix = 'as-needed' // hoặc 'always'