"use server";

const INSTANTLY_LEADS_SEARCH_URL = "https://api.instantly.ai/api/v2/leads/search";

export interface InstantlyLeadData {
    email: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    campaign_id?: string;
    status?: string;
    lead_id?: string;
    list_id?: string;
    phone?: string;
    website?: string;
    custom_variables?: Record<string, string>;
    created_at?: string;
    updated_at?: string;
}

export interface InstantlyLeadSearchResponse {
    items: InstantlyLeadData[];
    next_starting_after?: string;
}

/**
 * Retrieves a lead from Instantly by email address.
 * Optionally filters by campaign ID.
 */
export async function getLeadByEmail(
    email: string,
    campaignId?: string
): Promise<InstantlyLeadData | null> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        console.error("[Instantly] API key not configured");
        return null;
    }

    try {
        const params = new URLSearchParams({
            email: email.toLowerCase().trim(),
            limit: "1",
        });

        if (campaignId) {
            params.append("campaign_id", campaignId);
        }

        const response = await fetch(`${INSTANTLY_LEADS_SEARCH_URL}?${params.toString()}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Instantly] Lead search failed (${response.status}): ${errorText}`);
            return null;
        }

        const data: InstantlyLeadSearchResponse = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0];
        }

        return null;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Instantly] Error searching for lead: ${message}`);
        return null;
    }
}

/**
 * Checks which emails from a batch already exist in Instantly.
 * Returns a Set of emails that are already in Instantly.
 * Used for deduplication purposes.
 */
export async function getLeadsBatch(
    emails: string[],
    campaignId?: string
): Promise<Set<string>> {
    const apiKey = process.env.INSTANTLY_API_KEY;
    const existingEmails = new Set<string>();

    if (!apiKey) {
        throw new Error("Instantly API key not configured. Cannot perform deduplication.");
    }

    if (emails.length === 0) {
        return existingEmails;
    }

    console.log(`[Instantly] Checking ${emails.length} emails for duplicates...`);

    // Process emails in batches to avoid overwhelming the API
    // Instantly API doesn't have a bulk email lookup, so we need to check each email
    // We'll use pagination and batch processing
    const batchSize = 50; // Check 50 emails at a time

    for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(emails.length / batchSize);

        console.log(`[Instantly] Processing batch ${batchNum}/${totalBatches}`);

        // Process emails in parallel within each batch
        const promises = batch.map(async (email) => {
            try {
                const params = new URLSearchParams({
                    email: email.toLowerCase().trim(),
                    limit: "1",
                });

                if (campaignId) {
                    params.append("campaign_id", campaignId);
                }

                const response = await fetch(`${INSTANTLY_LEADS_SEARCH_URL}?${params.toString()}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                    },
                });

                if (!response.ok) {
                    return null;
                }

                const data: InstantlyLeadSearchResponse = await response.json();

                if (data.items && data.items.length > 0) {
                    return email.toLowerCase().trim();
                }

                return null;
            } catch {
                return null;
            }
        });

        const results = await Promise.all(promises);

        for (const email of results) {
            if (email) {
                existingEmails.add(email);
            }
        }

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < emails.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    console.log(`[Instantly] Found ${existingEmails.size} existing leads out of ${emails.length} checked`);

    return existingEmails;
}
