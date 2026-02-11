"use client";

import { useEffect, useCallback } from "react";
import type {
    ApolloContact,
    ValidatedContact,
    FetchStageResult,
    FilterStageResult,
    DedupeStageResult,
    SendStageResult,
    CampaignStageStatus,
} from "@/types/campaign";

const STORAGE_KEY = "campaign_run_state";

interface StageState {
    status: CampaignStageStatus;
    error?: string;
}

export interface CampaignStorageState {
    // Stage states
    fetchState: StageState;
    filterState: StageState;
    dedupeState: StageState;
    sendState: StageState;

    // Stage data
    fetchedContacts: ApolloContact[];
    filteredContacts: ValidatedContact[];
    dedupedContacts: ValidatedContact[];

    // Stage results
    fetchResult: FetchStageResult | null;
    filterResult: FilterStageResult | null;
    dedupeResult: DedupeStageResult | null;
    sendResult: SendStageResult | null;

    // Timestamp
    savedAt: number;
}

const DEFAULT_STATE: CampaignStorageState = {
    fetchState: { status: "idle" },
    filterState: { status: "idle" },
    dedupeState: { status: "idle" },
    sendState: { status: "idle" },
    fetchedContacts: [],
    filteredContacts: [],
    dedupedContacts: [],
    fetchResult: null,
    filterResult: null,
    dedupeResult: null,
    sendResult: null,
    savedAt: 0,
};

/**
 * Save campaign state to session storage
 */
export function saveCampaignState(state: Partial<CampaignStorageState>): void {
    if (typeof window === "undefined") return;

    try {
        const existing = loadCampaignState();
        const newState: CampaignStorageState = {
            ...existing,
            ...state,
            savedAt: Date.now(),
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
        console.error("[CampaignStorage] Failed to save state:", error);
    }
}

/**
 * Load campaign state from session storage
 */
export function loadCampaignState(): CampaignStorageState {
    if (typeof window === "undefined") return DEFAULT_STATE;

    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return DEFAULT_STATE;

        const parsed = JSON.parse(stored) as CampaignStorageState;

        // Check if state is older than 1 hour - if so, clear it
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - parsed.savedAt > oneHour) {
            clearCampaignState();
            return DEFAULT_STATE;
        }

        return parsed;
    } catch (error) {
        console.error("[CampaignStorage] Failed to load state:", error);
        return DEFAULT_STATE;
    }
}

/**
 * Clear campaign state from session storage
 */
export function clearCampaignState(): void {
    if (typeof window === "undefined") return;

    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("[CampaignStorage] Failed to clear state:", error);
    }
}

/**
 * Hook to use campaign storage with auto-save
 */
export function useCampaignStorage() {
    const save = useCallback((state: Partial<CampaignStorageState>) => {
        saveCampaignState(state);
    }, []);

    const load = useCallback(() => {
        return loadCampaignState();
    }, []);

    const clear = useCallback(() => {
        clearCampaignState();
    }, []);

    return { save, load, clear };
}