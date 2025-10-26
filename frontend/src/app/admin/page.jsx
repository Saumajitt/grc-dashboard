//frontend\src\app\admin\page.jsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Activity, ShieldCheck, TrendingUp, FileText } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({});
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchAdminData() {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load data");

                
                const users = data.clients || [];

                setClients(users);
                setStats({
                    totalClients: users.length,
                    totalAdmins: users.filter((u) => u.role === "admin").length,
                    totalEvidence: Math.floor(Math.random() * 300 + 50), // mock for now
                });
            } catch (err) {
                console.error("Error loading admin data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchAdminData();
    }, []);

    // 🌀 Loading state (same look as dashboard)
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    // ⚠️ Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center bg-slate-950">
                <div>
                    <Activity className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <h2 className="text-lg text-white font-semibold mb-1">
                        Error Loading Admin Data
                    </h2>
                    <p className="text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Summary Stats (Matches Client Dashboard Style) */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Total Clients</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.totalClients}</p>
                                <p className="text-emerald-400 text-xs mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Active clients
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Total Admins</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.totalAdmins}</p>
                                <p className="text-purple-400 text-xs mt-1">System managers</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/70 transition">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Total Evidence</p>
                                <p className="text-2xl font-bold text-white mt-1">{stats.totalEvidence}</p>
                                <p className="text-blue-400 text-xs mt-1">All client uploads</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-emerald-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Clients Table */}
                <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl text-white">
                            <Users className="w-5 h-5 mr-2 text-blue-400" /> Manage Clients
                        </CardTitle>
                        <p className="text-slate-400 text-sm">
                            View and manage registered users
                        </p>
                    </CardHeader>
                    <CardContent>
                        {clients.length > 0 ? (
                            <div className="overflow-hidden border border-slate-800 rounded-lg">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-800/60 text-slate-400 text-sm uppercase">
                                        <tr>
                                            <th className="py-3 px-4 font-medium">Email</th>
                                            <th className="py-3 px-4 font-medium">Role</th>
                                            <th className="py-3 px-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((client, idx) => (
                                            <tr
                                                key={client._id}
                                                className={`border-t border-slate-800 hover:bg-slate-800/40 transition-colors ${idx % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/50"
                                                    }`}
                                            >
                                                <td className="py-3 px-4 text-slate-200">{client.email}</td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-2 py-1 text-xs rounded ${client.role === "admin"
                                                                ? "bg-purple-500/20 text-purple-300"
                                                                : "bg-blue-500/20 text-blue-300"
                                                            }`}
                                                    >
                                                        {client.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                
                                                 {/* add disable functionality later */}
                                                    <button
                                                        disabled
                                                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-slate-500">No clients found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
