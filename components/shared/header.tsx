import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import ProductSearch from "./product-search";
import { useLocale, useTranslations } from "next-intl";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShoppingCart, User, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileProductSearch from "./mobile-product-search";
import { getCartItems } from "@/features/cart/api";
import { toast } from "sonner";
import { getMe } from "@/features/auth/api";
import { Link, usePathname, useRouter } from "@/src/i18n/navigation";
import { useCartLocal } from "@/hooks/cart";
import { useIsPhone } from "@/hooks/use-is-phone";
import { CartDrawer } from "./cart-drawer";
import { LoginDrawer } from "./login-drawer";
import { Button } from "../ui/button";

interface PageHeaderProps {
  hasSideBar?: boolean;
}

const PageHeader = ({ hasSideBar = false }: PageHeaderProps) => {
  const router = useRouter();
  const t = useTranslations();
  const isPhone = useIsPhone();
  const [open, setOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const pathName = usePathname();
  const locale = useLocale();

  const queryClient = useQueryClient();

  const [userId, setUserId] = React.useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("userId") : "",
  );

  //Get cart local and server
  const { cart: localCart } = useCartLocal();
  const {
    data: cart,
    isLoading: isLoadingCart,
    isError: isErrorCart,
  } = useQuery({
    queryKey: ["cart-items", userId],
    queryFn: async () => {
      const data = await getCartItems();
      return data;
    },
    enabled: !!userId,
    retry: false,
  });

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

  const displayedCart = userId
    ? cart?.reduce((count, group) => count + group.items.length, 0) ?? 0
    : localCart.length;

  return (
    <div
      className="home-banner-top__content sticky top-0 overflow-hidden z-50 flex flex-row gap-4 h-16 w-full bg-white shadow-secondary/10 shadow-xl py-4 items-center px-4 
    lg:flex lg:items-center lg:justify-end lg:px-4 lg:py-3 lg:gap-6"
    >
      {/*Product search desktop */}
      <div className="hidden lg:block flex-1">
        <ProductSearch />
      </div>

      <div className="flex h-full items-center justify-end w-full lg:w-fit gap-3 lg:items-end lg:gap-6">
        {/*Mobile Search */}
        <div className="block lg:hidden">
          <MobileProductSearch />
        </div>

        {/*Shopping cart */}
        <div className="lg:hidden">
          <CartDrawer
            openCart={openCart}
            setOpenCart={setOpenCart}
            cartNumber={displayedCart}
          />
        </div>
        <div className="hidden lg:block relative">
          <Link
            href={`/cart`}
            className={`cursor-pointer relative`}
            aria-label="Go to cart"
          >
            <ShoppingCart
              stroke={`#4D4D4D`}
              size={30}
              className="hover:scale-110 transition-all duration-300"
            />
            {displayedCart && displayedCart > 0 ? (
              <span className="absolute -top-1.5 -right-1 flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-red-500"></span>
              </span>
            ) : (
              ""
            )}
          </Link>
        </div>

        {/*User */}
        {/* User section — ẩn icon nếu đang ở trang cart/checkout mà chưa login */}
        {/* {!(
          !userId &&
          (pathName.endsWith("/cart") || pathName.endsWith("/check-out"))
        ) && (
         
        )} */}
        <>
          {isLoadingUser ? (
            // Loading state
            <User
              stroke="#4D4D4D"
              size={24}
              className="animate-pulse opacity-50"
            />
          ) : user ? (
            // Logged in -> dropdown
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <User
                    className="cursor-pointer hover:scale-110 transition-all duration-300"
                    stroke="#4D4D4D"
                    size={30}
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

        {hasSideBar ? (
          <SidebarTrigger
            className={`border-none text-[#4D4D4D] relative`}
            isMobile={isPhone ? true : false}
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PageHeader;
