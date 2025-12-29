"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import { getMe } from "@/features/auth/api";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { toast } from "sonner";
import { LoginDrawer } from "@/components/shared/login-drawer";
import { useMediaQuery } from "react-responsive";

const HeaderUserLogin = () => {
  const [userId, setUserId] = useAtom(userIdAtom);
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const pathName = usePathname();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useQuery({
    queryKey: ["me", userId],
    queryFn: () => getMe(),
    enabled: !!userId,
  });

  const onLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("userId");
    localStorage.removeItem("checkout");
    localStorage.removeItem("payment");

    toast.success("Logged out successfully");

    // Reset react-query cache liên quan đến user/session
    queryClient.removeQueries({ queryKey: ["me"], exact: true });
    queryClient.refetchQueries({ queryKey: ["me"], exact: true });
    queryClient.removeQueries({ queryKey: ["user"], exact: true });
    queryClient.refetchQueries({ queryKey: ["user"], exact: true });
    queryClient.refetchQueries({ queryKey: ["cart-items"], exact: true });

    setUserId(null); // cập nhật lại state để trigger re-render
    // queryClient.removeQueries({ queryKey: ["cart-items"], exact: true });
  };

  return (
    <>
      {isLoadingUser ? (
        // Loading state
        <User
          stroke="#4D4D4D"
          className="animate-pulse opacity-50 w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
        />
      ) : user ? (
        // Logged in -> dropdown
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <User
                className="cursor-pointer hover:scale-110 transition-all duration-300 w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
                stroke="#4D4D4D"
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              className="w-48 !absolute top-0 lg:-left-[180px] -left-[180px]
                        data-[state=open]:slide-in-from-right duration-500
                        data-[state=closed]:slide-out-to-right"
            >
              <DropdownMenuLabel>
                {t("greeting")}, {user.last_name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/my-order", { locale })}
              >
                {t("myOrder")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/account", { locale })}
              >
                {t("accountInformation")}
              </DropdownMenuItem>
              {/* Ẩn nút Logout nếu đang ở trang /cart hoặc /check-out */}
              {!pathName.endsWith("/cart") &&
                !pathName.endsWith("/check-out") && (
                  <DropdownMenuItem onClick={onLogout}>
                    {t("logout")}
                  </DropdownMenuItem>
                )}
              <Link href={`/wishlist`}>
                <DropdownMenuItem>{t("wishlist")}</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        // Not logged in -> Login drawer
        <LoginDrawer
          openLogin={open}
          setOpenLogin={setOpen}
          setUserId={setUserId}
        />
      )}
    </>
  );
};

export default HeaderUserLogin;
