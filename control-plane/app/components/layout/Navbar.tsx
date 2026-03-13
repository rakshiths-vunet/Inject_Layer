"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RocketIcon, Settings, Globe, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/components/brum/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/app/components/brum/ui/dialog";
import { useState } from "react";

const HAR_ANALYSER_URL = "https://home-blr-001.vunetsystems.com:8443/har-analyser/";

export function Navbar() {
    const pathname = usePathname();
    const [harAnalyserOpen, setHarAnalyserOpen] = useState(false);

    const navItems = [
        { name: "APM", href: "/apm", icon: ShieldAlert },
        { name: "BRUM", href: "/brum", icon: Globe },
    ];

    return (
        <nav className="h-16 border-b border-text-100/10 bg-bg-900/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center border border-accent-500/20 group-hover:border-accent-500/50 transition-colors">
                        <RocketIcon className="w-5 h-5 text-accent-500" />
                    </div>
                    <span className="font-bold text-text-100 tracking-tight">Chaos<span className="text-accent-500">Plane</span></span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? "bg-panel-800 text-accent-500 shadow-sm border border-panel-700"
                                        : "text-text-60 hover:text-text-100 hover:bg-panel-800/50"
                                    }
                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-accent-500" : "text-text-40 group-hover:text-text-100"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-text-60 hover:text-text-100 transition-colors bg-panel-800/50 p-2 rounded-full border border-transparent hover:border-panel-700">
                                <Settings className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setHarAnalyserOpen(true)}>
                                HAR Analyser
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog open={harAnalyserOpen} onOpenChange={setHarAnalyserOpen}>
                        <DialogContent className="sm:max-w-[75vw] w-[75vw] h-[90vh] max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
                            <DialogHeader className="p-4 border-b border-panel-700 bg-bg-900/80 backdrop-blur-sm shrink-0">
                                <DialogTitle>HAR Analyser</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 w-full bg-white">
                                <iframe
                                    src={HAR_ANALYSER_URL}
                                    className="w-full h-full border-0"
                                    title="HAR Analyser"
                                    sandbox="allow-same-origin allow-scripts allow-forms"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-panel-700 to-panel-800 border border-panel-700 flex items-center justify-center text-xs font-bold text-text-60">
                        JS
                    </div>
                </div>
            </div>
        </nav>
    );
}
