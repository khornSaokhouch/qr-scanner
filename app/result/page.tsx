// app/result/page.tsx
"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { detectScanType } from "@/lib/qr-parser";

function ResultContent() {
    const params = useSearchParams();
    const value = params.get("value") || "";
    const type = detectScanType(value) || "Text";

    const [copied, setCopied] = useState(false);
    const [copiedPassword, setCopiedPassword] = useState(false);
    const [scanTime, setScanTime] = useState("");
    const [canShare, setCanShare] = useState(false);

    // Safe client-side mount (avoids hydration mismatch with time & navigator)
    useEffect(() => {
        setScanTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        if (typeof navigator !== "undefined" && !!navigator.share) {
            setCanShare(true);
        }
    }, []);

    // Content type detection
    const isUrl = useMemo(() => /^https?:\/\//i.test(value), [value]);
    const isEmail = useMemo(() => /^mailto:/i.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), [value]);
    const isPhone = useMemo(() => /^tel:/i.test(value) || /^\+?[0-9\s-]{7,15}$/.test(value.trim()), [value]);
    const isWifi = useMemo(() => value.startsWith("WIFI:"), [value]);

    // Parse WiFi format (WIFI:S:MyNetwork;T:WPA;P:secret123;;)
    const wifiData = useMemo(() => {
        if (!isWifi) return null;
        const ssidMatch = value.match(/S:([^;]+)/);
        const passMatch = value.match(/P:([^;]+)/);
        const authMatch = value.match(/T:([^;]+)/);
        return {
            ssid: ssidMatch ? ssidMatch[1] : "Hidden SSID",
            password: passMatch ? passMatch[1] : "",
            auth: authMatch ? authMatch[1] : "WPA",
        };
    }, [isWifi, value]);

    const emailHref = isEmail && !value.startsWith("mailto:") ? `mailto:${value}` : value;
    const phoneHref = isPhone ? (value.startsWith("tel:") ? value : `tel:${value.trim()}`) : value;

    const handleCopy = async (text: string, isPass = false) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            if (isPass) {
                setCopiedPassword(true);
                setTimeout(() => setCopiedPassword(false), 2000);
            } else {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            // Fallback
        }
    };

    const handleShare = async () => {
        if (!navigator.share) return handleCopy(value);
        try {
            await navigator.share({
                title: "SmartScan Result",
                text: value,
                url: isUrl ? value : undefined,
            });
        } catch {
            // User cancelled or share failed
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start px-4 py-6 sm:px-6 sm:py-8 selection:bg-indigo-500 selection:text-white">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[250px] sm:h-[300px] bg-indigo-400/10 dark:bg-indigo-600/15 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />

            <main className="relative z-10 w-full max-w-lg flex flex-col gap-4">
                {/* Header Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/scanner"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Scanner
                    </Link>

                    {/* Dynamic Type Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        {type}
                    </span>
                </div>

                {/* Main Result Card */}
                <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl transition-colors">
                    {/* Status & Timestamp Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                Decoded Successfully
                            </h1>
                        </div>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                            {scanTime || "Just now"}
                        </span>
                    </div>

                    {/* WiFi Special Block */}
                    {wifiData ? (
                        <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    WiFi Network (SSID)
                                </span>
                                <p className="text-base font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                                    {wifiData.ssid}
                                </p>
                            </div>

                            {wifiData.password && (
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Password ({wifiData.auth})
                                        </span>
                                        <p className="text-sm font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                                            {wifiData.password}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(wifiData.password, true)}
                                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                                    >
                                        {copiedPassword ? "Copied!" : "Copy Password"}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Standard Decoded Content Container */
                        <div className="mt-5">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">
                                Content
                            </label>
                            <div className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 break-all max-h-60 overflow-y-auto select-all leading-relaxed transition-colors">
                                {value || <span className="text-slate-400 italic">No content captured.</span>}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Grid */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* 1. Context-Specific Primary Action */}
                        {isUrl && (
                            <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                                Open in Browser
                            </a>
                        )}

                        {isEmail && (
                            <a
                                href={emailHref}
                                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                Compose Email
                            </a>
                        )}

                        {isPhone && (
                            <a
                                href={phoneHref}
                                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                                Call Number
                            </a>
                        )}

                        {!isUrl && !isEmail && !isPhone && (
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(value)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                Google Search
                            </a>
                        )}

                        {/* 2. Copy Value Button */}
                        <button
                            onClick={() => handleCopy(value)}
                            className={`min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border active:scale-95 transition-all ${copied
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                    : "bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80"
                                }`}
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                    </svg>
                                    Copy Value
                                </>
                            )}
                        </button>

                        {/* 3. Share Sheet Button (Full width if present) */}
                        {canShare && (
                            <button
                                onClick={handleShare}
                                className="sm:col-span-2 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
                            >
                                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                </svg>
                                Share Result
                            </button>
                        )}
                    </div>
                </div>

                {/* Bottom Quick Action: Scan Next */}
                <div className="text-center pt-2">
                    <Link
                        href="/scanner"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Scan Another Code
                    </Link>
                </div>
            </main>
        </div>
    );
}

// Next.js Suspense wrapper for useSearchParams
export default function ResultPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <ResultContent />
        </Suspense>
    );
}