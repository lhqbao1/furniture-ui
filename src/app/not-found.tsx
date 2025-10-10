import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { Metadata } from 'next'

// 🧠 SEO metadata cho trang 404
export const metadata: Metadata = {
    title: '404 | Page Not Found',
    description: 'Sorry, the page you are looking for does not exist.',
    robots: { index: false, follow: false }, // 👈 Quan trọng: không index
    alternates: {
        canonical: '/404',
    },
    openGraph: {
        title: 'Page Not Found | Prestige Home',
        description: 'Sorry, the page you are looking for does not exist.',
        url: 'https://www.prestige-home.de/404',
        type: 'website',
    },
}

export default function NotFound() {
    const t = useTranslations('NotFound')

    return (
        <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
            <h1 className="text-5xl font-bold mb-4">{t('title')}</h1>
            <p className="text-gray-600 mb-8 max-w-md">{t('description')}</p>
            <Link
                href="/"
                className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"
            >
                {t('backHome')}
            </Link>
        </main>
    )
}
