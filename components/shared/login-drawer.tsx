"use client";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerClose,
  DrawerDescription,
} from "@/components/ui/drawer";
import { User, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import HeaderLoginForm from "../layout/header/header-login-form";
import { useQueryClient } from "@tanstack/react-query";
import CartLoginForm from "../layout/cart/login-form-cart";
import { useRouter } from "@/src/i18n/navigation";

export interface LoginDrawerProps {
  openLogin: boolean;
  setOpenLogin: (open: boolean) => void;
  setUserId: (id: string | null) => void;
  isCheckOut?: boolean;
}

export function LoginDrawer({
  openLogin,
  setOpenLogin,
  isCheckOut = false,
  setUserId,
}: LoginDrawerProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  return (
    <Drawer
      open={openLogin}
      onOpenChange={setOpenLogin}
      direction="left"
    >
      {isCheckOut ? (
        ""
      ) : (
        <DrawerTrigger asChild>
          <div className="relative">
            <User
              className="cursor-pointer hover:scale-110 transition-all duration-300 relative"
              stroke="#4D4D4D"
              size={30}
            />
          </div>
        </DrawerTrigger>
      )}

      <DrawerContent
        forceMount
        className="w-full h-full flex flex-col p-0 data-[vaul-drawer-direction=left]:w-full duration-500"
      >
        <DrawerTitle className="border-b-2 p-4 flex justify-between">
          <div className="uppercase font-bold text-xl">{t("login")}</div>
          <DrawerClose>
            <X />
          </DrawerClose>
        </DrawerTitle>
        <DrawerDescription></DrawerDescription>
        <div className="px-4 pb-6 space-y-2">
          <p className="text-black/70 text-lg">
            Melden Sie sich hier mit Ihren Kundendaten an.
          </p>
          {isCheckOut ? (
            <CartLoginForm
              onSuccess={() => {
                setOpenLogin(false);
                const uid = localStorage.getItem("user_id");
                setUserId(uid); // cập nhật state
                queryClient.refetchQueries({ queryKey: ["me"] });
                queryClient.refetchQueries({ queryKey: ["cart-items"] });
                router.push("/check-out", { locale });
              }}
              onError={() => {
                setOpenLogin(false);
                router.push("/check-out", { locale });
              }}
            />
          ) : (
            <HeaderLoginForm
              onSuccess={() => {
                const uid = localStorage.getItem("user_id");
                setUserId(uid); // cập nhật state
                queryClient.refetchQueries({ queryKey: ["me"] });
                queryClient.refetchQueries({ queryKey: ["cart-items"] });
                setOpenLogin(false);
              }}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
