"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";
import {
    Search,
    Users,
    Building2,
    MapPin,
    Briefcase,
    Factory,
    Hash,
    ChevronDown,
    ChevronUp,
    Target,
} from "lucide-react";
import {
    PERSON_TITLES,
    PERSON_SENIORITIES,
    ORGANIZATION_LOCATIONS,
    EMPLOYEE_RANGES,
    INDUSTRIES,
} from "@/utils/apollo-options";
import type { SearchFilters } from "./types";

interface SearchFiltersCardProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    disabled?: boolean;
}

export default function SearchFiltersCard({
    filters,
    onFiltersChange,
    disabled = false,
}: SearchFiltersCardProps) {
    const [showFilters, setShowFilters] = useState(true);

    const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <Card className="overflow-hidden pt-0">
            <CardHeader
                className={cn(
                    "cursor-pointer py-3 sm:py-4 transition-colors",
                    showFilters && "border-b bg-blue-50/50 dark:bg-blue-950/20"
                )}
                onClick={() => setShowFilters(!showFilters)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                            <Target className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-base sm:text-lg">Search Filters</CardTitle>
                    </div>
                    <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        showFilters ? "bg-primary/10" : "bg-muted"
                    )}>
                        {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                </div>
                <CardDescription className="text-xs sm:text-sm">Define your target audience on Apollo</CardDescription>
            </CardHeader>

            {showFilters && (
                <CardContent className="space-y-3 sm:space-y-4 pt-4">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                        {/* Job Titles */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                                <span className="p-1 rounded-md bg-blue-500 text-white">
                                    <Briefcase className="h-3 w-3" />
                                </span>
                                Job Titles
                            </Label>
                            <MultiSelect
                                options={PERSON_TITLES}
                                selected={filters.personTitles}
                                onChange={(v) => updateFilter("personTitles", v)}
                                placeholder="Select titles..."
                                disabled={disabled}
                            />
                        </div>

                        {/* Seniority */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                                <span className="p-1 rounded-md bg-purple-500 text-white">
                                    <Users className="h-3 w-3" />
                                </span>
                                Seniority Levels
                            </Label>
                            <MultiSelect
                                options={PERSON_SENIORITIES}
                                selected={filters.personSeniorities}
                                onChange={(v) => updateFilter("personSeniorities", v)}
                                placeholder="Select seniority..."
                                disabled={disabled}
                            />
                        </div>

                        {/* Locations */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                                <span className="p-1 rounded-md bg-emerald-500 text-white">
                                    <MapPin className="h-3 w-3" />
                                </span>
                                Locations
                            </Label>
                            <MultiSelect
                                options={ORGANIZATION_LOCATIONS}
                                selected={filters.locations}
                                onChange={(v) => updateFilter("locations", v)}
                                placeholder="Select locations..."
                                disabled={disabled}
                            />
                        </div>

                        {/* Company Size */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                                <span className="p-1 rounded-md bg-orange-500 text-white">
                                    <Building2 className="h-3 w-3" />
                                </span>
                                Company Size
                            </Label>
                            <MultiSelect
                                options={EMPLOYEE_RANGES}
                                selected={filters.employeeRanges}
                                onChange={(v) => updateFilter("employeeRanges", v)}
                                placeholder="Select sizes..."
                                disabled={disabled}
                            />
                        </div>

                        {/* Industries */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                                <span className="p-1 rounded-md bg-pink-500 text-white">
                                    <Factory className="h-3 w-3" />
                                </span>
                                Industries
                            </Label>
                            <MultiSelect
                                options={INDUSTRIES}
                                selected={filters.industries}
                                onChange={(v) => updateFilter("industries", v)}
                                placeholder="Select industries..."
                                disabled={disabled}
                            />
                        </div>

                        {/* Keywords */}
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label className="flex items-center gap-1.5 text-xs sm:text-sm">
                                <span className="p-1 rounded-md bg-cyan-500 text-white">
                                    <Hash className="h-3 w-3" />
                                </span>
                                Keywords
                            </Label>
                            <Input
                                value={filters.keywords}
                                onChange={(e) => updateFilter("keywords", e.target.value)}
                                placeholder="SaaS, B2B, startup..."
                                disabled={disabled}
                                className="text-sm"
                            />
                        </div>
                    </div>

                    {/* Daily Limit */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-3 border-t">
                        <Label className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
                            <span className="p-1 rounded-md bg-amber-500 text-white">
                                <Search className="h-3 w-3" />
                            </span>
                            Daily Limit:
                        </Label>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Input
                                type="number"
                                min={1}
                                max={1000}
                                value={filters.dailyLimit}
                                onChange={(e) => updateFilter("dailyLimit", parseInt(e.target.value) || 0)}
                                className="w-20 sm:w-24 text-sm"
                                disabled={disabled}
                            />
                            <span className="text-xs text-muted-foreground">Max contacts (1-1000)</span>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}