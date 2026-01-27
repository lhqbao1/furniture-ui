"use client";

import { LocationEdit, Mails, MapPin, PhoneCallIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

const ContactInfo = () => {
  const t = useTranslations();
  return (
    <div className="grid md:grid-cols-4 grid-cols-2 gap-4 md:w-3/4 w-full mx-auto mt-12">
      <div className="flex md:flex-row flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-3xl md:px-8 md:py-8 px-2 py-2 group transition-colors duration-400">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <Mails
            className="text-primary w-10 h-10"
            strokeWidth={1}
          />
        </div>
        <div className="text-center md:text-start">
          <h3 className="font-bold text-base text-black">{t("email")}</h3>
          <p className="text-gray-400 font-medium">info@prestige-home.de</p>
        </div>
      </div>
      <div className="flex md:flex-row flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-3xl md:px-8 md:py-8 px-2 py-2  group transition-colors duration-400">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <MapPin
            className="text-primary w-10 h-10"
            strokeWidth={1}
          />
        </div>
        <div className="text-center md:text-start">
          <h3 className="font-bold text-base text-black">{t("address")}</h3>
          <p className="text-gray-400 font-medium">
            Greifswalder Straße 226, 10405 Berlin
          </p>
        </div>
      </div>
      <div className="flex md:flex-row flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-3xl md:px-8 md:py-8 px-2 py-2  group transition-colors duration-400">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <PhoneCallIcon
            className="text-primary w-10 h-10"
            strokeWidth={1}
          />
        </div>
        <div className="text-center md:text-start">
          <h3 className="font-bold text-base text-black">
            {t("phone_number")}
          </h3>
          <p className="text-gray-400 font-medium">+49 30 814 537 080</p>
        </div>
      </div>
      <div className="flex md:flex-row flex-col items-center justify-center gap-4 cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-3xl md:px-8 md:py-8 px-2 py-2  group transition-colors duration-400">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <Mails
            className="text-primary w-10 h-10"
            strokeWidth={1}
          />
        </div>
        <div className="text-center md:text-start">
          <h3 className="font-bold text-base text-black">Öffnungszeiten</h3>
          <p className="text-gray-400 font-medium">
            Mo – Fr: 09:00 – 17:00 Uhr
          </p>
          <p className="text-xs text-gray-400">
            (Wir antworten in der Regel innerhalb von 1–2 Werktagen)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
