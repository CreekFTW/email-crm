"use client";

import { LayoutDashboard, Settings, Sparkles, BarChart3, Users, Shield, Megaphone, Home } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { NavSecondary } from "./nav-secondary"
import { SITE_NAME } from "@/utils/site";
import { useSession } from "next-auth/react";

// Color mappings for menu items
const iconColors: Record<string, string> = {
    Dashboard: "bg-blue-500",
    Analytics: "bg-emerald-500",
    Campaigns: "bg-orange-500",
    Contacts: "bg-cyan-500",
    Templates: "bg-pink-500",
    Settings: "bg-purple-500",
};

// Menu items
const items = [
    { title: "Dashboard", url: "dashboard", icon: LayoutDashboard },
    { title: "Campaigns", url: "campaigns", icon: Megaphone },
    { title: "Contacts", url: "contacts", icon: Users },
    { title: "Analytics", url: "analytics", icon: BarChart3 },
    { title: "Email Health", url: "email-health", icon: Shield },
]

const toolItems: { title: string; url: string; icon: typeof LayoutDashboard }[] = [
]

const footerItems = [
    { title: "Settings", url: "settings", icon: Settings },
]

// Sidebar component with inset variant
export function AppSidebar() {
    const { data: session } = useSession();

    return (
        <Sidebar variant="inset">
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-primary/10 group"
                        >
                            <a href="#" className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg group-hover:shadow-brand transition-shadow">
                                    <Home className="h-5 w-5" />
                                </div>
                                <span className="text-base font-bold">
                                    {session?.user.firstname} {session?.user.lastname}
                                </span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild className="hover:bg-primary/10 transition-colors">
                                        <a href={`/${item.url}`} className="flex items-center gap-2.5">
                                            <span className={`p-1 rounded-md`}>
                                                <item.icon className="h-4 w-4" />
                                            </span>
                                            <span className="font-medium">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {toolItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Tools
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {toolItems.map(item => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild className="hover:bg-primary/10 transition-colors">
                                            <a href={`/tools/${item.url}`} className="flex items-center gap-2.5">
                                                <span className={`p-1 rounded-md`}>
                                                    <item.icon className="h-4 w-4" />
                                                </span>
                                                <span className="font-medium">{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
                <NavSecondary items={footerItems} className="mt-auto" />
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    )
}
