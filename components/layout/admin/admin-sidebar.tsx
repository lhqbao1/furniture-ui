"use client";

import { ChevronRight, CornerDownRight } from "lucide-react";
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
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "../../ui/button";
import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/navigation";

export function AdminSideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const items = [
    {
      title: "Products",
      url: "/admin/products",
      icon: ChevronRight,
      children: [
        {
          title: "Add Product",
          url: "/admin/products/add",
          icon: CornerDownRight,
        },
        {
          title: "Product List",
          url: "/admin/products/list",
          icon: CornerDownRight,
        },
        {
          title: "Product Group",
          url: "/admin/products/group",
          icon: CornerDownRight,
        },
        {
          title: "Category List",
          url: "/admin/products/categories",
          icon: CornerDownRight,
        },
        {
          title: "Brand List",
          url: "/admin/products/brand",
          icon: CornerDownRight,
        },
        {
          title: "Marketplace",
          url: "/admin/products/marketplace",
          icon: CornerDownRight,
        },
        {
          title: "Price Matching",
          url: "/admin/products/matching",
          icon: CornerDownRight,
        },
      ],
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: ChevronRight,
      children: [
        {
          title: "Order List",
          url: "/admin/orders/list",
          icon: CornerDownRight,
        },
        {
          title: "Create Order",
          url: "/admin/orders/add",
          icon: CornerDownRight,
        },
      ],
    },
    {
      title: "Logistics",
      url: "/admin/logistic",
      icon: ChevronRight,
      children: [
        {
          title: "Inventory",
          url: "/admin/logistic/inventory/list",
          icon: CornerDownRight,
        },
      ],
    },
    {
      title: "CRM",
      url: "/admin/crm",
      icon: ChevronRight,
      children: [
        {
          title: "Customer List",
          url: "/admin/crm/customers/list",
          icon: CornerDownRight,
        },
        {
          title: "Supplier List",
          url: "/admin/crm/supplier/list",
          icon: CornerDownRight,
        },
        {
          title: "Voucher List",
          url: "/admin/crm/vouchers/list",
          icon: CornerDownRight,
        },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: ChevronRight,
      children: [
        {
          title: "Policy",
          url: "/admin/settings/policy",
          icon: CornerDownRight,
        },
      ],
    },
    {
      title: "AMM",
      url: "/admin/amm",
      icon: ChevronRight,
      children: [
        { title: "We Avis", url: "/admin/amm/we-avis", icon: CornerDownRight },
      ],
    },
  ];

  // prepend locale vào url
  const withLocale = (url: string) => `${url}`;

  return (
    <Sidebar className="app-sidebar custom-scroll pointer-events-auto">
      <SidebarHeader className="items-end flex lg:hidden">
        <SidebarTrigger
          className={`border-none text-[#4D4D4D] relative`}
          isClose
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Link href={`/admin`}>
            <div className="side-bar__logo px-5 py-6 flex flex-col items-center gap-3 group-data-[collapsible=icon]:[&>div]:hidden cursor-pointer">
              <Image
                src="/new-logo.svg"
                alt="Prestige Home logo"
                width={100}
                height={100}
                priority
                unoptimized
                className="w-auto h-[80px] group-data-[collapsible=icon]:h-[50px] group-data-[collapsible=icon]:mb-6"
              />
              <div className="text-[29px] flex gap-1">
                <span className="text-secondary font-semibold">
                  Administrator
                </span>
              </div>
            </div>
          </Link>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {items.map((item) => {
                const isActive = pathname === withLocale(item.url);
                if (item.children) {
                  return (
                    <SidebarMenuItem
                      key={item.title}
                      className="flex flex-col"
                    >
                      <SidebarMenuButton asChild>
                        <Button
                          className={`flex w-full flex-row items-center justify-start gap-4 rounded-none px-4 py-6 transition-colors ${
                            isActive
                              ? "bg-secondary/20 text-[#4D4D4D] hover:text-black"
                              : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
                          }`}
                          variant="ghost"
                        >
                          <div className="w-8">
                            <item.icon
                              height={40}
                              width={40}
                            />
                          </div>
                          <span className="text-xl">{item.title}</span>
                        </Button>
                      </SidebarMenuButton>

                      {/* Luôn render children thay vì Collapsible */}
                      <div className="flex flex-col gap-3 mt-3">
                        {item.children.map((child) => {
                          const childUrl = withLocale(child.url);
                          const isChildActive =
                            pathname === withLocale(child.url);
                          return (
                            <Button
                              key={child.title}
                              onClick={() => router.push(childUrl, { locale })}
                              onMouseEnter={() => router.prefetch(childUrl)} // 👈 prefetch trước
                              variant="ghost"
                              className={`relative flex flex-row items-center justify-start pl-12 gap-3 rounded-md py-1 text-base transition-colors ${
                                isChildActive
                                  ? "bg-secondary/20 text-[#4D4D4D] hover:text-black"
                                  : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
                              }`}
                            >
                              <child.icon
                                size={20}
                                stroke="#00B159"
                              />
                              <span>{child.title}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Button
                        onClick={() => router.push(item.url, { locale })}
                        className={`relative flex flex-row items-center justify-start gap-3 px-4 py-6 transition-colors ${
                          isActive
                            ? "bg-secondary/20 text-[#4D4D4D] hover:text-black"
                            : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
                        }`}
                        variant="ghost"
                      >
                        <div className="w-8">
                          <item.icon
                            height={40}
                            width={40}
                          />
                        </div>
                        <span className="text-xl">{item.title}</span>
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
