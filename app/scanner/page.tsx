// app/scanner/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

type Tab = "camera" | "image";

/* ──────────────────────────────────────────────────────────────────
   Camera scanner sub-component
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
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decoded) => {
                        if (isScannedRef.current) return;
                        isScannedRef.current = true;
                        if (scanner.isScanning) {
                            scanner.stop().then(() => onScan(decoded)).catch(() => onScan(decoded));
                        } else {
                            onScan(decoded);
                        }
                    },
                    () => {}
                );

                if (!isMounted && scanner.isScanning) await scanner.stop();
            } catch (err: unknown) {
                if (!isMounted) return;
                const e = err as DOMException;
                if (e?.name === "NotAllowedError") setError("Camera permission denied. Please allow camera access.");
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
                    s.stop().then(() => { try { s.clear(); } catch { } }).catch(() => {});
                } else {
                    try { s.clear(); } catch { }
                }
            }
        };
    }, [onScan]);

    if (error) {
        return (
            <div className="w-full p-5 text-center bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 rounded-2xl transition-colors">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Camera Notice</p>
                <p className="text-sm text-red-500 dark:text-red-300/80">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl bg-slate-100 dark:bg-slate-900 transition-colors">
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-indigo-500 dark:border-indigo-400 rounded-tl z-10 pointer-events-none" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-indigo-500 dark:border-indigo-400 rounded-tr z-10 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-indigo-500 dark:border-indigo-400 rounded-bl z-10 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-indigo-500 dark:border-indigo-400 rounded-br z-10 pointer-events-none" />
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce z-10 pointer-events-none" style={{ top: "50%" }} />
            <div id="qr-reader" className="w-full" />
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────
   Image upload scanner sub-component
────────────────────────────────────────────────────────────────── */
function ImageScanner({ onScan }: { onScan: (v: string) => void }) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Ensure a hidden container for the scanner instance exists
    const ELEMENT_ID = "qr-image-scanner-hidden";

    const processFile = useCallback(
        async (file: File) => {
            if (!file.type.startsWith("image/")) {
                setScanError("Please upload an image file (JPG, PNG, GIF, WebP, etc.).");
                return;
            }

            setScanError(null);
            setScanning(true);
            setFileName(file.name);
            setPreview(URL.createObjectURL(file));

            try {
                // Reuse or create the hidden scanner instance
                if (!scannerRef.current) {
                    scannerRef.current = new Html5Qrcode(ELEMENT_ID);
                }
                const decoded = await scannerRef.current.scanFile(file, /* showImage */ false);
                onScan(decoded);
            } catch {
                setScanError("No QR code or barcode detected in this image. Please try a clearer photo.");
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
            // Reset input so the same file can be re-selected
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
            {/* Hidden element required by html5-qrcode */}
            <div id={ELEMENT_ID} className="hidden" />

            {preview ? (
                /* ── Image Preview Card ── */
                <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg dark:shadow-2xl transition-colors">
                    <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Uploaded QR image"
                            className="max-h-full max-w-full object-contain"
                        />
                        {scanning && (
                            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                                <p className="text-xs font-mono text-indigo-300 tracking-wider">Scanning image…</p>
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                            </svg>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{fileName}</span>
                        </div>
                        <button
                            onClick={reset}
                            className="ml-3 shrink-0 text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                            Change image
                        </button>
                    </div>

                    {scanError && (
                        <div className="mx-4 mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300 text-xs flex gap-2">
                            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <span>{scanError}</span>
                        </div>
                    )}
                </div>
            ) : (
                /* ── Drop Zone ── */
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        w-full rounded-2xl border-2 border-dashed cursor-pointer
                        flex flex-col items-center justify-center gap-4
                        px-6 py-12 text-center
                        transition-all duration-200
                        ${isDragOver
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5"
                        }
                    `}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}>
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {isDragOver ? "Drop image here" : "Drop an image or click to browse"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            JPG, PNG, GIF, WebP, BMP supported
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/20 transition-colors pointer-events-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                        </svg>
                        Select Image
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
   Main Scanner Page
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
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-400/10 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                        </svg>
                    </div>
                    <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        SmartScan
                    </span>
                </Link>
                <ThemeToggle />
            </div>

            <main className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm pt-10">
                {/* Title */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {tab === "camera" ? "Camera Scanner" : "Image Scanner"}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {tab === "camera"
                            ? "Align the code inside the frame"
                            : "Upload any image containing a QR code or barcode"}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex w-full rounded-xl bg-slate-200/70 dark:bg-slate-800/70 p-1 gap-1">
                    <button
                        id="tab-camera"
                        onClick={() => setTab("camera")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            tab === "camera"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Camera
                    </button>

                    <button
                        id="tab-image"
                        onClick={() => setTab("image")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            tab === "image"
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                        </svg>
                        Upload Image
                    </button>
                </div>

                {/* Tab Content — keep both in DOM but hide unused tab to properly clean up camera */}
                <div className="w-full">
                    <div className={tab === "camera" ? "block" : "hidden"}>
                        <CameraScanner onScan={handleScan} />
                    </div>
                    <div className={tab === "image" ? "block" : "hidden"}>
                        <ImageScanner onScan={handleScan} />
                    </div>
                </div>

                <Link
                    href="/"
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    ← Back to Home
                </Link>
            </main>
        </div>
    );
}