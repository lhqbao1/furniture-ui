'use client'

import { ChevronDown, ChevronRight, CornerDownRight } from "lucide-react"
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
import { useState } from "react"

export function AdminSideBar() {
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [openItem, setOpenItem] = useState<string | null>(null)

    const items = [
        {
            title: "Products",
            url: "/admin/products",
            icon: ChevronRight,
            children: [
                { title: "Add Product", url: "/admin/products/add", icon: CornerDownRight },
                { title: "Product List", url: "/admin/products/list", icon: CornerDownRight },
                { title: "Product Group", url: "/admin/products/group", icon: CornerDownRight },
                { title: "Category List", url: "/admin/products/categories", icon: CornerDownRight },
            ],
        },
        {
            title: "Orders",
            url: "/admin/orders",
            icon: ChevronRight,
            children: [
                { title: "Order List", url: "/admin/orders/list", icon: CornerDownRight },
            ],
        },
        {
            title: "CRM",
            url: "/admin/crm",
            icon: ChevronRight,
            children: [
                { title: "Customer List", url: "/admin/crm/customers/list", icon: CornerDownRight },
            ],
        },
    ];

    return (
        <Sidebar className="app-sidebar custom-scroll">
            <SidebarContent>
                <SidebarGroup>
                    <Link href={'/admin'}>
                        <div className="side-bar__logo px-5 py-6 flex flex-col items-center gap-3 group-data-[collapsible=icon]:[&>div]:hidden cursor-pointer">
                            <Image
                                src="/new-logo.svg"
                                alt="Prestige Home logo"
                                width={100}
                                height={100}
                                priority
                                className="w-auto h-[80px] group-data-[collapsible=icon]:h-[50px] group-data-[collapsible=icon]:mb-6"
                            />
                            <div className="font-libre text-[29px] flex gap-1">
                                <span className="text-secondary font-semibold">Administrator</span>
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
                                                                <item.icon
                                                                    // src={item.icon}
                                                                    height={40}
                                                                    width={40}
                                                                // alt=""
                                                                />
                                                            </div>
                                                            <span className="text-xl">{item.title}</span>
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
                                                                <child.icon
                                                                    size={24}
                                                                    className="!size-5"
                                                                    stroke="#00B159"
                                                                />
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
                                                    <item.icon
                                                        // src={item.icon}
                                                        height={40}
                                                        width={40}
                                                    // alt=""
                                                    />
                                                </div>
                                                <span className="text-xl">{item.title}</span>
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
