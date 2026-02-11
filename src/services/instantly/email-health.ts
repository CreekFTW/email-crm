"use server";

import type { EmailHealthMetrics, AccountDailyAnalytics } from "@/types/campaign";

const INSTANTLY_BASE_URL = "https://api.instantly.ai/api/v2";

interface InstantlyAccountResponse {
    email: string;
    warmup_status?: string;
    warmup_progress?: number;
    daily_limit?: number;
    daily_sent?: number;
    health_score?: number;
}

interface InstantlyWarmupAnalyticsResponse {
    data?: Array<{
        email: string;
        warmup_status: string;
        warmup_progress: number;
        warmup_reputation?: number;
        total_sent_count?: number;
        total_inbox_count?: number;
        total_spam_count?: number;
    }>;
}

interface InstantlyAccountDailyResponse {
    data?: Array<{
        date: string;
        email: string;
        sent_count: number;
        inbox_count: number;
        warmup_sent: number;
        warmup_inbox: number;
    }>;
}

export async function getEmailAccounts(): Promise<{
    accounts: Array<{ email: string; status: string }>;
    error?: string;
}> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            accounts: [],
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(`${INSTANTLY_BASE_URL}/accounts?limit=100`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                accounts: [],
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const data = await response.json();

        const accounts = (data.items || []).map((item: InstantlyAccountResponse) => ({
            email: item.email,
            status: item.warmup_status || "unknown",
        }));

        return { accounts };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            accounts: [],
            error: `Failed to fetch accounts: ${message}`,
        };
    }
}

export async function getWarmupAnalytics(
    emails: string[]
): Promise<{
    metrics: EmailHealthMetrics[];
    error?: string;
}> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            metrics: [],
            error: "Instantly API key not configured",
        };
    }

    try {
        const response = await fetch(`${INSTANTLY_BASE_URL}/accounts/warmup-analytics`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ emails }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                metrics: [],
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const data: InstantlyWarmupAnalyticsResponse = await response.json();

        const metrics: EmailHealthMetrics[] = (data.data || []).map((item) => {
            const totalEmails = (item.total_inbox_count || 0) + (item.total_spam_count || 0);
            const spamScore = totalEmails > 0
                ? Math.round(((item.total_spam_count || 0) / totalEmails) * 100)
                : 0;

            let healthStatus: EmailHealthMetrics["healthStatus"] = "healthy";
            if (spamScore > 20 || item.warmup_progress < 30) {
                healthStatus = "critical";
            } else if (spamScore > 10 || item.warmup_progress < 60) {
                healthStatus = "warning";
            }

            return {
                email: item.email,
                warmupStatus: item.warmup_status as EmailHealthMetrics["warmupStatus"],
                warmupProgress: item.warmup_progress,
                dailySendVolume: item.total_sent_count || 0,
                dailySendLimit: 50,
                deliverabilityScore: item.warmup_reputation,
                spamScore,
                healthStatus,
            };
        });

        return { metrics };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            metrics: [],
            error: `Failed to fetch warmup analytics: ${message}`,
        };
    }
}

export async function getAccountDailyAnalytics(
    emails: string[],
    startDate?: string,
    endDate?: string
): Promise<{
    dailyData: AccountDailyAnalytics[];
    error?: string;
}> {
    const apiKey = process.env.INSTANTLY_API_KEY;

    if (!apiKey) {
        return {
            dailyData: [],
            error: "Instantly API key not configured",
        };
    }

    try {
        const body: Record<string, unknown> = { emails };
        if (startDate) body.start_date = startDate;
        if (endDate) body.end_date = endDate;

        const response = await fetch(`${INSTANTLY_BASE_URL}/accounts/analytics/daily`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                dailyData: [],
                error: `Instantly API error (${response.status}): ${errorText}`,
            };
        }

        const data: InstantlyAccountDailyResponse = await response.json();

        const dailyData: AccountDailyAnalytics[] = (data.data || []).map((item) => ({
            date: item.date,
            email: item.email,
            sent: item.sent_count,
            received: item.inbox_count,
            warmupSent: item.warmup_sent,
            warmupReceived: item.warmup_inbox,
        }));

        return { dailyData };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            dailyData: [],
            error: `Failed to fetch daily analytics: ${message}`,
        };
    }
}

export async function getEmailHealthSummary(): Promise<{
    summary: {
        totalAccounts: number;
        healthyAccounts: number;
        warningAccounts: number;
        criticalAccounts: number;
        averageWarmupProgress: number;
    };
    accounts: EmailHealthMetrics[];
    error?: string;
}> {
    const { accounts, error: accountsError } = await getEmailAccounts();

    if (accountsError) {
        return {
            summary: {
                totalAccounts: 0,
                healthyAccounts: 0,
                warningAccounts: 0,
                criticalAccounts: 0,
                averageWarmupProgress: 0,
            },
            accounts: [],
            error: accountsError,
        };
    }

    if (accounts.length === 0) {
        return {
            summary: {
                totalAccounts: 0,
                healthyAccounts: 0,
                warningAccounts: 0,
                criticalAccounts: 0,
                averageWarmupProgress: 0,
            },
            accounts: [],
        };
    }

    const emails = accounts.map((a) => a.email);
    const { metrics, error: metricsError } = await getWarmupAnalytics(emails);

    if (metricsError) {
        return {
            summary: {
                totalAccounts: accounts.length,
                healthyAccounts: 0,
                warningAccounts: 0,
                criticalAccounts: 0,
                averageWarmupProgress: 0,
            },
            accounts: [],
            error: metricsError,
        };
    }

    const healthyCount = metrics.filter((m) => m.healthStatus === "healthy").length;
    const warningCount = metrics.filter((m) => m.healthStatus === "warning").length;
    const criticalCount = metrics.filter((m) => m.healthStatus === "critical").length;
    const avgProgress = metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.warmupProgress, 0) / metrics.length)
        : 0;

    return {
        summary: {
            totalAccounts: accounts.length,
            healthyAccounts: healthyCount,
            warningAccounts: warningCount,
            criticalAccounts: criticalCount,
            averageWarmupProgress: avgProgress,
        },
        accounts: metrics,
    };
}
