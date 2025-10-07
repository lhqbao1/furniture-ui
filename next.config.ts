import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "melxlbszyvpsclujnxyv.supabase.co",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "pxjiuyvomonmptmmkglv.supabase.co",
      },
    ],
    minimumCacheTTL: 2678400, // 31 ngày
    formats: ['image/webp'],
    qualities: [70, 80],
    deviceSizes: [320, 640, 1024],
    imageSizes: [16, 32, 48, 64],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);