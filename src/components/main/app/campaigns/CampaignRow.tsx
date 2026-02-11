"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    CheckCircle2,
    PauseCircle,
    PlayCircle,
    Clock,
    FileText,
} from "lucide-react";
import CampaignActionsMenu from "./CampaignActionsMenu";
import type { InstantlyCampaign } from "@/types/campaign";

interface CampaignRowProps {
    campaign: InstantlyCampaign;
    onEdit: () => void;
    onPause: () => void;
    onActivate: () => void;
    onDelete: () => void;
}

export default function CampaignRow({
    campaign,
    onEdit,
    onPause,
    onActivate,
    onDelete,
}: CampaignRowProps) {
    const getStatusBadge = () => {
        switch (campaign.status) {
            case "active":
                return (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case "paused":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                        <PauseCircle className="h-3 w-3 mr-1" />
                        Paused
                    </Badge>
                );
            case "completed":
                return (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                    </Badge>
                );
            case "draft":
                return (
                    <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-0">
                        <FileText className="h-3 w-3 mr-1" />
                        Draft
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        {campaign.status}
                    </Badge>
                );
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return "-";
        }
    };

    return (
        <TableRow>
            <TableCell className="font-medium max-w-[200px] truncate" title={campaign.name}>
                {campaign.name}
            </TableCell>
            <TableCell>{getStatusBadge()}</TableCell>
            <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(campaign.createdAt)}</span>
                </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <span className="text-xs text-muted-foreground font-mono truncate block max-w-[180px]" title={campaign.id}>
                    {campaign.id}
                </span>
            </TableCell>
            <TableCell>
                <CampaignActionsMenu
                    campaign={campaign}
                    onEdit={onEdit}
                    onPause={onPause}
                    onActivate={onActivate}
                    onDelete={onDelete}
                />
            </TableCell>
        </TableRow>
    );
}
