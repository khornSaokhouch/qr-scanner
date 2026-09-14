// app/scanner/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";

type Tab = "camera" | "image";

/* ──────────────────────────────────────────────────────────────────
   Camera scanner sub-component (Mobile & Desktop Responsive)
────────────────────────────────────────────────────────────────── */
function CameraScanner({ onScan }: { onScan: (v: string) => void }) {
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScannedRef = useRef(false);

    useEffect(() => {
        let isMounted = true;
        const elementId = "qr-reader";
        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;
        isScannedRef.current = false;

        async function initScanner() {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (!isMounted) return;
                if (!devices || devices.length === 0) {
                    setError("No camera found on this device.");
                    return;
                }
                const backCamera = devices.find((d) => /back|rear|environment/i.test(d.label));
                const cameraId = backCamera ? backCamera.id : devices[0].id;

                await scanner.start(
                    cameraId,
                    {
                        fps: 15,
                        // Dynamically adapts scanner box size to device width
                        qrbox: (viewfinderWidth, viewfinderHeight) => {
                            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                            const boxSize = Math.floor(minEdge * 0.72);
                            return {
                                width: Math.max(160, Math.min(boxSize, 260)),
                                height: Math.max(160, Math.min(boxSize, 260)),
                            };
                        },
                        aspectRatio: 1.0,
                    },
                    (decoded) => {
                        if (isScannedRef.current) return;
                        isScannedRef.current = true;
                        if (scanner.isScanning) {
                            scanner.stop().then(() => onScan(decoded)).catch(() => onScan(decoded));
                        } else {
                            onScan(decoded);
                        }
                    },
                    () => { }
                );

                if (!isMounted && scanner.isScanning) await scanner.stop();
            } catch (err: unknown) {
                if (!isMounted) return;
                const e = err as DOMException;
                if (e?.name === "NotAllowedError") setError("Camera permission denied. Please allow camera access in browser settings.");
                else if (e?.name === "NotFoundError") setError("No camera device detected on your system.");
                else setError((err instanceof Error ? err.message : null) || "Failed to initialize camera.");
            }
        }

        initScanner();

        return () => {
            isMounted = false;
            const s = scannerRef.current;
            if (s) {
                if (s.isScanning) {
                    s.stop().then(() => { try { s.clear(); } catch { } }).catch(() => { });
                } else {
                    try { s.clear(); } catch { }
                }
            }
        };
    }, [onScan]);

    if (error) {
        return (
            <div className="w-full p-5 sm:p-6 text-center bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-3xl transition-colors shadow-lg">
                <div className="w-11 h-11 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Camera Notice</p>
                <p className="text-xs text-red-500 dark:text-red-300/80 leading-relaxed max-w-xs mx-auto">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-square max-h-[360px] sm:max-h-[400px] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl bg-slate-950 transition-colors">
            {/* Viewfinder Target Brackets */}
            <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 border-indigo-500 dark:border-indigo-400 rounded-tl z-10 pointer-events-none" />
            <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 border-indigo-500 dark:border-indigo-400 rounded-tr z-10 pointer-events-none" />
            <div className="absolute bottom-3.5 left-3.5 sm:bottom-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 border-indigo-500 dark:border-indigo-400 rounded-bl z-10 pointer-events-none" />
            <div className="absolute bottom-3.5 right-3.5 sm:bottom-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 border-indigo-500 dark:border-indigo-400 rounded-br z-10 pointer-events-none" />

            {/* Animated Laser Beam */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce z-10 pointer-events-none" style={{ top: "50%" }} />

            {/* Scoped CSS resets so html5-qrcode video is completely responsive */}
            <div
                id="qr-reader"
                className="w-full h-full overflow-hidden [&_video]:!object-cover [&_video]:!w-full [&_video]:!h-full [&_img]:!hidden"
            />
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────
   Image upload scanner sub-component (Mobile & Desktop Responsive)
────────────────────────────────────────────────────────────────── */
function ImageScanner({ onScan }: { onScan: (v: string) => void }) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const ELEMENT_ID = "qr-image-scanner-hidden";

    const processFile = useCallback(
        async (file: File) => {
            if (!file.type.startsWith("image/")) {
                setScanError("Please upload an image file (JPG, PNG, GIF, WebP).");
                return;
            }

            setScanError(null);
            setScanning(true);
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));

            try {
                if (!scannerRef.current) {
                    scannerRef.current = new Html5Qrcode(ELEMENT_ID);
                }
                const decoded = await scannerRef.current.scanFile(file, false);
                onScan(decoded);
            } catch {
                setScanError("No QR code or barcode detected. Try a clearer photo.");
            } finally {
                setScanning(false);
            }
        },
        [onScan]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = "";
        },
        [processFile]
    );

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
        },
        [processFile]
    );

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = () => setIsDragOver(false);

    const reset = () => {
        setPreview(null);
        setFileName("");
        setScanError(null);
        setScanning(false);
    };

    return (
        <>
            <div id={ELEMENT_ID} className="hidden" />

            {preview ? (
                <div className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl transition-colors">
                    <div className="relative w-full aspect-square max-h-[300px] sm:max-h-[340px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Uploaded QR image"
                            className="max-h-full max-w-full object-contain rounded-xl"
                        />
                        {scanning && (
                            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                                <p className="text-xs font-mono text-indigo-300 tracking-wider">Scanning image…</p>
                            </div>
                        )}
                    </div>

                    <div className="px-3.5 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                            </svg>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{fileName}</span>
                        </div>
                        <button
                            onClick={reset}
                            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                        >
                            Change
                        </button>
                    </div>

                    {scanError && (
                        <div className="mx-3.5 mb-3.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 text-xs flex gap-2">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <span>{scanError}</span>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        w-full aspect-square max-h-[360px] sm:max-h-[400px] rounded-3xl border-2 border-dashed cursor-pointer
                        flex flex-col items-center justify-center gap-3.5
                        px-4 py-8 sm:py-12 text-center shadow-xl
                        transition-all duration-200
                        ${isDragOver
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5"
                        }
                    `}
                >
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}>
                        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>

                    <div className="px-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {isDragOver ? "Drop image here" : "Upload or drop image"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Supports JPG, PNG, WebP, GIF
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors pointer-events-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                        </svg>
                        Choose File
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload image to scan"
            />
        </>
    );
}

/* ──────────────────────────────────────────────────────────────────
   Main Scanner Page (Auto-centers on all screens)
────────────────────────────────────────────────────────────────── */
export default function ScannerPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("camera");

    const handleScan = useCallback(
        (decodedText: string) => {
            router.push(`/result?value=${encodeURIComponent(decodedText)}`);
        },
        [router]
    );

    return (
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start px-4 py-3 sm:px-6 sm:py-5 selection:bg-indigo-500 selection:text-white">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[320px] sm:w-[500px] h-[250px] sm:h-[300px] bg-indigo-400/10 dark:bg-indigo-600/15 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none" />

            <main className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 w-full max-w-[340px] sm:max-w-sm">
                {/* Back Button Under Navbar */}
                <div className="w-full flex justify-start">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </Link>
                </div>

                {/* Title */}
                <div className="text-center px-1">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {tab === "camera" ? "Camera Scanner" : "Image Scanner"}
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        {tab === "camera"
                            ? "Position the QR code or barcode within the frame"
                            : "Upload an image containing any QR or barcode"}
                    </p>
                </div>

                {/* 1. Scanner Window */}
                <div className="w-full">
                    {tab === "camera" ? (
                        <CameraScanner onScan={handleScan} />
                    ) : (
                        <ImageScanner onScan={handleScan} />
                    )}
                </div>

                {/* 2. Switcher Button (Under Camera Scan) */}
                <div className="flex w-full rounded-2xl bg-slate-200/80 dark:bg-slate-900/80 p-1.5 gap-1.5 border border-slate-200 dark:border-slate-800/80 shadow-inner backdrop-blur-md">
                    <button
                        id="tab-camera"
                        onClick={() => setTab("camera")}
                        className={`flex-1 min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${tab === "camera"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Live Camera
                    </button>

                    <button
                        id="tab-image"
                        onClick={() => setTab("image")}
                        className={`flex-1 min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${tab === "image"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                    >
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                        </svg>
                        Upload Image
                    </button>
                </div>

                {/* Privacy Badge */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pb-4">
                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span>100% Client-side • Zero data stored</span>
                </div>
            </main>
        </div>
    );
}