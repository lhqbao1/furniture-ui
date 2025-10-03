'use client'
import React from "react";
import Image from "next/image";
// ❌ bỏ import Link từ "next/link"
// ✅ dùng Link của next-intl navigation để auto handle locale
import { Link } from "@/src/i18n/navigation"
import { useTranslations, useLocale } from "next-intl";
import { Input } from "../ui/input";

const Footer = () => {
    const t = useTranslations()
    const locale = useLocale() // 👈 lấy locale hiện tại

    return (
        <footer className="bg-white shadow-2xl mt-10 lg:mt-20 text-black w-full grid lg:grid-cols-6 grid-cols-2 lg:gap-0 gap-4 lg:px-20 lg:py-10 px-8 py-8 rounded-tl-2lg rounded-tr-2xl">
            {/* Cột 1: Newsletter */}
            <div className="col-span-6 lg:col-span-3 space-y-3 mb-6 lg:mb-0">
                <h3 className="font-semibold">
                    Jetzt Newsletter abonnieren – und mehr entdecken.
                </h3>

                <ul className="list-disc space-y-2 text-black-700 text-sm pl-3">
                    <li>Spare bis zu 70 % bei exklusiven Sales & Design-Angeboten</li>
                    <li>Erfahre als Erste*r von neuen Kollektionen und Trends</li>
                    <li>Erhalte persönliche Einladungen zu Aktionen & Events</li>
                </ul>

                <h3 className="font-semibold lg:mt-2 mt-1">Inspiration direkt ins Postfach.</h3>

                <div className="flex items-center gap-2">
                    <Input
                        type="email"
                        placeholder="Email"
                        className="w-full lg:w-1/3"
                    />
                </div>

                <button className="w-full lg:w-1/3 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition ">
                    Jetzt anmelden
                </button>

                <p className="leading-relaxed font-semibold text-sm lg:w-1/2 w-full">
                    Die Abmeldung des Newsletters ist jederzeit über den Abmeldelink in jeder Mail oder als Anfrage in unserem Kontaktformular möglich.{" "}
                    {/* ✅ thêm locale */}
                    <Link href={`/${locale}/privacy-policy`} className="underline text-gray-600 hover:text-gray-800">
                        Datenschutz
                    </Link>
                </p>
            </div>

            {/* Cột 2: Các trang */}
            <div className="lg:col-span-1 col-span-6">
                <h3 className="font-semibold mb-3">{t('pages')}</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    {/* ✅ thêm locale */}
                    <li><Link href={`/${locale}/about-us`}>{t('aboutUs')}</Link></li>
                    <li><Link href={`/${locale}/contact`}>{t('contact')}</Link></li>
                    <li><Link href={`/${locale}/faq`}>FAQ</Link></li>
                    <li><Link href={`/${locale}/impressum`}>{t('imprint')}</Link></li>
                </ul>
            </div>

            {/* Cột 3: Term & Policy */}
            <div className="lg:col-span-1 col-span-6">
                <h3 className="font-semibold mb-3">{t('termPolicy')}</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    {/* ✅ thêm locale */}
                    <li><Link href={`/${locale}/agb`}>{t('termCondition')}</Link></li>
                    <li><Link href={`/${locale}/privacy-policy`}>{t('privacyPolicy')}</Link></li>
                    <li><Link href={`/${locale}/cancellation`}>Widerruf</Link></li>
                    <li>
                        <Link
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                if (typeof window !== "undefined" && window.__ucCmp) {
                                    window.__ucCmp.showSecondLayer()
                                }
                            }}
                        >
                            {t("cookieSetting")}
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Cột 4: Social (ngoài, không thêm locale) */}
            <div className="lg:col-span-1 col-span-6 flex lg:items-start lg:justify-start lg:flex-col flex-row justify-center">
                <h3 className="font-semibold lg:mb-3 mb-0">Mehr entdecken</h3>
                <div className="flex gap-1 mt-2 lg:mt-0">
                    <Link href="https://www.facebook.com/profile.php?id=61578621160298" target="_blank">
                        <Image src="/fb.png" width={50} height={50} alt="fb" className="w-12 h-12 object-fill" unoptimized />
                    </Link>
                    <Link href="https://x.com/prestihome_de" target="_blank">
                        <Image src="/x.png" width={50} height={50} alt="x" className="w-12 h-12 object-fill" unoptimized />
                    </Link>
                    <Link href="https://www.instagram.com/prestige_home_gmbh/" target="_blank">
                        <Image src="/insta.png" width={50} height={50} alt="insta" className="w-12 h-12 object-fill" unoptimized />
                    </Link>
                    <Link href="https://www.linkedin.com/company/prestige-home-gmbh/" target="_blank">
                        <Image src="/linkedin.png" width={50} height={50} alt="linkedin" className="w-12 h-12 object-fill" unoptimized />
                    </Link>
                    <Link href="https://www.pinterest.com/prestigehomegmbh/" target="_blank">
                        <Image src="/pinterest.png" width={50} height={50} alt="pinterest" className="w-12 h-12 object-fill" unoptimized />
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
