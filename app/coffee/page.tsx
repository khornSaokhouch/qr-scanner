// app/coffee/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function CoffeePage() {
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Path to your payment QR image inside the public/ folder
    const qrImageUrl = "/icon.png";

    // 1. Download / Save QR Code Image
    const handleSaveQR = async () => {
        setDownloading(true);
        try {
            const response = await fetch(qrImageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "smartscan-support-qr.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            // Fallback: opens the image in a new tab if direct download fails
            window.open(qrImageUrl, "_blank");
        } finally {
            setDownloading(false);
        }
    };

    // 2. Share Page via Native Share Sheet (or copy link)
    const handleShare = async () => {
        const shareData = {
            title: "Support SmartScan",
            text: "Buy the creator of SmartScan a coffee!",
            url: typeof window !== "undefined" ? window.location.href : "",
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                // User cancelled share
            }
        } else {
            // Fallback: Copy URL to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch { }
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start px-4 py-6 sm:px-6 sm:py-8 selection:bg-amber-500 selection:text-white">
            {/* Background Warm Amber Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[250px] sm:h-[300px] bg-amber-400/10 dark:bg-amber-500/10 blur-[100px] sm:blur-[130px] rounded-full pointer-events-none" />

            <main className="relative z-10 w-full max-w-sm flex flex-col gap-5">
                {/* Back Link */}
                <div className="w-full flex justify-start">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col items-center text-center transition-colors">
                    {/* Coffee Icon Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 shadow-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Buy Me a Coffee
                    </h1>

                    {/* Description */}
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                        If SmartScan saved you time or helped your workflow, consider fueling future updates with a coffee.
                    </p>

                    {/* QR Code Container (Always White background for reliable camera scanning) */}
                    <div className="mt-6 relative p-3 rounded-2xl bg-white border border-slate-200 shadow-md">
                        {/* Corner Accents */}
                        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500 rounded-tl-sm pointer-events-none" />
                        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500 rounded-tr-sm pointer-events-none" />
                        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500 rounded-bl-sm pointer-events-none" />
                        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500 rounded-br-sm pointer-events-none" />

                        <div className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50">
                            <Image
                                src={qrImageUrl}
                                alt="Payment QR Code"
                                width={240}
                                height={240}
                                className="w-full h-full object-contain p-2"
                                priority
                            />
                        </div>
                    </div>

                    <p className="mt-3 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        Scan with your banking or payment app
                    </p>

                    {/* Buttons: Save & Share */}
                    <div className="mt-6 grid grid-cols-2 gap-2.5 w-full">
                        {/* Save QR Button */}
                        <button
                            onClick={handleSaveQR}
                            disabled={downloading}
                            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            {downloading ? "Saving..." : "Save QR"}
                        </button>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-sm active:scale-95 transition-all"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    Link Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                    </svg>
                                    Share
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Thank You Section */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1.5">
                        <span>Thank You So Much!</span>
                        <span>❤️</span>
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                        Every cup of coffee helps keep SmartScan 100% free, private, and ad-free.
                    </p>
                </div>
            </main>
        </div>
    );
}