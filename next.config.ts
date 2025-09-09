import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'de',
  },
  images: {
    domains: ["melxlbszyvpsclujnxyv.supabase.co","example.com", "pxjiuyvomonmptmmkglv.supabase.co", "pxjiuyvomonmptmmkglv.supabase.co"],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);