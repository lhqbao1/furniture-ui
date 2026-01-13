"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { NextIntlClientProvider } from "next-intl";
import { authHydratedAtom } from "@/store/auth";
import { useCheckAppVersion } from "@/hooks/useCheckVersion";

type Props = React.ComponentProps<typeof NextIntlClientProvider>;

export default function IntlClientProviderWithAuth({
  children,
  ...props
}: Props) {
  const [, setAuthHydrated] = useAtom(authHydratedAtom);
  useCheckAppVersion();

  useEffect(() => {
    setAuthHydrated(true);
  }, [setAuthHydrated]);

  return <NextIntlClientProvider {...props}>{children}</NextIntlClientProvider>;
}
