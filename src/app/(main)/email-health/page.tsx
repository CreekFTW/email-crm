import EmailHealthPage from "@/components/main/app/email-health/Page";
import { SITE_NAME } from "@/utils/site";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `${SITE_NAME} | Email Health`,
    description: "Monitor email account health and warmup status",
    robots: {
        index: false,
        follow: false,
    },
};

export default function EmailHealthRoute() {
    return <EmailHealthPage />;
}
