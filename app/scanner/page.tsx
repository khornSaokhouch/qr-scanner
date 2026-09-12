// components/Scanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScannerProps {
    onScan: (decodedText: string) => void;
}

export default function Scanner({ onScan }: ScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isScannedRef = useRef(false);

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
                                .then(() => onScan(decodedText))
                                .catch(() => onScan(decodedText));
                        } else {
                            onScan(decodedText);
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
            } catch (err: any) {
                if (!isMounted) return;

                // Handle denied permission or no hardware
                if (err?.name === "NotAllowedError") {
                    setError("Camera permission denied. Please allow camera access.");
                } else if (err?.name === "NotFoundError") {
                    setError("No camera device was detected on your system.");
                } else {
                    setError(err?.message || "Failed to initialize camera.");
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
    }, [onScan]);

    if (error) {
        return (
            <div className="w-full max-w-[320px] p-4 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg text-sm">
                <p className="font-semibold mb-1">Camera Notice</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[320px] sm:max-w-[400px] overflow-hidden rounded-lg">
            <div id="qr-reader" className="w-full" />
        </div>
    );
}