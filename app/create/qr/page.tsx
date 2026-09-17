// app/create-qr/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

type QRType = "text" | "url" | "email" | "phone" | "wifi";

type Feedback = {
    type: "success" | "error";
    message: string;
} | null;

export default function CreateQRPage() {
    const [type, setType] = useState<QRType>("text");
    const [value, setValue] = useState("");

    const [wifiName, setWifiName] = useState("");
    const [wifiPassword, setWifiPassword] = useState("");
    const [wifiSecurity, setWifiSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
    const [wifiHidden, setWifiHidden] = useState(false);

    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [feedback, setFeedback] = useState<Feedback>(null);

    /*
     * Build QR content matching international QR standards.
     */
    function getQRContent(): string {
        switch (type) {
            case "url": {
                const url = value.trim();
                if (!url) return "";
                if (url.startsWith("http://") || url.startsWith("https://")) return url;
                return `https://${url}`;
            }

            case "email": {
                const email = value.trim();
                if (!email) return "";
                return `mailto:${email}`;
            }

            case "phone": {
                const phone = value.trim();
                if (!phone) return "";
                return `tel:${phone}`;
            }

            case "wifi": {
                if (!wifiName.trim()) return "";
                const escapeWifi = (text: string) =>
                    text
                        .replace(/\\/g, "\\\\")
                        .replace(/;/g, "\\;")
                        .replace(/,/g, "\\,")
                        .replace(/:/g, "\\:");

                const ssid = escapeWifi(wifiName.trim());
                const password = escapeWifi(wifiPassword);
                const sec = wifiSecurity === "nopass" ? "nopass" : wifiSecurity;

                // Standard Wi-Fi format: WIFI:S:MyNetwork;T:WPA;P:password;H:false;;
                return `WIFI:S:${ssid};T:${sec};P:${sec === "nopass" ? "" : password};H:${wifiHidden ? "true" : "false"};;`;
            }

            default:
                return value.trim();
        }
    }

    /*
     * Generate high-res DataURL with standard 4-module quiet zone margin
     */
    useEffect(() => {
        let isMounted = true;

        async function generate() {
            const content = getQRContent();

            if (!content) {
                if (isMounted) setQrDataUrl("");
                return;
            }

            try {
                const dataUrl = await QRCode.toDataURL(content, {
                    width: 700, // High internal resolution for crisp display & downloads
                    margin: 4,  // Crucial: 4-module quiet zone required for cameras to scan
                    errorCorrectionLevel: "M",
                    color: {
                        dark: "#000000", // Pure black for maximum optical contrast
                        light: "#ffffff",
                    },
                });

                if (isMounted) setQrDataUrl(dataUrl);
            } catch (error) {
                console.error("QR generation error:", error);
                if (isMounted) setQrDataUrl("");
            }
        }

        generate();

        return () => {
            isMounted = false;
        };
    }, [type, value, wifiName, wifiPassword, wifiSecurity, wifiHidden]);

    function showFeedback(type: "success" | "error", message: string) {
        setFeedback({ type, message });
        window.setTimeout(() => setFeedback(null), 2500);
    }

    /* 1. Download QR Image */
    function downloadQR() {
        if (!qrDataUrl) return;

        try {
            const link = document.createElement("a");
            link.download = `smartscan-${type}-qr.png`;
            link.href = qrDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showFeedback("success", "QR code downloaded successfully!");
        } catch {
            showFeedback("error", "Unable to download QR code.");
        }
    }

    /* 2. Copy QR to Clipboard */
    async function copyQRImage() {
        if (!qrDataUrl) return;

        try {
            if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
                showFeedback("error", "Direct image copy not supported in this browser.");
                return;
            }

            const res = await fetch(qrDataUrl);
            const blob = await res.blob();

            await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
            ]);

            showFeedback("success", "QR image copied to clipboard!");
        } catch {
            showFeedback("error", "Unable to copy QR image.");
        }
    }

    /* 3. Share QR */
    async function shareQR() {
        if (!qrDataUrl) return;

        try {
            const res = await fetch(qrDataUrl);
            const blob = await res.blob();
            const file = new File([blob], `smartscan-${type}-qr.png`, {
                type: "image/png",
            });

            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    title: "SmartScan QR Code",
                    files: [file],
                });
                return;
            }

            if (navigator.share) {
                await navigator.share({
                    title: "SmartScan QR Code",
                    text: getQRContent(),
                });
                return;
            }

            showFeedback("error", "Sharing is not supported on this browser.");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
            showFeedback("error", "Unable to share the QR code.");
        }
    }

    function clearAll() {
        setValue("");
        setWifiName("");
        setWifiPassword("");
        setWifiSecurity("WPA");
        setWifiHidden(false);
        setQrDataUrl("");
        setFeedback(null);
    }

    function changeType(newType: QRType) {
        setType(newType);
        setFeedback(null);
    }

    return (
        <main className="w-full min-h-[calc(100vh-4rem)] overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

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
                <header className="mx-auto w-full max-w-2xl text-center mb-8">
                    <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm">
                        <QRCodeIcon />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
                        Create QR Code
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Generate instant, high-contrast QR codes for websites, Wi-Fi, text, and contacts.
                    </p>
                </header>

                {/* Feedback Toast */}
                {feedback && (
                    <div
                        role="status"
                        className={`mx-auto mb-6 flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium shadow-md transition-all ${feedback.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                            }`}
                    >
                        {feedback.type === "success" ? <CheckIcon /> : <AlertIcon />}
                        <span className="min-w-0">{feedback.message}</span>
                    </div>
                )}

                {/* Main 2-Column Responsive Layout */}
                <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:items-start">

                    {/* LEFT COLUMN: Input Options */}
                    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-7">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                            Content Type
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Select the type of QR code you wish to generate.
                        </p>

                        {/* Type Selectors */}
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
                            <TypeButton active={type === "text"} onClick={() => changeType("text")} icon={<TextIcon />}>
                                Text
                            </TypeButton>
                            <TypeButton active={type === "url"} onClick={() => changeType("url")} icon={<GlobeIcon />}>
                                Website
                            </TypeButton>
                            <TypeButton active={type === "email"} onClick={() => changeType("email")} icon={<EmailIcon />}>
                                Email
                            </TypeButton>
                            <TypeButton active={type === "phone"} onClick={() => changeType("phone")} icon={<PhoneIcon />}>
                                Phone
                            </TypeButton>
                            <TypeButton active={type === "wifi"} onClick={() => changeType("wifi")} icon={<WifiIcon />}>
                                Wi-Fi
                            </TypeButton>
                        </div>

                        {/* Standard Inputs */}
                        {type !== "wifi" && (
                            <div className="mt-6">
                                <label htmlFor="qr-value" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {getLabel(type)}
                                </label>
                                <textarea
                                    id="qr-value"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={getPlaceholder(type)}
                                    rows={5}
                                    spellCheck={false}
                                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                                />
                                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                                    <span>Updates automatically</span>
                                    <span>{value.length} characters</span>
                                </div>
                            </div>
                        )}

                        {/* Wi-Fi Inputs */}
                        {type === "wifi" && (
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label htmlFor="wifi-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Network Name (SSID)
                                    </label>
                                    <input
                                        id="wifi-name"
                                        type="text"
                                        value={wifiName}
                                        onChange={(e) => setWifiName(e.target.value)}
                                        placeholder="e.g. MyHomeWiFi"
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="wifi-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Password
                                    </label>
                                    <input
                                        id="wifi-password"
                                        type="text"
                                        value={wifiPassword}
                                        onChange={(e) => setWifiPassword(e.target.value)}
                                        placeholder="Enter network password"
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="wifi-security" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Security Type
                                    </label>
                                    <select
                                        id="wifi-security"
                                        value={wifiSecurity}
                                        onChange={(e) => setWifiSecurity(e.target.value as "WPA" | "WEP" | "nopass")}
                                        className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                                        <option value="WEP">WEP</option>
                                        <option value="nopass">None (Open Network)</option>
                                    </select>
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
                                    <input
                                        type="checkbox"
                                        checked={wifiHidden}
                                        onChange={(e) => setWifiHidden(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        Hidden Wi-Fi network
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Reset Form */}
                        <button
                            type="button"
                            onClick={clearAll}
                            disabled={!value && !wifiName && !wifiPassword}
                            className="mt-6 min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Clear Form
                        </button>
                    </section>

                    {/* RIGHT COLUMN: Scannable QR Preview & Action Buttons */}
                    <div className="lg:sticky lg:top-24 flex flex-col items-center">
                        <div className="w-full rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/50 flex flex-col items-center">

                            {/* QR Display Card (Always stays a perfect square) */}
                            <div className="relative w-full max-w-[280px] sm:max-w-[300px] aspect-square rounded-2xl bg-white border border-slate-200 p-3 shadow-sm flex items-center justify-center overflow-hidden">
                                {qrDataUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={qrDataUrl}
                                        alt="Generated QR Code"
                                        className="w-full h-full object-contain select-none pointer-events-none"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                                            <QRCodeIcon />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-700">Preview Area</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Type on the left to generate QR</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons (Save, Copy, Share) */}
                            <div className="mt-5 grid grid-cols-3 gap-2 w-full max-w-[280px] sm:max-w-[300px]">
                                <button
                                    onClick={downloadQR}
                                    disabled={!qrDataUrl}
                                    className="min-h-[42px] inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    <DownloadIcon />
                                    <span>Save</span>
                                </button>

                                <button
                                    onClick={copyQRImage}
                                    disabled={!qrDataUrl}
                                    className="min-h-[42px] inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    <CopyIcon />
                                    <span>Copy</span>
                                </button>

                                <button
                                    onClick={shareQR}
                                    disabled={!qrDataUrl}
                                    className="min-h-[42px] inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    <ShareIcon />
                                    <span>Share</span>
                                </button>
                            </div>

                            {/* Privacy Reassurance Badge */}
                            <div className="mt-5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                                <ShieldIcon />
                                <span>100% Client-side • Generated in your browser</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

/* =========================================================
   COMPONENTS & ICONS
========================================================= */

function TypeButton({
    active,
    onClick,
    icon,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95 ${active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
        >
            {icon}
            <span className="truncate">{children}</span>
        </button>
    );
}

function getLabel(type: QRType): string {
    switch (type) {
        case "url": return "Website URL";
        case "email": return "Email Address";
        case "phone": return "Phone Number";
        default: return "Text Content";
    }
}

function getPlaceholder(type: QRType): string {
    switch (type) {
        case "url": return "https://example.com";
        case "email": return "contact@domain.com";
        case "phone": return "+1 234 567 8900";
        default: return "Type your message or text here...";
    }
}

function QRCodeIcon() {
    return (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2h4z" />
        </svg>
    );
}

function TextIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7V5a1 1 0 011-1h14a1 1 0 011 1v2M12 4v16M8 20h8" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3z" />
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 6 9-6" />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h3l2 5-2 1.5a14 14 0 005.5 5.5L15 14l5 2v3a2 2 0 01-2 2C10.3 21 3 13.7 3 5a2 2 0 012-2z" />
        </svg>
    );
}

function WifiIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5a14 14 0 0118 0M6.5 12a9 9 0 0111 0M10 15.5a4 4 0 014 0" />
            <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
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

function CopyIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path strokeLinecap="round" d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
        </svg>
    );
}

function ShareIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 4.3 2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z" />
        </svg>
    );
}