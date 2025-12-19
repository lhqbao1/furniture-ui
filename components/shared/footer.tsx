"use client";
import React from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import ListStars from "./list-stars";

const Footer = () => {
  const t = useTranslations();
  return (
    <footer
      id="footer"
      className="bg-white shadow-secondary/100 shadow-2xl mt-10 lg:mt-32 text-black w-full grid lg:grid-cols-12 grid-cols-2 lg:gap-0 gap-4 lg:px-20 lg:pt-26 lg:pb-4 px-8 py-8 rounded-tl-2lg rounded-tr-2xl relative"
    >
      <div className="lg:w-1/2 w-full lg:col-span-12 col-span-6 shadow-[0_4px_20px_rgba(0,177,89,0.15)] flex lg:flex-row flex-col lg:items-center justify-center lg:gap-24 gap-6 mb-6 lg:absolute lg:left-1/2 lg:-translate-x-1/2 top-0 lg:-translate-y-1/2 bg-white px-6 py-4 rounded-tl-2xl rounded-tr-2xl">
        <div className="flex flex-col gap-2 items-center justify-center">
          <Link
            href={
              "https://www.ebay.de/sch/i.html?item=365962209706&rt=nc&_trksid=p4429486.m3561.l161211&_ssn=prestige.home"
            }
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
          >
            <Image
              src={"/ebay.png"}
              width={80}
              height={80}
              alt="ebay"
              className="object-cover h-7 w-auto"
            />
          </Link>
          <ListStars rating={5} />
          <div className="text-sm font-semibold">100% 5-Stars</div>
        </div>
        {/* <div className="flex flex-col gap-2 items-center justify-center">
          <Link
            href={
              "https://www.amazon.de/s?k=PRESTIGE+HOME+LIVING+OUTDOOR&i=kitchen&language=en&search-type=ss&ref=bl_dp_s_web_0"
            }
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
          >
            <Image
              src={"/amazon.png"}
              width={80}
              height={80}
              alt="amazon"
              className="object-cover h-7 w-auto"
            />
          </Link>
          <ListStars rating={5} />
          <div className="text-sm font-semibold">100% 5-Stars</div>
        </div> */}
        <div className="flex flex-col gap-2 items-center justify-center">
          <Link
            href={"https://www.kaufland.de/shops/Prestige_Home_GmbH/"}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
          >
            <Image
              src={"/kau.png"}
              width={80}
              height={80}
              alt="kaufland"
              className="object-cover h-7 w-auto"
            />
          </Link>
          <ListStars rating={5} />
          <div className="text-sm font-semibold">100% 5-Stars</div>
        </div>
      </div>
      {/* Cột 1: Newsletter */}
      {/* <div className="footer-column col-span-6 lg:col-span-4 space-y-3 mb-6 lg:mb-0">
        <h4 className="">{t("notifyByEmail")}</h4>

        <p className="lg:mt-2 mt-1 lg:w-2/3 w-full text-sm">
          {t("notifyDescription")}
        </p>

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

        <p className="leading-relaxed font-semibold text-sm w-full lg:w-1/2">
          Die Abmeldung des Newsletters ist jederzeit über den Abmeldelink in
          jeder Mail oder als Anfrage in unserem Kontaktformular möglich.{" "}
          <Link
            href={`/privacy-policy`}
            className="underline text-gray-600 hover:text-gray-800"
          >
            Datenschutz
          </Link>
        </p>
      </div> */}

      {/* Cột 2: Các trang */}
      <div className="footer-column lg:col-span-2 col-span-6 mb-6 lg:mb-0">
        <h4 className="font-semibold mb-3">{t("pages")}</h4>
        <ul className="space-y-2 text-black-700 text-sm">
          {/* ✅ thêm locale */}
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/about-us`}>{t("aboutUs")}</Link>
          </li>
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/contact`}>{t("contactAndAsk")}</Link>
          </li>
          {/* <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/faq`}>FAQ</Link>
          </li> */}
          <li className="hover:pl-2 transition-all duration-500">
            <Link href={`/impressum`}>{t("imprint")}</Link>
          </li>
        </ul>
        <div className="lg:mt-4 flex flex-col gap-2 mt-2">
          <a href="https://www.idealo.de/preisvergleich/Shop/336129.html#i">
            <img
              src="https://img.idealo.com/badges/336129/4aaf21c6-e44d-47d8-9179-c32923b7f542"
              loading="lazy"
              alt="zu www.idealo.de"
            />
          </a>
          <a
            href="https://www.praktiker.de/marktplatz/prestige-home-5786"
            rel="nofollow"
          >
            <img
              src="https://www.praktiker.de/marktplatz/images/badges/praktiker_trust_logo_s1s.png"
              width="120"
              height="50"
              alt="Praktiker Trust Logo"
            />
          </a>
        </div>
      </div>

      {/* Cột 3: Term & Policy */}
      <div className="footer-column lg:col-span-3 col-span-6 mb-6 lg:mb-0">
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

      <div className="footer-column lg:col-span-4 col-span-6">
        <h4 className="font-semibold mb-3">{t("companyTitle")}</h4>

        <div className="grid grid-cols-2 gap-6 items-start">
          <ul className="space-y-2 text-black-700 text-sm">
            <li className="font-bold">Büro </li>
            <li>Prestige Home GmbH</li>
            <li>Greifswalder Straße 226, 10405 Berlin</li>
            <li>{t("phone_number")}: 004368110327073</li>
            <li>{t("email")}: info@prestige-home.de</li>
          </ul>
          <ul className="space-y-2 text-black-700 text-sm">
            <li className="font-bold">Lager</li>
            <li>Prestige Home</li>
            <li>Amm GmbH & Co KG Spedition</li>
            <li>Hamburger Straße 99</li>
            <li>90451 Nuremberg</li>
          </ul>
        </div>
      </div>

      {/* Cột 3: Payment Method */}
      <div className="footer-column lg:col-span-3 col-span-6 lg:space-y-6 mb-6 lg:mb-0">
        <>
          <h4 className="font-semibold mb-3">{t("paymentMethod")}</h4>

          <div className="flex gap-2 mt-2 lg:mt-4 flex-wrap">
            <Image
              src="/footer-ggpay.svg"
              width={50}
              height={50}
              alt="x"
              className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
              unoptimized
            />
            <Image
              src="/footer-applepay.svg"
              width={50}
              height={50}
              alt="x"
              className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
              unoptimized
            />
            <Image
              src="/footer-visa.svg"
              width={50}
              height={50}
              alt="x"
              className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
              unoptimized
            />
            <Image
              src="/footer-mastercard.svg"
              width={50}
              height={50}
              alt="x"
              className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
              unoptimized
            />
            <Image
              src="/footer-klarna.svg"
              width={50}
              height={50}
              alt="x"
              className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
              unoptimized
            />
            <Image
              src="/footer-paypal.svg"
              width={50}
              height={50}
              alt="x"
              className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
              unoptimized
            />
          </div>
        </>

        <div className="mt-6 lg:mt-0">
          <h4 className="font-semibold mb-3">{t("deliveryService")}</h4>

          <div className="flex gap-4 mt-2 lg:mt-4 flex-wrap">
            <Image
              src="/dpd-footer.png"
              width={50}
              height={50}
              alt="x"
              className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
              unoptimized
            />
            <Image
              src="/amm-footer.webp"
              width={50}
              height={50}
              alt="x"
              className="w-auto h-10 object-contain hover:scale-110 duration-300 transition-all"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Cột 4: Social (ngoài, không thêm locale) */}
      <div className="footer-column lg:col-span-12 col-span-6 flex items-center justify-start flex-col">
        {/* <h4 className="font-semibold lg:mb-3 mb-0">Mehr entdecken</h4> */}
        <div className="flex gap-1 mt-2 lg:mt-8">
          {/* <Link
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
          </Link> */}
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

        <div className="text-sm mt-2 text-center">
          Copyright © 2025 Prestige Home Gmbh. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
