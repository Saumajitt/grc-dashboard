//frontend\src\app\dashboard\layout.jsx

"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Users, LayoutDashboard, Shield } from "lucide-react";
import TopNavbar from "@/components/TopNavbar";

export default function DashboardLayout({ children }) {
    const { user } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Evidence", href: "/evidence", icon: FileText },
        { name: "Third Parties", href: "/thirdparties", icon: Users },
    ];

    if (user?.role === "admin") {
        navItems.push({ name: "Admin", href: "/admin", icon: Shield });
    }

    return (
        <div className="flex h-screen bg-slate-950 text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    GRC Dashboard
                </div>
                <nav className="flex-1 px-4 py-2 space-y-2">
                    {navItems.map(({ name, href, icon: Icon }) => (
                        <Link
                            key={name}
                            href={href}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors
                            ${pathname === href
                                    ? "bg-slate-800 text-blue-400"
                                    : "text-slate-300 hover:bg-slate-800/50"}
                            `}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
                    Logged in as <span className="text-slate-300">{user?.email}</span>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
