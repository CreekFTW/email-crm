"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, Loader2, AlertCircle, Info } from "lucide-react";
import type { InstantlyCampaign, InstantlyLeadData, ApolloContact } from "@/types/campaign";

interface EmailComposerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipient?: InstantlyLeadData | ApolloContact | null;
    campaigns?: InstantlyCampaign[];
    onSend?: (data: EmailSendData) => Promise<boolean>;
}

export interface EmailSendData {
    recipientEmail: string;
    recipientName?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    campaignId: string;
}

export default function EmailComposer({
    open,
    onOpenChange,
    recipient,
    campaigns = [],
    onSend,
}: EmailComposerProps) {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [company, setCompany] = useState("");
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (recipient && open) {
            if ("email" in recipient && recipient.email) {
                setEmail(recipient.email);
            }

            if ("first_name" in recipient) {
                setFirstName(recipient.first_name || "");
            }

            if ("last_name" in recipient) {
                setLastName(recipient.last_name || "");
            }

            if ("company_name" in recipient) {
                setCompany(recipient.company_name || "");
            } else if ("organization" in recipient && recipient.organization?.name) {
                setCompany(recipient.organization.name);
            }
        }
    }, [recipient, open]);

    useEffect(() => {
        if (!open) {
            setEmail("");
            setFirstName("");
            setLastName("");
            setCompany("");
            setSelectedCampaign("");
            setError(null);
            setSuccess(false);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!email.trim()) {
            setError("Email address is required");
            return;
        }

        if (!selectedCampaign) {
            setError("Please select a campaign");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            if (onSend) {
                const recipientName = [firstName, lastName].filter(Boolean).join(" ");
                const result = await onSend({
                    recipientEmail: email.trim(),
                    recipientName: recipientName || undefined,
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    company: company || undefined,
                    campaignId: selectedCampaign,
                });

                if (result) {
                    setSuccess(true);
                    setTimeout(() => {
                        onOpenChange(false);
                    }, 1500);
                } else {
                    setError("Failed to send email. Please try again.");
                }
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "An error occurred";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-500" />
                        Send to Campaign
                    </DialogTitle>
                    <DialogDescription>
                        Add a contact to an Instantly campaign. They will receive emails according to the campaign sequence.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="recipient@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                            id="company"
                            placeholder="Acme Inc."
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="campaign">
                            Campaign <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={selectedCampaign}
                            onValueChange={setSelectedCampaign}
                            disabled={isLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a campaign" />
                            </SelectTrigger>
                            <SelectContent>
                                {campaigns.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No campaigns available
                                    </SelectItem>
                                ) : (
                                    campaigns.map((campaign) => (
                                        <SelectItem key={campaign.id} value={campaign.id}>
                                            {campaign.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <Alert variant="default" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                        <Info className="h-4 w-4 text-blue-500" />
                        <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                            Template variables like {"{{first_name}}"} and {"{{company}}"} will be automatically populated from the contact information.
                        </AlertDescription>
                    </Alert>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                            <Mail className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-700 dark:text-green-300">
                                Contact added to campaign successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || success}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Add to Campaign
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
