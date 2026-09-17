// components/ToolsSection.tsx
import Link from "next/link";

export default function ToolsSection() {
    const tools = [
        {
            title: "QR Code Scanner",
            description: "Scan QR codes instantly with your webcam or camera.",
            href: "/scanner",
            icon: <QrScannerIcon />,
            badge: "Utility",
        },
        {
            title: "QR Code Generator",
            description: "Generate custom QR codes for URLs, Wi-Fi, and text.",
            href: "/create/qr",
            icon: <QrGenerateIcon />,
            badge: "Utility",
        },
        {
            title: "TikTok Downloader",
            description: "Download TikTok videos in HD without watermark.",
            href: "/tools/tiktok",
            icon: <TikTokIcon />,
            badge: "Media",
        },
        {
            title: "YouTube Downloader",
            description: "Download YouTube videos, Shorts, and MP3 audio.",
            href: "/tools/youtube",
            icon: <YouTubeIcon />,
            badge: "Media",
        },
        {
            title: "Instagram Downloader",
            description: "Save Instagram Reels, photos, and video posts.",
            href: "/tools/instagram",
            icon: <InstagramIcon />,
            badge: "Media",
        },
        {
            title: "Facebook Downloader",
            description: "Extract public Facebook videos and Watch reels.",
            href: "/tools/facebook",
            icon: <FacebookIcon />,
            badge: "Media",
        },
        {
            title: "X / Twitter Downloader",
            description: "Download videos and GIFs shared on X (Twitter).",
            href: "/tools/x",
            icon: <XIcon />,
            badge: "Media",
        },
        {
            title: "Pinterest Downloader",
            description: "Download high-resolution Pinterest video pins.",
            href: "/tools/pinterest",
            icon: <PinterestIcon />,
            badge: "Media",
        },
    ];

    return (
        <section
            id="tools"
            className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-slate-200 dark:border-slate-900"
        >
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-14">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                    Smart Tools Hub
                </h2>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Everything You Need in One Place
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                    Free, hardware-accelerated tools for scanning, generating QR codes, and saving media.
                </p>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {tools.map((tool) => (
                    <Link
                        key={tool.title}
                        href={tool.href}
                        className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5"
                    >
                        <div>
                            {/* Icon & Badge */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm">
                                    {tool.icon}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                    {tool.badge}
                                </span>
                            </div>

                            <h4 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {tool.title}
                            </h4>

                            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                {tool.description}
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                            <span>Open Tool</span>
                            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

/* =========================================================
   AUTHENTIC BRAND SVG ICONS
========================================================= */

function QrScannerIcon() {
    return (
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function QrGenerateIcon() {
    return (
        <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2v2h-2zM18 14h2v6h-6v-2h4z" />
        </svg>
    );
}

function TikTokIcon() {
    return (
        <svg className="w-5 h-5 fill-slate-900 dark:fill-white" viewBox="0 0 24 24">
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 1.745A6.34 6.34 0 0 0 4 15.672a6.34 6.34 0 0 0 10.82 4.482 6.31 6.31 0 0 0 1.954-4.482V8.75a8.214 8.214 0 0 0 4.815 1.545V6.85a4.814 4.814 0 0 1-2-.164z" />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg className="w-5 h-5 fill-red-600" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg className="w-5 h-5 fill-pink-600 dark:fill-pink-500" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function XIcon() {
    return (
        <svg className="w-4 h-4 fill-slate-900 dark:fill-white" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function PinterestIcon() {
    return (
        <svg className="w-5 h-5 fill-red-600" viewBox="0 0 24 24">
            <path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.99-.13-2.52.03-3.61l1.15-4.88s-.29-.59-.29-1.46c0-1.37.79-2.39 1.78-2.39.84 0 1.25.63 1.25 1.39 0 .85-.54 2.11-.82 3.29-.23 1 .5 1.81 1.49 1.81 1.78 0 3.16-1.88 3.16-4.6 0-2.4-1.73-4.08-4.19-4.08-2.86 0-4.53 2.14-4.53 4.36 0 .86.33 1.79.74 2.29a.3.3 0 0 1 .07.29c-.08.33-.26 1.05-.29 1.2-.05.2-.16.25-.37.15-1.39-.65-2.26-2.67-2.26-4.3 0-3.5 2.54-6.72 7.34-6.72 3.86 0 6.85 2.75 6.85 6.42 0 3.83-2.42 6.92-5.77 6.92-1.13 0-2.19-.59-2.55-1.28l-.69 2.65c-.25.97-.93 2.19-1.39 2.93A12 12 0 1 0 12 0z" />
        </svg>
    );
}