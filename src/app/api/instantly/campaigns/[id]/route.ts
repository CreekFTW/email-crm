import { NextRequest, NextResponse } from "next/server";
import {
    getCampaign,
    updateCampaign,
    deleteCampaign,
} from "@/services/instantly/campaign-management";
import type { UpdateCampaignRequest } from "@/types/campaign";

export async function GET(
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

        const result = await getCampaign(id);

        if (result.error) {
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
            { error: `Failed to fetch campaign: ${message}` },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
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

        const body: UpdateCampaignRequest = await request.json();

        const result = await updateCampaign(id, body);

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
            { error: `Failed to update campaign: ${message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        const result = await deleteCampaign(id);

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
            { error: `Failed to delete campaign: ${message}` },
            { status: 500 }
        );
    }
}
