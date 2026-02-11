"use client";

import { Badge } from "@/components/ui/badge";
import { Database, Filter, UserCheck, Send, Layers } from "lucide-react";
import StageCard from "./StageCard";
import type { PipelineState, PipelineActions } from "./types";

interface PipelineStagesProps {
    state: PipelineState;
    actions: PipelineActions;
    testMode: boolean;
}

export default function PipelineStages({
    state,
    actions,
    testMode,
}: PipelineStagesProps) {
    const {
        fetchState,
        filterState,
        dedupeState,
        sendState,
        fetchResult,
        filterResult,
        dedupeResult,
        sendResult,
        isAnyRunning,
    } = state;

    return (
        <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                    <Layers className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold">
                    Pipeline Stages
                </h2>
            </div>

            {/* Stage 1: Fetch */}
            <StageCard
                stageNumber={1}
                title="Fetch from Apollo"
                icon={<Database />}
                state={fetchState}
                onRun={actions.runFetch}
                isRunning={isAnyRunning}
                colorScheme="blue"
                result={
                    fetchResult && (
                        <>
                            Fetched <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{fetchResult.totalFetched}</Badge> contacts
                        </>
                    )
                }
            />

            {/* Stage 2: Filter */}
            <StageCard
                stageNumber={2}
                title="Filter & Verify"
                icon={<Filter />}
                state={filterState}
                onRun={actions.runFilter}
                disabled={fetchState.status !== "completed"}
                isRunning={isAnyRunning}
                colorScheme="purple"
                result={
                    filterResult && (
                        <>
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{filterResult.totalVerified}</Badge> verified
                            <span className="hidden sm:inline">
                                {" · "}
                                <span className="text-xs">
                                    Filtered: {filterResult.filteredOut.noEmail} no email,{" "}
                                    {filterResult.filteredOut.unverified} unverified,{" "}
                                    {filterResult.filteredOut.generic} generic
                                </span>
                            </span>
                        </>
                    )
                }
            />

            {/* Stage 3: Dedupe */}
            <StageCard
                stageNumber={3}
                title="Deduplicate"
                icon={<UserCheck />}
                state={dedupeState}
                onRun={actions.runDedupe}
                disabled={filterState.status !== "completed"}
                isRunning={isAnyRunning}
                colorScheme="cyan"
                badge={
                    testMode && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs border-amber-300 text-amber-600 dark:text-amber-400">Skipped in test</Badge>
                    )
                }
                result={
                    dedupeResult && (
                        <>
                            <Badge variant="secondary" className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">{dedupeResult.contacts.length}</Badge> new contacts
                            {dedupeResult.skippedDuplicates > 0 && (
                                <span className="hidden sm:inline">
                                    {" · "}<span className="text-xs">{dedupeResult.skippedDuplicates} already emailed</span>
                                </span>
                            )}
                        </>
                    )
                }
            />

            {/* Stage 4: Send */}
            <StageCard
                stageNumber={4}
                title="Send to Instantly"
                icon={<Send />}
                state={sendState}
                onRun={actions.runSend}
                disabled={dedupeState.status !== "completed"}
                isRunning={isAnyRunning}
                colorScheme="green"
                result={
                    sendResult && (
                        <>
                            {testMode ? (
                                <><Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{sendResult.testSent}</Badge> sent to test email</>
                            ) : (
                                <><Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{sendResult.sent}</Badge> sent to Instantly</>
                            )}
                            {sendResult.errors > 0 && (
                                <> · <Badge variant="destructive" className="text-xs">{sendResult.errors}</Badge> errors</>
                            )}
                        </>
                    )
                }
            />
        </div>
    );
}