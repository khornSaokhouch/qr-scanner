import Link from "next/link";
import Image from "next/image";

export default function FounderSection() {
    return (
        <section
            id="founder"
            className="scroll-mt-24 max-w-4xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-900"
        >

            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">

                <div className="flex flex-col sm:flex-row items-center gap-8">

                    {/* Profile Image */}
                    <div className="relative shrink-0">

                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/10">

                            <Image
                                src="/founder.jpg"
                                alt="SmartScan Founder"
                                fill
                                sizes="(max-width: 640px) 96px, 112px"
                                className="object-cover"
                                priority
                            />

                        </div>


                        <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-wider shadow-md z-10">
                            Founder
                        </div>

                    </div>


                    {/* Founder Info */}
                    <div className="text-center sm:text-left">

                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Behind the Project
                        </span>


                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            Built with a Privacy-First Mindset
                        </h3>


                        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                            &ldquo;I built SmartScan because modern scanner apps are filled
                            with invasive tracking, paywalls, and slow ad screens. SmartScan
                            gives you an instant, hardware-accelerated scanning tool directly
                            in your browser with 100% of the image processing remaining on
                            your device.&rdquo;
                        </p>


                        <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-sm font-medium">

                            <Link
                                href="/coffee"
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm transition-all active:scale-95"
                            >

                                <svg
                                    className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"
                                    />
                                </svg>

                                <span>Buy me a coffee</span>

                            </Link>


                            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">
                                •
                            </span>


                            <Link
                                href="/scanner"
                                className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                            >
                                Try the scanner →
                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}