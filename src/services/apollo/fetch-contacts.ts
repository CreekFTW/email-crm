"use server";

import type {
    ApolloSearchFilters,
    ApolloContact,
} from "@/types/campaign";

const APOLLO_SEARCH_URL = "https://api.apollo.io/api/v1/mixed_people/api_search";
const APOLLO_BULK_MATCH_URL = "https://api.apollo.io/api/v1/people/bulk_match";

interface ApolloApiResponse {
    people?: ApolloContact[];
    pagination?: {
        page?: number;
        per_page?: number;
        total_entries?: number;
        total_pages?: number;
    };
    contacts?: ApolloContact[];
    total_results?: number;
}

interface ApolloBulkMatchPerson {
    id?: string;
    email?: string;
    email_status?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    title?: string;
    organization?: {
        id?: string;
        name?: string;
    };
}

interface ApolloBulkMatchResponse {
    matches?: ApolloBulkMatchPerson[];
    status?: string;
}

interface FetchApolloContactsResult {
    contacts: ApolloContact[];
    totalFetched: number;
    error?: string;
}

/**
 * Reveals emails for contacts in bulk using Apollo's bulk_match endpoint.
 * Processes up to 10 contacts per API call.
 */
async function revealEmailsBulk(
    contacts: ApolloContact[],
    apiKey: string
): Promise<ApolloContact[]> {
    const needsReveal = contacts.filter(c => !c.email);

    if (needsReveal.length === 0) {
        console.log("[Apollo] All contacts already have emails");
        return contacts;
    }

    console.log(`[Apollo] Revealing emails for ${needsReveal.length} contacts using bulk API...`);

    const revealedMap = new Map<string, ApolloBulkMatchPerson>();

    // Process in batches of 10 (Apollo's limit for bulk_match)
    const batchSize = 10;

    for (let i = 0; i < needsReveal.length; i += batchSize) {
        const batch = needsReveal.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(needsReveal.length / batchSize);

        console.log(`[Apollo] Processing batch ${batchNum}/${totalBatches} (${batch.length} contacts)`);

        try {
            const response = await fetch(
                `${APOLLO_BULK_MATCH_URL}?reveal_personal_emails=true`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": apiKey,
                    },
                    body: JSON.stringify({
                        details: batch.map(c => ({ id: c.id })),
                    }),
                }
            );

            if (!response.ok) {
                console.log(`[Apollo] Bulk match failed for batch ${batchNum}: ${response.status}`);
                continue;
            }

            const data: ApolloBulkMatchResponse = await response.json();

            if (data.matches) {
                for (const match of data.matches) {
                    if (match.id && match.email) {
                        revealedMap.set(match.id, match);
                    }
                }
                console.log(`[Apollo] Batch ${batchNum}: revealed ${data.matches.filter(m => m.email).length} emails`);
            }
        } catch (error) {
            console.error(`[Apollo] Error in batch ${batchNum}:`, error);
        }

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < needsReveal.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Merge revealed emails back into contacts
    const result = contacts.map(contact => {
        const revealed = revealedMap.get(contact.id);
        if (revealed?.email) {
            return {
                ...contact,
                email: revealed.email,
                email_status: revealed.email_status || contact.email_status,
            };
        }
        return contact;
    });

    const emailCount = result.filter(c => c.email).length;
    console.log(`[Apollo] Total contacts with emails: ${emailCount}/${result.length}`);

    return result;
}

/**
 * Fetches contacts from Apollo API with pagination support.
 * Automatically reveals emails in bulk for contacts that need it.
 */
export async function fetchApolloContacts(
    filters: ApolloSearchFilters,
    dailyLimit: number
): Promise<FetchApolloContactsResult> {
    const apiKey = process.env.APOLLO_API_KEY;

    if (!apiKey) {
        return {
            contacts: [],
            totalFetched: 0,
            error: "Apollo API key not configured",
        };
    }

    const allContacts: ApolloContact[] = [];
    let currentPage = 1;
    const perPage = Math.min(filters.per_page || 100, 100);

    try {
        while (allContacts.length < dailyLimit) {
            const remainingNeeded = dailyLimit - allContacts.length;
            const requestPerPage = Math.min(perPage, remainingNeeded);

            const requestBody = {
                ...filters,
                page: currentPage,
                per_page: requestPerPage,
            };

            console.log(`[Apollo] Fetching page ${currentPage}, per_page: ${requestPerPage}`);

            const response = await fetch(APOLLO_SEARCH_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                return {
                    contacts: allContacts,
                    totalFetched: allContacts.length,
                    error: `Apollo API error (${response.status}): ${errorText}`,
                };
            }

            const data: ApolloApiResponse = await response.json();

            console.log(`[Apollo] Response keys: ${Object.keys(data).join(", ")}`);

            const people = data.people || data.contacts || [];

            if (!people || people.length === 0) {
                console.log("[Apollo] No more people found");
                break;
            }

            console.log(`[Apollo] Got ${people.length} contacts on page ${currentPage}`);
            allContacts.push(...people);

            const totalPages = data.pagination?.total_pages;
            const hasMorePages = totalPages ? currentPage < totalPages : people.length >= requestPerPage;

            if (!hasMorePages || people.length < requestPerPage) {
                console.log("[Apollo] Reached end of results");
                break;
            }

            currentPage++;

            if (currentPage > 500) {
                console.log("[Apollo] Reached max page limit (500)");
                break;
            }
        }

        const limitedContacts = allContacts.slice(0, dailyLimit);

        // Reveal emails in bulk for contacts that don't have them
        console.log(`[Apollo] Total fetched: ${limitedContacts.length}, now revealing emails...`);
        const contactsWithEmails = await revealEmailsBulk(limitedContacts, apiKey);

        return {
            contacts: contactsWithEmails,
            totalFetched: allContacts.length,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Apollo] Error: ${message}`);
        return {
            contacts: allContacts,
            totalFetched: allContacts.length,
            error: `Failed to fetch Apollo contacts: ${message}`,
        };
    }
}