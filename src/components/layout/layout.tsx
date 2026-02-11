// Local Imports
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SiteHeader } from "@/components/ui/site-header";
import FirebaseProvider from "../firebase-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"


export default function Layout({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <FirebaseProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />

                    <main className={`h-100vh w-full p-4 xl:p-8 ${className} bg-white dark:bg-[#0f0f0f] overflow-y-auto`}>
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </FirebaseProvider>
    )
}
