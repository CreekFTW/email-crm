import { NextRequest, NextResponse } from "next/server";
import type {
  CampaignRunRequest,
  CampaignRunResponse,
  CampaignRunError,
  ValidatedContact,
} from "@/types/campaign";
import { fetchApolloContacts } from "@/services/apollo/fetch-contacts";
import { filterContacts, removeDuplicateEmails } from "@/services/campaign/filter-contacts";
import { getLeadsBatch } from "@/services/instantly/get-leads";
import { sendBulkToInstantly } from "@/services/instantly/add-lead";

/**
 * Validates the campaign run request.
 */
function validateRequest(body: unknown): {
  valid: boolean;
  error?: string;
  data?: CampaignRunRequest;
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const req = body as Partial<CampaignRunRequest>;

  // Check Apollo filters
  if (!req.apollo_filters || typeof req.apollo_filters !== "object") {
    return { valid: false, error: "apollo_filters is required and must be an object" };
  }

  // Check Instantly campaign ID
  if (!req.instantly_campaign_id || typeof req.instantly_campaign_id !== "string") {
    return { valid: false, error: "instantly_campaign_id is required" };
  }

  if (req.instantly_campaign_id.trim() === "") {
    return { valid: false, error: "instantly_campaign_id cannot be empty" };
  }

  // Check daily limit
  if (typeof req.daily_limit !== "number" || req.daily_limit <= 0) {
    return { valid: false, error: "daily_limit must be a positive number" };
  }

  if (req.daily_limit > 1000) {
    return { valid: false, error: "daily_limit cannot exceed 1000" };
  }

  // Check test mode requirements
  if (typeof req.test_mode !== "boolean") {
    return { valid: false, error: "test_mode must be a boolean" };
  }

  if (req.test_mode) {
    if (!req.test_email || typeof req.test_email !== "string") {
      return { valid: false, error: "test_email is required when test_mode is true" };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.test_email)) {
      return { valid: false, error: "test_email must be a valid email address" };
    }
  }

  return {
    valid: true,
    data: {
      apollo_filters: req.apollo_filters,
      instantly_campaign_id: req.instantly_campaign_id.trim(),
      daily_limit: req.daily_limit,
      test_mode: req.test_mode,
      test_email: req.test_email?.trim(),
    },
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<CampaignRunResponse | CampaignRunError>> {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Invalid request" },
        { status: 400 }
      );
    }

    const { apollo_filters, instantly_campaign_id, daily_limit, test_mode, test_email } = validation.data;

    // Initialize response counters
    const response: CampaignRunResponse = {
      fetched: 0,
      verified: 0,
      skipped_duplicates: 0,
      sent: 0,
      test_sent: 0,
      errors: 0,
    };

    // Step 1: Fetch contacts from Apollo
    console.log(`[Campaign Run] Fetching up to ${daily_limit} contacts from Apollo...`);
    const apolloResult = await fetchApolloContacts(apollo_filters, daily_limit);

    if (apolloResult.error) {
      console.error(`[Campaign Run] Apollo fetch error: ${apolloResult.error}`);
      return NextResponse.json(
        { error: "Failed to fetch contacts from Apollo", details: apolloResult.error },
        { status: 502 }
      );
    }

    response.fetched = apolloResult.totalFetched;
    console.log(`[Campaign Run] Fetched ${response.fetched} contacts from Apollo`);

    if (apolloResult.contacts.length === 0) {
      console.log("[Campaign Run] No contacts found matching filters");
      return NextResponse.json(response);
    }

    // Step 2: Filter contacts (verified emails, non-generic)
    console.log("[Campaign Run] Filtering contacts...");
    const filterResult = filterContacts(apolloResult.contacts);
    let validContacts = filterResult.validContacts;

    response.verified = validContacts.length;
    console.log(`[Campaign Run] ${response.verified} contacts passed verification filters`);
    console.log(`[Campaign Run] Filtered out: ${filterResult.filteredOut.noEmail} no email, ${filterResult.filteredOut.unverified} unverified, ${filterResult.filteredOut.generic} generic`);

    if (validContacts.length === 0) {
      console.log("[Campaign Run] No verified contacts after filtering");
      return NextResponse.json(response);
    }

    // Step 3: Remove duplicates within the batch
    validContacts = removeDuplicateEmails(validContacts);
    console.log(`[Campaign Run] ${validContacts.length} unique contacts after internal deduplication`);

    // Step 4: Deduplicate against Instantly (skip in test mode)
    let contactsToSend: ValidatedContact[] = validContacts;

    if (!test_mode) {
      console.log("[Campaign Run] Checking Instantly for existing leads...");
      const emails = validContacts.map((c) => c.email);
      const alreadyEmailedSet = await getLeadsBatch(emails, instantly_campaign_id);

      contactsToSend = validContacts.filter((c) => !alreadyEmailedSet.has(c.email.toLowerCase()));
      response.skipped_duplicates = validContacts.length - contactsToSend.length;

      console.log(`[Campaign Run] Skipped ${response.skipped_duplicates} existing leads`);
      console.log(`[Campaign Run] ${contactsToSend.length} new contacts to send`);
    } else {
      console.log("[Campaign Run] Test mode - skipping deduplication");
    }

    if (contactsToSend.length === 0) {
      console.log("[Campaign Run] No new contacts to send after deduplication");
      return NextResponse.json(response);
    }

    // Step 5: Send to Instantly using bulk API
    console.log(`[Campaign Run] Sending ${contactsToSend.length} contacts to Instantly using bulk API...`);

    const instantlyResult = await sendBulkToInstantly({
      contacts: contactsToSend,
      campaignId: instantly_campaign_id,
      testMode: test_mode,
      testEmail: test_email,
    });

    if (test_mode) {
      response.test_sent = instantlyResult.successful;
    } else {
      response.sent = instantlyResult.successful;
    }
    response.errors = instantlyResult.failed;

    // Log any errors for debugging
    if (instantlyResult.errors.length > 0) {
      for (const error of instantlyResult.errors) {
        console.error(`[Campaign Run] Error: ${error.email}: ${error.error}`);
      }
    }

    console.log(`[Campaign Run] Instantly results - sent: ${response.sent}, test_sent: ${response.test_sent}, errors: ${response.errors}`);

    // Note: No longer persisting to Firebase - Instantly is the single source of truth for leads

    console.log("[Campaign Run] Campaign run completed successfully");
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Campaign Run] Unexpected error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "An unexpected error occurred", details: message },
      { status: 500 }
    );
  }
}
