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
    <div className="grid h-screen w-screen grid-cols-12">
      <div className="col-span-12 flex items-start justify-center lg:col-span-5 lg:items-center">
        <LoginForm isAffiliate redirectTo="/affiliate" />
      </div>
      <div className="relative hidden lg:col-span-7 lg:block">
        <Image
          src={"/login.webp"}
          fill
          alt=""
          className="absolute top-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
};

export default AffiliateLoginPage;
