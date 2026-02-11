"use client";

import { useState, useEffect, useCallback } from "react";
import type { InstantlyLeadData } from "@/types/campaign";

interface UseInstantlyContactsOptions {
    campaignId?: string;
    autoFetch?: boolean;
    pollingInterval?: number;
}

interface UseInstantlyContactsResult {
    contacts: InstantlyLeadData[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
}

export function useInstantlyContacts(
    options: UseInstantlyContactsOptions = {}
): UseInstantlyContactsResult {
    const { campaignId, autoFetch = true, pollingInterval } = options;

    const [contacts, setContacts] = useState<InstantlyLeadData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextStartingAfter, setNextStartingAfter] = useState<string | undefined>();

    const fetchContacts = useCallback(async (append = false) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (campaignId) {
                params.append("campaignId", campaignId);
            }
            if (append && nextStartingAfter) {
                params.append("startingAfter", nextStartingAfter);
            }

            const response = await fetch(`/api/instantly/leads?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch contacts");
            }

            if (append) {
                setContacts(prev => [...prev, ...data.leads]);
            } else {
                setContacts(data.leads || []);
            }

            setHasMore(data.hasMore || false);
            setNextStartingAfter(data.nextStartingAfter);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [campaignId, nextStartingAfter]);

    const refresh = useCallback(async () => {
        setNextStartingAfter(undefined);
        await fetchContacts(false);
    }, [fetchContacts]);

    const loadMore = useCallback(async () => {
        if (hasMore && !isLoading) {
            await fetchContacts(true);
        }
    }, [fetchContacts, hasMore, isLoading]);

    useEffect(() => {
        if (autoFetch) {
            fetchContacts(false);
        }
    }, [autoFetch, campaignId]);

    useEffect(() => {
        if (pollingInterval && pollingInterval > 0) {
            const interval = setInterval(() => {
                fetchContacts(false);
            }, pollingInterval);

            return () => clearInterval(interval);
        }
    }, [pollingInterval, fetchContacts]);

    return {
        contacts,
        isLoading,
        error,
        hasMore,
        refresh,
        loadMore,
    };
}
