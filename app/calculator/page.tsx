// app/tools/calculator/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Authentic Khmer phonetic words spoken by Piseth
const KHMER_PHONETICS: Record<string, string> = {
    "0": "សូន្យ",
    "1": "មួយ",
    "2": "ពីរ",
    "3": "បី",
    "4": "បួន",
    "5": "ប្រាំ",
    "6": "ប្រាំមួយ",
    "7": "ប្រាំពីរ",
    "8": "ប្រាំបី",
    "9": "ប្រាំបួន",
    "+": "បូក",
    "-": "ដក",
    "*": "គុណ",
    "/": "ចែក",
    "=": "ស្មើនឹង",
    ".": "ក្បៀស",
    "AC": "លុបទាំងអស់",
    "DEL": "លុប",
    "%": "ភាគរយ",
    "+/-": "បូកដក",
    "sqrt": "ឫសការេ",
    "sqr": "ស្វ័យគុណពីរ",
    "recip": "មួយភាគ",
    "MC": "លុបអង្គចងចាំ",
    "MR": "ហៅអង្គចងចាំ",
    "M+": "បូកអង្គចងចាំ",
    "M-": "ដកអង្គចងចាំ",
};

const KHMER_NUMERALS: Record<string, string> = {
    "0": "០", "1": "១", "2": "២", "3": "៣", "4": "៤",
    "5": "៥", "6": "៦", "7": "៧", "8": "៨", "9": "៩",
    ".": ".", "-": "-", "+": " + ", "*": " × ", "/": " ÷ ",
};

function toKhmerDigits(str: string): string {
    return str.split("").map((c) => KHMER_NUMERALS[c] || c).join("");
}

interface HistoryItem {
    equation: string;
    result: string;
    time: string;
}

