import Script from "next/script"

export default function Head() {
    return (
        <>
            {/* Cookiebot script */}
            <Script
                id="cookiebot"
                src="https://consent.cookiebot.com/uc.js"
                data-cbid="f8e75d3b-6cdf-4ad9-bf82-8348e2be135d"
                data-blockingmode="auto"
                strategy="beforeInteractive" // load ngay trước khi app chạy
                type="text/javascript"
            />

            {/* (tuỳ chọn) CookieDeclaration script để hiển thị bảng cookies */}
            <Script
                id="cookie-declaration"
                src="https://consent.cookiebot.com/f8e75d3b-6cdf-4ad9-bf82-8348e2be135d/cd.js"
                strategy="afterInteractive"
                type="text/javascript"
            />
        </>
    )
}
