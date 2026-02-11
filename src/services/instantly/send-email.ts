"use server";

import { sendBulkToInstantly } from "./add-lead";
import type { ValidatedContact } from "@/types/campaign";

interface SendEmailOptions {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    campaignId: string;
    customVariables?: Record<string, string>;
}

interface SendEmailResult {
    success: boolean;
    error?: string;
}

export async function sendEmailViaInstantly(
    options: SendEmailOptions
): Promise<SendEmailResult> {
    const { email, firstName, lastName, company, campaignId, customVariables } = options;

    const contact: ValidatedContact = {
        apollo_id: `manual_${Date.now()}`,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        title: null,
        company: company || null,
        linkedin_url: null,
    };

    const result = await sendBulkToInstantly({
        contacts: [contact],
        campaignId,
        testMode: false,
    });

    if (result.successful > 0) {
        return { success: true };
    }

    const errorMessage = result.errors.length > 0
        ? result.errors[0].error
        : "Failed to send email";

    return {
        success: false,
        error: errorMessage,
    };
}

interface SendBulkEmailOptions {
    contacts: Array<{
        email: string;
        firstName?: string;
        lastName?: string;
        company?: string;
    }>;
    campaignId: string;
}

export async function sendBulkEmailViaInstantly(
    options: SendBulkEmailOptions
): Promise<{
    successful: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
}> {
    const { contacts, campaignId } = options;

    const validatedContacts: ValidatedContact[] = contacts.map((c, index) => ({
        apollo_id: `manual_${Date.now()}_${index}`,
        email: c.email,
        first_name: c.firstName || null,
        last_name: c.lastName || null,
        title: null,
        company: c.company || null,
        linkedin_url: null,
    }));

    const result = await sendBulkToInstantly({
        contacts: validatedContacts,
        campaignId,
        testMode: false,
    });

    return {
        successful: result.successful,
        failed: result.failed,
        errors: result.errors,
    };
}
