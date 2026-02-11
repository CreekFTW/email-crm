import { NextRequest, NextResponse } from "next/server";
import { pauseCampaign } from "@/services/instantly/campaign-management";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: "Campaign ID is required" },
                { status: 400 }
            );
        }

        const result = await pauseCampaign(id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to pause campaign: ${message}` },
            { status: 500 }
        );
    }
}
