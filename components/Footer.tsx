// components/Footer.tsx
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm transition-colors mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand Info */}
                    <div className="md:col-span-2 space-y-3">
                        <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                            SmartScan
                        </span>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                            Ultra-fast, in-browser optical barcode and QR recognition engine.
                            Zero tracking, 100% client-side privacy.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            All Systems Operational
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
                            Application
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li>
                                <Link href="/scanner" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Web Scanner
                                </Link>
                            </li>
                            <li>
                                <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    Features
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Creator & Privacy */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
                            About
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <li>
                                <a href="#founder" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                                    The Founder
                                </a>
                            </li>
                            <li>
                                <span className="text-slate-400 dark:text-slate-600 cursor-not-allowed">
                                    Privacy Policy (Client-Only)
                                </span>
                            </li>
                            <li>
                                <span className="text-slate-400 dark:text-slate-600 cursor-not-allowed">
                                    Terms of Service
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
                    <p>&copy; {new Date().getFullYear()} SmartScan. Built for speed and privacy.</p>
                    <p>Scan Anything. Anywhere.</p>
                </div>
            </div>
        </footer>
    );
}