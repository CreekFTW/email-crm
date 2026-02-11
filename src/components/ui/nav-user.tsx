"use client"

import {
    LogOut,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useSession } from "next-auth/react"
import { signOut } from "@/services/sign-out";

export function NavUser() {
    const { data: session } = useSession();

    async function handleSignOut() {
        await signOut()
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{`${session?.user.firstname?.slice(0, 1)}${session?.user.lastname?.slice(0, 1)}`}</AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64"
                align="end"
                sideOffset={8}
            >
                <DropdownMenuLabel className="font-normal p-2!">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{`${session?.user.firstname?.slice(0, 1)}${session?.user.lastname?.slice(0, 1)}`}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{session?.user.firstname ?? "Name"} {session?.user.lastname ?? ""}</p>
                            <p className="text-xs leading-none text-muted-foreground">{session?.user.email}</p>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
