"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import StatsCard from "../campaign/StatsCard";
import {
    Shield,
    Mail,
    RefreshCw,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Flame,
    Activity,
    Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmailHealthMetrics } from "@/types/campaign";

interface EmailHealthSummary {
    totalAccounts: number;
    healthyAccounts: number;
    warningAccounts: number;
    criticalAccounts: number;
    averageWarmupProgress: number;
}

export default function EmailHealth() {
    const [summary, setSummary] = useState<EmailHealthSummary | null>(null);
    const [accounts, setAccounts] = useState<EmailHealthMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHealthData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/instantly/email-health");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch email health");
            }

            setSummary(data.summary);
            setAccounts(data.accounts || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthData();
    }, []);

    useEffect(() => {
        const interval = setInterval(fetchHealthData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getHealthBadge = (status: EmailHealthMetrics["healthStatus"]) => {
        switch (status) {
            case "healthy":
                return (
                    <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Healthy
                    </Badge>
                );
            case "warning":
                return (
                    <Badge className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Warning
                    </Badge>
                );
            case "critical":
                return (
                    <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                        <XCircle className="h-3 w-3 mr-1" />
                        Critical
                    </Badge>
                );
        }
    };

    const getWarmupStatusBadge = (status: EmailHealthMetrics["warmupStatus"]) => {
        switch (status) {
            case "active":
                return (
                    <Badge variant="secondary" className="text-xs">
                        <Flame className="h-3 w-3 mr-1 text-orange-500" />
                        Active
                    </Badge>
                );
            case "completed":
                return (
                    <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case "paused":
                return (
                    <Badge variant="outline" className="text-xs">
                        Paused
                    </Badge>
                );
            case "not_started":
                return (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                        Not Started
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-xs">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            <Card className="pt-0">
                <CardHeader className="py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                                <Shield className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-lg">Email Health</CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchHealthData}
                            disabled={isLoading}
                            className="h-9 w-9"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {error ? (
                        <div className="flex items-center justify-center py-8 text-red-500">
                            <div className="text-center">
                                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Error loading email health</p>
                                <p className="text-xs mt-1">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchHealthData}
                                    className="mt-3"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry
                                </Button>
                            </div>
                        </div>
                    ) : isLoading && !summary ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-emerald-500" />
                                <p className="font-medium text-muted-foreground">Loading email health...</p>
                            </div>
                        </div>
                    ) : summary ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatsCard
                                    title="Total Accounts"
                                    value={summary.totalAccounts}
                                    subtitle="Email accounts"
                                    icon={<Users />}
                                    colorScheme="blue"
                                />
                                <StatsCard
                                    title="Healthy"
                                    value={summary.healthyAccounts}
                                    subtitle="Accounts healthy"
                                    icon={<CheckCircle2 />}
                                    colorScheme="green"
                                />
                                <StatsCard
                                    title="Warnings"
                                    value={summary.warningAccounts}
                                    subtitle="Need attention"
                                    icon={<AlertTriangle />}
                                    colorScheme="orange"
                                />
                                <StatsCard
                                    title="Avg. Warmup"
                                    value={`${summary.averageWarmupProgress}%`}
                                    subtitle="Progress"
                                    icon={<Activity />}
                                    colorScheme="purple"
                                />
                            </div>

                            {accounts.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <CardTitle className="text-sm font-medium">Account Details</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-auto max-h-[400px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                                            Email
                                                        </TableHead>
                                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                                            Health
                                                        </TableHead>
                                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                                            Warmup
                                                        </TableHead>
                                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                                            Progress
                                                        </TableHead>
                                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                                            Daily Volume
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {accounts.map((account, index) => (
                                                        <TableRow
                                                            key={account.email}
                                                            className={cn(
                                                                "border-muted transition-colors hover:bg-muted/50",
                                                                index % 2 === 0 && "bg-muted/20"
                                                            )}
                                                        >
                                                            <TableCell className="font-mono text-sm">
                                                                {account.email}
                                                            </TableCell>
                                                            <TableCell>
                                                                {getHealthBadge(account.healthStatus)}
                                                            </TableCell>
                                                            <TableCell>
                                                                {getWarmupStatusBadge(account.warmupStatus)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2 min-w-[120px]">
                                                                    <Progress
                                                                        value={account.warmupProgress}
                                                                        className="h-2 flex-1"
                                                                    />
                                                                    <span className="text-xs text-muted-foreground w-10 text-right">
                                                                        {account.warmupProgress}%
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                <span className={cn(
                                                                    account.dailySendVolume >= account.dailySendLimit * 0.9
                                                                        ? "text-orange-500"
                                                                        : "text-muted-foreground"
                                                                )}>
                                                                    {account.dailySendVolume} / {account.dailySendLimit}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <div className="text-center">
                                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No email accounts found</p>
                                <p className="text-xs mt-1">Connect email accounts in Instantly to monitor their health</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
