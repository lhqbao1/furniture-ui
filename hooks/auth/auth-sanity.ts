"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";

export function AuthSanity() {
  const [, setUserId] = useAtom(userIdAtom);
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    const token = localStorage.getItem("access_token");

    if (uid && !token) {
      localStorage.removeItem("user_id");
      setUserId(null);
    }
  }, []);

  return null;
}
