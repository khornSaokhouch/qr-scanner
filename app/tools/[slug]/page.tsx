// app/tools/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const PLATFORMS: Record<string, {
    name: string;
    placeholder: string;
    description: string;
    domains: string[];
    accentColor: string;
    badgeBg: string;
    icon: React.ReactNode;
}> = {
    tiktok: {
        name: "TikTok",
        placeholder: "https://www.tiktok.com/@user/video/... or vt.tiktok.com/...",
        description: "Download TikTok videos without watermark in HD or extract MP3 audio.",
        domains: ["tiktok.com"],
        accentColor: "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-slate-900/20",
        badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700",
        icon: <TikTokIcon />,
    },
    youtube: {
        name: "YouTube",
        placeholder: "https://www.youtube.com/watch?v=... or youtu.be/...",
        description: "Download YouTube videos, Shorts, and audio tracks in high quality.",
        domains: ["youtube.com", "youtu.be"],
        accentColor: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25",
        badgeBg: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
        icon: <YouTubeIcon />,
    },
    facebook: {
        name: "Facebook",
        placeholder: "https://www.facebook.com/watch?v=... or fb.watch/...",
        description: "Download public Facebook videos, reels, and watch clips in HD.",
        domains: ["facebook.com", "fb.watch", "fb.com"],
        accentColor: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25",
        badgeBg: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
        icon: <FacebookIcon />,
    },
    instagram: {
        name: "Instagram",
        placeholder: "https://www.instagram.com/reel/... or /p/...",
        description: "Save Instagram Reels, video posts, and carousel media directly.",
        domains: ["instagram.com"],
        accentColor: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white shadow-pink-500/25",
        badgeBg: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-500/20",
        icon: <InstagramIcon />,
    },
    x: {
        name: "X (Twitter)",
        placeholder: "https://x.com/user/status/... or twitter.com/...",
        description: "Extract high-bitrate video clips and animated GIFs from posts on X.",
        domains: ["x.com", "twitter.com"],
        accentColor: "bg-black hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black shadow-black/20",
        badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
        icon: <XIcon />,
    },
    twitter: {
        name: "X (Twitter)",
        placeholder: "https://x.com/user/status/... or twitter.com/...",
        description: "Extract high-bitrate video clips and animated GIFs from posts on X.",
        domains: ["x.com", "twitter.com"],
        accentColor: "bg-black hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black shadow-black/20",
        badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
        icon: <XIcon />,
    },
    pinterest: {
        name: "Pinterest",
        placeholder: "https://www.pinterest.com/pin/... or pin.it/...",
        description: "Save high-resolution video pins and animated media from Pinterest.",
        domains: ["pinterest.com", "pin.it"],
        accentColor: "bg-[#E60023] hover:bg-red-700 text-white shadow-red-600/25",
        badgeBg: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
        icon: <PinterestIcon />,
    },
};

