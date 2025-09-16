'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

const Footer = () => {
    const t = useTranslations()
    return (
        <footer className="bg-white shadow-2xl text-black w-full grid xl:grid-cols-4 grid-cols-2 xl:gap-6 gap-4 p-8 rounded-tl-2xl rounded-tr-2xl">
            {/* Cột 1: Logo */}
            <div className="col-span-2 xl:col-span-1">
                <div className="space-y-2">
                    <p className="text-3xl text-secondary font-semibold">
                        Prestige Home GmbH
                    </p>
                    <p className="text-sm text-black-700">Greifswalder Straße 226, 10405 Berlin.</p>
                    <p className="text-sm text-black-700">USt IdNr: DE454714336</p>
                </div>
            </div>

            {/* Cột 2: Các trang */}
            <div className="col-span-1">
                <h3 className="font-semibold mb-3">{t('pages')}</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    <li><Link href="/uber-uns" className="">{t('aboutUs')}</Link></li>
                    <li><Link href="/contact" className="">{t('contact')}</Link></li>
                    <li><Link href="/faq" className="">FAQ</Link></li>
                </ul>
            </div>

            {/* Cột 3: Danh mục sản phẩm */}
            <div className="col-span-1">
                <h3 className="font-semibold mb-3">{t('termPolicy')}</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    <li><Link href="/agb" className="">{t('termCondition')}</Link></li>
                    <li><Link href="/datenschutzerklarung" className="">{t('privacyPolicy')}</Link></li>
                    <li><Link href="/widerruf" className="">Widerruf</Link></li>
                    <li><Link href="/impressum" className="">{t('imprint')}</Link></li>
                    <li>
                        <div
                            // href="#"
                            onClick={(e) => {
                                // e.preventDefault()
                                if (typeof window !== "undefined" && window.Cookiebot) {
                                    window.Cookiebot.show()
                                    console.log(window.Cookiebot)
                                }
                            }}
                        >
                            {t("cookieSetting")}
                        </div>
                    </li>
                </ul>
            </div>

            {/* Cột 4: Bản đồ + Social */}
            <div className="lg:col-span-1 col-span-2 flex lg:items-start lg:justify-start lg:flex-col flex-row justify-center">
                <h3 className="font-semibold hidden lg:mb-3 mb-0 md:block">{t('contact')}</h3>
                <div className="flex gap-3 mt-2 lg:mt-0">
                    <Link
                        href={'https://www.facebook.com/profile.php?id=61578621160298'}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={'/fb.png'}
                            width={50}
                            height={50}
                            alt="fb"
                            className="w-12 h-12 object-fill"
                            unoptimized
                        />
                    </Link>
                    <Link
                        href={'https://x.com/prestihome_de'}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={'/x.png'}
                            width={50}
                            height={50}
                            alt="fb"
                            className="w-12 h-12 object-fill"
                            unoptimized
                        />
                    </Link>
                    <Link
                        href={'https://www.instagram.com/prestige_home_gmbh/'}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={'/insta.png'}
                            width={50}
                            height={50}
                            alt="fb"
                            className="w-12 h-12 object-fill"
                            unoptimized
                        />
                    </Link>
                    <Link
                        href={'https://www.linkedin.com/company/prestige-home-gmbh/'}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={'/linkedin.png'}
                            width={50}
                            height={50}
                            alt="fb"
                            className="w-12 h-12 object-fill"
                            unoptimized
                        />
                    </Link>
                    <Link
                        href={'https://www.pinterest.com/prestigehomegmbh/'}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src={'/pinterest.png'}
                            width={50}
                            height={50}
                            alt="fb"
                            className="w-12 h-12 object-fill"
                            unoptimized
                        />
                    </Link>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
