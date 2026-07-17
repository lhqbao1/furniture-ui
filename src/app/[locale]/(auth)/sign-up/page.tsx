import SignUpForm from "@/components/layout/auth/signup-form";
import Image from "next/image";
import React from "react";

export const metadata = {
  title: "Registrierung",
  description:
    "Erstellen Sie Ihr Prestige Home Konto, um Bestellungen zu verwalten, exklusive Angebote zu erhalten und Ihre persönlichen Einstellungen zu speichern.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Registrierung",
    description:
      "Registrieren Sie sich, um auf Ihr Prestige Home Konto zuzugreifen und personalisierte Funktionen zu nutzen.",
    url: "/sign-up",
    siteName: "Prestige Home",
    type: "website",
  },
};

const SignUpPage = () => {
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
              Prestige Home Konto
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-pretty xl:text-4xl">
              Ihr Zuhause, Ihre Bestellungen, alles an einem Ort.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">
              Speichern Sie Ihre Daten sicher und verwalten Sie Bestellungen
              schneller beim nächsten Einkauf.
            </p>
          </div>
        </div>
      </div>
      <div className="col-span-12 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:col-span-5 lg:px-10">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
