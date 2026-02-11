import CampaignsPage from "@/components/main/app/campaigns/Page";
import { SITE_NAME } from "@/utils/site";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `${SITE_NAME} | Campaigns`,
    description: "Manage your Instantly email campaigns",
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

export default function Campaigns() {
    return (
        <CampaignsPage />
    );
}
