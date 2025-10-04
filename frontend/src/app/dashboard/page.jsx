// src/app/dashboard/page.jsx
"use client";


import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRefresh } from "@/context/RefreshContext";  // ✅ NEW

import EvidenceDataTable from "@/components/EvidenceDataTable";
import EvidenceSummary from "@/components/EvidenceSummary";
import { getEvidence } from "@/lib/evidence";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Activity, Users, TrendingUp } from "lucide-react";
import { formatFileSize } from "@/lib/utils";


export default function ClientDashboard() {
    const { user, loading } = useAuth();
    const { refreshFlag } = useRefresh();
    const [localRefresh, setLocalRefresh] = useState(0);
    const [evidences, setEvidences] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (!user) return;

        let isMounted = true;
        const controller = new AbortController();

        async function fetchEvidence() {
            setFetching(true);
            setError(null);

            try {
                // Add timeout to prevent hanging
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, 10000); // 10 second timeout

                const res = await getEvidence({ page: 1, limit: 20 }, controller.signal);

                clearTimeout(timeoutId);

                if (isMounted) {
                    setEvidences(Array.isArray(res.evidences) ? res.evidences : []);
                }
            } catch (err) {
                if (!controller.signal.aborted && isMounted) {
                    console.error("Error fetching evidence:", err.message || err);
                    setError(err.message || "Failed to load evidence");
                    setEvidences([]); // Set empty array on error
                }
            } finally {
                if (isMounted) setFetching(false);
            }
        }

        fetchEvidence();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [user, refreshFlag, localRefresh]);

    // Handle refresh more carefully
    const handleRefresh = () => {
        setLocalRefresh(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
                    <p className="text-slate-400">Please log in to access your dashboard.</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error && !fetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                        <Activity className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // const getGreeting = () => {
    //     const hour = new Date().getHours();
    //     if (hour < 12) return "Good morning";
    //     if (hour < 18) return "Good afternoon";
    //     return "Good evening";
    // };

    // Memoize calculations to prevent unnecessary recalculations
    const thisMonthCount = evidences.filter(e =>
        new Date(e.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const categoryCount = Object.keys(
        evidences.reduce((acc, ev) => {
            if (ev.category) acc[ev.category] = true;
            return acc;
        }, {})
    ).length;

    const STORAGE_LIMIT = 10 * 1024 * 1024 * 1024; // 10 GB
    const totalUsed = evidences.reduce((sum, e) => sum + (e.size || 0), 0);
    const percentageUsed = Math.min((totalUsed / STORAGE_LIMIT) * 100, 100);


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            {/* <div className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-950/70 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center"> */}
                    {/* Left: Greeting */}
                    {/* <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs text-emerald-400">Online</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            {getGreeting()}, {user.email.split("@")[0]}
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div> */}

                    {/* Right: Actions */}
                    {/* <div className="flex items-center space-x-4">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-semibold text-white">
                                        Upload New Evidence
                                    </DialogTitle>
                                </DialogHeader>
                                <EvidenceUploadModal
                                    onSuccess={() => {
                                        handleRefresh();
                                        setOpen(false);
                                    }}
                                />
                            </DialogContent>
                        </Dialog> */}

                        {/* Avatar fallback */}
                        {/* <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                            {user.email[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </div> */}


                        

                       

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Loading state for content */}
                {fetching && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-slate-400">Loading evidence...</span>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-colors duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Total Evidence</p>
                                    <p className="text-2xl font-bold text-white mt-1">{evidences.length}</p>
                                    <p className="text-emerald-400 text-xs mt-1 flex items-center">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        Active files
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-colors duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">This Month</p>
                                    <p className="text-2xl font-bold text-white mt-1">{thisMonthCount}</p>
                                    <p className="text-emerald-400 text-xs mt-1 flex items-center">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        Recent uploads
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-colors duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Categories</p>
                                    <p className="text-2xl font-bold text-white mt-1">{categoryCount}</p>
                                    <p className="text-blue-400 text-xs mt-1">
                                        Different types
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition-colors duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="w-full">
                                    <p className="text-slate-400 text-sm font-medium">Storage Used</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {formatFileSize(totalUsed)}
                                    </p>
                                    <p className="text-slate-400 text-xs mt-1">
                                        of {formatFileSize(STORAGE_LIMIT)} available
                                    </p>
                                    <div className="mt-3">
                                        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-500 transition-all duration-300"
                                                style={{ width: `${percentageUsed}%` }}
                                            ></div>
                                        </div>
                                        {percentageUsed > 80 && (
                                            <p className="text-xs text-red-400 mt-2">
                                                You’re nearing your storage limit.{" "}
                                                <span className="underline cursor-pointer">Upgrade plan</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Overview Section */}
                {!fetching && (
                    <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm shadow-2xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-semibold text-white flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                                Evidence Overview
                            </CardTitle>
                            <p className="text-slate-400 text-sm">Breakdown of your evidence by category</p>
                        </CardHeader>
                        <CardContent>
                            <EvidenceSummary evidences={evidences} />
                        </CardContent>
                    </Card>
                )}

                {/* Evidence Table - Pass evidences to avoid double fetching */}
                {!fetching && (
                    <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm shadow-2xl">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-semibold text-white flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-blue-400" />
                                        My Evidence
                                    </CardTitle>
                                    <p className="text-slate-400 text-sm mt-1">Manage and organize your uploaded files</p>
                                </div>
                                <Badge variant="outline" className="border-slate-600 text-slate-300">
                                    {evidences.length} items
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="px-6">
                                <EvidenceDataTable
                                    evidences={evidences}
                                    onRefresh={handleRefresh}
                                    loading={fetching}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}