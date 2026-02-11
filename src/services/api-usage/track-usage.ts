"use server";

import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { usersCol, apiUsageCol } from "@/utils/constants";
import type { ApiUsageRecord } from "@/types/campaign";

interface TrackUsageParams {
    userId: string;
    service: "apollo" | "instantly";
    endpoint: string;
    credits?: number;
    requestType?: string;
    metadata?: Record<string, unknown>;
}

export async function trackApiUsage(params: TrackUsageParams): Promise<void> {
    const { userId, service, endpoint, credits, requestType, metadata } = params;

    try {
        const timestamp = Date.now();
        const docId = `${service}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

        const usageRecord: Omit<ApiUsageRecord, "id"> = {
            service,
            endpoint,
            timestamp,
            credits,
            requestType,
            metadata,
        };

        await firestoreAdmin
            .collection(usersCol)
            .doc(userId)
            .collection(apiUsageCol)
            .doc(docId)
            .set(usageRecord);

        console.log(`[API Usage] Tracked ${service} usage for user ${userId}: ${endpoint}`);
    } catch (error) {
        console.error(`[API Usage] Error tracking usage:`, error);
    }
}

export async function trackApolloUsage(
    userId: string,
    endpoint: string,
    credits?: number,
    metadata?: Record<string, unknown>
): Promise<void> {
    await trackApiUsage({
        userId,
        service: "apollo",
        endpoint,
        credits,
        requestType: "search",
        metadata,
    });
}

export async function trackInstantlyUsage(
    userId: string,
    endpoint: string,
    requestType: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await trackApiUsage({
        userId,
        service: "instantly",
        endpoint,
        requestType,
        metadata,
    });
}
