"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Image, BookOpen, Package, TrendingUp } from "lucide-react";

const categoryConfig = {
    policy: {
        icon: BookOpen,
        color: "blue",
        label: "Policies",
        description: "Policy documents"
    },
    diagram: {
        icon: Image,
        color: "purple",
        label: "Diagrams",
        description: "Visual diagrams"
    },
    doc: {
        icon: FileText,
        color: "emerald",
        label: "Documents",
        description: "General documents"
    },
    other: {
        icon: Package,
        color: "orange",
        label: "Other",
        description: "Miscellaneous files"
    }
};

const colorClasses = {
    blue: {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
        progress: "bg-blue-500"
    },
    purple: {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/20",
        progress: "bg-purple-500"
    },
    emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        progress: "bg-emerald-500"
    },
    orange: {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/20",
        progress: "bg-orange-500"
    }
};

export default function EvidenceSummary({ evidences }) {
    const total = evidences.length;
    const byCategory = evidences.reduce((acc, ev) => {
        acc[ev.category] = (acc[ev.category] || 0) + 1;
        return acc;
    }, {});

    // Calculate recent activity (last 7 days)
    const recentCount = evidences.filter(e =>
        new Date(e.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    if (total === 0) {
        return (
            <Card className="bg-slate-800/30 border-slate-700/50 p-6 text-center">
                <p className="text-slate-400">No evidence uploaded yet.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Category Breakdown */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(categoryConfig).map(([category, config]) => {
                    const count = byCategory[category] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const colors = colorClasses[config.color];
                    const Icon = config.icon;

                    return (
                        <Card
                            key={category}
                            className={`${colors.bg} ${colors.border} border backdrop-blur-sm hover:scale-105 transition-transform duration-200`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${colors.text}`} />
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                                        <p className="text-xs text-slate-400">{percentage.toFixed(0)}%</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-white text-sm">{config.label}</h3>
                                    </div>
                                    <p className="text-xs text-slate-400">{config.description}</p>

                                    <div className="space-y-1">
                                        <Progress
                                            value={percentage}
                                            className="h-1.5 bg-slate-800/50"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Activity Summary */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">Recent Activity</p>
                                <p className="text-xl font-bold text-white">{recentCount}</p>
                                <p className="text-xs text-slate-400">Files uploaded this week</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">Total Files</p>
                                <p className="text-xl font-bold text-white">{total}</p>
                                <p className="text-xs text-slate-400">Across all categories</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">Categories</p>
                                <p className="text-xl font-bold text-white">
                                    {Object.keys(byCategory).length}
                                </p>
                                <p className="text-xs text-slate-400">Different file types</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}