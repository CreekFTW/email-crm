"use server";

import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { usersCol, apiUsageCol } from "@/utils/constants";
import type { ApiUsageRecord, ApiUsageStats } from "@/types/campaign";

interface GetUsageParams {
    userId: string;
    service: "apollo" | "instantly";
    period: "day" | "week" | "month";
}

function getStartTimestamp(period: "day" | "week" | "month"): number {
    const now = new Date();
    switch (period) {
        case "day":
            return now.setHours(0, 0, 0, 0);
        case "week":
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 7);
            return weekStart.setHours(0, 0, 0, 0);
        case "month":
            const monthStart = new Date(now);
            monthStart.setDate(now.getDate() - 30);
            return monthStart.setHours(0, 0, 0, 0);
    }
}

function formatDate(timestamp: number): string {
    return new Date(timestamp).toISOString().split("T")[0];
}

export async function getApiUsageStats(params: GetUsageParams): Promise<ApiUsageStats> {
    const { userId, service, period } = params;
    const startTimestamp = getStartTimestamp(period);

    try {
        const snapshot = await firestoreAdmin
            .collection(usersCol)
            .doc(userId)
            .collection(apiUsageCol)
            .where("service", "==", service)
            .where("timestamp", ">=", startTimestamp)
            .orderBy("timestamp", "desc")
            .get();

        const records: ApiUsageRecord[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as ApiUsageRecord[];

        const dailyMap = new Map<string, { requests: number; credits: number }>();

        let totalRequests = 0;
        let totalCredits = 0;

        for (const record of records) {
            totalRequests++;
            totalCredits += record.credits || 0;

            const dateKey = formatDate(record.timestamp);
            const existing = dailyMap.get(dateKey) || { requests: 0, credits: 0 };
            dailyMap.set(dateKey, {
                requests: existing.requests + 1,
                credits: existing.credits + (record.credits || 0),
            });
        }

        const dailyBreakdown = Array.from(dailyMap.entries())
            .map(([date, data]) => ({
                date,
                requests: data.requests,
                credits: data.credits,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            service,
            period,
            totalRequests,
            totalCredits: service === "apollo" ? totalCredits : undefined,
            dailyBreakdown,
        };
    } catch (error) {
        console.error(`[API Usage] Error fetching usage stats:`, error);
        return {
            service,
            period,
            totalRequests: 0,
            totalCredits: service === "apollo" ? 0 : undefined,
            dailyBreakdown: [],
        };
    }
}

export async function getApolloUsageStats(
    userId: string,
    period: "day" | "week" | "month" = "day"
): Promise<ApiUsageStats> {
    return getApiUsageStats({ userId, service: "apollo", period });
}

export async function getInstantlyUsageStats(
    userId: string,
    period: "day" | "week" | "month" = "day"
): Promise<ApiUsageStats> {
    return getApiUsageStats({ userId, service: "instantly", period });
}

export async function getCombinedUsageStats(
    userId: string,
    period: "day" | "week" | "month" = "day"
): Promise<{ apollo: ApiUsageStats; instantly: ApiUsageStats }> {
    const [apollo, instantly] = await Promise.all([
        getApolloUsageStats(userId, period),
        getInstantlyUsageStats(userId, period),
    ]);

    return { apollo, instantly };
}
