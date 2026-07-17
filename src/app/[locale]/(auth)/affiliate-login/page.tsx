import LoginForm from "@/components/layout/auth/login-form";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Affiliate Anmeldung",
  description:
    "Sicherer Zugang fuer Affiliate Partner von Prestige Home. Diese Seite ist nicht indexierbar.",
  robots: {
    index: false,
    follow: false,
  },
};

const AffiliateLoginPage = () => {
  return (
    <div className="grid min-h-screen w-screen grid-cols-12 overflow-hidden bg-[#f7faf8]">
      <div className="relative hidden lg:col-span-7 lg:block">
        <Image
          src={"/login.webp"}
          fill
          priority
          sizes="58vw"
          alt="Modern eingerichtetes Wohnzimmer"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <div className="max-w-xl rounded-2xl border border-white/20 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-md">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/75">
              Prestige Home Affiliate
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-pretty xl:text-4xl">
              Partnerzugang mit klarer Übersicht.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">
              Melden Sie sich sicher an und verwalten Sie Ihre Affiliate-Daten
              in wenigen Schritten.
            </p>
          </div>
        </div>
      </div>
      <div className="col-span-12 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:col-span-5 lg:px-10">
        <LoginForm isAffiliate redirectTo="/affiliate" />
      </div>
    </div>
  );
};

export default AffiliateLoginPage;
