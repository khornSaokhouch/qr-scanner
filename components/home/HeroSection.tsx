// components/HeroSection.tsx
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-20 flex flex-col items-center text-center">

            {/* Top All-in-One Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 backdrop-blur-md mb-6 sm:mb-8">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 tracking-wide uppercase">
                    Free All-in-One Web Utilities
                </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.12] text-slate-900 dark:text-slate-50">
                The Smart Toolkit to{" "}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Scan, Create &amp; Convert
                </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Scan barcodes, generate custom QR codes, convert documents to PDF, and save social media clips in seconds—free, private, and directly in your browser.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                <a
                    href="#tools"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/25 active:scale-95 transition-all duration-200"
                >
                    <ToolsIcon />
                    Explore All Tools
                </a>

                <Link
                    href="/scanner"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm sm:text-base text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors"
                >
                    <CameraIcon />
                    Quick Scanner
                </Link>
            </div>

            {/* Quick-Launch Pills Grid (Direct 1-Click Access) */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-2xl">
                <Link
                    href="/scanner"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-md transition-all group"
                >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <QrCodeIcon />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">QR Scanner</p>
                        <p className="text-[10px] text-slate-400">Camera / File</p>
                    </div>
                </Link>

                <Link
                    href="/create/qr"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-md transition-all group"
                >
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <CreateQrIcon />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">QR Creator</p>
                        <p className="text-[10px] text-slate-400">Wi-Fi &amp; Links</p>
                    </div>
                </Link>

                <Link
                    href="/convert-to-pdf"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-md transition-all group"
                >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <PdfDocIcon />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">PDF Studio</p>
                        <p className="text-[10px] text-slate-400">Images &amp; Word</p>
                    </div>
                </Link>

                <a
                    href="#tools"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-md transition-all group"
                >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <MediaDownloadIcon />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Media Saver</p>
                        <p className="text-[10px] text-slate-400">TikTok, IG, YT</p>
                    </div>
                </a>
            </div>

            {/* Smart Hub Showcase Card */}
            <div className="mt-14 w-full max-w-3xl relative p-1 rounded-3xl bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent">
                <div className="relative rounded-[22px] bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 text-left">

                    {/* Left Details */}
                    <div className="space-y-3 max-w-md">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Hardware Accelerated &amp; Private
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Zero Install. 100% Client-Side Speed.
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            No accounts, no watermark restrictions, and no tracking cookies. All operations process locally in your device memory.
                        </p>
                    </div>

                    {/* Right Feature Badges Grid */}
                    <div className="grid grid-cols-1 gap-2 w-full md:w-auto shrink-0">
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <CheckSmallIcon />
                            <span>Instant QR &amp; Barcode Reader</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <CheckSmallIcon />
                            <span>A4 &amp; Letter PDF Converter</span>
                        </div>
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200">
                            <CheckSmallIcon />
                            <span>HD Video &amp; MP3 Extractor</span>
                        </div>
                    </div>

                </div>
            </div>

        </section>
    );
}

/* =========================================================
   CLEAN INLINE SVG ICONS
========================================================= */

function ToolsIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
    );
}

function CameraIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function QrCodeIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function CreateQrIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2h4z" />
        </svg>
    );
}

function PdfDocIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h4" />
        </svg>
    );
}

function MediaDownloadIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    );
}

function CheckSmallIcon() {
    return (
        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}