export default function ToolPage() {
    const params = useParams();
    const slug = (params?.slug as string)?.toLowerCase() || "tiktok";
    const config = PLATFORMS[slug] || PLATFORMS.tiktok;

    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [videoData, setVideoData] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
    const [resolvedDuration, setResolvedDuration] = useState<string>("");

    // Auto-detect duration from video stream metadata if missing
    useEffect(() => {
        if (!videoData) {
            setResolvedDuration("");
            return;
        }

        if (videoData.duration && videoData.duration !== "0:00") {
            setResolvedDuration(videoData.duration);
            return;
        }

        const streamUrl = videoData.formats?.[0]?.url || videoData.videoUrl;
        if (streamUrl) {
            const tempVideo = document.createElement("video");
            tempVideo.preload = "metadata";
            tempVideo.src = streamUrl;

            tempVideo.onloadedmetadata = () => {
                if (tempVideo.duration && !isNaN(tempVideo.duration) && tempVideo.duration !== Infinity) {
                    const totalSec = Math.floor(tempVideo.duration);
                    const mins = Math.floor(totalSec / 60);
                    const secs = totalSec % 60;
                    setResolvedDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
                }
            };
        }
    }, [videoData]);

    const validateUrl = (value: string) => {
        try {
            const parsed = new URL(value);
            return config.domains.some(
                (d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
            );
        } catch {
            return false;
        }
    };

    async function handleSubmit() {
        const cleanUrl = url.trim();
        setError("");

        if (!cleanUrl) {
            setError(`Please paste a valid ${config.name} link.`);
            return;
        }

        if (!validateUrl(cleanUrl)) {
            setError(`Please enter a valid link from ${config.name}.`);
            return;
        }

        setLoading(true);
        setVideoData(null);
        setResolvedDuration("");

        try {
            const response = await fetch(`/api/tools/${slug}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: cleanUrl }),
            });

            const json = await response.json();

            if (!response.ok || !json.success || !json.data) {
                throw new Error(json.error || `Unable to extract video from ${config.name}.`);
            }

            if (!json.data.videoUrl && (!json.data.formats || json.data.formats.length === 0)) {
                throw new Error("No downloadable video stream could be found for this post.");
            }

            setVideoData(json.data);
            setActiveTab("video");
        } catch (err: any) {
            setError(err.message || "Failed to process video. Please check the URL.");
        } finally {
            setLoading(false);
        }
    }

    // 100% GUARANTEED DIRECT DOWNLOAD (BLOB STREAMING - ZERO PAGE NAVIGATION)
    const handleDownload = async (fileUrl: string, ext = "mp4", buttonId: string) => {
        if (!fileUrl) return;

        setDownloadingId(buttonId);

        const title = videoData?.title || config.name;
        const cleanTitle = title
            .replace(/[^a-zA-Z0-9_\-\u1780-\u17FF]/g, "_")
            .substring(0, 40)
            .toLowerCase();

        const filename = `${cleanTitle}.${ext}`;
        const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(filename)}`;

        try {
            // Method A: Fetch as local blob (Same-origin blob download NEVER opens new tabs)
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error("Proxy fetch failed");

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", filename);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up memory
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 1000);
        } catch {
            // Method B: Silent fallback via invisible trigger
            const link = document.createElement("a");
            link.href = proxyUrl;
            link.setAttribute("download", filename);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setDownloadingId(null);
        }
    };

    async function pasteFromClipboard() {
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                setUrl(text.trim());
                setError("");
            }
        } catch {
            setError("Clipboard permission denied. Please paste manually.");
        }
    }

    const videoFormats = videoData?.formats?.filter((f: any) => f.ext !== "mp3" && f.vcodec !== "none") || [];
    const audioFormats = videoData?.formats?.filter((f: any) => f.ext === "mp3" || f.vcodec === "none" || f.acodec === "mp3") || [];

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
            <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
                {/* Back to Home Link */}
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
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md mb-4">
                        {config.icon}
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border mb-3 ${config.badgeBg}`}>
                        Free Media Tool
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
                        {config.name} Video Downloader
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                        {config.description}
                    </p>
                </header>

                {/* URL Input Form */}
                <section className="mx-auto w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-7">
                    <div>
                        <label htmlFor="media-url" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {config.name} Video or Post Link
                        </label>
                        <div className="relative">
                            <input
                                id="media-url"
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
                                placeholder={config.placeholder}
                                className="min-h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                            />
                            {url && (
                                <button
                                    type="button"
                                    onClick={() => setUrl("")}
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
                        className={`mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${config.accentColor}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span>Analyzing Media...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                                </svg>
                                <span>Get Download Links</span>
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                            <span>{error}</span>
                        </div>
                    )}
                </section>

                {/* Video Result Card */}
                {videoData && (
                    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 sm:p-7 animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Thumbnail Box */}
                            <div className="relative w-full sm:w-48 aspect-video sm:aspect-[9/16] max-h-64 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-800 shadow-md">
                                {videoData.thumbnail ? (
                                    <Image
                                        src={videoData.thumbnail}
                                        alt={videoData.title || "Video preview"}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                )}

                                {/* DURATION BADGE */}
                                {resolvedDuration && (
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[11px] font-mono font-semibold backdrop-blur-sm shadow">
                                        {resolvedDuration}
                                    </div>
                                )}
                            </div>

                            {/* Details & Download Options */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            {videoData.author || config.name}
                                        </span>
                                        {videoData.size && (
                                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                                {videoData.size}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                                        {videoData.title || `${config.name} Video`}
                                    </h3>
                                </div>

                                {/* Format Tabs: Video vs Audio */}
                                <div className="mt-5">
                                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-3.5 w-fit">
                                        <button
                                            onClick={() => setActiveTab("video")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "video"
                                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                                }`}
                                        >
                                            Video MP4 ({videoFormats.length || 1})
                                        </button>
                                        {(audioFormats.length > 0 || videoData.audioUrl) && (
                                            <button
                                                onClick={() => setActiveTab("audio")}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "audio"
                                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                                    }`}
                                            >
                                                Audio MP3
                                            </button>
                                        )}
                                    </div>

                                    {/* Action Buttons List: No `target="_blank"`, strictly stays on current page */}
                                    <div className="flex flex-col gap-2">
                                        {activeTab === "video" ? (
                                            videoFormats.length > 0 ? (
                                                videoFormats.map((format: any, idx: number) => {
                                                    const btnId = `video-${idx}`;
                                                    const isDownloading = downloadingId === btnId;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleDownload(format.url, format.ext || "mp4", btnId)}
                                                            disabled={isDownloading}
                                                            className="min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-[0.99] disabled:opacity-75"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                {isDownloading ? (
                                                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                                                                    </svg>
                                                                )}
                                                                <span>
                                                                    {isDownloading ? "Downloading to device..." : format.format_note || `${format.height || 720}p Resolution`}
                                                                </span>
                                                            </span>
                                                            <span className="text-[11px] font-mono text-slate-400 uppercase">
                                                                .{format.ext || "mp4"}
                                                            </span>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownload(videoData.videoUrl, "mp4", "video-main")}
                                                    disabled={downloadingId === "video-main"}
                                                    className={`min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-md transition active:scale-[0.99] ${config.accentColor}`}
                                                >
                                                    {downloadingId === "video-main" ? (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                                                        </svg>
                                                    )}
                                                    <span>
                                                        {downloadingId === "video-main" ? "Downloading to device..." : "Download Video (.MP4)"}
                                                    </span>
                                                </button>
                                            )
                                        ) : (
                                            /* Audio Button(s) */
                                            audioFormats.length > 0 ? (
                                                audioFormats.map((audio: any, idx: number) => {
                                                    const btnId = `audio-${idx}`;
                                                    const isDownloading = downloadingId === btnId;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleDownload(audio.url, "mp3", btnId)}
                                                            disabled={isDownloading}
                                                            className="min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.99] transition disabled:opacity-75"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                {isDownloading ? (
                                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                                    </svg>
                                                                )}
                                                                <span>{isDownloading ? "Downloading MP3..." : audio.format_note || "Download Audio (.MP3)"}</span>
                                                            </span>
                                                            <span className="text-[11px] font-mono opacity-80 uppercase">.mp3</span>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownload(videoData.audioUrl, "mp3", "audio-main")}
                                                    disabled={downloadingId === "audio-main"}
                                                    className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.99] transition"
                                                >
                                                    {downloadingId === "audio-main" ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                        </svg>
                                                    )}
                                                    <span>{downloadingId === "audio-main" ? "Downloading MP3..." : "Download Audio Track (.MP3)"}</span>
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

/* =========================================================
   AUTHENTIC BRAND SVG ICONS
========================================================= */

function TikTokIcon() {
    return (
        <svg className="w-6 h-6 fill-slate-900 dark:fill-white" viewBox="0 0 24 24">
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 1.745A6.34 6.34 0 0 0 4 15.672a6.34 6.34 0 0 0 10.82 4.482 6.31 6.31 0 0 0 1.954-4.482V8.75a8.214 8.214 0 0 0 4.815 1.545V6.85a4.814 4.814 0 0 1-2-.164z" />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg className="w-6 h-6 fill-red-600" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg className="w-6 h-6 fill-blue-600" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg className="w-6 h-6 fill-pink-600 dark:fill-pink-500" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg className="w-5 h-5 fill-slate-900 dark:fill-white" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function PinterestIcon() {
    return (
        <svg className="w-6 h-6 fill-red-600" viewBox="0 0 24 24">
            <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.99-.13-2.52.03-3.61l1.15-4.88s-.29-.59-.29-1.46c0-1.37.79-2.39 1.78-2.39.84 0 1.25.63 1.25 1.39 0 .85-.54 2.11-.82 3.29-.23 1 .5 1.81 1.49 1.81 1.78 0 3.16-1.88 3.16-4.6 0-2.4-1.73-4.08-4.19-4.08-2.86 0-4.53 2.14-4.53 4.36 0 .86.33 1.79.74 2.29a.3.3 0 0 1 .07.29c-.08.33-.26 1.05-.29 1.2-.05.2-.16.25-.37.15-1.39-.65-2.26-2.67-2.26-4.3 0-3.5 2.54-6.72 7.34-6.72 3.86 0 6.85 2.75 6.85 6.42 0 3.83-2.42 6.92-5.77 6.92-1.13 0-2.19-.59-2.55-1.28l-.69 2.65c-.25.97-.93 2.19-1.39 2.93A12 12 0 1 0 12 0z" />
        </svg>
    );
}