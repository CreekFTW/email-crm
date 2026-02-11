"use client"

import React, { useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Separator } from "./ui/separator"
import { ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { signOut } from "@/services/sign-out"
import { setCookie } from "@/utils/cookie-handlers"
import { idTokenCache } from "@/utils/constants"

interface Props {
    children: React.ReactNode;
}

const FirebaseProvider: React.FC<Props> = ({ children }) => {
    const router = useRouter();
    const { status, update: updateSession } = useSession();

    const showDialog = status === "unauthenticated";

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const path = window.location.pathname;

                if (path == "/preparing") {
                    await updateSession();
                    router.push("/dashboard")
                }

                // Proactively refresh token and cache it
                try {
                    const token = await user.getIdToken(true);
                    setCookie(idTokenCache, token, { expires: 1 });
                } catch (error) {
                    console.error("Failed to refresh token:", error);
                }
            }
        })

        // Set up periodic token refresh (every 50 minutes, tokens expire in 60 minutes)
        const tokenRefreshInterval = setInterval(async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const token = await user.getIdToken(true);
                    setCookie(idTokenCache, token, { expires: 1 });
                } catch (error) {
                    console.error("Failed to refresh token:", error);
                }
            }
        }, 50 * 60 * 1000); // 50 minutes

        return () => {
            unsubscribe();
            clearInterval(tokenRefreshInterval);
        }
    }, [router, updateSession])

    const handleReLogin = async () => {
        await signOut("/login");
        router.push("/login")
    }


    if (showDialog) {
        return (
            <Dialog open>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Session Expired</DialogTitle>
                        <Separator />
                    </DialogHeader>
                    <p className="text-muted-foreground">Your session has expired or you’ve been logged out. Please log back in to continue.</p>
                    <div className="flex justify-center items-center mt-4">
                        <Button onClick={handleReLogin}>
                            Go to login
                            <ArrowRight />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return <>{children}</>
}

export default FirebaseProvider