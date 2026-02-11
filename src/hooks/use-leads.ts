"use client";

import { useState, useCallback } from "react";
import { sendContactsAction } from "@/services/campaign/campaign-actions";
import { getLeadByEmail, getLeadsBatch } from "@/services/instantly/get-leads";
import type { ValidatedContact, SendStageResult } from "@/types/campaign";
import type { InstantlyLeadData } from "@/services/instantly/get-leads";

interface UseLeadsState {
    isAddingLeads: boolean;
    isCheckingLead: boolean;
    isCheckingDuplicates: boolean;
    error: string | null;
}

interface UseLeadsReturn {
    state: UseLeadsState;
    addLeads: (
        contacts: ValidatedContact[],
        campaignId: string,
        testMode: boolean,
        testEmail?: string
    ) => Promise<SendStageResult>;
    getLeadByEmail: (
        email: string,
        campaignId?: string
    ) => Promise<InstantlyLeadData | null>;
    checkDuplicates: (
        emails: string[],
        campaignId?: string
    ) => Promise<Set<string>>;
}

/**
 * Hook for managing leads in Instantly.
 * Provides methods for adding leads, checking for duplicates, and retrieving lead data.
 */
export function useLeads(): UseLeadsReturn {
    const [state, setState] = useState<UseLeadsState>({
        isAddingLeads: false,
        isCheckingLead: false,
        isCheckingDuplicates: false,
        error: null,
    });

    const addLeads = useCallback(async (
        contacts: ValidatedContact[],
        campaignId: string,
        testMode: boolean,
        testEmail?: string
    ): Promise<SendStageResult> => {
        setState(prev => ({ ...prev, isAddingLeads: true, error: null }));

        try {
            const result = await sendContactsAction(contacts, campaignId, testMode, testEmail);

            if (result.status === "error") {
                setState(prev => ({ ...prev, isAddingLeads: false, error: result.error || "Failed to add leads" }));
            } else {
                setState(prev => ({ ...prev, isAddingLeads: false }));
            }

            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            setState(prev => ({ ...prev, isAddingLeads: false, error: message }));
            return {
                status: "error",
                error: message,
                sent: 0,
                testSent: 0,
                errors: contacts.length,
            };
        }
    }, []);

    const getLead = useCallback(async (
        email: string,
        campaignId?: string
    ): Promise<InstantlyLeadData | null> => {
        setState(prev => ({ ...prev, isCheckingLead: true, error: null }));

        try {
            const result = await getLeadByEmail(email, campaignId);
            setState(prev => ({ ...prev, isCheckingLead: false }));
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            setState(prev => ({ ...prev, isCheckingLead: false, error: message }));
            return null;
        }
    }, []);

    const checkDuplicates = useCallback(async (
        emails: string[],
        campaignId?: string
    ): Promise<Set<string>> => {
        setState(prev => ({ ...prev, isCheckingDuplicates: true, error: null }));

        try {
            const result = await getLeadsBatch(emails, campaignId);
            setState(prev => ({ ...prev, isCheckingDuplicates: false }));
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            setState(prev => ({ ...prev, isCheckingDuplicates: false, error: message }));
            return new Set<string>();
        }
    }, []);

    return {
        state,
        addLeads,
        getLeadByEmail: getLead,
        checkDuplicates,
    };
}
