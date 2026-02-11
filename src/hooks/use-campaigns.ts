"use client";

import { useState, useCallback } from "react";
import type {
    InstantlyCampaign,
    InstantlyCampaignFull,
    CreateCampaignRequest,
    UpdateCampaignRequest,
} from "@/types/campaign";

interface UseCampaignsReturn {
    campaigns: InstantlyCampaign[];
    isLoading: boolean;
    error: string | null;
    fetchCampaigns: () => Promise<void>;
    refetch: () => Promise<void>;
}

export function useCampaigns(): UseCampaignsReturn {
    const [campaigns, setCampaigns] = useState<InstantlyCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/instantly/campaigns");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch campaigns");
            }

            setCampaigns(data.campaigns || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        campaigns,
        isLoading,
        error,
        fetchCampaigns,
        refetch: fetchCampaigns,
    };
}

interface UseCreateCampaignReturn {
    createCampaign: (data: CreateCampaignRequest) => Promise<InstantlyCampaignFull | null>;
    isCreating: boolean;
    error: string | null;
}

export function useCreateCampaign(): UseCreateCampaignReturn {
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCampaign = useCallback(async (data: CreateCampaignRequest) => {
        setIsCreating(true);
        setError(null);

        try {
            const response = await fetch("/api/instantly/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create campaign");
            }

            return result.campaign as InstantlyCampaignFull;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return null;
        } finally {
            setIsCreating(false);
        }
    }, []);

    return {
        createCampaign,
        isCreating,
        error,
    };
}

interface UseUpdateCampaignReturn {
    updateCampaign: (id: string, data: UpdateCampaignRequest) => Promise<InstantlyCampaignFull | null>;
    isUpdating: boolean;
    error: string | null;
}

export function useUpdateCampaign(): UseUpdateCampaignReturn {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateCampaign = useCallback(async (id: string, data: UpdateCampaignRequest) => {
        setIsUpdating(true);
        setError(null);

        try {
            const response = await fetch(`/api/instantly/campaigns/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update campaign");
            }

            return result.campaign as InstantlyCampaignFull;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return null;
        } finally {
            setIsUpdating(false);
        }
    }, []);

    return {
        updateCampaign,
        isUpdating,
        error,
    };
}

interface UseDeleteCampaignReturn {
    deleteCampaign: (id: string) => Promise<boolean>;
    isDeleting: boolean;
    error: string | null;
}

export function useDeleteCampaign(): UseDeleteCampaignReturn {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteCampaign = useCallback(async (id: string) => {
        setIsDeleting(true);
        setError(null);

        try {
            const response = await fetch(`/api/instantly/campaigns/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to delete campaign");
            }

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return false;
        } finally {
            setIsDeleting(false);
        }
    }, []);

    return {
        deleteCampaign,
        isDeleting,
        error,
    };
}

interface UsePauseCampaignReturn {
    pauseCampaign: (id: string) => Promise<boolean>;
    isPausing: boolean;
    error: string | null;
}

export function usePauseCampaign(): UsePauseCampaignReturn {
    const [isPausing, setIsPausing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pauseCampaign = useCallback(async (id: string) => {
        setIsPausing(true);
        setError(null);

        try {
            const response = await fetch(`/api/instantly/campaigns/${id}/pause`, {
                method: "POST",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to pause campaign");
            }

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return false;
        } finally {
            setIsPausing(false);
        }
    }, []);

    return {
        pauseCampaign,
        isPausing,
        error,
    };
}

interface UseActivateCampaignReturn {
    activateCampaign: (id: string) => Promise<boolean>;
    isActivating: boolean;
    error: string | null;
}

export function useActivateCampaign(): UseActivateCampaignReturn {
    const [isActivating, setIsActivating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activateCampaign = useCallback(async (id: string) => {
        setIsActivating(true);
        setError(null);

        try {
            const response = await fetch(`/api/instantly/campaigns/${id}/activate`, {
                method: "POST",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to activate campaign");
            }

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return false;
        } finally {
            setIsActivating(false);
        }
    }, []);

    return {
        activateCampaign,
        isActivating,
        error,
    };
}
