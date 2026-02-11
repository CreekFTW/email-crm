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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";
import ScheduleBuilder from "./ScheduleBuilder";
import SequenceEditor from "./SequenceEditor";
import type {
    UpdateCampaignRequest,
    CampaignSchedule,
    CampaignSequenceStep,
    InstantlyCampaignFull,
} from "@/types/campaign";

interface EditCampaignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign: InstantlyCampaignFull | null;
    onSuccess: () => void;
}

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

export default function EditCampaignDialog({
    open,
    onOpenChange,
    campaign,
    onSuccess,
}: EditCampaignDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accounts, setAccounts] = useState<Array<{ email: string; id: string }>>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [schedule, setSchedule] = useState<CampaignSchedule>(DEFAULT_SCHEDULE);
    const [sequences, setSequences] = useState<CampaignSequenceStep[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [dailyLimit, setDailyLimit] = useState(50);
    const [stopOnReply, setStopOnReply] = useState(true);
    const [stopOnAutoReply, setStopOnAutoReply] = useState(false);
    const [linkTracking, setLinkTracking] = useState(true);
    const [openTracking, setOpenTracking] = useState(true);

    useEffect(() => {
        if (campaign) {
            setName(campaign.name || "");
            setSchedule(campaign.campaign_schedule || DEFAULT_SCHEDULE);
            setSequences(campaign.sequences || []);
            setSelectedAccounts(campaign.email_list || []);
            setDailyLimit(campaign.daily_limit || 50);
            setStopOnReply(campaign.stop_on_reply ?? true);
            setStopOnAutoReply(campaign.stop_on_auto_reply ?? false);
            setLinkTracking(campaign.link_tracking ?? true);
            setOpenTracking(campaign.open_tracking ?? true);
        }
    }, [campaign]);

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
            // Silent fail
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    const handleSubmit = async () => {
        if (!campaign) return;

        setIsSubmitting(true);

        try {
            // Only include fields that have valid values
            const payload: UpdateCampaignRequest = {
                name: name.trim(),
            };

            // Only include schedule if it has schedules defined
            if (schedule?.schedules && schedule.schedules.length > 0) {
                payload.campaign_schedule = schedule;
            }

            // Only include sequences if they exist
            if (sequences && sequences.length > 0) {
                payload.sequences = sequences;
            }

            // Only include email_list if accounts are selected
            if (selectedAccounts.length > 0) {
                payload.email_list = selectedAccounts;
            }

            // Include other settings
            payload.daily_limit = dailyLimit;
            payload.stop_on_reply = stopOnReply;
            payload.stop_on_auto_reply = stopOnAutoReply;
            payload.link_tracking = linkTracking;
            payload.open_tracking = openTracking;

            const response = await fetch(`/api/instantly/campaigns/${campaign.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update campaign");
            }

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

    if (!campaign) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Campaign</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="sequences">Sequences</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-4">
                        <div>
                            <Label htmlFor="edit-name">Campaign Name</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Campaign name"
                                className="mt-1"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule" className="mt-4">
                        <ScheduleBuilder schedule={schedule} onChange={setSchedule} />
                    </TabsContent>

                    <TabsContent value="sequences" className="mt-4">
                        <SequenceEditor sequences={sequences} onChange={setSequences} />
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6 mt-4">
                        {/* Email Accounts */}
                        <div>
                            <Label>Email Accounts</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Select accounts to send from
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
                            <Label htmlFor="edit-dailyLimit">Daily Send Limit</Label>
                            <Input
                                id="edit-dailyLimit"
                                type="number"
                                min={1}
                                max={500}
                                value={dailyLimit}
                                onChange={(e) => setDailyLimit(parseInt(e.target.value) || 50)}
                                className="mt-1 w-32"
                            />
                        </div>

                        {/* Toggle Settings */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Stop on Reply</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Stop follow-ups when lead replies
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
                                        Track link clicks
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
                                        Track email opens
                                    </p>
                                </div>
                                <Switch
                                    checked={openTracking}
                                    onCheckedChange={setOpenTracking}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
