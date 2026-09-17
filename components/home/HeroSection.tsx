import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-400/30 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 backdrop-blur-md mb-8">
                <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />

                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 tracking-wide uppercase">
                    AI-Powered Scanner Engine
                </span>
            </div>


            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.1] text-slate-900 dark:text-slate-50">
                Scan{" "}
                <span className="bg-gradient-to-r from-indigo-500 via-violet-400 to-sky-500 bg-clip-text text-transparent">
                    Anything
                </span>
                .{" "}
                Anywhere.
            </h1>


            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Instantly capture documents, barcodes, QR codes, and text with
                sub-second optical recognition straight from your browser.
            </p>


            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">

                <Link
                    href="/scanner"
                    className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 w-full sm:w-auto rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 active:scale-[0.98] transition-all duration-200"
                >
                    <svg
                        className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />

                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>

                    Start Scan
                </Link>


                <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center px-7 py-4 w-full sm:w-auto rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
                >
                    How it Works
                </a>

            </div>


            {/* Scanner Preview */}
            <div className="mt-16 w-full max-w-md relative p-1 rounded-2xl bg-gradient-to-b from-indigo-400/20 dark:from-indigo-500/20 to-transparent">

                <div className="relative aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-sm">

                    {/* Corners */}
                    <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500 dark:border-indigo-400 rounded-tl-sm" />

                    <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500 dark:border-indigo-400 rounded-tr-sm" />

                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500 dark:border-indigo-400 rounded-bl-sm" />

                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500 dark:border-indigo-400 rounded-br-sm" />


                    {/* Scanner Line */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_3s_infinite]" />


                    <div className="text-center px-4">

                        <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-300 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">

                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                                />
                            </svg>

                        </div>

                        <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Ready to Capture
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}