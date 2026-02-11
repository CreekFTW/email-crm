import { NextRequest, NextResponse } from "next/server";
import {
    getCampaignAnalytics,
    getCampaignDailyAnalytics,
    getCampaignAnalyticsOverview,
} from "@/services/instantly/analytics";

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get("campaignId");
        const type = searchParams.get("type") || "summary";
        const startDate = searchParams.get("startDate") || undefined;
        const endDate = searchParams.get("endDate") || undefined;

        if (type === "overview") {
            const result = await getCampaignAnalyticsOverview();

            if (result.error) {
                return NextResponse.json(
                    { error: result.error },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                overview: result.overview,
            });
        }

        if (!campaignId) {
            return NextResponse.json(
                { error: "campaignId is required" },
                { status: 400 }
            );
        }

        if (type === "daily") {
            const result = await getCampaignDailyAnalytics(campaignId, startDate, endDate);

            if (result.error) {
                return NextResponse.json(
                    { error: result.error },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                dailyData: result.dailyData,
            });
        }

        const result = await getCampaignAnalytics(campaignId);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            analytics: result.analytics,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to fetch analytics: ${message}` },
            { status: 500 }
        );
    }
}
