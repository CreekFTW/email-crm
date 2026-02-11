import OnboardingForm from "@/components/auth/forms/onboarding-form"
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Karsilo | Onboarding",
    description: "Onboarding",
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

export default function Onboarding() {
    return (
        <OnboardingForm />
    )
}
