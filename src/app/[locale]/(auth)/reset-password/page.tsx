import ForgotPasswordEmail from "@/components/layout/auth/forgot-password-email";
import Image from "next/image";
import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ResetPasswordForm from "@/components/layout/auth/reset-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const LoginPage = () => {
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
      <div className="lg:col-span-5 col-span-12 flex lg:items-center items-start justify-center">
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default LoginPage;
