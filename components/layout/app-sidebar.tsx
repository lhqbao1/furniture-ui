'use client'

import { Calendar, Home, Inbox, Search, Settings, ChevronDown, User } from "lucide-react"
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
import { Categories } from "@/data/data"
import { usePathname } from "next/navigation"

export function AppSidebar() {
    const pathname = usePathname()

    const items = [
        { title: "Home", url: "/", icon: Home },
        { title: "Best Seller", url: "/best-seller", icon: Inbox },
        { title: "Flash Sale", url: "/flash-sale", icon: Calendar },
        {
            title: "Categories",
            url: "#",
            icon: Search,
            children: Categories.map((category) => ({
                title: category.name,
                url: `/${category.name.toLowerCase()}`,
                icon: category.icon
            })),
        },
        { title: "Viewed", url: "/viewed", icon: Settings },
        { title: "Contact", url: "/contact", icon: Settings },
        { title: "Account", url: "/account", icon: User },

    ]

    return (
        <Sidebar className="app-sidebar custom-scroll">
            <SidebarContent>
                <SidebarGroup>
                    <div className="side-bar__logo px-5 py-6 flex flex-col items-center gap-3">
                        <Image
                            src="/new-logo.png"
                            alt="Prestige Home logo"
                            width={180}
                            height={100}   // match h-[100px]
                            priority
                            className="w-auto h-[100px]"
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
                                                            className={`flex w-full flex-row items-center justify-between gap-4 !rounded-full px-4 py-6 transition-colors ${isActive ? "bg-primary text-white" : "hover:bg-orange-100"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <item.icon
                                                                    size={24}
                                                                    stroke={isActive ? "#fff" : "#0028a0"}
                                                                />
                                                                <span className="text-xl">{item.title}</span>
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
                                                                className={`flex flex-row gap-3 rounded-md px-2 py-1 text-base transition-colors ${isChildActive
                                                                    ? "bg-primary text-white"
                                                                    : "text-muted-foreground hover:bg-orange-100 hover:text-foreground"
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

                                // Nếu không có children → render bình thường
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a
                                                href={item.url}
                                                className={`flex flex-row items-center gap-4 !rounded-full px-4 py-6 transition-colors ${isActive ? "bg-primary text-white" : "hover:bg-orange-100"
                                                    }`}
                                            >
                                                <item.icon
                                                    size={24}
                                                    className="!size-5"
                                                    stroke={isActive ? "#fff" : "#0028a0"}
                                                />
                                                <span className="text-xl">{item.title}</span>
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
