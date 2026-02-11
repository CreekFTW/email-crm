import AnalyticsPage from "@/components/main/app/analytics/Page";
import { SITE_NAME } from "@/utils/site";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `${SITE_NAME} | Analytics`,
    description: "Campaign analytics and insights",
    robots: {
        index: false,
        follow: false,
    },
};

export default function Analytics() {
    return <AnalyticsPage />;
}
