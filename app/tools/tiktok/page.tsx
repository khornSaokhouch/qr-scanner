// app/tiktok/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VideoMetadata } from "@/lib/service/tiktok";

export default function TikTokPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [videoData, setVideoData] = useState<VideoMetadata | null>(null);

    const isValidTikTokUrl = (value: string) => {
        try {
            const parsed = new URL(value);
            return (
                parsed.hostname === "tiktok.com" ||
                parsed.hostname.endsWith(".tiktok.com")
            );
        } catch {
            return false;
        }
    };

    async function handleSubmit() {
        const cleanUrl = url.trim();
        setError("");

        if (!cleanUrl) {
            setError("Please paste a TikTok link.");
            return;
        }

        if (!isValidTikTokUrl(cleanUrl)) {
            setError("Please enter a valid TikTok URL (e.g., https://vt.tiktok.com/... or tiktok.com/@user/...)");
            return;
        }

        setLoading(true);
        setVideoData(null);

        try {
            const response = await fetch("/api/tiktok", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: cleanUrl }),
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.error || "Unable to extract video.");
            }

            setVideoData(json.data);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please check the link and try again.");
        } finally {
            setLoading(false);
        }
    }

    function clearAll() {
        setUrl("");
        setError("");
        setVideoData(null);
    }

    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
            setError("");
        } catch {
            setError("Unable to read clipboard. Please paste manually.");
        }
    }

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
            <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
                {/* Back Link */}
                <div className="mb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                {/* Header */}
                <header className="mx-auto max-w-2xl text-center mb-8">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm">
                        <TikTokIcon />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
                        TikTok Video Downloader
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Download TikTok videos in HD without watermark, or extract MP3 audio.
                    </p>
                </header>

                {/* Input Card */}
                <section className="mx-auto w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-7">
                    <div>
                        <label htmlFor="tiktok-url" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            TikTok Video Link
                        </label>
                        <div className="relative">
                            <input
                                id="tiktok-url"
                                type="url"
                                inputMode="url"
                                autoComplete="off"
                                spellCheck={false}
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    setError("");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSubmit();
                                }}
                                placeholder="https://www.tiktok.com/@user/video/... or https://vt.tiktok.com/..."
                                className="min-h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                            />
                            {url && (
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 transition"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={pasteFromClipboard}
                            className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                            Paste from clipboard
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Spinner />
                                <span>Fetching Media...</span>
                            </>
                        ) : (
                            <>
                                <DownloadIcon />
                                <span>Extract Video</span>
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                            <InfoIcon />
                            <span>{error}</span>
                        </div>
                    )}
                </section>

                {/* Video Result Display */}
                {videoData && (
                    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 sm:p-7 animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Thumbnail */}
                            <div className="relative w-full sm:w-48 aspect-[9/16] max-h-72 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-800 shadow-md">
                                {videoData.thumbnail && (
                                    <Image
                                        src={videoData.thumbnail}
                                        alt={videoData.title}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                )}
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-mono backdrop-blur-sm">
                                    {videoData.duration}
                                </div>
                            </div>

                            {/* Details & Download Formats */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            {videoData.author}
                                        </span>
                                        {videoData.size && (
                                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                                {videoData.size}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-1 text-sm sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                                        {videoData.title}
                                    </h3>
                                </div>

                                {/* Download Buttons Grid */}
                                <div className="mt-6 flex flex-col gap-2.5">
                                    {videoData.formats.map((format, idx) => (
                                        <a
                                            key={idx}
                                            href={format.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className={`min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-[0.99] ${format.format_id === "hd"
                                                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                                                : format.format_id === "audio"
                                                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                                                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <DownloadIcon />
                                                <span>{format.format_note}</span>
                                            </div>
                                            <span className="uppercase text-[11px] font-mono opacity-80">
                                                .{format.ext}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Features & How-To Info */}
                <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Feature icon={<ZapIcon />} title="Fast" description="Sub-second link extraction directly to direct MP4 streams." />
                    <Feature icon={<ShieldIcon />} title="No Watermark" description="Downloads clean HD videos without the bouncing logo." />
                    <Feature icon={<DeviceIcon />} title="All Devices" description="Works seamlessly across mobile, tablets, and desktop." />
                </section>
            </div>
        </main>
    );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                {icon}
            </div>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );
}

function TikTokIcon() {
    return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 4v10.2a4.2 4.2 0 11-3.1-4.05M14 4c.7 2.7 2.2 4.2 5 4.7" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
        </svg>
    );
}

function ZapIcon() {
    return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m13 2-9 12h7l-1 8 9-12h-7l1-8z" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3zm-3 9 2 2 4-4" />
        </svg>
    );
}

function DeviceIcon() {
    return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path strokeLinecap="round" d="M10 18h4" />
        </svg>
    );
}

function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" className="opacity-25" stroke="currentColor" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

function InfoIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
        </svg>
    );
}