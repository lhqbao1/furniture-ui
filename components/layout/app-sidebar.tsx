"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
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
    newProducts,
    sale,
    ...(categories && categories.length > 0 ? mapCategories(categories) : []),
    accountMenu,
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
          <div className={`flex flex-col gap-4 items-center`}>
            <Link
              href={`/`}
              className="relative w-16 h-16 hidden lg:flex"
            >
              <Image
                src="/new-logo.svg"
                alt=""
                fill
                style={{ objectFit: "contain" }}
              />
            </Link>
            <Link href={"/"}>
              <div
                className="hidden lg:flex text-[29px] gap-1"
                translate="no"
              >
                <span className="text-secondary font-bold">Prestige</span>
                <span className="text-primary font-bold">Home</span>
              </div>
            </Link>
          </div>
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
                      // className={`flex justify-start
                      //   ${
                      //     item.id === "account"
                      //       ? "border-t-2 border-black/50"
                      //       : ""
                      //   }
                      // `}
                      className="flex justify-start"
                    >
                      <Collapsible
                        className="w-full"
                        open={isOpen}
                        onOpenChange={(open) => {
                          setOpenItem(open ? item.id : null);
                          if (!open && currentCategoryId === item.id) {
                            setCurrentCategoryId(null); // nếu muốn clear atom khi đóng
                            setCurrentCategoryName("");
                          }
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Button
                              className={`flex w-full flex-row items-center justify-between gap-3 rounded-none px-4 py-6 transition-colors data-[state=open]:hover:bg-secondary-30 data-[state=open]:hover:text-black hover:[&>svg]:stroke-black ${
                                isActive
                                  ? "bg-secondary/20 text-[#4D4D4D] hover:text-black"
                                  : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
                              }
                                                                  focus:bg-secondary/20 active:bg-secondary/20 focus:text-black active:text-black
                                                                  `}
                              variant={"ghost"}
                              onClick={() => {
                                setCurrentCategoryId(item.id);
                              }}
                            >
                              <span className="lg:text-lg text-lg">
                                {item.title}
                              </span>
                              <ChevronDown
                                className={`size-4 opacity-70 transition-transform text-[#51BE8C] ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        {isOpen && (
                          <CollapsibleContent
                            // style={{ transition: "all" }}
                            className="flex flex-col gap-1.5 mt-1 overflow-hidden [data-state=closed]:hidden [data-state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
                          >
                            {item.children.map((child) => {
                              const isChildActive =
                                pathname === child.url ||
                                pathname === `/${locale}${child.url}`; // 👈 check kèm locale
                              return (
                                <Button
                                  key={child.id}
                                  onClick={() => {
                                    router.push(child.url, { locale }); // 👈 thêm locale
                                    if (isPhone) setOpenMobile(false);
                                    if (
                                      item.url &&
                                      item.url.includes("category")
                                    ) {
                                      setCurrentCategoryId(child.id);
                                      setCurrentCategoryName(child.title);
                                    }
                                  }}
                                  variant={"ghost"}
                                  className={`relative flex flex-row items-start justify-start lg:pl-8 pl-12 text-wrap gap-3 h-fit rounded-none py-1 flex-wrap max-w-full text-base transition-colors ${
                                    isChildActive
                                      ? "bg-secondary/20 text-[#4D4D4D] !hover:bg-secondary/20"
                                      : "hover:bg-secondary/20 hover:text-foreground text-[#4D4D4D]"
                                  }`}
                                >
                                  <span className="text-wrap lg:text-[17px] text-start">
                                    {child.title}
                                  </span>
                                  {isOpen && isChildActive && (
                                    <span className="absolute w-1 h-full bg-secondary right-0 top-0"></span>
                                  )}
                                </Button>
                              );
                            })}
                          </CollapsibleContent>
                        )}
                      </Collapsible>
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
