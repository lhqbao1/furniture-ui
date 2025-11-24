"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "../ui/input";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const Footer = () => {
  const t = useTranslations();
  // useEffect(() => {
  //   gsap.registerPlugin(ScrollTrigger);

  //   const columns = gsap.utils.toArray<HTMLElement>(".footer-column");

  //   if (!columns) return;

  //   const tl = gsap.timeline({
  //     scrollTrigger: {
  //       trigger: "#footer",
  //       start: "top 85%",
  //       once: true,
  //     },
  //   });

  //   tl.from(columns[0], {
  //     x: -40,
  //     autoAlpha: 0,
  //     duration: 0.8,
  //     ease: "power3.out",
  //     immediateRender: false,
  //   })
  //     .from(
  //       columns[1],
  //       {
  //         y: 40,
  //         autoAlpha: 0,
  //         duration: 0.8,
  //         ease: "power3.out",
  //         immediateRender: false,
  //       },
  //       "-=0.4",
  //     )
  //     .from(
  //       columns[2],
  //       {
  //         x: 40,
  //         autoAlpha: 0,
  //         duration: 0.8,
  //         ease: "power3.out",
  //         immediateRender: false,
  //       },
  //       "-=0.4",
  //     )
  //     .from(
  //       columns[3],
  //       {
  //         scale: 0.6,
  //         autoAlpha: 0,
  //         duration: 0.9,
  //         ease: "back.out(1.7)",
  //         immediateRender: false,
  //       },
  //       "-=0.4",
  //     );

  //   columns.forEach((col: any) => {
  //     const items = col.querySelectorAll("li, input, button, img, p");

  //     gsap.from(items, {
  //       autoAlpha: 0,
  //       y: 20,
  //       duration: 0.6,
  //       stagger: 0.1,
  //       ease: "power2.out",
  //       immediateRender: false,
  //       scrollTrigger: {
  //         trigger: col,
  //         start: "top 90%",
  //         once: true,
  //       },
  //     });
  //   });

  //   // ⛔ return () => () => tl.kill() → Sai
  //   // ✅ return cleanup đúng chuẩn:
  //   return () => {
  //     tl.kill();
  //     ScrollTrigger.getAll().forEach((st) => st.kill());
  //   };
  // }, []);

  return (
    <footer
      id="footer"
      className="bg-white shadow-secondary/100 shadow-2xl mt-10 lg:mt-20 text-black w-full grid lg:grid-cols-12 grid-cols-2 lg:gap-0 gap-4 lg:px-20 lg:pt-10 lg:pb-4 px-8 py-8 rounded-tl-2lg rounded-tr-2xl"
    >
      {/* Cột 1: Newsletter */}
      <div className="footer-column col-span-6 lg:col-span-4 space-y-3 mb-6 lg:mb-0">
        <h4 className="font-semibold">
          Jetzt Newsletter abonnieren – und mehr entdecken.
        </h4>

        <ul className="list-disc space-y-2 text-black-700 text-sm pl-3">
          <li>Spare bis zu 70 % bei exklusiven Sales & Design-Angeboten</li>
          <li>Erfahre als Erste*r von neuen Kollektionen und Trends</li>
          <li>Erhalte persönliche Einladungen zu Aktionen & Events</li>
        </ul>

        <h4 className="font-semibold lg:mt-2 mt-1">
          Inspiration direkt ins Postfach.
        </h4>

        <div className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="Email"
            className="w-full lg:w-1/2"
          />
        </div>

        <button className="w-full lg:w-1/2 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition ">
          Jetzt anmelden
        </button>

        <p className="leading-relaxed font-semibold text-sm lg:w-1/2 w-full">
          Die Abmeldung des Newsletters ist jederzeit über den Abmeldelink in
          jeder Mail oder als Anfrage in unserem Kontaktformular möglich.{" "}
          {/* ✅ thêm locale */}
          <Link
            href={`/privacy-policy`}
            className="underline text-gray-600 hover:text-gray-800"
          >
            Datenschutz
          </Link>
        </p>
      </div>

      {/* Cột 2: Các trang */}
      <div className="footer-column lg:col-span-2 col-span-6">
        <h4 className="font-semibold mb-3">{t("pages")}</h4>
        <ul className="space-y-2 text-black-700 text-sm">
          {/* ✅ thêm locale */}
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/about-us`}>{t("aboutUs")}</Link>
          </li>
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/contact`}>{t("contact")}</Link>
          </li>
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/faq`}>FAQ</Link>
          </li>
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/impressum`}>{t("imprint")}</Link>
          </li>
        </ul>
      </div>

      {/* Cột 3: Term & Policy */}
      <div className="footer-column lg:col-span-3 col-span-6">
        <h4 className="font-semibold mb-3">{t("termPolicy")}</h4>
        <ul className="space-y-2 text-black-700 text-sm">
          {/* ✅ thêm locale */}
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/agb`}>{t("termCondition")}</Link>
          </li>
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/privacy-policy`}>{t("privacyPolicy")}</Link>
          </li>
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/shipping-and-delivery`}>{t("shippingPolicy")}</Link>
          </li>
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/payment-terms`}>{t("paymentTerms")}</Link>
          </li>
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/cancellation`}>Widerruf</Link>
          </li>

          <li className="hover:pl-2 transition-all duration-500">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined" && window.__ucCmp) {
                  window.__ucCmp.showSecondLayer();
                }
              }}
            >
              {t("cookieSetting")}
            </Link>
          </li>
        </ul>
      </div>

      {/* Cột 5: Company Info */}
      <div className="footer-column lg:col-span-3 col-span-6">
        <h4 className="font-semibold mb-3">{t("companyTitle")}</h4>

        <ul className="space-y-2 text-black-700 text-sm">
          <li>Prestige Home GmbH</li>
          <li>Greifswalder Straße 226, 10405 Berlin</li>
          <li>{t("phone_number")}: +49 3222 1808038</li>
          <li>{t("email")}: info@prestige-home.de</li>
          <li>{t("vatId")}: DE454714336</li>
        </ul>
      </div>

      {/* Cột 4: Social (ngoài, không thêm locale) */}
      <div className="footer-column lg:col-span-12 col-span-6 flex lg:items-center lg:justify-start lg:flex-col flex-row justify-center">
        {/* <h4 className="font-semibold lg:mb-3 mb-0">Mehr entdecken</h4> */}
        <div className="flex gap-1 mt-2 lg:mt-0">
          <Link
            href="https://www.facebook.com/profile.php?id=61578621160298"
            target="_blank"
          >
            <Image
              src="/fb.png"
              width={50}
              height={50}
              alt="fb"
              className="w-12 h-12 object-fill hover:scale-110 duration-300 transition-all"
              unoptimized
            />
          </Link>
          <Link
            href="https://x.com/prestihome_de"
            target="_blank"
          >
            <Image
              src="/x.png"
              width={50}
              height={50}
              alt="x"
              className="w-12 h-12 object-fill hover:scale-110 duration-300 transition-all"
              unoptimized
            />
          </Link>
          <Link
            href="https://www.instagram.com/prestige_home_gmbh/"
            target="_blank"
          >
            <Image
              src="/insta.png"
              width={50}
              height={50}
              alt="insta"
              className="w-12 h-12 object-fill hover:scale-110 duration-300 transition-all"
              unoptimized
            />
          </Link>
          <Link
            href="https://www.linkedin.com/company/prestige-home-gmbh/"
            target="_blank"
          >
            <Image
              src="/linkedin.png"
              width={50}
              height={50}
              alt="linkedin"
              className="w-12 h-12 object-fill hover:scale-110 duration-300 transition-all"
              unoptimized
            />
          </Link>
          <Link
            href="https://www.pinterest.com/prestigehomegmbh/"
            target="_blank"
          >
            <Image
              src="/pinterest.png"
              width={50}
              height={50}
              alt="pinterest"
              className="w-12 h-12 object-fill hover:scale-110 duration-300 transition-all"
              unoptimized
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
