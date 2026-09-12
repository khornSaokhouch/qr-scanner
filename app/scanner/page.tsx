// app/scanner/page.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";

export default function ScannerPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScannedRef = useRef(false);

    const handleScan = useCallback(
        (decodedText: string) => {
            router.push(`/result?value=${encodeURIComponent(decodedText)}`);
        },
        [router]
    );

    useEffect(() => {
        let isMounted = true;
        const elementId = "qr-reader";
        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        async function initScanner() {
            try {
                // 1. Get all available cameras on the device
                const devices = await Html5Qrcode.getCameras();

                if (!isMounted) return;

                if (!devices || devices.length === 0) {
                    setError("No camera found on this device.");
                    return;
                }

                // 2. Select back/environment camera if on mobile, otherwise use the first webcam
                const backCamera = devices.find((device) =>
                    /back|rear|environment/i.test(device.label)
                );
                const selectedCameraId = backCamera ? backCamera.id : devices[0].id;

                // 3. Start scanning
                await scanner.start(
                    selectedCameraId,
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        if (isScannedRef.current) return;
                        isScannedRef.current = true;

                        if (scanner.isScanning) {
                            scanner
                                .stop()
                                .then(() => handleScan(decodedText))
                                .catch(() => handleScan(decodedText));
                        } else {
                            handleScan(decodedText);
                        }
                    },
                    () => {
                        // Frame scanning pass (ignored)
                    }
                );

                // If the component unmounted while `start()` was resolving
                if (!isMounted && scanner.isScanning) {
                    await scanner.stop();
                }
            } catch (err: unknown) {
                if (!isMounted) return;

                const domError = err as DOMException;
                // Handle denied permission or no hardware
                if (domError?.name === "NotAllowedError") {
                    setError("Camera permission denied. Please allow camera access.");
                } else if (domError?.name === "NotFoundError") {
                    setError("No camera device was detected on your system.");
                } else {
                    setError(
                        (err instanceof Error ? err.message : null) ||
                        "Failed to initialize camera."
                    );
                }
            }
        }

        initScanner();

        // 4. Safe Cleanup
        return () => {
            isMounted = false;
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current
                        .stop()
                        .then(() => {
                            try {
                                scannerRef.current?.clear();
                            } catch { }
                        })
                        .catch(() => { });
                } else {
                    try {
                        scannerRef.current.clear();
                    } catch { }
                }
            }
        };
    }, [handleScan]);

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500 selection:text-white">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 group"
                >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
                        </svg>
                    </div>
                    <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">SmartScan</span>
                </Link>
                <span className="text-xs text-slate-500 font-mono">
                    Point camera at a QR code or barcode
                </span>
            </div>

            <main className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">Scanning…</h1>
                    <p className="mt-1 text-sm text-slate-400">Align the code inside the frame below</p>
                </div>

                {error ? (
                    <div className="w-full p-5 text-center bg-red-950/50 border border-red-800/50 rounded-2xl">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-red-400 mb-1">Camera Notice</p>
                        <p className="text-sm text-red-300/80">{error}</p>
                        <button
                            onClick={() => { isScannedRef.current = false; setError(null); }}
                            className="mt-4 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                        {/* Corner viewfinder brackets */}
                        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-indigo-400 rounded-tl z-10 pointer-events-none" />
                        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-indigo-400 rounded-tr z-10 pointer-events-none" />
                        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-indigo-400 rounded-bl z-10 pointer-events-none" />
                        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-indigo-400 rounded-br z-10 pointer-events-none" />
                        {/* Scanning laser line animation */}
                        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce z-10 pointer-events-none" style={{ top: "50%" }} />
                        <div id="qr-reader" className="w-full" />
                    </div>
                )}

                <Link
                    href="/"
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                    ← Back to Home
                </Link>
            </main>
        </div>
    );
}