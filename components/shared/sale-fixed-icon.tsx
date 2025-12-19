"use client";

import { usePathname } from "@/src/i18n/navigation";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X } from "lucide-react";
import { useAtom } from "jotai";
import { currentVoucherAtom, lastVoucherAtom } from "@/store/voucher";
const VOUCHER_ID = "aa05d81b-b665-4e0f-be55-5497e2e3ea84";

const SaleFixedIcon = () => {
  const pathname = usePathname();
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  const [currentVoucher, setCurrentVoucher] = useAtom(currentVoucherAtom);
  const [lastVoucher, setLastVoucher] = useAtom(lastVoucherAtom);
  const isApplied = currentVoucher === VOUCHER_ID;

  // Mount check (avoid hydration issue)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate IN
  useEffect(() => {
    if (!mounted || !boxRef.current) return;

    gsap.fromTo(
      boxRef.current,
      { x: 200, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out",
      },
    );
  }, [mounted]);

  // Hide animation
  const handleClose = () => {
    if (!boxRef.current) return;

    gsap.to(boxRef.current, {
      x: 200,
      opacity: 0,
      duration: 0.5,
      ease: "power3.in",
      onComplete: () => {
        setVisible(false);
        setCurrentVoucher(null);
        setLastVoucher(null);
      },
    });
  };

  // 👉 Click vào ảnh
  const handleClickVoucher = () => {
    if (isApplied) {
      // 🔁 remove voucher
      setCurrentVoucher(null);
      setLastVoucher(null);
      setVisible(false);
    } else {
      // ✅ apply voucher
      setCurrentVoucher(VOUCHER_ID);
      setLastVoucher(null);
      setVisible(false);
    }
  };

  // Conditions
  if (!mounted || !visible || pathname.includes("/admin")) {
    return null;
  }

  return (
    <div
      ref={boxRef}
      className="fixed bottom-24 right-6 z-[1000] cursor-pointer pointer-events-auto"
    >
      <div className="relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-white rounded-full shadow-xl p-1 hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        {/* Clickable image */}
        <button
          type="button"
          onClick={handleClickVoucher}
          className="block cursor-pointer"
          aria-label="Activate voucher"
        >
          <Image
            src="/10eur.svg"
            width={150}
            height={250}
            alt="Promotion"
            priority
          />
        </button>
      </div>
    </div>
  );
};

export default SaleFixedIcon;
