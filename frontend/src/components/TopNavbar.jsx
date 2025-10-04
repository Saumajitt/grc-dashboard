//grc-dashboard\frontend\src\components\TopNavbar.jsx

"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EvidenceUploadModal from "@/components/EvidenceUploadModal";
import { Upload } from "lucide-react";
import { useRefresh } from "@/context/RefreshContext";

export default function TopNavbar({ onUploadSuccess }) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const { triggerRefresh } = useRefresh();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <header className="border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
            <div className="flex justify-between items-center px-6 py-3">
                {/* Left: Greeting */}
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs text-emerald-400">Online</span>
                    </div>
                    <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        {getGreeting()}, {user?.email?.split("@")[0]}
                    </h1>
                    <p className="text-slate-400 text-xs">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>

                {/* Right: Upload + Avatar */}
                <div className="flex items-center space-x-4">
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
                                <DialogTitle className="text-lg font-semibold text-white">
                                    Upload New Evidence
                                </DialogTitle>
                            </DialogHeader>
                            <EvidenceUploadModal
                                onSuccess={() => {
                                    onUploadSuccess?.();
                                    setOpen(false);
                                    // prefer context trigger; still call optional prop for backwards compatibility
                                    triggerRefresh();
                                    onUploadSuccess?.();
                                    setOpen(false);
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                        {user?.email?.[0]?.toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}
