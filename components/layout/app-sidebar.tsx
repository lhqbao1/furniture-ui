'use client'
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { Categories } from "@/data/data"
import { usePathname } from "next/navigation"

export function AppSidebar() {
    const pathname = usePathname();

    const items = [
        {
            title: "Home",
            url: "/",
            icon: Home,
        },
        {
            title: "Best Seller",
            url: "/best-seller",
            icon: Inbox,
        },
        {
            title: "Flash Sale",
            url: "/flash-sale",
            icon: Calendar,
        },
        {
            title: "Category",
            url: "#",
            icon: Search,
            children: Categories.map((category) => ({
                title: category.name,
                url: `/${category.name.toLowerCase()}`,
                icon: category.icon
            })),
        },
        {
            title: "Viewed",
            url: "/viewed",
            icon: Settings,
        },
        {
            title: "Contact",
            url: "/contact",
            icon: Settings,
        },
        {
            title: "Account",
            url: "/account",
            icon: Settings,
        },
        {
            title: "About P",
            url: "/about",
            icon: Settings,
        },
        {
            title: "Seller",
            url: "/seller",
            icon: Settings,
        },
    ]

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <div className="side-bar__logo px-5 py-6">
                        <Image
                            className="h-[100px] w-fit"
                            src="/logo.svg"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                        />
                    </div>
                    <SidebarGroupContent className="px-2">
                        <SidebarMenu className="gap-3">
                            {items.map((item) => {
                                const isActive = pathname === item.url;

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a
                                                href={item.url}
                                                className={`flex flex-row items-center gap-4 !rounded-full px-4 py-6 transition-colors ${isActive ? "bg-orange-500 text-white" : "hover:bg-orange-100"
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

                                        {item.children && (
                                            <div className="ml-6 flex flex-col space-y-1 gap-3 mt-3">
                                                {item.children.map((child) => {
                                                    const isChildActive = pathname === child.url;
                                                    return (
                                                        <a
                                                            key={child.title}
                                                            href={child.url}
                                                            className={`flex flex-row gap-3 rounded-md px-2 py-1 text-base transition-colors ${isChildActive
                                                                ? "bg-orange-500 text-white"
                                                                : "text-muted-foreground hover:bg-orange-100 hover:text-foreground"
                                                                }`}
                                                        >
                                                            <child.icon />
                                                            <span>{child.title}</span>
                                                        </a>
                                                    )
                                                })}
                                            </div>
                                        )}
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
