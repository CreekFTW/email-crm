"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Mail,
    RefreshCw,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    MousePointerClick,
    Loader2,
    Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SentEmail } from "@/types/campaign";

const PAGE_SIZE = 10;

interface EmailHistoryProps {
    emails: SentEmail[];
    isLoading?: boolean;
    onRefresh?: () => void;
    title?: string;
}

export default function EmailHistory({
    emails,
    isLoading = false,
    onRefresh,
    title = "Email History",
}: EmailHistoryProps) {
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(emails.length / PAGE_SIZE);
    const paginatedEmails = emails.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const getStatusBadge = (status: SentEmail["status"]) => {
        switch (status) {
            case "sent":
                return (
                    <Badge variant="secondary" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Sent
                    </Badge>
                );
            case "delivered":
                return (
                    <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Delivered
                    </Badge>
                );
            case "opened":
                return (
                    <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                        <Eye className="h-3 w-3 mr-1" />
                        Opened
                    </Badge>
                );
            case "clicked":
                return (
                    <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                        <MousePointerClick className="h-3 w-3 mr-1" />
                        Clicked
                    </Badge>
                );
            case "bounced":
                return (
                    <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                        <XCircle className="h-3 w-3 mr-1" />
                        Bounced
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="destructive" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-xs">
                        {status}
                    </Badge>
                );
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (page > 3) {
                pages.push("ellipsis");
            }

            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (page < totalPages - 2) {
                pages.push("ellipsis");
            }

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <Card className="h-full flex flex-col overflow-hidden pt-0">
            <CardHeader className="pb-3 py-5 border-b bg-linear-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                            <Mail className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                            {emails.length} emails
                        </Badge>
                        {onRefresh && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onRefresh}
                                disabled={isLoading}
                                className="h-8 w-8 p-0"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col pt-0">
                {isLoading && emails.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-blue-500" />
                            <p className="font-medium text-muted-foreground">Loading email history...</p>
                        </div>
                    </div>
                ) : emails.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground py-8">
                        <div className="text-center">
                            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-3 w-fit">
                                <Inbox className="h-12 w-12 text-blue-500" />
                            </div>
                            <p className="font-medium">No emails sent yet</p>
                            <p className="text-xs mt-1 text-muted-foreground">
                                Emails will appear here after you send them
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Recipient
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Subject
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Campaign
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Sent
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedEmails.map((email, index) => (
                                        <TableRow
                                            key={email.id}
                                            className={cn(
                                                "border-muted transition-colors hover:bg-muted/50",
                                                index % 2 === 0 && "bg-muted/20"
                                            )}
                                        >
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {email.recipientName || "Unknown"}
                                                    </span>
                                                    <span className="text-xs font-mono text-muted-foreground">
                                                        {email.recipientEmail}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-48 truncate text-sm">
                                                {email.subject || "-"}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {email.campaignName || email.campaignId}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(email.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(email.sentAt)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="pt-3 mt-3">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {getPageNumbers().map((pageNum, idx) => (
                                            <PaginationItem key={idx}>
                                                {pageNum === "ellipsis" ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        isActive={page === pageNum}
                                                        onClick={() => setPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
