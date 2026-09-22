// app/tools/video-translate/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function VideoTranslatePage() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
    const [sourceLang, setSourceLang] = useState<"English" | "Chinese">("English");

    const [isProcessing, setIsProcessing] = useState(false);
    const [progressStep, setProgressStep] = useState<string>("");
    const [error, setError] = useState<string>("");

    const [result, setResult] = useState<{
        originalTranscript: string;
        khmerTranslation: string;
        summary: string;
    } | null>(null);

    // Audio & Video player sync
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlayingDubbed, setIsPlayingDubbed] = useState(false);
    const [copied, setCopied] = useState(false);

    // Cleanup video preview URL
    useEffect(() => {
        return () => {
            if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
        };
    }, [videoPreviewUrl]);

    // File selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            setError("Please upload an MP4, WebM, or MOV video file.");
            return;
        }

        setError("");
        setResult(null);
        setVideoFile(file);
        setVideoPreviewUrl(URL.createObjectURL(file));
    };

    // Submit for AI Transcription & Translation
    const handleTranslate = async () => {
        if (!videoFile) {
            setError("Please select a video file first.");
            return;
        }

        setIsProcessing(true);
        setError("");
        setResult(null);
        setProgressStep("1/3: Uploading video & extracting speech...");

        try {
            const formData = new FormData();
            formData.append("video", videoFile);
            formData.append("sourceLang", sourceLang);

            setTimeout(() => {
                setProgressStep("2/3: Gemini AI analyzing speech & translating to Khmer...");
            }, 3000);

            const res = await fetch("/api/translate-video", {
                method: "POST",
                body: formData,
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.error || "Failed to translate video voice.");
            }

            setProgressStep("3/3: Preparing Khmer voice dubbing...");
            setResult(json.data);
        } catch (err: any) {
            setError(err.message || "An error occurred while processing the video.");
        } finally {
            setIsProcessing(false);
            setProgressStep("");
        }
    };

    // Synchronized Player: Plays video muted while playing Khmer voice audio
    const toggleDubbedPlayback = () => {
        if (!videoRef.current || !audioRef.current) return;

        if (isPlayingDubbed) {
            videoRef.current.pause();
            audioRef.current.pause();
            setIsPlayingDubbed(false);
        } else {
            videoRef.current.muted = true; // Mute original language
            videoRef.current.currentTime = 0;
            audioRef.current.currentTime = 0;

            videoRef.current.play();
            audioRef.current.play();
            setIsPlayingDubbed(true);
        }
    };

    const copyKhmer = () => {
        if (!result?.khmerTranslation) return;
        navigator.clipboard.writeText(result.khmerTranslation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadKhmerAudio = () => {
        if (!result?.khmerTranslation) return;
        const ttsUrl = `/api/tts?lang=km&text=${encodeURIComponent(result.khmerTranslation)}`;
        const a = document.createElement("a");
        a.href = ttsUrl;
        a.download = "khmer_voiceover_dub.mp3";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

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
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm mb-4">
                        <VideoTranslateIcon />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 mb-3">
                        AI Video Voiceover &amp; Dubbing
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                        Translate Video Voice to Khmer
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Upload English or Chinese videos to automatically translate the voice into natural Khmer audio.
                    </p>
                </header>

                {/* Upload & Setup Card */}
                <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 space-y-6">
                    {/* Source Language Picker */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
                            1. Spoken Language in Video:
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                            <button
                                type="button"
                                onClick={() => setSourceLang("English")}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${sourceLang === "English"
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    }`}
                            >
                                <span>🇺🇸</span>
                                <span>English Voice</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSourceLang("Chinese")}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${sourceLang === "Chinese"
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    }`}
                            >
                                <span>🇨🇳</span>
                                <span>Chinese Voice (中文)</span>
                            </button>
                            <div className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                                <span>&rarr; Output: 🇰🇭 ភាសាខ្មែរ (Khmer Voice)</span>
                            </div>
                        </div>
                    </div>

                    {/* Drag and Drop Video Box */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                            2. Upload Video Clip:
                        </label>
                        <label className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 hover:border-indigo-400 transition cursor-pointer">
                            <UploadCloudIcon />
                            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {videoFile ? videoFile.name : "Click to choose video or drag file here"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">MP4, WebM, MOV supported (up to 25MB)</p>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Translate Button */}
                    <button
                        type="button"
                        onClick={handleTranslate}
                        disabled={!videoFile || isProcessing}
                        className="w-full min-h-[48px] rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs sm:text-sm text-white shadow-lg shadow-indigo-600/25 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{progressStep || "Translating with Gemini AI..."}</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon />
                                <span>Translate Voice to Khmer</span>
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs">
                            {error}
                        </div>
                    )}
                </section>

                {/* RESULTS: DUBBED VIDEO PLAYER & TRANSCRIPTS */}
                {result && videoPreviewUrl && (
                    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 space-y-6 animate-in fade-in duration-300">
                        {/* Summary Pill */}
                        {result.summary && (
                            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                    <span className="font-bold">សេចក្តីសង្ខេប (Summary): </span>
                                    {result.summary}
                                </p>
                            </div>
                        )}

                        {/* Synced Dub Player Container */}
                        <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md">
                            <div className="relative aspect-video max-h-[380px] mx-auto flex items-center justify-center">
                                <video
                                    ref={videoRef}
                                    src={videoPreviewUrl}
                                    playsInline
                                    className="w-full h-full object-contain"
                                    onEnded={() => setIsPlayingDubbed(false)}
                                />

                                {/* Hidden audio player delivering natural Khmer voice */}
                                <audio
                                    ref={audioRef}
                                    src={`/api/tts?lang=km&text=${encodeURIComponent(result.khmerTranslation)}`}
                                    onEnded={() => setIsPlayingDubbed(false)}
                                    className="hidden"
                                />
                            </div>

                            {/* Player Bar */}
                            <div className="p-4 bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-white border-t border-slate-800">
                                <button
                                    onClick={toggleDubbedPlayback}
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 shadow-md shadow-indigo-600/30"
                                >
                                    <PlayIcon />
                                    <span>{isPlayingDubbed ? "Pause Dubbed Video" : "Play with Khmer Voice"}</span>
                                </button>

                                <button
                                    onClick={downloadKhmerAudio}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                                >
                                    <DownloadIcon />
                                    <span>Save Khmer Audio (.MP3)</span>
                                </button>
                            </div>
                        </div>

                        {/* Side-by-Side Transcripts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Original Language Transcript */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Original {sourceLang} Speech
                                </span>
                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                                    {result.originalTranscript}
                                </p>
                            </div>

                            {/* Translated Khmer Voice Script */}
                            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                        🇰🇭 សំឡេងបកប្រែជាភាសាខ្មែរ (Khmer Voice)
                                    </span>
                                    <button
                                        onClick={copyKhmer}
                                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                    >
                                        {copied ? "Copied!" : "Copy Text"}
                                    </button>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
                                    {result.khmerTranslation}
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

/* =========================================================
   CLEAN ICONS
========================================================= */

function VideoTranslateIcon() {
    return (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    );
}

function UploadCloudIcon() {
    return (
        <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
    );
}

function SparklesIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}

function PlayIcon() {
    return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
        </svg>
    );
}