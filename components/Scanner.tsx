"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
    onScan: (value: string) => void;
}

/**
 * Low-level Scanner component that wraps html5-qrcode.
 * Note: app/scanner/page.tsx contains the full-featured scanner page.
 * This component is kept for potential reuse in other contexts.
 */
export default function Scanner({ onScan }: Props) {
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        const scanner = new Html5Qrcode("smartscan-reader");
        scannerRef.current = scanner;

        scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                onScan(decodedText);
                scanner.stop().catch(() => { });
            },
            () => {
                // per-frame error (ignored)
            }
        );

        return () => {
            scanner.stop().catch(() => { });
        };
    }, [onScan]);

    return (
        <div>
            <div id="smartscan-reader" />
        </div>
    );
}