import LoginForm from "@/components/layout/auth/login-form";
import Image from "next/image";
import React from "react";

export const metadata = {
  title: "Anmeldung",
  description:
    "Melden Sie sich bei Ihrem Prestige Home Konto an, um Ihre Bestellungen, Einstellungen und persönlichen Daten zu verwalten.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Anmeldung",
    description:
      "Zugriff auf Ihr Prestige Home Konto. Verwalten Sie Bestellungen, Einstellungen und persönliche Daten.",
    url: "/login",
    siteName: "Prestige Home",
    type: "website",
  },
};

const LoginPage = () => {
  return (
    <div className="grid grid-cols-12 w-screen h-screen">
      <div className="lg:col-span-5 col-span-12 flex items-center justify-center">
        <LoginForm />
      </div>
      <div className="lg:col-span-7 lg:block hidden relative">
        <Image
          src={"/login.webp"}
          fill
          alt=""
          className="absolute w-full h-full object-cover top-0"
        />
      </div>
    </div>
  );
};

export default LoginPage;
