"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RocketIcon, LayoutGrid, Activity, Settings, Zap, Server, Globe } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "APM", href: "/apm", icon: Server },
        { name: "BRUM", href: "/brum", icon: Globe },
        { name: "Service Matrix", href: "/matrix", icon: Zap },
        { name: "Observability", href: "/monitor", icon: Activity },
    ];

    return (
        <nav className="h-16 border-b border-panel-800 bg-bg-900/50 backdrop-blur-md sticky top-0 z-50">
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
                                        ? "bg-panel-800 text-accent-500 shadow-[0_0_20px_rgba(255,200,87,0.05)] border border-panel-700"
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
                    <button className="text-text-60 hover:text-text-100 transition-colors bg-panel-800/50 p-2 rounded-full border border-transparent hover:border-panel-700">
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-panel-700 to-panel-800 border border-panel-700 flex items-center justify-center text-xs font-bold text-text-60">
                        JS
                    </div>
                </div>
            </div>
        </nav>
    );
}
