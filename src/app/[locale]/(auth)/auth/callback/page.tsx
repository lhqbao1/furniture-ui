// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BeatLoader, FadeLoader } from "react-spinners";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";

export default function CallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [userId, setUserId] = useAtom(userIdAtom);

  useEffect(() => {
    const token = params.get("token");
    const user_id = params.get("user_id");

    if (token) {
      localStorage.setItem("access_token", token);
      if (user_id) setUserId(user_id);

      // Điều hướng đến trang sau khi đăng nhập
      router.push("/");
    }
  }, [params, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay mờ + blur */}
      <div className="absolute inset-0 backdrop-blur-sm" />

      {/* card spinner */}
      <div
        role="status"
        aria-live="polite"
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <BeatLoader
          color="#00B159"
          size={20}
        />
      </div>
    </div>
  );
}
