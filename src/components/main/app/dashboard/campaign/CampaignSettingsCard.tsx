"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Settings, Mail, FlaskConical, Hash, Loader2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CampaignSettings } from "./types";
import type { InstantlyCampaign } from "@/types/campaign";

interface CampaignSettingsCardProps {
    settings: CampaignSettings;
    onSettingsChange: (settings: CampaignSettings) => void;
    disabled?: boolean;
}

export default function CampaignSettingsCard({
    settings,
    onSettingsChange,
    disabled = false,
}: CampaignSettingsCardProps) {
    const [campaigns, setCampaigns] = useState<InstantlyCampaign[]>([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoadingCampaigns(true);
            try {
                const response = await fetch("/api/instantly/campaigns");
                const data = await response.json();
                if (response.ok) {
                    setCampaigns(data.campaigns || []);
                }
            } catch {
                // Silent fail - user can still enter ID manually
            } finally {
                setIsLoadingCampaigns(false);
            }
        };
        fetchCampaigns();
    }, []);

    const updateSetting = <K extends keyof CampaignSettings>(key: K, value: CampaignSettings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const selectedCampaign = campaigns.find(c => c.id === settings.instantlyCampaignId);

    return (
        <Card className="overflow-hidden pt-0">
            <CardHeader className="py-3 sm:py-4 border-b bg-purple-50/50  dark:bg-purple-950/20">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500 text-white">
                        <Settings className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">Campaign Settings</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">Configure Instantly campaign and test mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-4">
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                    {/* Campaign Selection */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="campaign-id" className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <span className="p-1 rounded-md bg-indigo-500 text-white">
                                <Hash className="h-3 w-3" />
                            </span>
                            Instantly Campaign
                        </Label>
                        {isLoadingCampaigns ? (
                            <div className="flex items-center gap-2 h-10 px-3 border rounded-md text-muted-foreground text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading campaigns...
                            </div>
                        ) : campaigns.length > 0 ? (
                            <Select
                                value={settings.instantlyCampaignId}
                                onValueChange={(value) => updateSetting("instantlyCampaignId", value)}
                                disabled={disabled}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select a campaign..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {campaigns.map((campaign) => (
                                        <SelectItem key={campaign.id} value={campaign.id}>
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    campaign.status === "active" ? "bg-green-500" :
                                                    campaign.status === "paused" ? "bg-yellow-500" :
                                                    "bg-gray-400"
                                                )} />
                                                {campaign.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                id="campaign-id"
                                value={settings.instantlyCampaignId}
                                onChange={(e) => updateSetting("instantlyCampaignId", e.target.value)}
                                placeholder="Enter campaign ID..."
                                disabled={disabled}
                                className="text-sm"
                            />
                        )}
                        {selectedCampaign && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono truncate">{selectedCampaign.id}</span>
                                <a
                                    href={`https://app.instantly.ai/app/campaign/${selectedCampaign.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-600"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                asChild
                            >
                                <a href="/campaigns">
                                    <Plus className="h-3 w-3 mr-1" />
                                    Manage Campaigns
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Test Email */}
                    <div className="space-y-1.5 sm:space-y-2">
                        <Label htmlFor="test-email" className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <span className="p-1 rounded-md bg-pink-500 text-white">
                                <Mail className="h-3 w-3" />
                            </span>
                            Test Email
                        </Label>
                        <Input
                            id="test-email"
                            type="email"
                            value={settings.testEmail}
                            onChange={(e) => updateSetting("testEmail", e.target.value)}
                            placeholder="your-test@email.com"
                            disabled={disabled || !settings.testMode}
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Test Mode Toggle */}
                <div className={cn(
                    "flex items-center justify-between rounded-xl border p-3 sm:p-4 transition-all duration-300",
                    settings.testMode
                        ? "border-amber-300 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-700"
                        : "bg-muted/30"
                )}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            settings.testMode
                                ? "bg-amber-500 text-white"
                                : "bg-muted text-muted-foreground"
                        )}>
                            <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                            <Label htmlFor="test-mode" className="font-medium text-sm cursor-pointer">Test Mode</Label>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                                Send to test address, skip database
                            </p>
                        </div>
                    </div>
                    <Switch
                        id="test-mode"
                        checked={settings.testMode}
                        onCheckedChange={(v) => updateSetting("testMode", v)}
                        disabled={disabled}
                    />
                </div>
            </CardContent>
        </Card>
    );
}