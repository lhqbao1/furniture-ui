"use client";

import type { ReactNode } from "react";

import Protected from "@/components/layout/auth/protected";

export default function ClientAffiliateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Protected redirectTo="/affiliate-login" loadingLabel="affiliate">
      {children}
    </Protected>
  );
}
