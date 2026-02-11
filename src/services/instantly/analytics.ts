"use server";

import type {
    CampaignAnalytics,
    CampaignDailyAnalytics,
    InstantlyCampaign,
} from "@/types/campaign";

const INSTANTLY_BASE_URL = "https://api.instantly.ai/api/v2";

interface InstantlyAnalyticsResponse {
    campaign_id?: string;
    campaign_name?: string;
    total_leads?: number;
    contacted?: number;
    leads_who_read?: number;
    leads_who_replied?: number;
    leads_who_clicked?: number;
    bounced?: number;
    unsubscribed?: number;
}

interface InstantlyDailyAnalyticsResponse {
    data?: Array<{
        date: string;
        new_leads_contacted: number;
        leads_who_read: number;
        leads_who_replied: number;
        leads_who_clicked: number;
        bounced: number;
    }>;
}

interface InstantlyCampaignListResponse {
    items?: Array<{
        id: string;
        name: string;
        status: string;
        created_at?: string;
        updated_at?: string;
    }>;
    next_starting_after?: string;
}

export async function getCampaigns(): Promise<{
    campaigns: InstantlyCampaign[];
    error?: string;
}> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            campaigns: [],
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(`${INSTANTLY_BASE_URL}/campaigns?limit=100`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                campaigns: [],
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const data: InstantlyCampaignListResponse = await response.json();

        const campaigns: InstantlyCampaign[] = (data.items || []).map((item) => ({
            id: item.id,
            name: item.name,
            status: item.status as InstantlyCampaign["status"],
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }));

        return { campaigns };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            campaigns: [],
            error: `Failed to fetch campaigns: ${message}`,
        };
    }
}

export async function getCampaignAnalytics(
    campaignId: string
): Promise<{
    analytics: CampaignAnalytics | null;
    error?: string;
}> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            analytics: null,
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(
            `${INSTANTLY_BASE_URL}/campaigns/analytics?id=${campaignId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                analytics: null,
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const data: InstantlyAnalyticsResponse = await response.json();

        const sent = data.contacted || 0;
        const opened = data.leads_who_read || 0;
        const clicked = data.leads_who_clicked || 0;
        const replied = data.leads_who_replied || 0;
        const bounced = data.bounced || 0;
        const unsubscribed = data.unsubscribed || 0;

        const analytics: CampaignAnalytics = {
            campaignId: data.campaign_id || campaignId,
            campaignName: data.campaign_name,
            sent,
            opened,
            clicked,
            replied,
            bounced,
            unsubscribed,
            openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
            clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
            replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
            bounceRate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
        };

        return { analytics };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            analytics: null,
            error: `Failed to fetch analytics: ${message}`,
        };
    }
}

export async function getCampaignDailyAnalytics(
    campaignId: string,
    startDate?: string,
    endDate?: string
): Promise<{
    dailyData: CampaignDailyAnalytics[];
    error?: string;
}> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            dailyData: [],
            error: "Instantly API key not configured",
        };
    }

    try {
        const params = new URLSearchParams();
        params.append("id", campaignId);
        if (startDate) {
            params.append("start_date", startDate);
        }
        if (endDate) {
            params.append("end_date", endDate);
        }

        const url = `${INSTANTLY_BASE_URL}/campaigns/analytics/daily?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                dailyData: [],
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const data: InstantlyDailyAnalyticsResponse = await response.json();

        const dailyData: CampaignDailyAnalytics[] = (data.data || []).map((item) => ({
            date: item.date,
            sent: item.new_leads_contacted,
            opened: item.leads_who_read,
            clicked: item.leads_who_clicked,
            replied: item.leads_who_replied,
            bounced: item.bounced,
        }));

        return { dailyData };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            dailyData: [],
            error: `Failed to fetch daily analytics: ${message}`,
        };
    }
}

export async function getCampaignAnalyticsOverview(): Promise<{
    overview: CampaignAnalytics[];
    error?: string;
}> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            overview: [],
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(`${INSTANTLY_BASE_URL}/campaigns/analytics/overview`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const { campaigns, error } = await getCampaigns();
            if (error) {
                return { overview: [], error };
            }

            const analyticsPromises = campaigns.map((c) => getCampaignAnalytics(c.id));
            const results = await Promise.all(analyticsPromises);

            const overview: CampaignAnalytics[] = results
                .filter((r) => r.analytics !== null)
                .map((r) => r.analytics as CampaignAnalytics);

            return { overview };
        }

        const data = await response.json();

        const overview: CampaignAnalytics[] = (data.items || []).map((item: InstantlyAnalyticsResponse) => {
            const sent = item.contacted || 0;
            const opened = item.leads_who_read || 0;
            const clicked = item.leads_who_clicked || 0;
            const replied = item.leads_who_replied || 0;
            const bounced = item.bounced || 0;
            const unsubscribed = item.unsubscribed || 0;

            return {
                campaignId: item.campaign_id || "",
                campaignName: item.campaign_name,
                sent,
                opened,
                clicked,
                replied,
                bounced,
                unsubscribed,
                openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
                clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
                replyRate: sent > 0 ? Math.round((replied / sent) * 100) : 0,
                bounceRate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
            };
        });

        return { overview };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            overview: [],
            error: `Failed to fetch analytics overview: ${message}`,
        };
    }
}
