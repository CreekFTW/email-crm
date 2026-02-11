"use client"

import { SidebarTrigger } from "./sidebar"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "../theme-toggle"
import { NavUser } from "./nav-user"
import { usePathname } from "next/navigation";

export function SiteHeader() {
    const pathname = usePathname();
    const title =
        pathname === "/" || pathname === "/dashboard"
            ? "Dashboard"
            : pathname
                .split("/")
                .filter(Boolean)
                .pop()!
                .split("-")
                .map(w => w[0]?.toUpperCase() + w.slice(1))
                .join(" ");

    return (
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b border-border/50">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1 hover:bg-primary/10 transition-colors" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
                <div className="ml-auto flex justify-center items-center gap-3">
                    <ModeToggle />
                    <Separator
                        orientation="vertical"
                        className="mx-1 data-[orientation=vertical]:h-4"
                    />
                    <NavUser />
                </div>
            </div>
        </header>
    );
}
