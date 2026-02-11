"use server";

import type { InstantlyLeadData, InstantlyLeadSearchResponse } from "@/types/campaign";

const INSTANTLY_LEADS_LIST_URL = "https://api.instantly.ai/api/v2/leads/list";

interface GetAllLeadsOptions {
    campaignId?: string;
    limit?: number;
    startingAfter?: string;
}

interface GetAllLeadsResult {
    leads: InstantlyLeadData[];
    nextStartingAfter?: string;
    hasMore: boolean;
    error?: string;
}

export async function getAllInstantlyLeads(
    options: GetAllLeadsOptions = {}
): Promise<GetAllLeadsResult> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            leads: [],
            hasMore: false,
            error: "Instantly API key not configured",
        };
    }

    const { campaignId, limit = 100, startingAfter } = options;

    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    try {
        const body: Record<string, unknown> = {
            limit,
        };

        // Only pass campaign_id if it's a valid UUID (Instantly API requirement)
        if (campaignId && uuidRegex.test(campaignId)) {
            body.campaign_id = campaignId;
        }

        if (startingAfter) {
            body.starting_after = startingAfter;
        }

        const response = await fetch(INSTANTLY_LEADS_LIST_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                leads: [],
                hasMore: false,
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const data: InstantlyLeadSearchResponse = await response.json();

        return {
            leads: data.items || [],
            nextStartingAfter: data.next_starting_after,
            hasMore: !!data.next_starting_after,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            leads: [],
            hasMore: false,
            error: `Failed to fetch Instantly leads: ${message}`,
        };
    }
}

export async function fetchAllInstantlyLeadsPaginated(
    campaignId?: string,
    maxLeads: number = 1000
): Promise<GetAllLeadsResult> {
    const allLeads: InstantlyLeadData[] = [];
    let startingAfter: string | undefined;
    let hasMore = true;

    while (hasMore && allLeads.length < maxLeads) {
        const result = await getAllInstantlyLeads({
            campaignId,
            limit: 100,
            startingAfter,
        });

        if (result.error) {
            return {
                leads: allLeads,
                hasMore: false,
                error: result.error,
            };
        }

        allLeads.push(...result.leads);
        startingAfter = result.nextStartingAfter;
        hasMore = result.hasMore;

        if (hasMore) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return {
        leads: allLeads.slice(0, maxLeads),
        hasMore: allLeads.length >= maxLeads,
    };
}
