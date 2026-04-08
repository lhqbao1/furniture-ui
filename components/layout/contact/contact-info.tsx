"use client";

import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import Link from "next/link";

const ContactInfo = () => {
  const phoneLabel = "02921 327 20 38";
  const phoneHref = "tel:+4929213272038";

  return (
    <aside className="h-full rounded-3xl border border-[#E7EAEF] bg-white p-5 md:p-7 shadow-[0_10px_40px_rgba(20,34,51,0.08)] flex flex-col gap-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">
          Kontakt
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#101828]">
          Wir sind für Sie da
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#475467]">
          Sie erreichen unser Team telefonisch oder per E-Mail. Für Anfragen zu
          Bestellungen hilft uns Ihre Bestellnummer, damit wir schneller
          unterstützen können.
        </p>
      </div>

      <div className="space-y-3 flex-1">
        <div className="rounded-2xl border border-[#EBEEF2] bg-[#F8FAFC] p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3e6] text-primary">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#667085]">
                Telefon
              </p>
              <Link
                href={phoneHref}
                className="text-lg font-semibold text-[#0f172a] hover:text-primary transition-colors"
              >
                {phoneLabel}
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEEF2] bg-[#F8FAFC] p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f6ee] text-primary">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#667085]">
                Öffnungszeiten
              </p>
              <p className="text-base font-semibold text-[#0f172a]">
                Montag bis Freitag
              </p>
              <p className="text-sm text-[#475467]">08:00 - 17:00 Uhr</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBEEF2] bg-[#F8FAFC] p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4ff] text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#667085]">
                E-Mail
              </p>
              <Link
                href="mailto:support@prestige-home.de"
                className="text-base font-semibold text-[#0f172a] hover:text-primary transition-colors"
              >
                support@prestige-home.de
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#101828] px-4 py-3 mt-auto">
        <p className="text-xs uppercase tracking-wide text-white/70">
          Service-Hinweis
        </p>
        <p className="mt-1 text-sm text-white">
          Unser Team antwortet in der Regel innerhalb von 1 bis 2 Werktagen.
        </p>
      </div>
    </aside>
  );
};

export default ContactInfo;
