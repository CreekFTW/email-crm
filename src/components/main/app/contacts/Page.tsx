"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactsTable from "../dashboard/campaign/ContactsTable";
import InstantlyContactsTable from "../dashboard/campaign/InstantlyContactsTable";
import EmailComposer, { EmailSendData } from "../dashboard/email/EmailComposer";
import { Users, Zap } from "lucide-react";
import type { InstantlyLeadData, InstantlyCampaign } from "@/types/campaign";

export default function ContactsPage() {
    const [emailComposerOpen, setEmailComposerOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<InstantlyLeadData | null>(null);
    const [campaigns, setCampaigns] = useState<InstantlyCampaign[]>([]);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch("/api/instantly/campaigns");
            const data = await response.json();
            if (response.ok) {
                setCampaigns(data.campaigns || []);
            }
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        }
    };

    const handleSendEmail = (contact: InstantlyLeadData) => {
        setSelectedContact(contact);
        fetchCampaigns();
        setEmailComposerOpen(true);
    };

    const handleEmailSend = async (data: EmailSendData): Promise<boolean> => {
        try {
            const response = await fetch("/api/instantly/leads", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.recipientEmail,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    company: data.company,
                    campaignId: data.campaignId,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error("Failed to send email:", error);
            return false;
        }
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="apollo" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="apollo" className="gap-2">
                        <Users className="h-4 w-4" />
                        Apollo Contacts
                    </TabsTrigger>
                    <TabsTrigger value="instantly" className="gap-2">
                        <Zap className="h-4 w-4" />
                        Instantly Contacts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="apollo" className="space-y-4">
                    <ContactsTable />
                </TabsContent>

                <TabsContent value="instantly" className="space-y-4">
                    <InstantlyContactsTable onSendEmail={handleSendEmail} />
                </TabsContent>
            </Tabs>

            <EmailComposer
                open={emailComposerOpen}
                onOpenChange={setEmailComposerOpen}
                recipient={selectedContact}
                campaigns={campaigns}
                onSend={handleEmailSend}
            />
        </div>
    );
}