export default function RealKhmerCalculator() {
    const [display, setDisplay] = useState("0");
    const [equation, setEquation] = useState("");
    const [activeOp, setActiveOp] = useState<string | null>(null);
    const [memory, setMemory] = useState<number | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [spokenWord, setSpokenWord] = useState("សូន្យ");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // AudioContext & In-Memory Preload Cache for 0ms Instant Sound
    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioBufferCache = useRef<Map<string, AudioBuffer>>(new Map());

    // 1. Initialize AudioContext and Preload Audio into Memory Buffers
    useEffect(() => {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
            audioCtxRef.current = new AudioCtx();
        }

        async function preloadSounds() {
            if (!audioCtxRef.current) return;
            const words = Object.values(KHMER_PHONETICS);

            for (const word of words) {
                try {
                    const res = await fetch(`/api/tts?lang=km&voice=km-KH-PisethNeural&text=${encodeURIComponent(word)}`);
                    if (res.ok) {
                        const arrayBuffer = await res.arrayBuffer();
                        const decoded = await audioCtxRef.current.decodeAudioData(arrayBuffer);
                        audioBufferCache.current.set(word, decoded);
                    }
                } catch {
                    // Preload silently continues
                }
            }
        }

        preloadSounds();

        return () => {
            if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
                audioCtxRef.current.close();
            }
        };
    }, []);

    // 2. Play Sound from Memory Buffer (0ms Latency)
    const playSound = useCallback((word: string) => {
        if (!soundEnabled || !word) return;

        setSpokenWord(word);
        setIsSpeaking(true);

        // Haptic feedback for tactile feel on phones
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(10);
        }

        const ctx = audioCtxRef.current;

        // If buffer is cached in memory, play with zero lag
        if (ctx && audioBufferCache.current.has(word)) {
            if (ctx.state === "suspended") {
                ctx.resume();
            }
            const buffer = audioBufferCache.current.get(word)!;
            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();

            source.buffer = buffer;
            gainNode.gain.value = 1.0; // Crisp full volume
            source.connect(gainNode);
            gainNode.connect(ctx.destination);

            source.onended = () => setIsSpeaking(false);
            source.start(0);
            return;
        }

        // Fallback HTML5 Audio stream
        try {
            const audio = new Audio(`/api/tts?lang=km&voice=km-KH-PisethNeural&text=${encodeURIComponent(word)}`);
            audio.volume = 1.0;
            audio.onended = () => setIsSpeaking(false);
            audio.onerror = () => setIsSpeaking(false);
            audio.play().catch(() => setIsSpeaking(false));
        } catch {
            setIsSpeaking(false);
        }
    }, [soundEnabled]);

    // ──────────────────────────────────────────
    // HARDWARE CALCULATOR ENGINE
    // ──────────────────────────────────────────
    const handleNumber = useCallback((digit: string) => {
        playSound(KHMER_PHONETICS[digit]);

        setDisplay((prev) => {
            if (prev === "0" || prev === "Error" || (activeOp !== null && equation.endsWith(" "))) {
                return digit;
            }
            if (prev.length >= 11) return prev;
            return prev + digit;
        });
        setActiveOp(null);
    }, [activeOp, equation, playSound]);

    const handleDecimal = useCallback(() => {
        playSound(KHMER_PHONETICS["."]);
        setDisplay((prev) => {
            if (!prev.includes(".")) return prev + ".";
            return prev;
        });
    }, [playSound]);

    const handleOperator = useCallback((op: string) => {
        playSound(KHMER_PHONETICS[op]);
        setActiveOp(op);
        setEquation(`${display} ${op} `);
    }, [display, playSound]);

    const handleAllClear = useCallback(() => {
        playSound(KHMER_PHONETICS["AC"]);
        setDisplay("0");
        setEquation("");
        setActiveOp(null);
    }, [playSound]);

    const handleBackspace = useCallback(() => {
        playSound(KHMER_PHONETICS["DEL"]);
        setDisplay((prev) => {
            if (prev.length <= 1 || prev === "Error") return "0";
            return prev.slice(0, -1);
        });
    }, [playSound]);

    const handleToggleSign = useCallback(() => {
        playSound(KHMER_PHONETICS["+/-"]);
        setDisplay((prev) => {
            if (prev === "0") return prev;
            return prev.startsWith("-") ? prev.slice(1) : "-" + prev;
        });
    }, [playSound]);

    const handlePercent = useCallback(() => {
        playSound(KHMER_PHONETICS["%"]);
        setDisplay((prev) => {
            const val = parseFloat(prev);
            if (isNaN(val)) return "0";
            return String(parseFloat((val / 100).toFixed(8)));
        });
    }, [playSound]);

    // Square Root (√x)
    const handleSquareRoot = useCallback(() => {
        playSound(KHMER_PHONETICS["sqrt"]);
        const val = parseFloat(display);
        if (val < 0) {
            setDisplay("Error");
            return;
        }
        const result = parseFloat(Math.sqrt(val).toFixed(6)).toString();
        setDisplay(result);
        setEquation(`√(${val})`);
    }, [display, playSound]);

    // Square (x²)
    const handleSquare = useCallback(() => {
        playSound(KHMER_PHONETICS["sqr"]);
        const val = parseFloat(display);
        const result = parseFloat((val * val).toFixed(6)).toString();
        setDisplay(result);
        setEquation(`sqr(${val})`);
    }, [display, playSound]);

    // Reciprocal (1/x)
    const handleReciprocal = useCallback(() => {
        playSound(KHMER_PHONETICS["recip"]);
        const val = parseFloat(display);
        if (val === 0) {
            setDisplay("Error");
            return;
        }
        const result = parseFloat((1 / val).toFixed(6)).toString();
        setDisplay(result);
        setEquation(`1/(${val})`);
    }, [display, playSound]);

    // Equals (=)
    const handleEquals = useCallback(() => {
        if (!equation) return;

        try {
            const fullExpr = equation + display;
            const sanitized = fullExpr.replace(/[^0-9+\-*/.]/g, "");
            const compute = new Function(`return (${sanitized})`);
            const rawResult = compute();

            if (rawResult === Infinity || isNaN(rawResult)) {
                setDisplay("Error");
                playSound("មិនត្រឹមត្រូវ");
                return;
            }

            const cleanResult = parseFloat(rawResult.toFixed(6)).toString();

            // Save to history tape
            const newHistoryItem: HistoryItem = {
                equation: fullExpr,
                result: cleanResult,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
            setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);

            setDisplay(cleanResult);
            setEquation("");
            setActiveOp(null);

            // Announce in Khmer
            playSound(`ស្មើនឹង ${cleanResult}`);
        } catch {
            setDisplay("Error");
            playSound("មិនត្រឹមត្រូវ");
        }
    }, [display, equation, playSound]);

    // ──────────────────────────────────────────
    // MEMORY FUNCTIONS (MC, MR, M+, M-)
    // ──────────────────────────────────────────
    const handleMemoryClear = () => {
        playSound(KHMER_PHONETICS["MC"]);
        setMemory(null);
    };

    const handleMemoryRecall = () => {
        if (memory === null) return;
        playSound(KHMER_PHONETICS["MR"]);
        setDisplay(String(memory));
    };

    const handleMemoryAdd = () => {
        playSound(KHMER_PHONETICS["M+"]);
        const currentVal = parseFloat(display) || 0;
        setMemory((prev) => (prev ?? 0) + currentVal);
    };

    const handleMemorySubtract = () => {
        playSound(KHMER_PHONETICS["M-"]);
        const currentVal = parseFloat(display) || 0;
        setMemory((prev) => (prev ?? 0) - currentVal);
    };

    // 3. Physical Keyboard Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
            else if (e.key === ".") handleDecimal();
            else if (e.key === "+") handleOperator("+");
            else if (e.key === "-") handleOperator("-");
            else if (e.key === "*") handleOperator("*");
            else if (e.key === "/") {
                e.preventDefault();
                handleOperator("/");
            } else if (e.key === "Enter" || e.key === "=") {
                e.preventDefault();
                handleEquals();
            } else if (e.key === "Backspace") handleBackspace();
            else if (e.key === "Escape") handleAllClear();
            else if (e.key === "%") handlePercent();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNumber, handleDecimal, handleOperator, handleEquals, handleBackspace, handleAllClear, handlePercent]);

    // Dynamic Font Scaling
    const getDisplayFontSize = () => {
        const len = display.length;
        if (len > 9) return "text-2xl sm:text-3xl";
        if (len > 7) return "text-3xl sm:text-4xl";
        return "text-4xl sm:text-5xl";
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors flex flex-col items-center justify-center py-6 px-4">

            {/* Top Bar: Back Button, Piseth Voice Badge, Voice Toggle */}
            <div className="w-full max-w-sm flex items-center justify-between mb-3 text-xs">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition"
                >
                    &larr; Back
                </Link>

                {/* Voice Status Indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Piseth (km-KH)</span>
                </div>

                {/* Sound On/Off Button */}
                <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 border ${soundEnabled
                            ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                            : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                        }`}
                >
                    {soundEnabled ? "🔊 ON" : "🔇 OFF"}
                </button>
            </div>

            {/* ========================================================= */}
            {/* HARDWARE CALCULATOR CHASSIS                               */}
            {/* ========================================================= */}
            <div className="w-full max-w-sm rounded-[36px] p-5 sm:p-6 bg-[#16181f] border-4 border-slate-800 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.65)] relative select-none">

                {/* Brand & History Toggle */}
                <div className="flex items-center justify-between px-2 pb-2.5 text-slate-400 text-xs">
                    <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-[11px] font-bold text-slate-400 hover:text-white transition flex items-center gap-1"
                    >
                        <span>📜 History ({history.length})</span>
                    </button>

                    {/* Word Pronounced Badge */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                        {isSpeaking && (
                            <span className="flex gap-0.5">
                                <span className="w-1 h-3 bg-amber-400 animate-pulse rounded-full" />
                                <span className="w-1 h-4 bg-amber-400 animate-pulse delay-75 rounded-full" />
                                <span className="w-1 h-2 bg-amber-400 animate-pulse delay-150 rounded-full" />
                            </span>
                        )}
                        <span className="text-[11px] font-bold text-amber-400">{spokenWord}</span>
                    </div>
                </div>

                {/* LCD Display Screen */}
                <div className="w-full rounded-2xl bg-[#0a0b0e] border border-slate-800 p-4 min-h-[125px] flex flex-col justify-between items-end mb-4 shadow-inner relative">
                    {/* Active Memory Indicator */}
                    {memory !== null && (
                        <span className="absolute top-2 left-3 text-[10px] font-bold text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            M
                        </span>
                    )}

                    {/* Secondary Equation Line */}
                    <span className="text-xs font-mono text-slate-500 h-4 truncate">
                        {equation}
                    </span>

                    {/* Main Digits Display */}
                    <span className={`font-mono font-bold text-white tracking-tight ${getDisplayFontSize()} transition-all`}>
                        {display}
                    </span>

                    {/* Khmer Script Translation */}
                    <span className="text-xs font-bold text-amber-400/90 font-mono tracking-wider">
                        {toKhmerDigits(display)}
                    </span>
                </div>

                {/* SLIDE-OUT HISTORY DRAWER */}
                {showHistory && (
                    <div className="mb-4 p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800 max-h-36 overflow-y-auto space-y-1.5 text-xs text-slate-300">
                        {history.length === 0 ? (
                            <p className="text-center text-slate-500 py-2">No calculations yet</p>
                        ) : (
                            history.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setDisplay(item.result);
                                        setShowHistory(false);
                                    }}
                                    className="flex justify-between items-center p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer font-mono"
                                >
                                    <span className="text-slate-400 truncate pr-2">{item.equation} =</span>
                                    <span className="font-bold text-amber-400">{item.result}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Keypad Grid (Real Hardware 4 Columns) */}
                <div className="grid grid-cols-4 gap-2.5">
                    {/* ROW 0: MEMORY FUNCTIONS */}
                    <KeyButton label="MC" onClick={handleMemoryClear} variant="mem" />
                    <KeyButton label="MR" onClick={handleMemoryRecall} variant="mem" />
                    <KeyButton label="M-" onClick={handleMemorySubtract} variant="mem" />
                    <KeyButton label="M+" onClick={handleMemoryAdd} variant="mem" />

                    {/* ROW 1: MATH EXTENSIONS */}
                    <KeyButton label="√x" onClick={handleSquareRoot} variant="ext" />
                    <KeyButton label="x²" onClick={handleSquare} variant="ext" />
                    <KeyButton label="1/x" onClick={handleReciprocal} variant="ext" />
                    <KeyButton label="AC" onClick={handleAllClear} variant="danger" />

                    {/* ROW 2 */}
                    <KeyButton label="⌫" onClick={handleBackspace} variant="utility" />
                    <KeyButton label="±" onClick={handleToggleSign} variant="utility" />
                    <KeyButton label="%" onClick={handlePercent} variant="utility" />
                    <KeyButton
                        label="÷"
                        onClick={() => handleOperator("/")}
                        variant="operator"
                        isActive={activeOp === "/"}
                    />

                    {/* ROW 3 */}
                    <KeyButton label="7" sub="៧" onClick={() => handleNumber("7")} />
                    <KeyButton label="8" sub="៨" onClick={() => handleNumber("8")} />
                    <KeyButton label="9" sub="៩" onClick={() => handleNumber("9")} />
                    <KeyButton
                        label="×"
                        onClick={() => handleOperator("*")}
                        variant="operator"
                        isActive={activeOp === "*"}
                    />

                    {/* ROW 4 */}
                    <KeyButton label="4" sub="៤" onClick={() => handleNumber("4")} />
                    <KeyButton label="5" sub="៥" onClick={() => handleNumber("5")} />
                    <KeyButton label="6" sub="៦" onClick={() => handleNumber("6")} />
                    <KeyButton
                        label="-"
                        onClick={() => handleOperator("-")}
                        variant="operator"
                        isActive={activeOp === "-"}
                    />

                    {/* ROW 5 */}
                    <KeyButton label="1" sub="១" onClick={() => handleNumber("1")} />
                    <KeyButton label="2" sub="២" onClick={() => handleNumber("2")} />
                    <KeyButton label="3" sub="៣" onClick={() => handleNumber("3")} />
                    <KeyButton
                        label="+"
                        onClick={() => handleOperator("+")}
                        variant="operator"
                        isActive={activeOp === "+"}
                    />

                    {/* ROW 6 */}
                    <KeyButton label="0" sub="០" onClick={() => handleNumber("0")} colSpan={2} />
                    <KeyButton label="." sub="ក្បៀស" onClick={handleDecimal} />
                    <KeyButton label="=" onClick={handleEquals} variant="equals" />
                </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center">
                Instant 0ms Audio Preload • Supports Keyboard Typing
            </p>
        </main>
    );
}

/* =========================================================
   AUTHENTIC 3D TACTILE KEY COMPONENT
========================================================= */

function KeyButton({
    label,
    sub,
    onClick,
    variant = "number",
    colSpan = 1,
    isActive = false,
}: {
    label: string;
    sub?: string;
    onClick: () => void;
    variant?: "number" | "operator" | "equals" | "utility" | "mem" | "ext" | "danger";
    colSpan?: number;
    isActive?: boolean;
}) {
    // Number buttons (Dark Matte Charcoal)
    let colorStyles = "bg-[#252833] hover:bg-[#2f3340] text-white border-t border-white/10 shadow-[0_4px_0_#13141a]";

    if (variant === "utility") {
        colorStyles = "bg-[#3e4352] hover:bg-[#4b5163] text-white border-t border-white/20 shadow-[0_4px_0_#232630]";
    } else if (variant === "mem") {
        colorStyles = "bg-[#1f222b] hover:bg-[#2c303d] text-amber-400 border-t border-amber-500/20 shadow-[0_4px_0_#111217] text-xs font-mono";
    } else if (variant === "ext") {
        colorStyles = "bg-[#2c303d] hover:bg-[#383d4e] text-slate-200 border-t border-white/15 shadow-[0_4px_0_#171920] text-xs sm:text-sm";
    } else if (variant === "danger") {
        colorStyles = "bg-[#dc2626] hover:bg-[#ef4444] text-white border-t border-white/30 shadow-[0_4px_0_#991b1b]";
    } else if (variant === "operator") {
        colorStyles = isActive
            ? "bg-white text-[#ea580c] shadow-none ring-2 ring-white scale-[0.98]"
            : "bg-[#ea580c] hover:bg-[#f97316] text-white border-t border-white/30 shadow-[0_4px_0_#9a3412]";
    } else if (variant === "equals") {
        colorStyles = "bg-[#f59e0b] hover:bg-[#fbbf24] text-[#16181f] border-t border-white/40 shadow-[0_4px_0_#b45309] font-black";
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={`min-h-[50px] sm:min-h-[56px] rounded-2xl flex flex-col items-center justify-center font-bold text-base sm:text-lg transition-all duration-75 active:translate-y-1 active:shadow-none ${colorStyles} ${colSpan === 2 ? "col-span-2 items-start pl-6" : "col-span-1"
                }`}
        >
            <span className="leading-none">{label}</span>
            {sub && <span className="text-[10px] text-white/50 -mb-1 mt-0.5 font-normal tracking-wide">{sub}</span>}
        </button>
    );
}