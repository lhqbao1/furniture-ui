"use client";

import dynamic from "next/dynamic";

const AwinTracker = dynamic(
  () => import("@/components/shared/awin-tracker").then((mod) => mod.AwinTracker),
  { ssr: false },
);
const AwinAttribution = dynamic(
  () =>
    import("@/components/shared/awin/awin-attribution").then(
      (mod) => mod.AwinAttribution,
    ),
  { ssr: false },
);
const AuthSanity = dynamic(
  () => import("@/hooks/auth/auth-sanity").then((mod) => mod.AuthSanity),
  { ssr: false },
);
const WhatsAppChatBox = dynamic(
  () => import("@/components/shared/whatsapp-box-chat"),
  { ssr: false },
);

export default function LocaleClientBoot() {
  return (
    <>
      <AwinTracker />
      <AwinAttribution />
      <AuthSanity />
      <WhatsAppChatBox />
    </>
  );
}
