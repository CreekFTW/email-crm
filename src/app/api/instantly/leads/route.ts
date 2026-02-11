import { NextRequest, NextResponse } from "next/server";
import { getAllInstantlyLeads, fetchAllInstantlyLeadsPaginated } from "@/services/instantly/get-all-leads";

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get("campaignId") || undefined;
        const startingAfter = searchParams.get("startingAfter") || undefined;
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : 100;

        // If requesting more than 100 leads, use paginated fetching
        const result = limit > 100
            ? await fetchAllInstantlyLeadsPaginated(campaignId, limit)
            : await getAllInstantlyLeads({
                campaignId,
                startingAfter,
                limit,
            });

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            leads: result.leads,
            hasMore: result.hasMore,
            nextStartingAfter: result.nextStartingAfter,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to fetch leads: ${message}` },
            { status: 500 }
        );
    }
}
