// components/HowItWorksSection.tsx
export default function HowItWorksSection() {
    const steps = [
        {
            step: "01",
            title: "Pick Your Tool",
            description:
                "Choose from QR tools, PDF document converter, or social media downloaders from the tools hub.",
            tag: "Instant Access",
            icon: <ChooseToolIcon />,
            accent: "from-indigo-500 to-violet-500",
            borderHover: "hover:border-indigo-400 dark:hover:border-indigo-500/50",
            shadowHover: "hover:shadow-indigo-500/10",
        },
        {
            step: "02",
            title: "Paste, Drop, or Aim",
            description:
                "Paste a video link, drag and drop documents/images, or point your camera at any QR code.",
            tag: "Smart Engine",
            icon: <InputIcon />,
            accent: "from-purple-500 to-pink-500",
            borderHover: "hover:border-purple-400 dark:hover:border-purple-500/50",
            shadowHover: "hover:shadow-purple-500/10",
        },
        {
            step: "03",
            title: "Convert & Save",
            description:
                "Download clean HD videos, export custom PDFs, or copy decoded data straight to your device.",
            tag: "Direct Download",
            icon: <SaveIcon />,
            accent: "from-pink-500 to-rose-500",
            borderHover: "hover:border-pink-400 dark:hover:border-pink-500/50",
            shadowHover: "hover:shadow-pink-500/10",
        },
    ];

    return (
        <section
            id="how-it-works"
            className="scroll-mt-24 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 border-t border-slate-200/80 dark:border-slate-900 relative"
        >
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20 mb-3">
                    Simple 3-Step Process
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    How Smart Tools Work
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                    Fast, private, and frictionless. No account signups, no watermarks, and no software installations.
                </p>
            </div>

            {/* Steps Grid */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Horizontal Connector Line (Desktop Only) */}
                <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 -z-0"
                />

                {steps.map((item) => (
                    <div
                        key={item.step}
                        className={`group relative z-10 flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/90 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${item.borderHover} ${item.shadowHover}`}
                    >
                        {/* Top Step Number Badge */}
                        <div className="relative mb-6">
                            <div
                                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.accent} text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}
                            >
                                {item.icon}
                            </div>
                            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold flex items-center justify-center shadow-md">
                                {item.step}
                            </span>
                        </div>

                        {/* Tag Pill */}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                            {item.tag}
                        </span>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2.5">
                            {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Bottom Quick Feature Highlights */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
                    <p className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">0s</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Wait Time</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
                    <p className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400">100%</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Client-Side Privacy</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
                    <p className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">HD</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Original Quality</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
                    <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">Free</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">No Signups Ever</p>
                </div>
            </div>
        </section>
    );
}

/* =========================================================
   CLEAN ICONS
========================================================= */

function ChooseToolIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );
}

function InputIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
    );
}

function SaveIcon() {
    return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
    );
}