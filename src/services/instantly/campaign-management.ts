"use server";

import type {
    CreateCampaignRequest,
    UpdateCampaignRequest,
    CampaignManagementResponse,
    InstantlyCampaignFull,
} from "@/types/campaign";

const INSTANTLY_BASE_URL = "https://api.instantly.ai/api/v2";

export async function createCampaign(
    data: CreateCampaignRequest
): Promise<CampaignManagementResponse> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            success: false,
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(`${INSTANTLY_BASE_URL}/campaigns`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                campaign_schedule: data.campaign_schedule,
                sequences: data.sequences,
                email_list: data.email_list,
                daily_limit: data.daily_limit,
                stop_on_reply: data.stop_on_reply,
                stop_on_auto_reply: data.stop_on_auto_reply,
                link_tracking: data.link_tracking,
                open_tracking: data.open_tracking,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const campaign = await response.json();

        return {
            success: true,
            campaign,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: `Failed to create campaign: ${message}`,
        };
    }
}

export async function getCampaign(
    campaignId: string
): Promise<{ campaign: InstantlyCampaignFull | null; error?: string }> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            campaign: null,
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(
            `${INSTANTLY_BASE_URL}/campaigns/${campaignId}`,
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
                campaign: null,
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const campaign = await response.json();

        return { campaign };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            campaign: null,
            error: `Failed to fetch campaign: ${message}`,
        };
    }
}

export async function updateCampaign(
    campaignId: string,
    data: UpdateCampaignRequest
): Promise<CampaignManagementResponse> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            success: false,
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(
            `${INSTANTLY_BASE_URL}/campaigns/${campaignId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const campaign = await response.json();

        return {
            success: true,
            campaign,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: `Failed to update campaign: ${message}`,
        };
    }
}

export async function deleteCampaign(
    campaignId: string
): Promise<CampaignManagementResponse> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            success: false,
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(
            `${INSTANTLY_BASE_URL}/campaigns/${campaignId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: `Failed to delete campaign: ${message}`,
        };
    }
}

export async function pauseCampaign(
    campaignId: string
): Promise<CampaignManagementResponse> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            success: false,
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(
            `${INSTANTLY_BASE_URL}/campaigns/${campaignId}/pause`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: `Failed to pause campaign: ${message}`,
        };
    }
}

export async function activateCampaign(
    campaignId: string
): Promise<CampaignManagementResponse> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            success: false,
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(
            `${INSTANTLY_BASE_URL}/campaigns/${campaignId}/activate`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: `Failed to activate campaign: ${message}`,
        };
    }
}

export async function getEmailAccounts(): Promise<{
    accounts: Array<{ email: string; id: string }>;
    error?: string;
}> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            accounts: [],
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(`${INSTANTLY_BASE_URL}/accounts?limit=100`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                accounts: [],
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const data = await response.json();

        return {
            accounts: (data.items || []).map((item: { email: string; id: string }) => ({
                email: item.email,
                id: item.id,
            })),
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            accounts: [],
            error: `Failed to fetch email accounts: ${message}`,
        };
    }
}
