"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Search, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import CampaignRow from "./CampaignRow";
import CreateCampaignDialog from "./CreateCampaignDialog";
import EditCampaignDialog from "./EditCampaignDialog";
import type { InstantlyCampaign, InstantlyCampaignFull } from "@/types/campaign";
import { toast } from "sonner";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<InstantlyCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<InstantlyCampaignFull | null>(null);

    const fetchCampaigns = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/instantly/campaigns");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch campaigns");
            }

            setCampaigns(data.campaigns || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const filteredCampaigns = campaigns.filter((campaign) => {
        if (!search.trim()) return true;
        return campaign.name.toLowerCase().includes(search.toLowerCase());
    });

    const handleCreateSuccess = () => {
        setCreateDialogOpen(false);
        fetchCampaigns();
        toast.success("Campaign created successfully");
    };

    const handleEditSuccess = () => {
        setEditDialogOpen(false);
        setEditingCampaign(null);
        fetchCampaigns();
        toast.success("Campaign updated successfully");
    };

    const handleEdit = async (campaign: InstantlyCampaign) => {
        try {
            const response = await fetch(`/api/instantly/campaigns/${campaign.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch campaign details");
            }

            setEditingCampaign(data.campaign);
            setEditDialogOpen(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Failed to load campaign: ${message}`);
        }
    };

    const handlePause = async (campaignId: string) => {
        try {
            const response = await fetch(`/api/instantly/campaigns/${campaignId}/pause`, {
                method: "POST",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to pause campaign");
            }

            fetchCampaigns();
            toast.success("Campaign paused");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Failed to pause campaign: ${message}`);
        }
    };

    const handleActivate = async (campaignId: string) => {
        try {
            const response = await fetch(`/api/instantly/campaigns/${campaignId}/activate`, {
                method: "POST",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to activate campaign");
            }

            fetchCampaigns();
            toast.success("Campaign activated");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Failed to activate campaign: ${message}`);
        }
    };

    const handleDelete = async (campaignId: string) => {
        try {
            const response = await fetch(`/api/instantly/campaigns/${campaignId}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to delete campaign");
            }

            fetchCampaigns();
            toast.success("Campaign deleted");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            toast.error(`Failed to delete campaign: ${message}`);
        }
    };

    const statusCounts = {
        active: campaigns.filter((c) => c.status === "active").length,
        paused: campaigns.filter((c) => c.status === "paused").length,
        completed: campaigns.filter((c) => c.status === "completed").length,
        draft: campaigns.filter((c) => c.status === "draft").length,
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end items-start sm:items-center">
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{campaigns.length}</p>
                            </div>
                            <Megaphone className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Running
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Paused</p>
                                <p className="text-2xl font-bold text-yellow-600">{statusCounts.paused}</p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Paused
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-blue-600">{statusCounts.completed}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Done
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                        <CardTitle className="text-lg">All Campaigns</CardTitle>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search campaigns..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={fetchCampaigns}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="text-center py-8 text-red-500">
                            <p className="font-medium">Error loading campaigns</p>
                            <p className="text-sm mt-1">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchCampaigns}
                                className="mt-4"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    ) : isLoading && campaigns.length === 0 ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground mt-2">Loading campaigns...</p>
                        </div>
                    ) : filteredCampaigns.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">
                                {search ? "No campaigns match your search" : "No campaigns yet"}
                            </p>
                            {!search && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCreateDialogOpen(true)}
                                    className="mt-4"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create your first campaign
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="hidden sm:table-cell">ID</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCampaigns.map((campaign) => (
                                    <CampaignRow
                                        key={campaign.id}
                                        campaign={campaign}
                                        onEdit={() => handleEdit(campaign)}
                                        onPause={() => handlePause(campaign.id)}
                                        onActivate={() => handleActivate(campaign.id)}
                                        onDelete={() => handleDelete(campaign.id)}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreateCampaignDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />

            <EditCampaignDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                campaign={editingCampaign}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}
