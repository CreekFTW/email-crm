"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Circle,
    Loader2,
    CheckCircle2,
    XCircle,
    Play,
    RotateCcw,
} from "lucide-react";
import type { CampaignStageStatus, StageState } from "./types";

interface StageCardProps {
    stageNumber: number;
    title: string;
    icon: ReactNode;
    state: StageState;
    result?: ReactNode;
    badge?: ReactNode;
    onRun: () => void;
    disabled?: boolean;
    isRunning?: boolean;
    colorScheme?: "blue" | "purple" | "cyan" | "green";
}

const stageColors = {
    blue: {
        iconBg: "bg-blue-500",
        iconBgLight: "bg-blue-500/10 dark:bg-blue-500/20",
        ring: "ring-blue-500/20",
    },
    purple: {
        iconBg: "bg-purple-500",
        iconBgLight: "bg-purple-500/10 dark:bg-purple-500/20",
        ring: "ring-purple-500/20",
    },
    cyan: {
        iconBg: "bg-cyan-500",
        iconBgLight: "bg-cyan-500/10 dark:bg-cyan-500/20",
        ring: "ring-cyan-500/20",
    },
    green: {
        iconBg: "bg-emerald-500",
        iconBgLight: "bg-emerald-500/10 dark:bg-emerald-500/20",
        ring: "ring-emerald-500/20",
    },
};

function getStageIcon(status: CampaignStageStatus) {
    switch (status) {
        case "idle":
            return <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />;
        case "running":
            return <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-spin" />;
        case "completed":
            return <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />;
        case "error":
            return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
    }
}

function getStageStyles(status: CampaignStageStatus) {
    switch (status) {
        case "idle":
            return "border-border bg-card hover:border-primary/30 hover:shadow-sm";
        case "running":
            return "border-blue-500/50 bg-linear-to-r from-blue-50 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/20 shadow-info animate-pulse-soft";
        case "completed":
            return "border-emerald-500/50 bg-linear-to-r from-emerald-50 to-green-50/50 dark:from-emerald-950/30 dark:to-green-950/20 shadow-success";
        case "error":
            return "border-red-500/50 bg-linear-to-r from-red-50 to-rose-50/50 dark:from-red-950/30 dark:to-rose-950/20";
    }
}

export default function StageCard({
    stageNumber,
    title,
    icon,
    state,
    result,
    badge,
    onRun,
    disabled = false,
    isRunning = false,
    colorScheme = "blue",
}: StageCardProps) {
    const colors = stageColors[colorScheme];

    return (
        <Card className={cn(
            "transition-all duration-300",
            getStageStyles(state.status)
        )}>
            <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={cn(
                            "shrink-0 p-1.5 sm:p-2 rounded-lg transition-colors",
                            state.status === "idle" ? colors.iconBgLight : "bg-transparent"
                        )}>
                            {getStageIcon(state.status)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className={cn(
                                    "p-1 rounded-md [&>svg]:h-3.5 [&>svg]:w-3.5 sm:[&>svg]:h-4 sm:[&>svg]:w-4 shrink-0",
                                    colors.iconBg,
                                    "text-white"
                                )}>
                                    {icon}
                                </span>
                                <span className="font-medium text-sm sm:text-base truncate">
                                    {stageNumber}. {title}
                                </span>
                                {badge}
                            </div>
                            {state.status === "completed" && result && (
                                <div className="text-xs sm:text-sm text-muted-foreground mt-1 truncate flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                    {result}
                                </div>
                            )}
                            {state.error && (
                                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1 truncate flex items-center gap-1">
                                    <XCircle className="h-3 w-3 flex-shrink-0" />
                                    {state.error}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant={state.status === "completed" ? "outline" : "default"}
                        onClick={onRun}
                        disabled={disabled || isRunning}
                        className={cn(
                            "flex-shrink-0 text-xs sm:text-sm h-8 px-2 sm:px-3 gap-1",
                            state.status === "idle" && "bg-primary hover:bg-primary/90",
                            state.status === "completed" && "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                        )}
                    >
                        {state.status === "running" ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        ) : state.status === "completed" ? (
                            <>
                                <RotateCcw className="h-3 w-3" />
                                <span className="hidden sm:inline">Re-run</span>
                            </>
                        ) : (
                            <>
                                <Play className="h-3 w-3" />
                                <span className="hidden sm:inline">Run</span>
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}