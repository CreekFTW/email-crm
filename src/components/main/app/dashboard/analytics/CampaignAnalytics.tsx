"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import StatsCard from "../campaign/StatsCard";
import {
    BarChart3,
    Mail,
    Eye,
    MousePointerClick,
    MessageSquare,
    AlertTriangle,
    RefreshCw,
    Loader2,
    TrendingUp,
} from "lucide-react";
import type { CampaignAnalytics, CampaignDailyAnalytics, InstantlyCampaign } from "@/types/campaign";

interface CampaignAnalyticsProps {
    initialCampaignId?: string;
}

const chartConfig: ChartConfig = {
    sent: {
        label: "Sent",
        color: "hsl(var(--chart-1))",
    },
    opened: {
        label: "Opened",
        color: "hsl(var(--chart-2))",
    },
    clicked: {
        label: "Clicked",
        color: "hsl(var(--chart-3))",
    },
    replied: {
        label: "Replied",
        color: "hsl(var(--chart-4))",
    },
};

export default function CampaignAnalyticsComponent({
    initialCampaignId,
}: CampaignAnalyticsProps) {
    const [campaigns, setCampaigns] = useState<InstantlyCampaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>(initialCampaignId || "");
    const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
    const [dailyData, setDailyData] = useState<CampaignDailyAnalytics[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch("/api/instantly/campaigns");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch campaigns");
            }

            setCampaigns(data.campaigns || []);

            if (!selectedCampaign && data.campaigns?.length > 0) {
                setSelectedCampaign(data.campaigns[0].id);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
        }
    };

    const fetchAnalytics = async (campaignId: string) => {
        if (!campaignId) return;

        setIsLoading(true);
        setError(null);

        try {
            const [analyticsRes, dailyRes] = await Promise.all([
                fetch(`/api/instantly/analytics?campaignId=${campaignId}&type=summary`),
                fetch(`/api/instantly/analytics?campaignId=${campaignId}&type=daily`),
            ]);

            const analyticsData = await analyticsRes.json();
            const dailyDataResponse = await dailyRes.json();

            if (!analyticsRes.ok) {
                throw new Error(analyticsData.error || "Failed to fetch analytics");
            }

            setAnalytics(analyticsData.analytics);
            setDailyData(dailyDataResponse.dailyData || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    useEffect(() => {
        if (selectedCampaign) {
            fetchAnalytics(selectedCampaign);
        }
    }, [selectedCampaign]);

    const handleRefresh = () => {
        if (selectedCampaign) {
            fetchAnalytics(selectedCampaign);
        }
    };

    const selectedCampaignName = campaigns.find(c => c.id === selectedCampaign)?.name || "Campaign";

    return (
        <div className="space-y-6">
            <Card className="pt-0">
                <CardHeader className="py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-500 text-white">
                                <BarChart3 className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-lg">Campaign Analytics</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                value={selectedCampaign}
                                onValueChange={setSelectedCampaign}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Select a campaign" />
                                </SelectTrigger>
                                <SelectContent>
                                    {campaigns.map((campaign) => (
                                        <SelectItem key={campaign.id} value={campaign.id}>
                                            {campaign.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={isLoading || !selectedCampaign}
                                className="h-9 w-9"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {error ? (
                        <div className="flex items-center justify-center py-8 text-red-500">
                            <div className="text-center">
                                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Error loading analytics</p>
                                <p className="text-xs mt-1">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    className="mt-3"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Retry
                                </Button>
                            </div>
                        </div>
                    ) : isLoading && !analytics ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-purple-500" />
                                <p className="font-medium text-muted-foreground">Loading analytics...</p>
                            </div>
                        </div>
                    ) : !selectedCampaign ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Select a campaign to view analytics</p>
                            </div>
                        </div>
                    ) : analytics ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                <StatsCard
                                    title="Emails Sent"
                                    value={analytics.sent}
                                    subtitle={selectedCampaignName}
                                    icon={<Mail />}
                                    colorScheme="blue"
                                />
                                <StatsCard
                                    title="Open Rate"
                                    value={`${analytics.openRate}%`}
                                    subtitle={`${analytics.opened} opened`}
                                    icon={<Eye />}
                                    colorScheme="green"
                                />
                                <StatsCard
                                    title="Click Rate"
                                    value={`${analytics.clickRate}%`}
                                    subtitle={`${analytics.clicked} clicked`}
                                    icon={<MousePointerClick />}
                                    colorScheme="purple"
                                />
                                <StatsCard
                                    title="Reply Rate"
                                    value={`${analytics.replyRate}%`}
                                    subtitle={`${analytics.replied} replied`}
                                    icon={<MessageSquare />}
                                    colorScheme="cyan"
                                />
                                <StatsCard
                                    title="Bounce Rate"
                                    value={`${analytics.bounceRate}%`}
                                    subtitle={`${analytics.bounced} bounced`}
                                    icon={<AlertTriangle />}
                                    colorScheme="orange"
                                />
                            </div>

                            {dailyData.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                            <CardTitle className="text-sm font-medium">Daily Performance</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                            <LineChart data={dailyData}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis
                                                    dataKey="date"
                                                    tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    className="text-xs"
                                                />
                                                <YAxis className="text-xs" />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="sent"
                                                    stroke="var(--color-sent)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="opened"
                                                    stroke="var(--color-opened)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="clicked"
                                                    stroke="var(--color-clicked)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="replied"
                                                    stroke="var(--color-replied)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                        <div className="flex items-center justify-center gap-6 mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
                                                <span className="text-xs text-muted-foreground">Sent</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
                                                <span className="text-xs text-muted-foreground">Opened</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-3))]" />
                                                <span className="text-xs text-muted-foreground">Clicked</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-4))]" />
                                                <span className="text-xs text-muted-foreground">Replied</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
