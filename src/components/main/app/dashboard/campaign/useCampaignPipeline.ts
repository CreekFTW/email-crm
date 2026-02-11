"use client";

import { useState, useRef, useCallback } from "react";
import {
    useCampaignStorage,
    clearCampaignState,
    loadCampaignState,
} from "@/hooks/use-campaign-storage";
import {
    fetchContactsAction,
    filterContactsAction,
    dedupeContactsAction,
    sendContactsAction,
} from "@/services/campaign/campaign-actions";
import type {
    StageState,
    SearchFilters,
    CampaignSettings,
    PipelineState,
    PipelineActions,
    ApolloSearchFilters,
    ApolloContact,
    ValidatedContact,
    FetchStageResult,
    FilterStageResult,
    DedupeStageResult,
    SendStageResult,
} from "./types";

function getInitialStageState(
    stored: ReturnType<typeof loadCampaignState>,
    key: 'fetchState' | 'filterState' | 'dedupeState' | 'sendState'
): StageState {
    if (stored.savedAt > 0) {
        const state = stored[key];
        return state.status === "running" ? { status: "idle" } : state;
    }
    return { status: "idle" };
}

export function useCampaignPipeline(
    filters: SearchFilters,
    settings: CampaignSettings
) {
    const { save } = useCampaignStorage();
    const [initialState] = useState(() => loadCampaignState());

    // Stage states
    const [fetchState, setFetchState] = useState<StageState>(() => getInitialStageState(initialState, 'fetchState'));
    const [filterState, setFilterState] = useState<StageState>(() => getInitialStageState(initialState, 'filterState'));
    const [dedupeState, setDedupeState] = useState<StageState>(() => getInitialStageState(initialState, 'dedupeState'));
    const [sendState, setSendState] = useState<StageState>(() => getInitialStageState(initialState, 'sendState'));

    // Stage data refs
    const fetchedContactsRef = useRef<ApolloContact[]>(initialState.savedAt > 0 ? initialState.fetchedContacts : []);
    const filteredContactsRef = useRef<ValidatedContact[]>(initialState.savedAt > 0 ? initialState.filteredContacts : []);
    const dedupedContactsRef = useRef<ValidatedContact[]>(initialState.savedAt > 0 ? initialState.dedupedContacts : []);

    // Stage results
    const [fetchResult, setFetchResult] = useState<FetchStageResult | null>(initialState.savedAt > 0 ? initialState.fetchResult : null);
    const [filterResult, setFilterResult] = useState<FilterStageResult | null>(initialState.savedAt > 0 ? initialState.filterResult : null);
    const [dedupeResult, setDedupeResult] = useState<DedupeStageResult | null>(initialState.savedAt > 0 ? initialState.dedupeResult : null);
    const [sendResult, setSendResult] = useState<SendStageResult | null>(initialState.savedAt > 0 ? initialState.sendResult : null);

    const isAnyRunning =
        fetchState.status === "running" ||
        filterState.status === "running" ||
        dedupeState.status === "running" ||
        sendState.status === "running";

    const buildApolloFilters = useCallback((): ApolloSearchFilters => {
        const apolloFilters: ApolloSearchFilters = {};
        if (filters.personTitles.length > 0) apolloFilters.person_titles = filters.personTitles;
        if (filters.personSeniorities.length > 0) apolloFilters.person_seniorities = filters.personSeniorities;
        if (filters.locations.length > 0) apolloFilters.organization_locations = filters.locations;
        if (filters.employeeRanges.length > 0) apolloFilters.organization_num_employees_ranges = filters.employeeRanges;
        if (filters.industries.length > 0) apolloFilters.organization_industry_tag_ids = filters.industries;
        if (filters.keywords.trim()) apolloFilters.q_keywords = filters.keywords.trim();
        return apolloFilters;
    }, [filters]);

    const validateFilters = useCallback((): string | null => {
        const hasFilters =
            filters.personTitles.length > 0 ||
            filters.personSeniorities.length > 0 ||
            filters.locations.length > 0 ||
            filters.employeeRanges.length > 0 ||
            filters.industries.length > 0 ||
            filters.keywords.trim();
        if (!hasFilters) return "Please select at least one search filter";
        if (filters.dailyLimit <= 0) return "Daily limit must be greater than 0";
        if (filters.dailyLimit > 1000) return "Daily limit cannot exceed 1000";
        return null;
    }, [filters]);

    const validateSend = useCallback((): string | null => {
        if (!settings.instantlyCampaignId.trim()) return "Instantly Campaign ID is required";
        if (settings.testMode && !settings.testEmail.trim()) return "Test email is required in test mode";
        if (settings.testMode && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.testEmail)) return "Invalid test email";
        return null;
    }, [settings]);

    const runFetch = useCallback(async (): Promise<boolean> => {
        const error = validateFilters();
        if (error) {
            setFetchState({ status: "error", error });
            return false;
        }

        setFetchState({ status: "running" });
        setFetchResult(null);

        try {
            const data = await fetchContactsAction(buildApolloFilters(), filters.dailyLimit);

            if (data.status === "error") {
                setFetchState({ status: "error", error: data.error });
                return false;
            }

            fetchedContactsRef.current = data.contacts;
            setFetchResult(data);
            setFetchState({ status: "completed" });

            // Reset downstream stages
            setFilterState({ status: "idle" });
            filteredContactsRef.current = [];
            setFilterResult(null);
            setDedupeState({ status: "idle" });
            dedupedContactsRef.current = [];
            setDedupeResult(null);
            setSendState({ status: "idle" });
            setSendResult(null);

            save({
                fetchState: { status: "completed" },
                filterState: { status: "idle" },
                dedupeState: { status: "idle" },
                sendState: { status: "idle" },
                fetchedContacts: data.contacts,
                filteredContacts: [],
                dedupedContacts: [],
                fetchResult: data,
                filterResult: null,
                dedupeResult: null,
                sendResult: null,
            });

            return true;
        } catch (err) {
            setFetchState({ status: "error", error: err instanceof Error ? err.message : "Unknown error" });
            return false;
        }
    }, [buildApolloFilters, filters.dailyLimit, save, validateFilters]);

    const runFilter = useCallback(async (): Promise<boolean> => {
        if (fetchedContactsRef.current.length === 0) {
            setFilterState({ status: "error", error: "No contacts to filter. Run Fetch first." });
            return false;
        }

        setFilterState({ status: "running" });
        setFilterResult(null);

        try {
            const data = await filterContactsAction(fetchedContactsRef.current);

            if (data.status === "error") {
                setFilterState({ status: "error", error: data.error });
                return false;
            }

            filteredContactsRef.current = data.contacts;
            setFilterResult(data);
            setFilterState({ status: "completed" });

            // Reset downstream stages
            setDedupeState({ status: "idle" });
            dedupedContactsRef.current = [];
            setDedupeResult(null);
            setSendState({ status: "idle" });
            setSendResult(null);

            save({
                filterState: { status: "completed" },
                dedupeState: { status: "idle" },
                sendState: { status: "idle" },
                filteredContacts: data.contacts,
                dedupedContacts: [],
                filterResult: data,
                dedupeResult: null,
                sendResult: null,
            });

            return true;
        } catch (err) {
            setFilterState({ status: "error", error: err instanceof Error ? err.message : "Unknown error" });
            return false;
        }
    }, [save]);

    const runDedupe = useCallback(async (): Promise<boolean> => {
        if (filteredContactsRef.current.length === 0) {
            setDedupeState({ status: "error", error: "No contacts to dedupe. Run Filter first." });
            return false;
        }

        setDedupeState({ status: "running" });
        setDedupeResult(null);

        try {
            const data = await dedupeContactsAction(
                filteredContactsRef.current,
                settings.testMode,
                settings.instantlyCampaignId || undefined
            );

            if (data.status === "error") {
                setDedupeState({ status: "error", error: data.error });
                return false;
            }

            dedupedContactsRef.current = data.contacts;
            setDedupeResult(data);
            setDedupeState({ status: "completed" });

            // Reset downstream stage
            setSendState({ status: "idle" });
            setSendResult(null);

            save({
                dedupeState: { status: "completed" },
                sendState: { status: "idle" },
                dedupedContacts: data.contacts,
                dedupeResult: data,
                sendResult: null,
            });

            return true;
        } catch (err) {
            setDedupeState({ status: "error", error: err instanceof Error ? err.message : "Unknown error" });
            return false;
        }
    }, [save, settings.testMode, settings.instantlyCampaignId]);

    const runSend = useCallback(async (): Promise<boolean> => {
        const error = validateSend();
        if (error) {
            setSendState({ status: "error", error });
            return false;
        }

        if (dedupedContactsRef.current.length === 0) {
            setSendState({ status: "error", error: "No contacts to send. Run Dedupe first." });
            return false;
        }

        setSendState({ status: "running" });
        setSendResult(null);

        try {
            const data = await sendContactsAction(
                dedupedContactsRef.current,
                settings.instantlyCampaignId.trim(),
                settings.testMode,
                settings.testMode ? settings.testEmail.trim() : undefined
            );

            if (data.status === "error") {
                setSendState({ status: "error", error: data.error });
                return false;
            }

            setSendResult(data);
            setSendState({ status: "completed" });

            save({
                sendState: { status: "completed" },
                sendResult: data,
            });

            return true;
        } catch (err) {
            setSendState({ status: "error", error: err instanceof Error ? err.message : "Unknown error" });
            return false;
        }
    }, [save, settings, validateSend]);

    const runAllStages = useCallback(async () => {
        const fetchSuccess = await runFetch();
        if (!fetchSuccess) return;

        const filterSuccess = await runFilter();
        if (!filterSuccess) return;

        const dedupeSuccess = await runDedupe();
        if (!dedupeSuccess) return;

        await runSend();
    }, [runFetch, runFilter, runDedupe, runSend]);

    const resetAll = useCallback(() => {
        setFetchState({ status: "idle" });
        setFilterState({ status: "idle" });
        setDedupeState({ status: "idle" });
        setSendState({ status: "idle" });
        fetchedContactsRef.current = [];
        filteredContactsRef.current = [];
        dedupedContactsRef.current = [];
        setFetchResult(null);
        setFilterResult(null);
        setDedupeResult(null);
        setSendResult(null);
        clearCampaignState();
    }, []);

    const pipelineState: PipelineState = {
        fetchState,
        filterState,
        dedupeState,
        sendState,
        fetchResult,
        filterResult,
        dedupeResult,
        sendResult,
        isAnyRunning,
    };

    const pipelineActions: PipelineActions = {
        runFetch,
        runFilter,
        runDedupe,
        runSend,
        runAllStages,
        resetAll,
    };

    return { state: pipelineState, actions: pipelineActions };
}