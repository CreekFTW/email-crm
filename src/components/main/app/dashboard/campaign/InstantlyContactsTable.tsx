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
import { Input } from "@/components/ui/input";
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
    Zap,
    Search,
    ExternalLink,
    Building2,
    Mail,
    RefreshCw,
    UserCircle,
    Clock,
    CheckCircle2,
    PauseCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { InstantlyLeadData } from "@/types/campaign";

const PAGE_SIZE = 10;

interface InstantlyContactsTableProps {
    campaignId?: string;
    onSendEmail?: (contact: InstantlyLeadData) => void;
}

export default function InstantlyContactsTable({
    campaignId,
    onSendEmail,
}: InstantlyContactsTableProps) {
    const [contacts, setContacts] = useState<InstantlyLeadData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchContacts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (campaignId) {
                params.append("campaignId", campaignId);
            }
            params.append("limit", "1000");

            const response = await fetch(`/api/instantly/leads?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch contacts");
            }

            setContacts(data.leads || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [campaignId]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const filteredContacts = contacts.filter((contact) => {
        if (!search.trim()) return true;
        const searchLower = search.toLowerCase();
        return (
            contact.email?.toLowerCase().includes(searchLower) ||
            contact.first_name?.toLowerCase().includes(searchLower) ||
            contact.last_name?.toLowerCase().includes(searchLower) ||
            contact.company_name?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);
    const paginatedContacts = filteredContacts.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const getStatusBadge = (status: unknown) => {
        if (!status || typeof status !== "string") return null;
        switch (status.toLowerCase()) {
            case "active":
            case "completed":
                return (
                    <Badge className="text-xs bg-linear-to-r from-emerald-500 to-green-500 text-white border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {status}
                    </Badge>
                );
            case "paused":
                return (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        <PauseCircle className="h-3 w-3 mr-1" />
                        Paused
                    </Badge>
                );
            case "bounced":
            case "unsubscribed":
                return (
                    <Badge className="text-xs bg-linear-to-r from-red-500 to-rose-500 text-white border-0">
                        <XCircle className="h-3 w-3 mr-1" />
                        {status}
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

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "-";
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return "-";
        }
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
        <Card className="h-full max-h-100 lg:max-h-128 flex flex-col overflow-hidden pt-0">
            <CardHeader className="pb-3 py-5 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-orange-500 text-white">
                            <Zap className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">Instantly Contacts</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                            {filteredContacts.length} of {contacts.length}
                        </Badge>
                    </div>
                </div>
                <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-row items-center gap-2">
                        <Input
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-8 max-w-xl"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchContacts}
                            disabled={isLoading}
                            className="h-9 w-9 p-0"
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
            <CardContent className="flex-1 overflow-hidden flex flex-col pt-0">
                {error ? (
                    <div className="flex-1 flex items-center justify-center text-red-500 py-8">
                        <div className="text-center">
                            <XCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">Error loading contacts</p>
                            <p className="text-xs mt-1">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchContacts}
                                className="mt-3"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </div>
                ) : isLoading && contacts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-8">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-orange-500" />
                            <p className="font-medium text-muted-foreground">Loading contacts...</p>
                        </div>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground py-8">
                        <div className="text-center">
                            <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto mb-3 w-fit">
                                <UserCircle className="h-12 w-12 text-orange-500" />
                            </div>
                            <p className="font-medium">No contacts in Instantly</p>
                            <p className="text-xs mt-1 text-muted-foreground">
                                Contacts will appear here after sending campaigns
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
                                            Name
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Email
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Company
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Status
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">
                                            Created
                                        </TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold w-20">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedContacts.map((contact, index) => (
                                        <TableRow
                                            key={contact.lead_id || contact.email}
                                            className={cn(
                                                "border-muted transition-colors hover:bg-muted/50",
                                                index % 2 === 0 && "bg-muted/20"
                                            )}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1 rounded-full bg-primary/10">
                                                        <UserCircle className="h-3 w-3 text-primary" />
                                                    </div>
                                                    {`${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-mono">
                                                    {contact.email || "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="p-1 rounded bg-orange-100 dark:bg-orange-900/30">
                                                        <Building2 className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                    <span className="text-sm max-w-28 truncate">
                                                        {contact.company_name || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(contact.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(contact.created_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {contact.email && onSendEmail && (
                                                        <button
                                                            onClick={() => onSendEmail(contact)}
                                                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors group"
                                                            title="Send email"
                                                        >
                                                            <Mail className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
                                                        </button>
                                                    )}
                                                    {contact.lead_id && (
                                                        <a
                                                            href={`https://app.instantly.ai/app/leads/${contact.lead_id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-md transition-colors group"
                                                            title="View in Instantly"
                                                        >
                                                            <ExternalLink className="h-4 w-4 text-orange-500 group-hover:text-orange-600" />
                                                        </a>
                                                    )}
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
