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
import { usePathname } from "next/navigation"

export function AdminSideBar() {
    const pathname = usePathname()

    const items = [
        {
            title: "Products",
            url: "/admin/products",
            icon: ChevronRight,
            children: [
                { title: "Add Product", url: "/admin/products/add", icon: CornerDownRight },
                { title: "Product List", url: "/admin/products/list", icon: CornerDownRight },
                { title: "Category List", url: "/admin/products/categories", icon: CornerDownRight },
            ],
        },
        {
            title: "Orders",
            url: "/admin/orders",
            icon: ChevronRight,
            children: [
                { title: "Order List", url: "/admin/orders/list", icon: CornerDownRight },
                { title: "Order Details", url: "/admin/orders/details", icon: CornerDownRight },
            ],
        },
        {
            title: "CRM",
            url: "/admin/crm",
            icon: ChevronRight,
            children: [
                { title: "Customer List", url: "/admin/crm/customers", icon: CornerDownRight },
            ],
        },
        {
            title: "Invoice",
            url: "/admin/invoices",
            icon: ChevronRight,
            children: [
                { title: "Invoice List", url: "/admin/invoices/list", icon: CornerDownRight },
                { title: "Create Invoice", url: "/admin/invoices/create", icon: CornerDownRight },
            ],
        },
        {
            title: "Setting",
            url: "/admin/setting",
            icon: ChevronRight,
        },
    ];



    return (
        <Sidebar className="app-sidebar custom-scroll">
            <SidebarContent>
                <SidebarGroup>
                    <div className="side-bar__logo px-5 py-6 flex flex-col items-center gap-3">
                        <Image
                            className="h-[100px] w-fit"
                            src="/new-logo.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                        />
                        <div className="font-libre text-2xl flex gap-1">
                            <span className="text-secondary">Prestige</span>
                            <span className="text-primary">Home</span>
                        </div>
                    </div>
                    <SidebarGroupContent className="px-2">
                        <SidebarMenu className="gap-3">
                            {items.map((item) => {
                                const isActive = pathname === item.url

                                // Nếu có children → dùng Collapsible
                                if (item.children) {
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <Collapsible>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton asChild>
                                                        <button
                                                            className={`flex w-full flex-row items-center justify-between gap-4 !rounded-full px-4 py-6 transition-colors hover:[&_svg]:stroke-white  ${isActive ? "bg-primary text-white" : "hover:bg-orange-100"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <item.icon
                                                                    size={24}
                                                                    stroke={isActive ? "#fff" : "#FAA61A"}
                                                                />
                                                                <span className="text-lg">{item.title}</span>
                                                            </div>
                                                            <ChevronDown className="size-4 opacity-70" />
                                                        </button>
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent
                                                    style={{ transition: "none" }} // tắt inline transition Radix
                                                    className="ml-6 flex flex-col gap-3 mt-3 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
                                                >
                                                    {item.children.map((child) => {
                                                        const isChildActive = pathname === child.url
                                                        return (
                                                            <a
                                                                key={child.title}
                                                                href={child.url}
                                                                className={`flex flex-row gap-3 rounded-full px-3 py-2 text-base transition-colors ${isChildActive
                                                                    ? "bg-primary/70 text-white"
                                                                    : "text-muted-foreground hover:bg-primary/90 hover:text-white"
                                                                    }`}
                                                            >
                                                                <child.icon />
                                                                <span>{child.title}</span>
                                                            </a>
                                                        )
                                                    })}
                                                </CollapsibleContent>

                                            </Collapsible>
                                        </SidebarMenuItem>
                                    )
                                }

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a
                                                href={item.url}
                                                className={`flex flex-row items-center gap-4 !rounded-full px-4 py-6 transition-colors ${isActive ? "bg-orange-500 text-white" : "hover:bg-orange-100"
                                                    }`}
                                            >
                                                <item.icon
                                                    size={48}
                                                    className="!size-6"
                                                    stroke={isActive ? "#fff" : "#FAA61A"}
                                                />
                                                <span className="text-lg">{item.title}</span>
                                            </a>
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
