// Campaign Run Types

export interface CampaignRunRequest {
  apollo_filters: ApolloSearchFilters;
  instantly_campaign_id: string;
  daily_limit: number;
  test_mode: boolean;
  test_email?: string;
}

export interface CampaignRunResponse {
  fetched: number;
  verified: number;
  skipped_duplicates: number;
  sent: number;
  test_sent: number;
  errors: number;
}

export interface CampaignRunError {
  error: string;
  details?: string;
}

// Apollo API Types

export interface ApolloSearchFilters {
  person_titles?: string[];
  person_seniorities?: string[];
  organization_locations?: string[];
  organization_num_employees_ranges?: string[];
  organization_industry_tag_ids?: string[];
  q_keywords?: string;
  per_page?: number;
  page?: number;
  [key: string]: unknown;
}

export interface ApolloContact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  email: string | null;
  email_status: string | null;
  title: string | null;
  organization?: {
    id: string;
    name: string | null;
    website_url: string | null;
    industry: string | null;
    estimated_num_employees: number | null;
  };
  linkedin_url: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface ApolloSearchResponse {
  people: ApolloContact[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

// Instantly API Types

export interface InstantlyLead {
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  personalization?: string;
  phone?: string;
  website?: string;
  custom_variables?: Record<string, string>;
}

export interface InstantlyAddLeadRequest {
  campaign_id: string;
  skip_if_in_workspace?: boolean;
  leads: InstantlyLead[];
}

export interface InstantlyAddLeadResponse {
  status: string;
  message?: string;
}

export interface InstantlyBulkAddLeadResponse {
  status: string;
  message?: string;
  uploaded?: number;
  skipped?: number;
  errors?: Array<{ email: string; error: string }>;
}

export interface BulkSendResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  successfulContacts: ValidatedContact[];
  errors: Array<{ email: string; error: string }>;
}

// Firestore Types

export interface EmailedContact {
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  title: string | null;
  source: "apollo";
  campaign_id: string;
  emailed_at: number;
  apollo_id?: string;
}

// Validated Contact (after filtering)

export interface ValidatedContact {
  apollo_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  company: string | null;
  linkedin_url: string | null;
}

// Campaign Stage Types

export type CampaignStageStatus = "idle" | "running" | "completed" | "error";

export interface StageResult {
  status: CampaignStageStatus;
  error?: string;
}

export interface FetchStageResult extends StageResult {
  contacts: ApolloContact[];
  totalFetched: number;
}

export interface FilterStageResult extends StageResult {
  contacts: ValidatedContact[];
  totalVerified: number;
  filteredOut: {
    noEmail: number;
    unverified: number;
    generic: number;
  };
}

export interface DedupeStageResult extends StageResult {
  contacts: ValidatedContact[];
  skippedDuplicates: number;
}

export interface SendStageResult extends StageResult {
  sent: number;
  testSent: number;
  errors: number;
}

// Instantly Lead Search Types

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

export interface CampaignState {
  // Stage results
  fetchResult: FetchStageResult | null;
  filterResult: FilterStageResult | null;
  dedupeResult: DedupeStageResult | null;
  sendResult: SendStageResult | null;

  // Current running stage
  currentStage: "fetch" | "filter" | "dedupe" | "send" | null;
}

// Stage API Request/Response types

export interface FetchStageRequest {
  apollo_filters: ApolloSearchFilters;
  daily_limit: number;
}

export interface FilterStageRequest {
  contacts: ApolloContact[];
}

export interface DedupeStageRequest {
  contacts: ValidatedContact[];
  test_mode: boolean;
}

export interface SendStageRequest {
  contacts: ValidatedContact[];
  instantly_campaign_id: string;
  test_mode: boolean;
  test_email?: string;
}

// API Usage Tracking Types

export interface ApiUsageRecord {
  id: string;
  service: "apollo" | "instantly";
  endpoint: string;
  timestamp: number;
  credits?: number;
  requestType?: string;
  metadata?: Record<string, unknown>;
}

export interface ApiUsageStats {
  service: "apollo" | "instantly";
  period: "day" | "week" | "month";
  totalRequests: number;
  totalCredits?: number;
  dailyBreakdown: Array<{
    date: string;
    requests: number;
    credits?: number;
  }>;
}

// Sent Email Types

export interface SentEmail {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  body: string;
  campaignId: string;
  campaignName?: string;
  sentAt: number;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
  apolloId?: string;
  instantlyLeadId?: string;
  metadata?: Record<string, unknown>;
}

// Campaign Analytics Types

export interface CampaignAnalytics {
  campaignId: string;
  campaignName?: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
}

export interface CampaignDailyAnalytics {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
}

// Email Health Types

export interface EmailHealthMetrics {
  email: string;
  warmupStatus: "active" | "paused" | "completed" | "not_started";
  warmupProgress: number;
  dailySendVolume: number;
  dailySendLimit: number;
  deliverabilityScore?: number;
  spamScore?: number;
  healthStatus: "healthy" | "warning" | "critical";
}

export interface AccountDailyAnalytics {
  date: string;
  email: string;
  sent: number;
  received: number;
  warmupSent: number;
  warmupReceived: number;
}

// Instantly Campaign Types

export interface InstantlyCampaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed" | "draft";
  createdAt?: string;
  updatedAt?: string;
}

// Campaign Schedule Types

export interface CampaignScheduleSlot {
  name: string;
  timing: {
    from: string; // HH:mm format
    to: string;   // HH:mm format
  };
  days: Record<string, boolean>; // sun, mon, tue, wed, thu, fri, sat
  timezone: string;
}

export interface CampaignSchedule {
  schedules: CampaignScheduleSlot[];
}

// Campaign Sequence Types

export interface CampaignSequenceVariant {
  subject: string;
  body: string;
}

export interface CampaignSequence {
  steps: CampaignSequenceStep[];
}

export interface CampaignSequenceStep {
  subject: string;
  body: string;
  delay?: number; // days
  variants?: CampaignSequenceVariant[];
}

// Campaign Management Types

export interface CreateCampaignRequest {
  name: string;
  campaign_schedule?: CampaignSchedule;
  sequences?: CampaignSequenceStep[];
  email_list?: string[]; // email account addresses
  daily_limit?: number;
  stop_on_reply?: boolean;
  stop_on_auto_reply?: boolean;
  link_tracking?: boolean;
  open_tracking?: boolean;
}

export interface UpdateCampaignRequest {
  name?: string;
  campaign_schedule?: CampaignSchedule;
  sequences?: CampaignSequenceStep[];
  email_list?: string[];
  daily_limit?: number;
  stop_on_reply?: boolean;
  stop_on_auto_reply?: boolean;
  link_tracking?: boolean;
  open_tracking?: boolean;
}

export interface CampaignManagementResponse {
  success: boolean;
  campaign?: InstantlyCampaignFull;
  error?: string;
}

export interface InstantlyCampaignFull extends InstantlyCampaign {
  daily_limit?: number;
  stop_on_reply?: boolean;
  stop_on_auto_reply?: boolean;
  link_tracking?: boolean;
  open_tracking?: boolean;
  sequences?: CampaignSequenceStep[];
  email_list?: string[];
  campaign_schedule?: CampaignSchedule;
  total_leads?: number;
  leads_contacted?: number;
}
