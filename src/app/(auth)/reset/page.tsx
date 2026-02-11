import { ResetForm } from "@/components/auth/forms/reset-form"
import { SITE_NAME } from "@/utils/site";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `${SITE_NAME} | RESET`,
    description: "Reset password",
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

export default function Reset() {
    return (
        <ResetForm />
    )
}
