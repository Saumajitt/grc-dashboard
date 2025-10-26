//frontend\src\app\thirdparties\page.jsx

"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ThirdPartiesPage() {
    const [thirdParties, setThirdParties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchThirdParties() {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/thirdparties`);
                const data = await res.json();
                setThirdParties(data || []);
            } catch (err) {
                console.error("Error loading third-parties:", err);
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
                    {loading ? (
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
