//frontend\src\app\thirdparties\page.jsx

"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ThirdPartiesPage() {
    const [thirdParties, setThirdParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchThirdParties() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/thirdparties`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });    
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load third parties");
                setThirdParties(data || []);
            } catch (err) {
                console.error("Error loading third-parties:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchThirdParties();
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <Card className="bg-slate-900/30 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-white">
                        <Users className="w-5 h-5 mr-2 text-purple-400" /> Third-Party Vendors
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <p className="text-red-400">Error: {error}</p>
                    ) : loading ? (
                        <p className="text-slate-400">Loading vendors...</p>
                    ) : thirdParties.length > 0 ? (
                        <ul className="space-y-2">
                            {thirdParties.map((tp) => (
                                <li
                                    key={tp._id}
                                    className="p-3 bg-slate-800/30 rounded-md border border-slate-700/50 text-slate-200"
                                >
                                    {tp.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">No vendors added yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
