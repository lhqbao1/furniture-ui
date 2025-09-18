'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Input } from "../ui/input";

const Footer = () => {
    const t = useTranslations()
    return (
        <footer className="bg-white shadow-2xl text-black w-full grid lg:grid-cols-6 grid-cols-2 lg:gap-0 gap-4 lg:px-20 lg:py-10 px-8 py-8 rounded-tl-2lg rounded-tr-2xl">
            {/* Cột 1: Logo */}
            <div className="col-span-6 lg:col-span-3 space-y-3 mb-6 lg:mb-0">
                <h3 className="font-semibold">
                    Jetzt Newsletter abonnieren – und mehr entdecken.
                </h3>

                <ul className="list-disc space-y-2 text-black-700 text-sm pl-3">
                    <li className="">Spare bis zu 70 % bei exklusiven Sales & Design-Angeboten</li>
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
                    <a href="#" className="underline text-gray-600 hover:text-gray-800">Datenschutz</a>
                </p>
            </div>

            {/* Cột 2: Các trang */}
            <div className="lg:col-span-1 col-span-6">
                <h3 className="font-semibold mb-3">{t('pages')}</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    <li><Link href="/uber-uns" className="">{t('aboutUs')}</Link></li>
                    <li><Link href="/contact" className="">{t('contact')}</Link></li>
                    <li><Link href="/faq" className="">FAQ</Link></li>
                    <li><Link href="/impressum" className="">{t('imprint')}</Link></li>
                </ul>
            </div>

            {/* Cột 3: Danh mục sản phẩm */}
            <div className="lg:col-span-1 col-span-6">
                <h3 className="font-semibold mb-3">{t('termPolicy')}</h3>
                <ul className="space-y-2 text-black-700 text-sm">
                    <li><Link href="/agb" className="">{t('termCondition')}</Link></li>
                    <li><Link href="/datenschutzerklarung" className="">{t('privacyPolicy')}</Link></li>
                    <li><Link href="/widerruf" className="">Widerruf</Link></li>
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

            {/* Cột 4: Bản đồ + Social */}
            <div className="lg:col-span-1 col-span-6 flex lg:items-start lg:justify-start lg:flex-col flex-row justify-center">
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
