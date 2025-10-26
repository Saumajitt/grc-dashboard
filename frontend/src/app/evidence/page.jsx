//frontend\src\app\evidence\page.jsx
"use client";
import EvidenceDataTable from "@/components/EvidenceDataTable";
import { getEvidence } from "@/lib/evidence";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useRefresh } from "@/context/RefreshContext";

export default function EvidencePage() {
    const { refreshFlag, triggerRefresh } = useRefresh();
    const [evidences, setEvidences] = useState([]);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        async function fetchEvidence() {
            setLoading(true);
            try {
                const res = await getEvidence({ page: 1, limit: 50 });
                setEvidences(res.evidences || []);
            } catch (err) {
                console.error("Error loading evidences:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchEvidence();
    }, [refreshFlag]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <Card className="bg-slate-900/30 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-white">
                        <Activity className="w-5 h-5 mr-2 text-blue-400" /> Evidence Library
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <EvidenceDataTable evidences={evidences} loading={loading} onRefresh={triggerRefresh} />
                </CardContent>
            </Card>
        </div>
    );
}
