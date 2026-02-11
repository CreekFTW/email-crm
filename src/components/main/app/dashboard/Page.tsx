"use client";

import { useState, useEffect } from "react";
import { Users, CheckCircle2, Zap, TrendingUp } from "lucide-react";
import CampaignRunForm from "./campaign/CampaignRunForm";
import ContactsTable from "./campaign/ContactsTable";
import InstantlyContactsTable from "./campaign/InstantlyContactsTable";
import StatsCard from "./campaign/StatsCard";
import { loadCampaignState } from "@/hooks/use-campaign-storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Page = () => {
    const [stats, setStats] = useState({
        totalContacts: 0,
        verifiedEmails: 0,
        successRate: 0,
        activeStages: 0,
    });

    useEffect(() => {
        const updateStats = () => {
            const state = loadCampaignState();
            const contacts = state.fetchedContacts || [];
            const verified = contacts.filter(
                (c) => c.email_status?.toLowerCase() === "verified"
            ).length;
            const total = contacts.length;
            const rate = total > 0 ? Math.round((verified / total) * 100) : 0;

            setStats({
                totalContacts: total,
                verifiedEmails: verified,
                successRate: rate,
                activeStages: 0,
            });
        };

        updateStats();
        const interval = setInterval(updateStats, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <StatsCard
                    title="Total Contacts"
                    value={stats.totalContacts}
                    subtitle="Fetched from Apollo"
                    icon={<Users />}
                    colorScheme="blue"
                />
                <StatsCard
                    title="Verified Emails"
                    value={stats.verifiedEmails}
                    subtitle="Ready to send"
                    icon={<CheckCircle2 />}
                    colorScheme="green"
                />
                <StatsCard
                    title="Success Rate"
                    value={`${stats.successRate}%`}
                    subtitle="Email verification"
                    icon={<TrendingUp />}
                    colorScheme="purple"
                />
                <StatsCard
                    title="Pipeline Status"
                    value={stats.activeStages > 0 ? "Running" : "Ready"}
                    subtitle={stats.activeStages > 0 ? `${stats.activeStages} active` : "All stages idle"}
                    icon={<Zap />}
                    colorScheme="orange"
                />
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Left side - Campaign Form */}
                <div className="w-full lg:w-1/2">
                    <CampaignRunForm />
                </div>

                {/* Right side - Contacts Table */}
                <div className="w-full lg:w-1/2">
                    <Tabs defaultValue="apollo" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="apollo" className="gap-2">
                                <Users className="h-4 w-4" />
                                Apollo
                            </TabsTrigger>
                            <TabsTrigger value="instantly" className="gap-2">
                                <Zap className="h-4 w-4" />
                                Instantly
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="apollo">
                            <ContactsTable />
                        </TabsContent>
                        <TabsContent value="instantly">
                            <InstantlyContactsTable />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Page;