import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["de"],
  defaultLocale: "de",
  localePrefix: { mode: "always" },
  localeDetection: false,
});

export default function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/en(?=\/|$)/, "/de");
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (pathname === "/de/en" || pathname.startsWith("/de/en/")) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/de\/en(?=\/|$)/, "/de");
    return NextResponse.redirect(redirectUrl, 301);
  }

  const res = intlMiddleware(req) as NextResponse;

  res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");

  // ✅ Điều kiện nhận diện URL kiểu WooCommerce cũ
  const looksLikeOldWooProduct =
    pathname.startsWith("/product/") &&
    // không phải ID UUID (Next.js mới)
    !/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(
      pathname,
    );

  const hasWpParams = [
    "add_to_wishlist",
    "_wpnonce",
    "remove_item",
    "add-to-cart",
    "wc-api",
    "product-page",
    "orderby",
    "coupon_code",
    "apply_coupon",
    "order",
  ].some((param) => searchParams.has(param));

  const isOtherOldWpPaths =
    pathname.startsWith("/shop/") ||
    pathname.startsWith("/product-category/") ||
    pathname.startsWith("/de/product-category/");
  // pathname.startsWith("/cart") ||
  // pathname.startsWith("/checkout") ||
  // pathname.startsWith("/my-account");

  // ✅ Nếu URL là kiểu WooCommerce → trả về 410
  if (looksLikeOldWooProduct || hasWpParams || isOtherOldWpPaths) {
    return new NextResponse("This page has been permanently removed.", {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const noIndexPrefixes = [
    "/admin",
    "/dsp",
    "/de/admin",
    "/de/dsp",
    "/de/cart",
    "/de/check-out",
    "/de/thank-you",
    "/de/account",
    "/de/my-order",
    "/de/wishlist",
    "/de/recent-viewed",
    "/de/login",
    "/de/sign-up",
    "/de/forgot-password",
    "/de/reset-password",
    "/de/admin-login",
    "/de/auth/callback",
  ];

  const shouldNoIndex = noIndexPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (shouldNoIndex) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  // ✅ Cho phép các route hợp lệ tiếp tục
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json|txt|xml|mp4|webm|ogg|mp3|wav|pdf|woff|ttf|eot)).*)",
  ],
};
