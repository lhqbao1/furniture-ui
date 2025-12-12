import AccountForm from "@/components/layout/account/account-form";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React from "react";

export const metadata: Metadata = {
  title: "Kontoinformationen – Prestige Home",
  description:
    "Verwalten Sie Ihre persönlichen Daten sicher in Ihrem Prestige Home Konto.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const AccountPage = async () => {
  const t = await getTranslations();
  return (
    <div className="space-y-6 lg:pb-12 pb-4">
      <div>
        <CustomBreadCrumb currentPage={t("account")} />
      </div>
      <div className="lg:px-12">
        <AccountForm />
      </div>
    </div>
  );
};

export default AccountPage;
