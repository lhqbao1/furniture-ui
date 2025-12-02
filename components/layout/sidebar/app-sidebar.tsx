"use client";
import React, { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { usePathname } from "next/navigation";
import { Button } from "../../ui/button";
import { CategoryResponse } from "@/types/categories";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useAtom } from "jotai";
import {
  currentCategoryIdAtom,
  currentCategoryNameAtom,
} from "@/store/category";
import { useIsPhone } from "@/hooks/use-is-phone";
import Link from "next/link";
import Image from "next/image";
import { SidebarCollapsibleItem } from "./app-sidebar-collapsible";
import { userIdAtom } from "@/store/auth";

type MenuItem = {
  title: string;
  url: string;
  children?: MenuItem[];
  id: string;
};

type AppSidebarProps = {
  categories: CategoryResponse[];
  defaultOpen?: boolean;
};

export default function AppSidebar({
  categories,
  defaultOpen = true,
}: AppSidebarProps) {
  const {
    open: sidebarOpen,
    setOpen,
    openMobile,
    setOpenMobile,
  } = useSidebar();
  const [userId, setUserId] = useAtom(userIdAtom);

  const t = useTranslations();
  const locale = useLocale(); // 👈 thêm locale
  const [currentCategoryId, setCurrentCategoryId] = useAtom(
    currentCategoryIdAtom,
  );
  const [currentCategoryName, setCurrentCategoryName] = useAtom(
    currentCategoryNameAtom,
  );

  function mapCategories(
    categories: CategoryResponse[],
    parentSlug = "",
  ): MenuItem[] {
    return categories.map((cat) => {
      const currentSlug = parentSlug ? `${parentSlug}/${cat.slug}` : cat.slug;

      return {
        id: cat.id,
        title: cat.name,
        url: `/category/${currentSlug}`,
        children:
          cat.children && cat.children.length > 0
            ? mapCategories(cat.children, currentSlug)
            : undefined,
      };
    });
  }

  const pathname = usePathname();
  const router = useRouter();

  const newProducts: MenuItem = {
    title: t("newProducts"),
    url: "/new-products",
    id: "new-products",
  };
  const sale: MenuItem = { title: t("sale"), url: "/sale", id: "sale" };

  const accountMenu: MenuItem = {
    title: t("account"),
    url: "#",
    id: "account",
    children: [
      { title: t("order"), url: "/my-order", id: "order" },
      { title: t("profile"), url: "/account", id: "profile" },
      { title: t("wishlist"), url: "/wishlist", id: "wishlist" },
      { title: t("cart"), url: "/cart", id: "cart" },
    ],
  };

  const items: MenuItem[] = [
    // newProducts,
    // sale,
    ...(categories && categories.length > 0 ? mapCategories(categories) : []),
    // ...(userId ? [accountMenu] : []), // 👈 Chỉ thêm khi có userId
  ];

  const [openItem, setOpenItem] = useState<string | null>(null);
  const isPhone = useIsPhone();

  useEffect(() => {
    // Khi atom thay đổi từ component khác -> mở item tương ứng
    // Nếu currentCategoryId là falsy (undefined/null/""), sẽ đóng tất cả.
    setOpenItem(currentCategoryId ?? null);
  }, [currentCategoryId]);

  return (
    <Sidebar
      className="app-sidebar custom-scroll"
      collapsible="offcanvas"
    >
      <SidebarContent>
        <SidebarHeader className="flex items-end lg:items-center">
          <SidebarTrigger
            className={`border-none text-[#4D4D4D] relative lg:hidden`}
            isMobile={isPhone ? true : false}
            isClose
          />
        </SidebarHeader>
        <SidebarGroup className="h-full relative">
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {items.map((item) => {
                const isActive = pathname?.startsWith(item.url); // ✅ cho phép match /category/slug/...
                const isOpen =
                  currentCategoryId === item.id
                    ? openItem === currentCategoryId
                    : openItem === item.id;

                // Nếu có children → dùng Collapsible
                if (item.children) {
                  return (
                    <SidebarMenuItem
                      key={item.id}
                      className="flex justify-start"
                    >
                      <SidebarCollapsibleItem
                        item={item}
                        isOpen={isOpen}
                        onOpenChange={(open) => {
                          setOpenItem(open ? item.id : null);
                          if (!open && currentCategoryId === item.id) {
                            setCurrentCategoryId(null);
                            setCurrentCategoryName("");
                          }
                        }}
                        locale={locale}
                        isPhone={isPhone ?? false}
                        setOpenMobile={setOpenMobile}
                        setCurrentCategoryId={setCurrentCategoryId}
                        setCurrentCategoryName={setCurrentCategoryName}
                        pathname={pathname}
                      />
                    </SidebarMenuItem>
                  );
                }

                // Nếu không có children → render bình thường
                return (
                  <SidebarMenuItem
                    key={item.id}
                    // className={`flex justify-start ${
                    //   item.id === "sale" ? "border-b-2 border-black/50" : ""
                    // }`}
                    className="flex justify-start"
                  >
                    <SidebarMenuButton asChild>
                      <Button
                        onClick={() => {
                          router.push(item.url, { locale }); // 👈 thêm locale
                        }}
                        className={`relative flex flex-row items-center justify-start rounded-none gap-3 px-4 py-6 transition-colors ${
                          isActive
                            ? "bg-secondary/20 text-[#4D4D4D] hover:text-black hover:bg-secondary/20"
                            : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
                        }
                                                          focus:bg-secondary/20 active:bg-secondary/20 focus:text-black active:text-black

                                                      `}
                        variant={"ghost"}
                        hasEffect
                      >
                        <span className="lg:text-lg text-lg">{item.title}</span>
                        {isActive && (
                          <span className="absolute w-1 h-full bg-secondary right-0"></span>
                        )}
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
