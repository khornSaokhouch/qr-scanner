// app/page.tsx
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-400/10 dark:bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />

      {/* Hero Section */}
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
          Scan <span className="bg-gradient-to-r from-indigo-500 via-violet-400 to-sky-500 bg-clip-text text-transparent">Anything</span>.{" "}
          Anywhere.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
          Instantly capture documents, barcodes, QR codes, and text with sub-second optical recognition straight from your browser.
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

        {/* Visual Showcase: Scanner Frame */}
        <div className="mt-16 w-full max-w-md relative p-1 rounded-2xl bg-gradient-to-b from-indigo-400/20 dark:from-indigo-500/20 to-transparent">
          <div className="relative aspect-[4/3] rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500 dark:border-indigo-400 rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500 dark:border-indigo-400 rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500 dark:border-indigo-400 rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500 dark:border-indigo-400 rounded-br-sm" />

            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_3s_infinite]" />

            <div className="text-center px-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-300 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                </svg>
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">Ready to Capture</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="scroll-mt-24 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            Why SmartScan
          </h2>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built for Extreme Speed and Total Privacy
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white">Instant 1D &amp; 2D Codes</h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Scans QR codes, UPC, EAN, Code-128, and DataMatrix with zero latency directly from your camera feed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
            <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white">Smart Parser</h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Instantly detects URLs, emails, phone numbers, and barcodes to provide one-tap contextual actions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-white">Client-Side Privacy</h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No backend processing. Your camera feed never leaves your device or touches an external server.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="scroll-mt-24 max-w-5xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-900">
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
              Click &quot;Start Scan&quot;. Grant camera permissions—no account or download required.
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
              Point your camera at any QR code or barcode. The engine auto-detects and snaps it in milliseconds.
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
              Instantly open the link, copy the text to your clipboard, or look up barcode information on Google.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section id="founder" className="scroll-mt-24 max-w-4xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-slate-900">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-8">

            {/* Profile Image with Founder Badge */}
            <div className="relative shrink-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/10">
                <Image
                  src="/founder.jpg" // Place your file in public/founder.jpg (or .png)
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

            {/* Founder Info & Story */}
            <div className="text-center sm:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Behind the Project
              </span>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Built with a Privacy-First Mindset
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                &ldquo;I built SmartScan because modern scanner apps are filled with invasive tracking, paywalls, and slow ad screens. SmartScan gives you an instant, hardware-accelerated scanning tool directly in your browser with 100% of the image processing remaining on your device.&rdquo;
              </p>

              <div className="mt-5 flex items-center justify-center sm:justify-start gap-4 text-sm font-medium">
                <span className="text-slate-900 dark:text-white font-semibold">SmartScan Creator</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <Link
                  href="/scanner"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Try the scanner &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}