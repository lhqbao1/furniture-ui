'use client'
import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "../ui/button"
import Link from "next/link"
import { useGetCategories } from "@/features/category/hook"
import { CategoryResponse } from "@/types/categories"
import { useTranslations } from "next-intl"
    ;
import { slugify } from "@/lib/slugify"
type MenuItem = {
    title: string;
    url: string;
    icon: string;
    children?: MenuItem[];
    id: string
};

export function AppSidebar() {
    const [open, setOpen] = useState(false)
    const [openItem, setOpenItem] = useState<string | null>(null)
    const { data: categories, isLoading, isError } = useGetCategories()
    const t = useTranslations()

    // function mapCategories(categories: CategoryResponse[]): MenuItem[] {
    //     return categories.map((category) => ({
    //         title: category.name,
    //         url: `/product/${category.name.toLowerCase()}`,
    //         icon: category.img_url,
    //         children: category.children ? mapCategories(category.children) : undefined
    //     }));
    // }

    function mapCategories(categories: CategoryResponse[]): MenuItem[] {
        return categories.flatMap((category) =>
            category.children
                ? category.children.map((child) => ({
                    title: child.name,
                    url: `/product/${slugify(child.name)}`,
                    icon: child.img_url,
                    id: child.id
                }))
                : []
        )
    }


    const pathname = usePathname()
    const router = useRouter()
    const items = [
        { title: t('home'), url: "/", icon: '/side-home.png', id: 1 },
        { title: t('shopAll'), url: "/shop-all", icon: '/shop-all.png', id: 2 },
        { title: t('bestSeller'), url: "/product/best-seller", icon: '/side-best.png', id: 3 },
        { title: t('flashSale'), url: "/product/flash-sale", icon: '/side-sale.png', id: 4 },
        {
            title: t('categories'),
            url: "#",
            icon: '/side-category.png',
            id: 5,
            children: categories && categories.length > 0 ? mapCategories(categories) : undefined
        },
        { title: t('viewed'), url: "/recent-viewed", icon: '/side-view.png', id: 6 },
        { title: t('wishlist'), url: "/wishlist", icon: '/side-wishlist.png', id: 7 },
        { title: t('cart'), url: "/cart", icon: '/side-cart.png', id: 8 },
        { title: t('order'), url: "/my-order", icon: '/side-order.png', id: 9 },
        { title: t('account'), url: "/account", icon: '/side-account.png', id: 10 },
    ]

    return (
        <Sidebar className="app-sidebar custom-scroll" collapsible="icon"
        >
            <SidebarContent>
                <SidebarGroup className="h-full relative">
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
                                        <SidebarMenuItem key={item.id} className="flex justify-start">
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
                                                                    unoptimized
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
                                                    className="flex flex-col gap-3 mt-3 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down lg:h-[500px] lg:overflow-y-scroll"
                                                >
                                                    {item.children.map((child) => {
                                                        const isChildActive = pathname === child.url
                                                        return (
                                                            <Button
                                                                key={child.id}
                                                                onClick={() => {
                                                                    router.push(child.url)
                                                                }}
                                                                variant={"ghost"}
                                                                className={`relative flex flex-row items-start justify-start lg:pl-20 pl-4 text-wrap gap-3 h-fit rounded-md py-1 flex-wrap max-w-full text-base transition-colors ${isChildActive
                                                                    ? "bg-secondary/20 text-[#4D4D4D] !hover:bg-secondary/20"
                                                                    : "hover:bg-secondary/20 hover:text-foreground text-[#4D4D4D]"
                                                                    }`}
                                                            >
                                                                <span className="text-wrap text-start">{child.title}</span>

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
                                    <SidebarMenuItem key={item.id} className="flex justify-center">
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
                                                        unoptimized
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
            <SidebarFooter className="data-[state=collapsed]:items-center data-[state=expanded]:items-end">
                <SidebarTrigger className={`cursor-pointer bg-transparent border-none text-secondary`} />
            </SidebarFooter>
        </Sidebar>
    )
}
