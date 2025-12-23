"use client";
import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { useTranslations } from "next-intl";

const LoginGoogleButton = () => {
  const t = useTranslations();

  const handleLoginGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}google/login`;
  };
  return (
    <div className="flex flex-col gap-4 justify-center items-center mt-8">
      <Button
        className="w-full"
        variant={"outline"}
        onClick={() => handleLoginGoogle()}
      >
        <Image
          src={"/google.svg"}
          width={20}
          height={20}
          alt=""
        />
        {t("continueWithGoogle")}
      </Button>
    </div>
  );
};

export default LoginGoogleButton;
