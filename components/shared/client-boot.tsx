"use client";

import dynamic from "next/dynamic";

const RuntimeErrorLogger = dynamic(
  () => import("@/components/shared/error/runtime-error-logger"),
  { ssr: false },
);
const TrustedShops = dynamic(
  () =>
    import("@/components/shared/trusted-shop").then((mod) => mod.TrustedShops),
  { ssr: false },
);
const BilligerSoluteLanding = dynamic(
  () =>
    import("@/components/shared/billiger/landing").then(
      (mod) => mod.BilligerSoluteLanding,
    ),
  { ssr: false },
);
const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false },
);

export default function ClientBoot() {
  return (
    <>
      <BilligerSoluteLanding />
      <RuntimeErrorLogger />
      <TrustedShops />
      <Toaster
        expand
        richColors
        position="top-right"
        closeButton
        toastOptions={{
          className:
            "bg-[rgba(81,190,140,0.2)] text-white z-100 top-10 translate-y-10",
        }}
      />
    </>
  );
}
