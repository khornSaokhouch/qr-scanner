// components/FounderSection.tsx
import Link from "next/link";
import Image from "next/image";

export default function FounderSection() {
    // Replace with your real social profile URLs
    const socialLinks = [
        {
            name: "Facebook",
            href: "https://facebook.com/khorn.saokhouch.2025",
            icon: <FacebookIcon />,
        },
        {
            name: "TikTok",
            href: "https://tiktok.com/@saokhouch1111",
            icon: <TikTokIcon />,
        },
        {
            name: "Instagram",
            href: "https://instagram.com/khouch_1004",
            icon: <InstagramIcon />,
        },
        {
            name: "LinkedIn",
            href: "https://linkedin.com/in/khornsaokhouch",
            icon: <LinkedInIcon />,
        },
        {
            name: "Telegram",
            href: "https://t.me/Khouch04",
            icon: <TelegramIcon />,
        },
        {
            name: "YouTube",
            href: "https://youtube.com/@AIHorizon-t2",
            icon: <YouTubeIcon />,
        },
    ];

    return (
        <section
            id="founder"
            className="scroll-mt-24 max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 border-t border-slate-200/80 dark:border-slate-900 relative"
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[250px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[110px] rounded-full pointer-events-none" />

            {/* Main Founder Card */}
            <div className="relative p-7 sm:p-12 rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900/90 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-7 sm:gap-10">

                    {/* Profile Picture & Badges */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="relative">
                            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-indigo-500/30 dark:border-indigo-500/40 shadow-xl shadow-indigo-500/10 ring-4 ring-indigo-500/10 dark:ring-indigo-500/5">
                                <Image
                                    src="/founder.jpg"
                                    alt="SmartScan Founder"
                                    fill
                                    sizes="(max-width: 640px) 112px, 128px"
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Verified Creator Badge */}
                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap z-10 border border-slate-700 dark:border-slate-200">
                                Creator
                            </div>
                        </div>

                        {/* Status */}
                        <div className="mt-5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Building Public Tools</span>
                        </div>
                    </div>

                    {/* Founder Story & Message */}
                    <div className="flex-1 text-center md:text-left">
                        {/* Section Tag */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20 mb-3">
                            Behind the Mission
                        </div>

                        {/* Headline */}
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Built with a Privacy-First Mindset
                        </h3>

                        {/* Story Body */}
                        <p className="mt-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            &ldquo;I built this platform because modern web tools—whether for downloading clips, converting documents, or scanning codes—have become filled with predatory pop-ups, slow ad walls, and invasive tracking.
                            My goal is to give you a clean, lightweight, and hardware-accelerated toolkit directly in your browser where your data never leaves your device.&rdquo;
                        </p>

                        {/* Core Value Chips */}
                        <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                                <ShieldSmallIcon />
                                Zero Data Collection
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                                <ZapSmallIcon />
                                100% Free &amp; Ad-Free
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                                <HeartSmallIcon />
                                Community Supported
                            </span>
                        </div>

                        {/* Bottom Action Row: Coffee + Explore on Left, Real Social Brand Icons on Right */}
                        <div className="mt-7 pt-6 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col lg:flex-row items-center justify-between gap-5">

                            {/* Coffee & Explore Links */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Link
                                    href="/coffee"
                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm active:scale-95 transition-all"
                                >
                                    <CoffeeCupIcon />
                                    <span>Buy me a coffee</span>
                                </Link>

                                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

                                <a
                                    href="#tools"
                                    className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold hover:underline transition-colors inline-flex items-center gap-1"
                                >
                                    Explore all tools &rarr;
                                </a>
                            </div>

                            {/* Icon-Only Social Media Links (ALWAYS SHOW REAL BRAND COLORS) */}
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                {socialLinks.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={item.name}
                                        aria-label={item.name}
                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md active:scale-95 transition-all duration-200"
                                    >
                                        {item.icon}
                                    </a>
                                ))}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

/* =========================================================
   AUTHENTIC BRAND COLORED ICONS (DEFAULT COLORS)
========================================================= */

function FacebookIcon() {
    return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

function TikTokIcon() {
    return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-slate-950 dark:fill-white" viewBox="0 0 24 24">
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 1.745A6.34 6.34 0 0 0 4 15.672a6.34 6.34 0 0 0 10.82 4.482 6.31 6.31 0 0 0 1.954-4.482V8.75a8.214 8.214 0 0 0 4.815 1.545V6.85a4.814 4.814 0 0 1-2-.164z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" viewBox="0 0 24 24">
            <defs>
                <linearGradient id="ig-founder-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fdf497" />
                    <stop offset="25%" stopColor="#fd5949" />
                    <stop offset="60%" stopColor="#d6249f" />
                    <stop offset="100%" stopColor="#285AEB" />
                </linearGradient>
            </defs>
            <path
                fill="url(#ig-founder-gradient)"
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
            />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#0A66C2]" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V9.9H5.06v8.6h2.8z" />
        </svg>
    );
}

function TelegramIcon() {
    return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#229ED9]" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-[#FF0000]" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}

/* =========================================================
   BADGE & DECORATION ICONS
========================================================= */

function CoffeeCupIcon() {
    return (
        <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
        </svg>
    );
}

function ShieldSmallIcon() {
    return (
        <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    );
}

function ZapSmallIcon() {
    return (
        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
    );
}

function HeartSmallIcon() {
    return (
        <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    );
}