"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    MoreVertical,
    Edit,
    Pause,
    Play,
    Trash2,
    BarChart3,
    ExternalLink,
} from "lucide-react";
import type { InstantlyCampaign } from "@/types/campaign";

interface CampaignActionsMenuProps {
    campaign: InstantlyCampaign;
    onEdit: () => void;
    onPause: () => void;
    onActivate: () => void;
    onDelete: () => void;
}

export default function CampaignActionsMenu({
    campaign,
    onEdit,
    onPause,
    onActivate,
    onDelete,
}: CampaignActionsMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pauseDialogOpen, setPauseDialogOpen] = useState(false);

    const handleDelete = () => {
        setDeleteDialogOpen(false);
        onDelete();
    };

    const handlePauseToggle = () => {
        setPauseDialogOpen(false);
        if (campaign.status === "active") {
            onPause();
        } else {
            onActivate();
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </DropdownMenuItem>

                    {campaign.status === "active" ? (
                        <DropdownMenuItem onClick={() => setPauseDialogOpen(true)}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                        </DropdownMenuItem>
                    ) : campaign.status === "paused" ? (
                        <DropdownMenuItem onClick={() => setPauseDialogOpen(true)}>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                        </DropdownMenuItem>
                    ) : null}

                    <DropdownMenuItem asChild>
                        <a href={`/analytics?campaign=${campaign.id}`}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                        </a>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <a
                            href={`https://app.instantly.ai/app/campaign/${campaign.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in Instantly
                        </a>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{campaign.name}&quot;? This action
                            cannot be undone. All leads and analytics data associated with this
                            campaign will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Pause/Activate Confirmation Dialog */}
            <AlertDialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {campaign.status === "active" ? "Pause Campaign" : "Activate Campaign"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {campaign.status === "active"
                                ? `Are you sure you want to pause "${campaign.name}"? No emails will be sent while the campaign is paused.`
                                : `Are you sure you want to activate "${campaign.name}"? The campaign will start sending emails according to its schedule.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePauseToggle}>
                            {campaign.status === "active" ? "Pause" : "Activate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
