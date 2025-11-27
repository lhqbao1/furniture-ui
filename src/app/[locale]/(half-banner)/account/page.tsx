import AccountForm from "@/components/layout/account/account-form";
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import { getTranslations } from "next-intl/server";
import React from "react";

const AccountPage = async () => {
  const t = await getTranslations();
  return (
    <div className="space-y-6 lg:pb-12 pb-4">
      <div>
        <CustomBreadCrumb currentPage={t("account")} />
      </div>
      <div className="lg:px-30">
        <AccountForm />
      </div>
    </div>
  );
};

export default AccountPage;
