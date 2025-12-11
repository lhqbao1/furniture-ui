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
    <div className="grid grid-cols-12 w-screen h-screen">
      <div className="lg:col-span-7 lg:block hidden relative">
        <Image
          src={"/login.webp"}
          fill
          alt=""
          className="absolute w-full h-full object-cover top-0"
        />
      </div>
      <div className="lg:col-span-5 col-span-12 flex items-center justify-center">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
