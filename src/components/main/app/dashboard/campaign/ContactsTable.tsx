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
    Users,
    Search,
    ExternalLink,
    Building2,
    Mail,
    XCircle,
    AlertCircle,
    ShieldCheck,
    UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadCampaignState } from "@/hooks/use-campaign-storage";
import type { ApolloContact } from "@/types/campaign";

const PAGE_SIZE = 10;

export default function ContactsTable() {
    const [contacts, setContacts] = useState<ApolloContact[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Poll session storage for updates
    useEffect(() => {
        const loadContacts = () => {
            const state = loadCampaignState();
            setContacts(state.fetchedContacts);
        };

        loadContacts();
        const interval = setInterval(loadContacts, 1000);
        return () => clearInterval(interval);
    }, []);

    // Handle search change - reset page when search changes
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    // Filter contacts based on search
    const filteredContacts = contacts.filter((contact) => {
        if (!search.trim()) return true;
        const searchLower = search.toLowerCase();
        return (
            contact.name?.toLowerCase().includes(searchLower) ||
            contact.email?.toLowerCase().includes(searchLower) ||
            contact.title?.toLowerCase().includes(searchLower) ||
            contact.organization?.name?.toLowerCase().includes(searchLower)
        );
    });

    // Paginate
    const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);
    const paginatedContacts = filteredContacts.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const getEmailStatusBadge = (status: string | null) => {
        if (!status) return null;
        switch (status.toLowerCase()) {
            case "verified":
                return (
                    <Badge className="text-xs bg-linear-to-r from-emerald-500 to-green-500 text-white border-0">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                    </Badge>
                );
            case "unverified":
                return (
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800">
                        <AlertCircle className="h-3 w-3 mr-1 text-gray-500" />
                        Unverified
                    </Badge>
                );
            case "invalid":
                return (
                    <Badge className="text-xs bg-linear-to-r from-red-500 to-rose-500 text-white border-0">
                        <XCircle className="h-3 w-3 mr-1" />
                        Invalid
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

    // Generate page numbers to show
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
                        <div className="p-1.5 rounded-lg bg-cyan-500 text-white">
                            <Users className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-lg">Fetched Contacts</CardTitle>
                    </div>
                    <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-0">
                        {filteredContacts.length} of {contacts.length}
                    </Badge>
                </div>
                <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-8 max-w-xl"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col pt-0">
                {contacts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground py-8">
                        <div className="text-center">
                            <div className="p-4 rounded-full bg-cyan-100 dark:bg-cyan-900/30 mx-auto mb-3 w-fit">
                                <UserCircle className="h-12 w-12 text-cyan-500" />
                            </div>
                            <p className="font-medium">No contacts fetched yet</p>
                            <p className="text-xs mt-1 text-muted-foreground">Run the Fetch stage to load contacts</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">Name</TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">Email</TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">Title</TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold">Company</TableHead>
                                        <TableHead className="sticky top-0 bg-muted/80 backdrop-blur-sm font-semibold w-20">Links</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedContacts.map((contact, index) => (
                                        <TableRow
                                            key={contact.id}
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
                                                    {contact.name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-mono">
                                                        {contact.email || "-"}
                                                    </span>
                                                    {getEmailStatusBadge(contact.email_status)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-36 truncate">
                                                {contact.title || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="p-1 rounded bg-orange-100 dark:bg-orange-900/30">
                                                        <Building2 className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                                                    </div>
                                                    <span className="text-sm max-w-28 truncate">
                                                        {contact.organization?.name || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {contact.email && (
                                                        <a
                                                            href={`mailto:${contact.email}`}
                                                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors group"
                                                            title="Send email"
                                                        >
                                                            <Mail className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
                                                        </a>
                                                    )}
                                                    {contact.linkedin_url && (
                                                        <a
                                                            href={contact.linkedin_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors group"
                                                            title="LinkedIn profile"
                                                        >
                                                            <ExternalLink className="h-4 w-4 text-[#0A66C2] group-hover:text-[#004182]" />
                                                        </a>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
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