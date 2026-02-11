import type { ApolloContact, ValidatedContact } from "@/types/campaign";

// Generic email prefixes to exclude
const GENERIC_EMAIL_PREFIXES = [
    "info@",
    "admin@",
    "support@",
    "sales@",
    "hello@",
    "contact@",
    "help@",
    "team@",
    "enquiries@",
    "inquiries@",
    "noreply@",
    "no-reply@",
    "webmaster@",
    "marketing@",
    "pr@",
    "press@",
    "media@",
    "careers@",
    "jobs@",
    "hr@",
    "recruitment@",
    "billing@",
    "accounts@",
    "finance@",
    "legal@",
    "privacy@",
    "abuse@",
    "postmaster@",
    "hostmaster@",
];

/**
 * Checks if an email is a generic/role-based address.
 */
function isGenericEmail(email: string): boolean {
    const lowerEmail = email.toLowerCase().trim();
    return GENERIC_EMAIL_PREFIXES.some((prefix) => lowerEmail.startsWith(prefix));
}

/**
 * Converts an Apollo contact to a validated contact format.
 */
function toValidatedContact(contact: ApolloContact): ValidatedContact {
    return {
        apollo_id: contact.id,
        email: contact.email!.toLowerCase().trim(),
        first_name: contact.first_name,
        last_name: contact.last_name,
        title: contact.title,
        company: contact.organization?.name || null,
        linkedin_url: contact.linkedin_url,
    };
}

export interface FilterContactsResult {
    validContacts: ValidatedContact[];
    totalProcessed: number;
    filteredOut: {
        noEmail: number;
        unverified: number;
        generic: number;
    };
}

/**
 * Filters Apollo contacts to only include valid, verified, non-generic emails.
 * Returns validated contacts ready for deduplication and sending.
 */
export function filterContacts(contacts: ApolloContact[]): FilterContactsResult {
    let noEmail = 0;
    let unverified = 0;
    let generic = 0;
    const validContacts: ValidatedContact[] = [];

    for (const contact of contacts) {
        // Check for missing email
        if (!contact.email || contact.email.trim() === "") {
            noEmail++;
            continue;
        }

        // Check for unverified email
        if (contact.email_status !== "verified") {
            unverified++;
            continue;
        }

        // Check for generic email
        if (isGenericEmail(contact.email)) {
            generic++;
            continue;
        }

        // Contact passes all filters
        validContacts.push(toValidatedContact(contact));
    }

    return {
        validContacts,
        totalProcessed: contacts.length,
        filteredOut: {
            noEmail,
            unverified,
            generic,
        },
    };
}

/**
 * Removes duplicate emails from the contact list (case-insensitive).
 * Keeps the first occurrence of each email.
 */
export function removeDuplicateEmails(
    contacts: ValidatedContact[]
): ValidatedContact[] {
    const seen = new Set<string>();
    const unique: ValidatedContact[] = [];

    for (const contact of contacts) {
        const normalizedEmail = contact.email.toLowerCase().trim();
        if (!seen.has(normalizedEmail)) {
            seen.add(normalizedEmail);
            unique.push(contact);
        }
    }

    return unique;
}
