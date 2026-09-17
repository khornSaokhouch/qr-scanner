export default function HowItWorksSection() {
    return (
        <section
            id="how-it-works"
            className="scroll-mt-24 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-900"
        >

            <div className="text-center max-w-xl mx-auto mb-16">

                <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                    Workflow
                </h2>

                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    How It Works in 3 Steps
                </h3>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

                {/* Step 1 */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">

                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-lg shadow-lg shadow-indigo-600/30">
                        1
                    </div>

                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Launch &amp; Allow Camera
                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Click &quot;Start Scan&quot;. Grant camera permissions—no account
                        or download required.
                    </p>

                </div>


                {/* Step 2 */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">

                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-lg shadow-lg shadow-indigo-600/30">
                        2
                    </div>

                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Align Within Box
                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Point your camera at any QR code or barcode. The engine auto-detects
                        and snaps it in milliseconds.
                    </p>

                </div>


                {/* Step 3 */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">

                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-lg shadow-lg shadow-indigo-600/30">
                        3
                    </div>

                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Act &amp; Export
                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Instantly open the link, copy the text to your clipboard, or look
                        up barcode information on Google.
                    </p>

                </div>

            </div>

        </section>
    );
}