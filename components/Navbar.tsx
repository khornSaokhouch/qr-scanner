// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        SmartScan
                    </span>
                </Link>

                {/* Center Nav Links (Desktop) */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                        Features
                    </a>
                    <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                        How it Works
                    </a>
                    <a href="#founder" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                        Founder
                    </a>
                </nav>

                {/* Right Actions: Theme Toggle + Mobile Menu Trigger */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeToggle />

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                        className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-lg px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <a
                        href="#features"
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#how-it-works"
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                    >
                        How it Works
                    </a>
                    <a
                        href="#founder"
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Founder
                    </a>
                </div>
            )}
        </header>
    );
}