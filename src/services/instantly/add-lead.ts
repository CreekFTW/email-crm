"use server";

import type {
    InstantlyLead,
    InstantlyBulkAddLeadResponse,
    ValidatedContact,
    BulkSendResult,
} from "@/types/campaign";

const INSTANTLY_BULK_API_URL = "https://api.instantly.ai/api/v2/leads/add";

interface SendBulkToInstantlyOptions {
    contacts: ValidatedContact[];
    campaignId: string;
    testMode: boolean;
    testEmail?: string;
}

/**
 * Builds an InstantlyLead object from a ValidatedContact.
 * In test mode, replaces the contact email with the test email and preserves the original.
 */
function buildLead(contact: ValidatedContact, testMode: boolean, testEmail?: string): InstantlyLead {
    const emailToSend = testMode && testEmail ? testEmail : contact.email;
    const originalEmail = testMode ? contact.email : undefined;

    const customVariables: Record<string, string> = {
        source: "apollo",
    };

    if (contact.first_name) {
        customVariables.first_name = contact.first_name;
    }
    if (contact.company) {
        customVariables.company = contact.company;
    }
    if (contact.title) {
        customVariables.title = contact.title;
    }
    if (originalEmail) {
        customVariables.original_email = originalEmail;
    }

    return {
        email: emailToSend,
        first_name: contact.first_name || undefined,
        last_name: contact.last_name || undefined,
        company_name: contact.company || undefined,
        custom_variables: customVariables,
    };
}

/**
 * Sends multiple leads to Instantly using the bulk API endpoint.
 * Returns detailed results including successful contacts for persistence.
 */
export async function sendBulkToInstantly(
    options: SendBulkToInstantlyOptions
): Promise<BulkSendResult> {
    const { contacts, campaignId, testMode, testEmail } = options;
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            totalProcessed: contacts.length,
            successful: 0,
            failed: contacts.length,
            successfulContacts: [],
            errors: [{ email: "all", error: "Instantly API key not configured" }],
        };
    }

    if (contacts.length === 0) {
        return {
            totalProcessed: 0,
            successful: 0,
            failed: 0,
            successfulContacts: [],
            errors: [],
        };
    }

    // Build leads array from all contacts
    const leads: InstantlyLead[] = contacts.map(contact =>
        buildLead(contact, testMode, testEmail)
    );

    try {
        const response = await fetch(INSTANTLY_BULK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                campaign_id: campaignId,
                skip_if_in_campaign: true,
                leads: leads,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                totalProcessed: contacts.length,
                successful: 0,
                failed: contacts.length,
                successfulContacts: [],
                errors: [{ email: "all", error: `Instantly API error (${response.status}): ${errorText}` }],
            };
        }

        const data: InstantlyBulkAddLeadResponse = await response.json();

        if (data.status === "error") {
            return {
                totalProcessed: contacts.length,
                successful: 0,
                failed: contacts.length,
                successfulContacts: [],
                errors: [{ email: "all", error: data.message || "Unknown Instantly error" }],
            };
        }

        // Calculate successful count from response
        const uploaded = data.uploaded ?? contacts.length;
        const successful = uploaded;
        const failed = contacts.length - successful;

        // If the API doesn't return individual errors, assume all non-skipped were successful
        // For now, we assume the first N contacts were successful (based on uploaded count)
        const successfulContacts = testMode ? [] : contacts.slice(0, successful);

        return {
            totalProcessed: contacts.length,
            successful,
            failed,
            successfulContacts,
            errors: data.errors || [],
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            totalProcessed: contacts.length,
            successful: 0,
            failed: contacts.length,
            successfulContacts: [],
            errors: [{ email: "all", error: `Failed to send to Instantly: ${message}` }],
        };
    }
}

/**
 * Sends multiple leads to Instantly in batch using the bulk API.
 * Returns count of successful and failed sends.
 *
 * @deprecated Use sendBulkToInstantly directly for more detailed results
 */
export async function sendBatchToInstantly(
    contacts: ValidatedContact[],
    campaignId: string,
    testMode: boolean,
    testEmail?: string
): Promise<{
    sent: number;
    testSent: number;
    errors: number;
    errorMessages: string[];
}> {
    const result = await sendBulkToInstantly({
        contacts,
        campaignId,
        testMode,
        testEmail,
    });

    const errorMessages = result.errors.map(e => `${e.email}: ${e.error}`);

    return {
        sent: testMode ? 0 : result.successful,
        testSent: testMode ? result.successful : 0,
        errors: result.failed,
        errorMessages,
    };
}
