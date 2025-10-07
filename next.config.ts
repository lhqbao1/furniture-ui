import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
   // ✅ Redirect các URL cũ của WordPress
   async redirects() {
    return [
      // Redirect /product/... → /products/...
      {
        source: '/product/:slug*',
        destination: '/products/:slug*',
        permanent: true,
      },
      // Redirect nếu có add_to_wishlist hoặc _wpnonce trong query
      {
        source: '/product/:slug*',
        has: [
          { type: 'query', key: 'add_to_wishlist' },
          { type: 'query', key: '_wpnonce' },
        ],
        destination: '/products/:slug*',
        permanent: true,
      },
      // Optional: redirect /product-category/... → /categories/...
      {
        source: '/product-category/:slug*',
        destination: '/categories/:slug*',
        permanent: true,
      },
    ];
  },

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