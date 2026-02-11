// Local Imports
import Providers from "../providers";

// External Imports
import { Suspense } from "react";
import { Metadata } from "next";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ROOT_SITE_NAME, SITE_NAME } from "@/utils/site";
import { ModeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";

export const metadata: Metadata = {
    title: `${SITE_NAME}`,
    description: "",
    robots: {
        index: false,
        follow: false,
        nocache: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <Providers>
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-5">
                    <div className="flex justify-between gap-2">
                        <a href="#" className="flex items-center gap-2 font-medium">
                            <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
                                <Avatar>
                                    <AvatarImage src="/logos/favicon-orange.svg" className="scale-80" />
                                    <AvatarFallback>BT</AvatarFallback>
                                </Avatar>
                            </div>
                            {SITE_NAME}
                        </a>
                        <ModeToggle />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            <Suspense fallback={null}>
                                {children}
                            </Suspense>
                        </div>
                    </div>
                </div>
                <div className="bg-muted relative hidden lg:flex items-center justify-center">
                    <p className="font-bold text-lg">{ROOT_SITE_NAME} - {SITE_NAME} Software</p>
                </div>
            </div>
        </Providers>
    );
}