import { SignUpForm } from "@/components/auth/forms/sign-up-form";
import { SITE_NAME } from "@/utils/site";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: `${SITE_NAME} | Sign Up`,
    description: "Sign up page",
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

export default function SignUp() {
    return (
        <SignUpForm />
    );
}
