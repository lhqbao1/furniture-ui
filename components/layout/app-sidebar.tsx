'use client'
import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "../ui/button"
import Link from "next/link"
import { useGetCategories } from "@/features/category/hook"
import { CategoryResponse } from "@/types/categories"
import { useTranslations } from "next-intl"

type MenuItem = {
    title: string;
    url: string;
    icon: string;
    children?: MenuItem[];
};

export function AppSidebar() {
    const [open, setOpen] = useState(false)
    const [openItem, setOpenItem] = useState<string | null>(null)
    const { data: categories, isLoading, isError } = useGetCategories()
    const t = useTranslations()

    function mapCategories(categories: CategoryResponse[]): MenuItem[] {
        return categories.map((category) => ({
            title: category.name,
            url: `/${category.name.toLowerCase()}`,
            icon: category.img_url,
            children: category.children ? mapCategories(category.children) : undefined
        }));
    }

    const pathname = usePathname()
    const router = useRouter()
    const items = [
        { title: t('home'), url: "/", icon: '/side-home.png' },
        { title: t('shopAll'), url: "/shop-all", icon: '/shop-all.png' },
        { title: t('bestSeller'), url: "/best-seller", icon: '/side-best.png' },
        { title: t('flashSale'), url: "/flash-sale", icon: '/side-sale.png' },
        {
            title: t('categories'),
            url: "#",
            icon: '/side-category.png',
            children: categories && categories.length > 0 ? mapCategories(categories) : undefined
        },
        { title: t('viewed'), url: "/recent-viewed", icon: '/side-view.png' },
        { title: t('wishlist'), url: "/wishlist", icon: '/side-wishlist.png' },
        { title: t('cart'), url: "/cart", icon: '/side-cart.png' },
        { title: t('order'), url: "/my-order", icon: '/side-order.png' },
        { title: t('account'), url: "/account", icon: '/side-account.png' },
    ]

    return (
        <Sidebar className="app-sidebar custom-scroll" collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <Link href={'/'}>
                        <div className="side-bar__logo px-5 py-6 flex flex-col items-center gap-3 group-data-[collapsible=icon]:[&>div]:hidden cursor-pointer">
                            <Image
                                src="/new-logo.svg"
                                alt="Prestige Home logo"
                                width={100}
                                height={100}
                                priority
                                className="w-auto lg:h-[80px] h-[50px] group-data-[collapsible=icon]:h-[50px] group-data-[collapsible=icon]:mb-6"
                            />
                            <div className="font-libre lg:text-[29px] text-xl flex gap-1">
                                <span className="text-secondary font-semibold">Prestige</span>
                                <span className="text-primary font-semibold">Home</span>
                            </div>
                        </div>
                    </Link>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-3">
                            {items.map((item) => {
                                const isActive = pathname === item.url
                                const isOpen = openItem === item.title

                                // Nếu có children → dùng Collapsible
                                if (item.children) {
                                    return (
                                        <SidebarMenuItem key={item.title} className="flex justify-start">
                                            <Collapsible
                                                className="w-full"
                                                open={isOpen}
                                                onOpenChange={(open) => setOpenItem(open ? item.title : null)}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton asChild>
                                                        <Button
                                                            className={`flex w-full flex-row items-center justify-start gap-4 rounded-none px-4 py-6 transition-colors data-[state=open]:hover:bg-secondary-30 data-[state=open]:hover:text-black ${isActive
                                                                ? "bg-secondary/20 text-[#4D4D4D] hover:text-black"
                                                                : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
                                                                }`}
                                                            variant={"ghost"}
                                                        >
                                                            <div className="w-8">
                                                                <Image
                                                                    src={item.icon}
                                                                    height={40}
                                                                    width={40}
                                                                    alt=""
                                                                    className="lg:w-8 lg:h-8 w-6 h-6"
                                                                />
                                                            </div>
                                                            <span className="lg:text-lg text-lg">{item.title}</span>
                                                            <ChevronDown
                                                                className={`size-4 opacity-70 transition-transform ${open ? "rotate-180" : ""
                                                                    }`}
                                                            />
                                                        </Button>
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent
                                                    style={{ transition: "none" }}
                                                    className="flex flex-col gap-3 mt-3 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
                                                >
                                                    {item.children.map((child) => {
                                                        const isChildActive = pathname === child.url
                                                        return (
                                                            <Button
                                                                key={child.title}
                                                                onClick={() => {
                                                                    router.push(child.url)
                                                                }}
                                                                variant={"ghost"}
                                                                className={`relative flex flex-row items-center justify-start pl-12 gap-3 rounded-md py-1 text-base transition-colors ${isChildActive
                                                                    ? "bg-secondary/20 text-[#4D4D4D] !hover:bg-secondary/20"
                                                                    : "hover:bg-secondary/20 hover:text-foreground text-[#4D4D4D]"
                                                                    }`}
                                                            >
                                                                <span>{child.title}</span>

                                                                {/* chỉ render indicator nếu Collapsible mở */}
                                                                {open && isChildActive && (
                                                                    <span className="absolute w-1 h-full bg-secondary right-0"></span>
                                                                )}
                                                            </Button>
                                                        )
                                                    })}
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </SidebarMenuItem>
                                    )
                                }

                                // Nếu không có children → render bình thường
                                return (
                                    <SidebarMenuItem key={item.title} className="flex justify-center">
                                        <SidebarMenuButton asChild>
                                            <Button
                                                onClick={() => {
                                                    router.push(item.url)
                                                }}
                                                className={`relative flex flex-row items-center justify-start rounded-none gap-3 px-4 py-6 transition-colors ${isActive
                                                    ? "bg-secondary/20 text-[#4D4D4D] hover:text-black hover:bg-secondary/20"
                                                    : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
                                                    }`}
                                                variant={"ghost"}
                                            >
                                                <div className="w-8">
                                                    <Image
                                                        src={item.icon}
                                                        height={40}
                                                        width={40}
                                                        alt=""
                                                        className="lg:w-8 lg:h-8 w-6 h-6"
                                                    />
                                                </div>
                                                <span className="lg:text-lg text-lg">{item.title}</span>
                                                {isActive && !open && (
                                                    <span className="absolute w-1 h-full bg-secondary right-0"></span>
                                                )}
                                            </Button>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
