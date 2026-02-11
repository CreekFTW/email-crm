"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    colorScheme: "blue" | "green" | "purple" | "orange" | "cyan" | "pink";
}

const colorClasses = {
    blue: {
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        iconBg: "bg-blue-500",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20",
    },
    green: {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        iconBg: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
    },
    purple: {
        bg: "bg-purple-500/10 dark:bg-purple-500/20",
        iconBg: "bg-purple-500",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/20",
    },
    orange: {
        bg: "bg-orange-500/10 dark:bg-orange-500/20",
        iconBg: "bg-orange-500",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-500/20",
    },
    cyan: {
        bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
        iconBg: "bg-cyan-500",
        text: "text-cyan-600 dark:text-cyan-400",
        border: "border-cyan-500/20",
    },
    pink: {
        bg: "bg-pink-500/10 dark:bg-pink-500/20",
        iconBg: "bg-pink-500",
        text: "text-pink-600 dark:text-pink-400",
        border: "border-pink-500/20",
    },
};

export default function StatsCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    colorScheme,
}: StatsCardProps) {
    const colors = colorClasses[colorScheme];

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border p-4 sm:p-5 transition-all duration-100",
                "hover:shadow-sm cursor-default",
                colors.border
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight", colors.text)}>
                            {value}
                        </p>
                        {trend && (
                            <span
                                className={cn(
                                    "text-xs font-medium px-1.5 py-0.5 rounded-full",
                                    trend.isPositive
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                                )}
                            >
                                {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        `shrink-0 p-2.5 sm:p-3 rounded-xl ${colors.text}`,
                        `${colors.iconBg}/10`,
                        "[&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6"
                    )}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
