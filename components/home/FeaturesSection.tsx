export default function FeaturesSection() {
    return (
        <section
            id="features"
            className="scroll-mt-24 max-w-5xl mx-auto px-6 py-16"
        >

            <div className="text-center max-w-xl mx-auto mb-12">

                <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                    Why SmartScan
                </h2>

                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Built for Extreme Speed and Total Privacy
                </h3>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

                {/* Feature 1 */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">

                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">

                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z"
                            />
                        </svg>

                    </div>

                    <h4 className="font-semibold text-slate-900 dark:text-white">
                        Instant 1D &amp; 2D Codes
                    </h4>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Scans QR codes, UPC, EAN, Code-128, and DataMatrix with zero
                        latency directly from your camera feed.
                    </p>

                </div>


                {/* Feature 2 */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">

                    <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">

                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                        </svg>

                    </div>

                    <h4 className="font-semibold text-slate-900 dark:text-white">
                        Smart Parser
                    </h4>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Instantly detects URLs, emails, phone numbers, and barcodes to
                        provide one-tap contextual actions.
                    </p>

                </div>


                {/* Feature 3 */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">

                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">

                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                            />
                        </svg>

                    </div>

                    <h4 className="font-semibold text-slate-900 dark:text-white">
                        Client-Side Privacy
                    </h4>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        No backend processing. Your camera feed never leaves your device
                        or touches an external server.
                    </p>

                </div>

            </div>

        </section>
    );
}