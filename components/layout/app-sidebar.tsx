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
    useSidebar
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "../ui/button"
import { useGetCategories } from "@/features/category/hook"
import { CategoryResponse } from "@/types/categories"
import { useTranslations } from "next-intl"
    ;
import { slugify } from "@/lib/slugify"
import { useMediaQuery } from "react-responsive"
import { Link, useRouter } from "@/src/i18n/navigation"
import { useAtom } from "jotai"
import { currentCategoryIdAtom, currentCategoryNameAtom } from "@/store/category"

type MenuItem = {
    title: string;
    url: string;
    children?: MenuItem[];
    id: string
};

type AppSidebarProps = {
    categories: CategoryResponse[]
    defaultOpen?: boolean
}

export default function AppSidebar({ categories, defaultOpen = true }: AppSidebarProps) {
    const { open: sidebarOpen, setOpen } = useSidebar()  // true = expanded, false = collapsed
    const t = useTranslations()
    const [currentCategoryId, setCurrentCategoryId] = useAtom(currentCategoryIdAtom)
    const [currentCategoryName, setCurrentCategoryName] = useAtom(currentCategoryNameAtom)



    function mapCategories(categories: CategoryResponse[]): MenuItem[] {
        return categories.map((cat) => ({
            id: cat.id,
            title: cat.name,
            url: `/product/${slugify(cat.name)}`,
            children: cat.children && cat.children.length > 0 ? mapCategories(cat.children) : undefined,
        }))
    }


    const pathname = usePathname()
    const router = useRouter()

    // Đồng bộ state sidebar với prop defaultOpen
    React.useEffect(() => {
        if (pathname === "/cart" || pathname === "/check-out") {
            setOpen(false) // ép đóng khi vào cart/checkout
        }
    }, [pathname])

    const newProducts: MenuItem = { title: t("newProducts"), url: "/new-products", id: "new-products" };
    const sale: MenuItem = { title: t("sale"), url: "/sale", id: "sale" };

    const accountMenu: MenuItem = {
        title: t("account"),
        url: "#",
        id: 'account',
        children: [
            { title: t("order"), url: "/my-order", id: 'order' },
            { title: t("profile"), url: "/account", id: 'profile' },
            { title: t("wishlist"), url: "/wishlist", id: 'wishlist' },
            { title: t("cart"), url: "/cart", id: 'cart' },
        ],
    };

    const items: MenuItem[] = [
        newProducts,
        sale,
        ...(categories && categories.length > 0 ? mapCategories(categories) : []),
        accountMenu
    ];


    const [openItem, setOpenItem] = useState<string | null>()

    return (
        <Sidebar className="app-sidebar custom-scroll" collapsible="offcanvas"
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
                        </div>
                    </Link>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-3">
                            {items.map((item) => {
                                const isActive = pathname === item.url
                                const isOpen = openItem === item.id
                                // Nếu có children → dùng Collapsible
                                if (item.children) {
                                    return (
                                        <SidebarMenuItem key={item.id} className={`flex justify-start ${item.id === 'account' ? 'border-t-2 border-black/50' : ''}`}>
                                            <Collapsible
                                                className="w-full"
                                                open={isOpen}
                                                onOpenChange={(open) => setOpenItem(open ? item.id : null)}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton asChild>
                                                        <Button
                                                            className={`flex w-full flex-row items-center justify-start gap-3 rounded-none px-4 py-6 transition-colors data-[state=open]:hover:bg-secondary-30 data-[state=open]:hover:text-black hover:[&>svg]:stroke-black ${isActive
                                                                ? "bg-secondary/20 text-[#4D4D4D] hover:text-black"
                                                                : "hover:bg-secondary/20 text-[#4D4D4D] hover:text-black"
                                                                }`}
                                                            variant={"ghost"}
                                                        >
                                                            <span className="lg:text-lg text-lg">{item.title}</span>
                                                            <ChevronDown
                                                                className={`size-4 opacity-70 transition-transform text-[#4D4D4D] ${isOpen ? "rotate-180" : ""
                                                                    }`}
                                                            />
                                                        </Button>
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>

                                                {sidebarOpen && isOpen && (
                                                    <CollapsibleContent
                                                        // style={{ transition: "all" }}
                                                        className="flex flex-col gap-1.5 mt-1 overflow-hidden [data-state=closed]:hidden [data-state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
                                                    >
                                                        {item.children.map((child) => {
                                                            const isChildActive = pathname === child.url
                                                            return (
                                                                <Button
                                                                    key={child.id}
                                                                    onClick={() => {
                                                                        router.push(child.url)
                                                                        if (item.url && item.url.includes("product")) {
                                                                            setCurrentCategoryId(child.id)
                                                                            setCurrentCategoryName(child.title)
                                                                        }
                                                                    }}
                                                                    variant={"ghost"}
                                                                    className={`relative flex flex-row items-start justify-start lg:pl-16 pl-4 text-wrap gap-3 h-fit rounded-none py-1 flex-wrap max-w-full text-base transition-colors ${isChildActive
                                                                        ? "bg-secondary/20 text-[#4D4D4D] !hover:bg-secondary/20"
                                                                        : "hover:bg-secondary/20 hover:text-foreground text-[#4D4D4D]"
                                                                        }`}
                                                                >
                                                                    <span className="text-wrap lg:text-[17px] text-start">{child.title}</span>
                                                                    {isOpen && isChildActive && (
                                                                        <span className="absolute w-1 h-full bg-secondary right-0 top-0"></span>
                                                                    )}
                                                                </Button>
                                                            )
                                                        })}
                                                    </CollapsibleContent>
                                                )}

                                            </Collapsible>
                                        </SidebarMenuItem>
                                    )
                                }

                                // Nếu không có children → render bình thường
                                return (
                                    <SidebarMenuItem key={item.id} className={`flex justify-start ${item.id === 'sale' ? 'border-b-2 border-black/50' : ''}`}>
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
                                                <span className="lg:text-lg text-lg">{item.title}</span>
                                                {isActive && (
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
            {/* <SidebarFooter className="data-[state=collapsed]:justify-center data-[state=expanded]:justify-end flex-row ">
                <SidebarTrigger className={`cursor-pointer bg-transparent border-none text-secondary`} />
                {isPhone ? (
                    <Select
                        defaultValue="de"
                        onValueChange={(value) => {
                            if (value === "de") {
                                const path = pathname.startsWith('/en') ? pathname.replace('/en', '') : pathname
                                router.push(path)
                            } else if (value === "en") {
                                const path = pathname.startsWith('/en') ? pathname : `/en${pathname}`
                                router.push(path)
                            }
                        }}
                    >
                        <SelectTrigger className={`w-fit text-secondary text-xl font-bold xl:border-0 border-2 border-secondary`} placeholderColor iconColor="#00B159">
                            <SelectValue placeholder={t('german')} className='text-secondary' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="de" className='font-semibold'>{t('german')}</SelectItem>
                            <SelectItem value="en" className='font-semibold'>{t('english')}</SelectItem>
                        </SelectContent>
                    </Select>
                ) : ''}
            </SidebarFooter> */}
        </Sidebar>
    )
}
