"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import ScheduleBuilder from "./ScheduleBuilder";
import SequenceEditor from "./SequenceEditor";
import type {
    CreateCampaignRequest,
    CampaignSchedule,
    CampaignSequenceStep,
} from "@/types/campaign";
import { cn } from "@/lib/utils";

interface CreateCampaignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, name: "Basic Info", description: "Campaign name and description" },
    { id: 2, name: "Schedule", description: "When emails should be sent" },
    { id: 3, name: "Sequences", description: "Email content and follow-ups" },
    { id: 4, name: "Settings", description: "Email accounts and limits" },
];

const DEFAULT_SCHEDULE: CampaignSchedule = {
    schedules: [
        {
            name: "Default",
            timing: { from: "09:00", to: "17:00" },
            days: {
                sun: false,
                mon: true,
                tue: true,
                wed: true,
                thu: true,
                fri: true,
                sat: false,
            },
            timezone: "America/New_York",
        },
    ],
};

const DEFAULT_SEQUENCE: CampaignSequenceStep[] = [
    {
        subject: "",
        body: "",
        delay: 0,
    },
];

export default function CreateCampaignDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateCampaignDialogProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accounts, setAccounts] = useState<Array<{ email: string; id: string }>>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [schedule, setSchedule] = useState<CampaignSchedule>(DEFAULT_SCHEDULE);
    const [sequences, setSequences] = useState<CampaignSequenceStep[]>(DEFAULT_SEQUENCE);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [dailyLimit, setDailyLimit] = useState(50);
    const [stopOnReply, setStopOnReply] = useState(true);
    const [stopOnAutoReply, setStopOnAutoReply] = useState(false);
    const [linkTracking, setLinkTracking] = useState(true);
    const [openTracking, setOpenTracking] = useState(true);

    useEffect(() => {
        if (open) {
            fetchAccounts();
        }
    }, [open]);

    const fetchAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
            const response = await fetch("/api/instantly/accounts");
            const data = await response.json();
            if (response.ok) {
                setAccounts(data.accounts || []);
            }
        } catch {
            // Silent fail, accounts can be added later
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const resetForm = () => {
        setStep(1);
        setName("");
        setSchedule(DEFAULT_SCHEDULE);
        setSequences(DEFAULT_SEQUENCE);
        setSelectedAccounts([]);
        setDailyLimit(50);
        setStopOnReply(true);
        setStopOnAutoReply(false);
        setLinkTracking(true);
        setOpenTracking(true);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return name.trim().length >= 3;
            case 2:
                return schedule.schedules.length > 0;
            case 3:
                return sequences.length > 0 && sequences[0].subject && sequences[0].body;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const payload: CreateCampaignRequest = {
                name: name.trim(),
                campaign_schedule: schedule,
                sequences,
                email_list: selectedAccounts.length > 0 ? selectedAccounts : undefined,
                daily_limit: dailyLimit,
                stop_on_reply: stopOnReply,
                stop_on_auto_reply: stopOnAutoReply,
                link_tracking: linkTracking,
                open_tracking: openTracking,
            };

            const response = await fetch("/api/instantly/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create campaign");
            }

            resetForm();
            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            alert(`Error: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleAccount = (email: string) => {
        setSelectedAccounts((prev) =>
            prev.includes(email)
                ? prev.filter((e) => e !== email)
                : [...prev, email]
        );
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Create Campaign</DialogTitle>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="flex items-center justify-between">
                    {STEPS.map((s, index) => (
                        <div key={s.id} className="flex items-center">
                            <div
                                className={cn(
                                    "flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                                    step > s.id
                                        ? "bg-green-500 text-white"
                                        : step === s.id
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted text-muted-foreground"
                                )}
                            >
                                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                            </div>
                            <span
                                className={cn(
                                    "ml-2 text-sm hidden sm:block",
                                    step === s.id ? "font-medium" : "text-muted-foreground"
                                )}
                            >
                                {s.name}
                            </span>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "w-8 sm:w-16 h-0.5 mx-2",
                                        step > s.id ? "bg-green-500" : "bg-muted"
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Campaign Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Q1 Outreach Campaign"
                                    className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Minimum 3 characters
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <ScheduleBuilder schedule={schedule} onChange={setSchedule} />
                    )}

                    {step === 3 && (
                        <SequenceEditor sequences={sequences} onChange={setSequences} />
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            {/* Email Accounts */}
                            <div>
                                <Label>Email Accounts</Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Select accounts to send from (optional)
                                </p>
                                {isLoadingAccounts ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading accounts...
                                    </div>
                                ) : accounts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No email accounts found
                                    </p>
                                ) : (
                                    <div className="grid gap-2 max-h-32 overflow-y-auto">
                                        {accounts.map((account) => (
                                            <label
                                                key={account.id}
                                                className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAccounts.includes(account.email)}
                                                    onChange={() => toggleAccount(account.email)}
                                                    className="rounded"
                                                />
                                                <span className="text-sm">{account.email}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Daily Limit */}
                            <div>
                                <Label htmlFor="dailyLimit">Daily Send Limit</Label>
                                <Input
                                    id="dailyLimit"
                                    type="number"
                                    min={1}
                                    max={500}
                                    value={dailyLimit}
                                    onChange={(e) => setDailyLimit(parseInt(e.target.value) || 50)}
                                    className="mt-1 w-32"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Maximum emails per day per account
                                </p>
                            </div>

                            {/* Toggle Settings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Stop on Reply</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Stop sending follow-ups when lead replies
                                        </p>
                                    </div>
                                    <Switch
                                        checked={stopOnReply}
                                        onCheckedChange={setStopOnReply}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Stop on Auto-Reply</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Stop on out-of-office replies
                                        </p>
                                    </div>
                                    <Switch
                                        checked={stopOnAutoReply}
                                        onCheckedChange={setStopOnAutoReply}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Link Tracking</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Track when links are clicked
                                        </p>
                                    </div>
                                    <Switch
                                        checked={linkTracking}
                                        onCheckedChange={setLinkTracking}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Open Tracking</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Track when emails are opened
                                        </p>
                                    </div>
                                    <Switch
                                        checked={openTracking}
                                        onCheckedChange={setOpenTracking}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setStep((s) => s - 1)}
                        disabled={step === 1}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    {step < 4 ? (
                        <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Create Campaign
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
