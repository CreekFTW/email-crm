"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
    Play,
    Loader2,
    Rocket,
    FlaskConical,
    RotateCcw,
    PartyPopper,
    Sparkles,
} from "lucide-react";
import {
    SearchFiltersCard,
    PipelineStages,
    CampaignSettingsCard,
    useCampaignPipeline,
    type SearchFilters,
    type CampaignSettings,
} from ".";

export default function CampaignRunForm() {
    // Search filters state
    const [filters, setFilters] = useState<SearchFilters>({
        personTitles: ["CEO", "Founder", "Owner"],
        personSeniorities: ["owner", "founder", "c_suite"],
        locations: ["United States"],
        employeeRanges: ["1,10", "11,20"],
        industries: [],
        keywords: "",
        dailyLimit: 50,
    });

    // Campaign settings state
    const [settings, setSettings] = useState<CampaignSettings>({
        instantlyCampaignId: "",
        testMode: true,
        testEmail: "",
    });

    // Pipeline hook
    const { state, actions } = useCampaignPipeline(filters, settings);

    const hasStarted = state.fetchState.status !== "idle" || state.filterState.status !== "idle";

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                <div className="flex items-center gap-2">
                    {hasStarted && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={actions.resetAll}
                            disabled={state.isAnyRunning}
                            className="text-xs sm:text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        >
                            <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                            Reset
                        </Button>
                    )}
                    <Button
                        onClick={actions.runAllStages}
                        disabled={state.isAnyRunning}
                        variant="outline"
                        size="sm"
                        className={cn(
                            "text-xs sm:text-sm transition-all"
                        )}
                    >
                        {state.isAnyRunning ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                                Run All
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Test Mode Banner */}
            {settings.testMode && (
                <Alert className="border-amber-400 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-700 py-2 sm:py-3">
                    <AlertDescription className="text-amber-800 dark:text-amber-200 text-xs sm:text-sm ml-2">
                        <div className="flex flex-row gap-2 items-center">
                            <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                                <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                            <strong>Test Mode Active</strong> — Emails sent to{" "}
                        </div>
                        <span className="font-mono text-[10px] sm:text-xs bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">{settings.testEmail || "(not set)"}</span>.
                        No data persisted.
                    </AlertDescription>
                </Alert>
            )}

            {/* Search Filters */}
            <SearchFiltersCard
                filters={filters}
                onFiltersChange={setFilters}
                disabled={state.isAnyRunning}
            />

            {/* Pipeline Stages */}
            <PipelineStages
                state={state}
                actions={actions}
                testMode={settings.testMode}
            />

            {/* Campaign Settings */}
            <CampaignSettingsCard
                settings={settings}
                onSettingsChange={setSettings}
                disabled={state.isAnyRunning}
            />

            {/* Final Summary */}
            {state.sendState.status === "completed" && (
                <Alert className="border-emerald-400 bg-linear-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 dark:border-emerald-700 py-2 sm:py-3 animate-scale-in">
                    <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                        <PartyPopper className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <AlertDescription className="text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm ml-2">
                        <strong>Campaign Complete!</strong>
                        {settings.testMode ? (
                            <> Sent <span className="font-mono bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded">{state.sendResult?.testSent}</span> test emails.</>
                        ) : (
                            <> Sent <span className="font-mono bg-emerald-100 dark:bg-emerald-900/50 px-1 py-0.5 rounded">{state.sendResult?.sent}</span> emails to Instantly.</>
                        )}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}