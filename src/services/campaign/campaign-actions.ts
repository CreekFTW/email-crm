"use server";

import { fetchApolloContacts } from "@/services/apollo/fetch-contacts";
import { filterContacts, removeDuplicateEmails } from "@/services/campaign/filter-contacts";
import { sendBulkToInstantly } from "@/services/instantly/add-lead";
import { getLeadsBatch } from "@/services/instantly/get-leads";
import type {
    ApolloSearchFilters,
    ApolloContact,
    ValidatedContact,
    FetchStageResult,
    FilterStageResult,
    DedupeStageResult,
    SendStageResult,
} from "@/types/campaign";

/**
 * Fetches contacts from Apollo based on the provided filters and daily limit.
 */
export async function fetchContactsAction(
    filters: ApolloSearchFilters,
    dailyLimit: number
): Promise<FetchStageResult> {
    try {
        const result = await fetchApolloContacts(filters, dailyLimit);

        if (result.error) {
            return {
                status: "error",
                error: result.error,
                contacts: result.contacts,
                totalFetched: result.totalFetched,
            };
        }

        return {
            status: "completed",
            contacts: result.contacts,
            totalFetched: result.totalFetched,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            status: "error",
            error: `Failed to fetch contacts: ${message}`,
            contacts: [],
            totalFetched: 0,
        };
    }
}

/**
 * Filters contacts to only include valid, verified, non-generic emails.
 * Also removes duplicate emails within the batch.
 */
export async function filterContactsAction(
    contacts: ApolloContact[]
): Promise<FilterStageResult> {
    try {
        const result = filterContacts(contacts);
        const uniqueContacts = removeDuplicateEmails(result.validContacts);

        return {
            status: "completed",
            contacts: uniqueContacts,
            totalVerified: uniqueContacts.length,
            filteredOut: result.filteredOut,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            status: "error",
            error: `Failed to filter contacts: ${message}`,
            contacts: [],
            totalVerified: 0,
            filteredOut: {
                noEmail: 0,
                unverified: 0,
                generic: 0,
            },
        };
    }
}

/**
 * Deduplicates contacts by checking against existing leads in Instantly.
 * In test mode, skips deduplication (all contacts pass through).
 */
export async function dedupeContactsAction(
    contacts: ValidatedContact[],
    testMode: boolean,
    campaignId?: string
): Promise<DedupeStageResult> {
    try {
        // In test mode, skip deduplication
        if (testMode) {
            console.log("[Dedupe] Test mode enabled, skipping deduplication");
            return {
                status: "completed",
                contacts: contacts,
                skippedDuplicates: 0,
            };
        }

        // Get all emails to check
        const emails = contacts.map(c => c.email);

        // Check which emails already exist in Instantly
        const existingEmails = await getLeadsBatch(emails, campaignId);

        // Filter out contacts that already exist in Instantly
        const newContacts = contacts.filter(c => !existingEmails.has(c.email.toLowerCase().trim()));
        const skippedCount = contacts.length - newContacts.length;

        console.log(`[Dedupe] Filtered out ${skippedCount} existing leads, ${newContacts.length} new leads remaining`);

        return {
            status: "completed",
            contacts: newContacts,
            skippedDuplicates: skippedCount,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            status: "error",
            error: `Failed to dedupe contacts: ${message}`,
            contacts: [],
            skippedDuplicates: 0,
        };
    }
}

/**
 * Sends contacts to Instantly campaign.
 * No longer persists to Firebase - Instantly is the single source of truth.
 */
export async function sendContactsAction(
    contacts: ValidatedContact[],
    campaignId: string,
    testMode: boolean,
    testEmail?: string
): Promise<SendStageResult> {
    try {
        if (contacts.length === 0) {
            return {
                status: "completed",
                sent: 0,
                testSent: 0,
                errors: 0,
            };
        }

        const result = await sendBulkToInstantly({
            contacts,
            campaignId,
            testMode,
            testEmail,
        });

        if (result.errors.length > 0 && result.successful === 0) {
            return {
                status: "error",
                error: result.errors[0]?.error || "Failed to send leads to Instantly",
                sent: 0,
                testSent: 0,
                errors: result.failed,
            };
        }

        return {
            status: "completed",
            sent: testMode ? 0 : result.successful,
            testSent: testMode ? result.successful : 0,
            errors: result.failed,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            status: "error",
            error: `Failed to send contacts: ${message}`,
            sent: 0,
            testSent: 0,
            errors: contacts.length,
        };
    }
}
