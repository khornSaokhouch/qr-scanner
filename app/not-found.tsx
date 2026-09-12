// app/not-found.tsx
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6 overflow-hidden selection:bg-indigo-500 selection:text-white">
            {/* Background Radial Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

            <main className="relative z-10 max-w-md w-full flex flex-col items-center text-center">
                {/* Brand Logo */}

                {/* 404 Scanner Graphic */}
                <div className="relative w-full aspect-[16/10] rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col items-center justify-center p-6 shadow-2xl backdrop-blur-sm overflow-hidden mb-8">
                    {/* Viewfinder Corners */}
                    <div className="absolute top-3.5 left-3.5 w-5 h-5 border-t-2 border-l-2 border-rose-500/70 rounded-tl-sm" />
                    <div className="absolute top-3.5 right-3.5 w-5 h-5 border-t-2 border-r-2 border-rose-500/70 rounded-tr-sm" />
                    <div className="absolute bottom-3.5 left-3.5 w-5 h-5 border-b-2 border-l-2 border-rose-500/70 rounded-bl-sm" />
                    <div className="absolute bottom-3.5 right-3.5 w-5 h-5 border-b-2 border-r-2 border-rose-500/70 rounded-br-sm" />

                    {/* Red/Rose Scanning Line (Error State) */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e]" />

                    {/* Large 404 Display */}
                    <span className="text-7xl font-extrabold tracking-tighter text-slate-200 select-none">
                        4<span className="text-rose-500 animate-pulse">0</span>4
                    </span>

                    <span className="mt-2 text-xs font-mono tracking-widest text-rose-400/90 uppercase">
                        [ Target Missing ]
                    </span>
                </div>

                {/* Text Content */}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Scan Target Not Found
                </h1>

                <p className="mt-3 text-sm text-slate-400 max-w-sm leading-relaxed">
                    The page or scan link you followed doesn't exist, was moved, or expired.
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full">
                    <Link
                        href="/scanner"
                        className="flex-1 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
                    >
                        {/* Scanner Icon */}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Open Scanner
                    </Link>

                    <Link
                        href="/"
                        className="flex-1 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-medium text-sm transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}