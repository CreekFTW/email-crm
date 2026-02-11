import { NextRequest, NextResponse } from "next/server";
import { getCampaigns } from "@/services/instantly/analytics";
import { createCampaign } from "@/services/instantly/campaign-management";
import type { CreateCampaignRequest } from "@/types/campaign";

export async function GET(): Promise<NextResponse> {
    try {
        const result = await getCampaigns();

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            campaigns: result.campaigns,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to fetch campaigns: ${message}` },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body: CreateCampaignRequest = await request.json();

        if (!body.name || body.name.trim().length === 0) {
            return NextResponse.json(
                { error: "Campaign name is required" },
                { status: 400 }
            );
        }

        const result = await createCampaign(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            campaign: result.campaign,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to create campaign: ${message}` },
            { status: 500 }
        );
    }
}
