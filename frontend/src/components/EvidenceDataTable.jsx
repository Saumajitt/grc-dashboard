"use client";

import React, { useState, useMemo } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
    Table,
    TableHeader,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { deleteEvidence } from "@/lib/evidence";
import { Search, Trash2, FileText, Calendar, Tag, Filter } from "lucide-react";

// Category color mapping for badges
const categoryColors = {
    policy: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    diagram: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    doc: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    other: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function EvidenceDataTable({
    evidences = [],
    onRefresh = () => { },
    loading = false
}) {
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState(null); // Track which item is being deleted

    // Create columns with the onRefresh callback
    const columns = useMemo(() => [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => {
                const title = row.getValue("title");
                return (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white">{title}</p>
                            <p className="text-xs text-slate-400">{row.original.filename}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const category = row.getValue("category");
                const colorClass = categoryColors[category] || categoryColors.other;
                return (
                    <Badge variant="outline" className={`${colorClass} capitalize`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {category}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Uploaded",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                const now = new Date();
                const diffTime = Math.abs(now - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let timeAgo;
                if (diffDays === 1) timeAgo = "Today";
                else if (diffDays === 2) timeAgo = "Yesterday";
                else if (diffDays <= 7) timeAgo = `${diffDays} days ago`;
                else timeAgo = date.toLocaleDateString();

                return (
                    <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                            <p className="text-slate-200">{timeAgo}</p>
                            <p className="text-xs text-slate-500">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const ev = row.original;
                const isDeleting = deleting === ev._id;

                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 disabled:opacity-50"
                        onClick={async (e) => {
                            e.stopPropagation(); // ✅ prevent triggering row click
                            if (confirm("Are you sure you want to delete this evidence? This action cannot be undone.")) {
                                try {
                                    setDeleting(ev._id);
                                    await deleteEvidence(ev._id);
                                    onRefresh();
                                } catch (err) {
                                    console.error("Delete error:", err);
                                    alert("Delete failed. Please try again.");
                                } finally {
                                    setDeleting(null);
                                }
                            }
                        }}
                    >

                        {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </Button>
                );
            },
        },
    ], [deleting, onRefresh]);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!search.trim()) return evidences;

        return evidences.filter((ev) =>
            (ev.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (ev.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (ev.filename?.toLowerCase() || '').includes(search.toLowerCase())
        );
    }, [evidences, search]);

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="w-64 h-10 bg-slate-800/50 rounded-lg animate-pulse"></div>
                    <div className="w-20 h-6 bg-slate-800/50 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-800/30 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        placeholder="Search evidence..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 w-80 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:bg-slate-800 focus:border-blue-500/50 transition-all duration-200"
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {filteredData.length} of {evidences.length} items
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-slate-800/20 rounded-lg border border-slate-700/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="border-b border-slate-700/50 hover:bg-slate-800/30"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="font-semibold text-slate-200 bg-slate-800/50 py-4"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => window.open(row.original.fileUrl, "_blank")} // ✅ Open in new tab
                                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors duration-200 cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="py-4"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center"
                                >
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-300 font-medium">No evidence found</p>
                                            <p className="text-slate-500 text-sm">
                                                {search ? "Try adjusting your search terms" : "Upload your first piece of evidence to get started"}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}