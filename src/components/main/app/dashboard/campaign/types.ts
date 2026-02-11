import type {
    ApolloSearchFilters,
    ApolloContact,
    ValidatedContact,
    FetchStageResult,
    FilterStageResult,
    DedupeStageResult,
    SendStageResult,
    CampaignStageStatus,
} from "@/types/campaign";

export interface StageState {
    status: CampaignStageStatus;
    error?: string;
}

export interface SearchFilters {
    personTitles: string[];
    personSeniorities: string[];
    locations: string[];
    employeeRanges: string[];
    industries: string[];
    keywords: string;
    dailyLimit: number;
}

export interface CampaignSettings {
    instantlyCampaignId: string;
    testMode: boolean;
    testEmail: string;
}

export interface PipelineState {
    fetchState: StageState;
    filterState: StageState;
    dedupeState: StageState;
    sendState: StageState;
    fetchResult: FetchStageResult | null;
    filterResult: FilterStageResult | null;
    dedupeResult: DedupeStageResult | null;
    sendResult: SendStageResult | null;
    isAnyRunning: boolean;
}

export interface PipelineActions {
    runFetch: () => Promise<boolean>;
    runFilter: () => Promise<boolean>;
    runDedupe: () => Promise<boolean>;
    runSend: () => Promise<boolean>;
    runAllStages: () => Promise<void>;
    resetAll: () => void;
}

export type {
    ApolloSearchFilters,
    ApolloContact,
    ValidatedContact,
    FetchStageResult,
    FilterStageResult,
    DedupeStageResult,
    SendStageResult,
    CampaignStageStatus,
};