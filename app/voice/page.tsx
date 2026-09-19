// app/tools/voice/page.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

type Mode = "tts" | "stt";
type Persona = "girl" | "boy" | "young" | "cloned";

interface ClonedVoiceProfile {
    pitchMultiplier: number;
    speedMultiplier: number;
    frequencyHz: number;
    genderEstimate: string;
}

const ALLOWED_LANGUAGES = [
    { code: "km-KH", ttsCode: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ", flag: "🇰🇭" },
    { code: "en-US", ttsCode: "en", name: "English (US)", nativeName: "English", flag: "🇺🇸" },
    { code: "zh-CN", ttsCode: "zh", name: "Chinese (Mandarin)", nativeName: "中文", flag: "🇨🇳" },
    { code: "ja-JP", ttsCode: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
    { code: "ko-KR", ttsCode: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
];

const SAMPLE_TEXTS: Record<string, string> = {
    "km-KH": "សួស្តី! សូមស្វាគមន៍មកកាន់ SmartScan Voice Studio។ ឥឡូវនេះសំឡេងអាចប្តូរជាក្មេង ប្រុស ឬស្រីបានយ៉ាងពិតប្រាកដ។",
    "en-US": "Hello! Welcome to SmartScan Voice Studio. The voice tone now realistically shifts between male, female, and child.",
    "zh-CN": "你好！欢迎使用智能语音工作室。声音音调现在可以在男声、女声和童声之间自由切换。",
    "ja-JP": "こんにちは！音声スタジオへようこそ。男声、女声、子供の声にリアルに切り替えることができます。",
    "ko-KR": "안녕하세요! 스마트 음성 스튜디오에 오신 것을 환영합니다. 남성, 여성, 어린이 목소리로 완벽하게 변환됩니다.",
};

const PERSONA_CONFIG: Record<Persona, { label: string; icon: string; playbackRate: number; pitchVal: number }> = {
    girl: { label: "Girl / Female", icon: "👩", playbackRate: 1.05, pitchVal: 1.2 },
    boy: { label: "Boy / Male", icon: "👨", playbackRate: 0.84, pitchVal: 0.75 },
    young: { label: "Young / Kid", icon: "🧒", playbackRate: 1.35, pitchVal: 1.6 },
    cloned: { label: "Cloned Voice", icon: "✨", playbackRate: 1.0, pitchVal: 1.0 },
};

export default function VoiceToolsPage() {
    const [mode, setMode] = useState<Mode>("tts");

    // ==========================================
    // TEXT TO VOICE (TTS) STATE
    // ==========================================
    const [ttsLang, setTtsLang] = useState(ALLOWED_LANGUAGES[0].code);
    const [ttsText, setTtsText] = useState(SAMPLE_TEXTS["km-KH"]);
    const [persona, setPersona] = useState<Persona>("girl");
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>("cloud-default");
    const [selectedVoiceLabel, setSelectedVoiceLabel] = useState<string>("🇰🇭 ភាសាខ្មែរ (Natural Cloud Voice)");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    // Searchable Voice Dropdown State
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const [voiceSearch, setVoiceSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // ==========================================
    // VOICE CLONING (AI ANALYZER) STATE
    // ==========================================
    const [isCloning, setIsCloning] = useState(false);
    const [cloneCountdown, setCloneCountdown] = useState(3);
    const [clonedProfile, setClonedProfile] = useState<ClonedVoiceProfile | null>(null);
    const [cloneSuccessMsg, setCloneSuccessMsg] = useState("");

    // ==========================================
    // VOICE TO TEXT (STT) STATE
    // ==========================================
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [sttLang, setSttLang] = useState("km-KH");
    const [sttSupported, setSttSupported] = useState(true);
    const recognitionRef = useRef<any>(null);

    const [copied, setCopied] = useState(false);

    // Close voice dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsVoiceOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Load saved cloned voice from localStorage on mount
    useEffect(() => {
        try {
            const savedClone = localStorage.getItem("smartscan_cloned_voice");
            if (savedClone) {
                setClonedProfile(JSON.parse(savedClone));
            }
        } catch { }
    }, []);

    // Initialize Web Speech APIs
    useEffect(() => {
        // 1. Speech Recognition
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSttSupported(false);
        } else {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                let current = "";
                for (let i = 0; i < event.results.length; i++) {
                    current += event.results[i][0].transcript + " ";
                }
                setTranscript(current.trim());
            };

            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);
            recognitionRef.current = recognition;
        }

        // 2. Speech Synthesis - ONLY 5 ALLOWED LANGUAGES
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const loadVoices = () => {
                const available = window.speechSynthesis.getVoices();
                const filtered = available.filter((v) =>
                    /^(km|en|zh|ja|ko)/i.test(v.lang)
                );
                setVoices(filtered);
            };

            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (audioPlayerRef.current) audioPlayerRef.current.pause();
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Filtered voices inside combobox
    const filteredVoices = useMemo(() => {
        const query = voiceSearch.toLowerCase().trim();
        return voices.filter(
            (v) => v.name.toLowerCase().includes(query) || v.lang.toLowerCase().includes(query)
        );
    }, [voices, voiceSearch]);

    // ──────────────────────────────────────────
    // VOICE CLONING FUNCTION (Frequency Analyzer)
    // ──────────────────────────────────────────
    const handleStartCloning = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsCloning(true);
            setCloneCountdown(3);

            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);
            const pitchSamples: number[] = [];

            // Sample pitch frequency every 100ms
            const interval = setInterval(() => {
                analyser.getFloatFrequencyData(dataArray);
                let maxVal = -Infinity;
                let maxIndex = -1;
                for (let i = 0; i < bufferLength; i++) {
                    if (dataArray[i] > maxVal) {
                        maxVal = dataArray[i];
                        maxIndex = i;
                    }
                }
                const freq = (maxIndex * audioCtx.sampleRate) / analyser.fftSize;
                if (freq > 70 && freq < 450) {
                    pitchSamples.push(freq);
                }
            }, 100);

            // 3-second recording countdown
            let count = 3;
            const timer = setInterval(() => {
                count -= 1;
                setCloneCountdown(count);
                if (count <= 0) {
                    clearInterval(timer);
                    clearInterval(interval);

                    // Stop mic
                    stream.getTracks().forEach((track) => track.stop());
                    audioCtx.close();

                    // Calculate average pitch
                    const avgFreq =
                        pitchSamples.length > 0
                            ? pitchSamples.reduce((a, b) => a + b, 0) / pitchSamples.length
                            : 160;

                    // Standard baseline is 160Hz.
                    // If pitch is low (e.g. 100Hz), multiplier < 1.0 (deeper).
                    // If pitch is high (e.g. 240Hz), multiplier > 1.0 (brighter).
                    const calculatedMultiplier = Math.max(0.78, Math.min(1.4, avgFreq / 160));
                    const gender = avgFreq < 145 ? "Male Tone" : avgFreq > 195 ? "Bright/Female Tone" : "Natural Tone";

                    const newProfile: ClonedVoiceProfile = {
                        pitchMultiplier: parseFloat(calculatedMultiplier.toFixed(2)),
                        speedMultiplier: 1.0,
                        frequencyHz: Math.round(avgFreq),
                        genderEstimate: gender,
                    };

                    setClonedProfile(newProfile);
                    localStorage.setItem("smartscan_cloned_voice", JSON.stringify(newProfile));
                    setPersona("cloned");
                    setIsCloning(false);
                    setCloneSuccessMsg(`Voice cloned! Detected: ${newProfile.frequencyHz}Hz (${gender})`);
                    setTimeout(() => setCloneSuccessMsg(""), 4000);
                }
            }, 1000);
        } catch {
            alert("Microphone permission denied. Please allow mic access to clone voice.");
            setIsCloning(false);
        }
    };

    // Change Language Preset
    const handleLanguageChange = (code: string) => {
        setTtsLang(code);
        setTtsText(SAMPLE_TEXTS[code] || "");

        const currentLangObj = ALLOWED_LANGUAGES.find((l) => l.code === code);
        const flag = currentLangObj?.flag || "🌐";
        const name = currentLangObj?.nativeName || "Natural Voice";

        setSelectedVoiceId("cloud-default");
        setSelectedVoiceLabel(`${flag} ${name} (Natural Voice)`);
    };

    // ──────────────────────────────────────────
    // PLAY AUDIO (WITH REAL PITCH MODULATION)
    // ──────────────────────────────────────────
    const handleSpeak = () => {
        if (!ttsText.trim()) return;

        const langObj = ALLOWED_LANGUAGES.find((l) => l.code === ttsLang);
        const isKhmer = ttsLang === "km-KH" || /[\u1780-\u17FF]/.test(ttsText);
        const shouldUseCloud = isKhmer || selectedVoiceId === "cloud-default";

        // Calculate pitch modulation rate
        let effectivePlaybackRate = PERSONA_CONFIG[persona].playbackRate;
        if (persona === "cloned" && clonedProfile) {
            effectivePlaybackRate = clonedProfile.pitchMultiplier;
        }

        // 1. PLAY CLOUD STREAM (Khmer & Cloud Voices)
        if (shouldUseCloud) {
            if (isPaused && audioPlayerRef.current) {
                audioPlayerRef.current.play();
                setIsPaused(false);
                setIsSpeaking(true);
                return;
            }

            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current.currentTime = 0;
            }

            const langParam = isKhmer ? "km" : langObj?.ttsCode || "en";
            const audioUrl = `/api/tts?lang=${langParam}&text=${encodeURIComponent(ttsText)}`;
            const audio = new Audio(audioUrl);

            // CRUCIAL: preservesPitch = false forces the browser to actually shift the voice
            // into deep boy, natural female, or high child frequency!
            audio.preservesPitch = false;
            // @ts-ignore
            audio.webkitPreservesPitch = false;
            // @ts-ignore
            audio.mozPreservesPitch = false;

            audio.playbackRate = effectivePlaybackRate;
            audioPlayerRef.current = audio;

            audio.onplay = () => {
                setIsSpeaking(true);
                setIsPaused(false);
            };
            audio.onended = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };
            audio.onerror = () => {
                setIsSpeaking(false);
                setIsPaused(false);
            };

            audio.play();
            return;
        }

        // 2. PLAY SYSTEM BROWSER VOICE
        if (!("speechSynthesis" in window)) return;

        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsSpeaking(true);
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(ttsText);

        // Auto-select male or female system voice if matching persona
        let matchedVoice = voices.find((v) => v.name === selectedVoiceId);
        const langPrefix = ttsLang.split("-")[0];

        if (persona === "girl") {
            const femaleVoice = voices.find(
                (v) => v.lang.startsWith(langPrefix) && /(female|zira|samantha|victoria|kyoko|yuna)/i.test(v.name)
            );
            if (femaleVoice) matchedVoice = femaleVoice;
        } else if (persona === "boy") {
            const maleVoice = voices.find(
                (v) => v.lang.startsWith(langPrefix) && /(male|david|george|alex|daniel|ichiro)/i.test(v.name)
            );
            if (maleVoice) matchedVoice = maleVoice;
        }

        if (matchedVoice) utterance.voice = matchedVoice;

        utterance.pitch =
            persona === "cloned" && clonedProfile
                ? clonedProfile.pitchMultiplier
                : PERSONA_CONFIG[persona].pitchVal;

        utterance.rate =
            persona === "young" ? 1.15 : persona === "boy" ? 0.92 : 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const handlePause = () => {
        if (audioPlayerRef.current && !audioPlayerRef.current.paused) {
            audioPlayerRef.current.pause();
            setIsPaused(true);
            setIsSpeaking(false);
            return;
        }
        if (typeof window !== "undefined" && window.speechSynthesis?.speaking && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            setIsSpeaking(false);
        }
    };

    const handleStop = () => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const handleDownloadMp3 = () => {
        if (!ttsText.trim()) return;
        const isKhmer = ttsLang === "km-KH" || /[\u1780-\u17FF]/.test(ttsText);
        const langObj = ALLOWED_LANGUAGES.find((l) => l.code === ttsLang);
        const langCode = isKhmer ? "km" : langObj?.ttsCode || "en";

        const url = `/api/tts?lang=${langCode}&text=${encodeURIComponent(ttsText)}`;
        const a = document.createElement("a");
        a.href = url;
        a.download = `smartscan-speech-${langCode}-${persona}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // ──────────────────────────────────────────
    // VOICE TO TEXT CONTROLS
    // ──────────────────────────────────────────
    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.lang = sttLang;
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const copyText = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadTxt = (text: string) => {
        if (!text) return;
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `smartscan-transcription.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
            <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">

                {/* Back Link */}
                <div className="mb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>

                {/* Header */}
                <header className="mx-auto max-w-2xl text-center mb-8">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm mb-4">
                        <AudioStudioIcon />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 mb-3">
                        Speech &amp; Audio Studio
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                        Voice Studio &amp; Cloner
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Shift pitch realistically between Boy, Girl, and Child voices, or clone your own voice sample.
                    </p>
                </header>

                {/* Mode Selector Tabs */}
                <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-8">
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            onClick={() => {
                                setMode("tts");
                                if (isListening && recognitionRef.current) {
                                    recognitionRef.current.stop();
                                    setIsListening(false);
                                }
                            }}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${mode === "tts"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                }`}
                        >
                            <SpeakerIcon />
                            <span>Text to Voice</span>
                        </button>

                        <button
                            onClick={() => {
                                setMode("stt");
                                handleStop();
                            }}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${mode === "stt"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                }`}
                        >
                            <MicIcon />
                            <span>Voice to Text</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 1. TEXT TO VOICE (REAL SHIFTING + VOICE CLONE)            */}
                {/* ========================================================= */}
                {mode === "tts" && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 space-y-6">

                        {/* 5 ALLOWED LANGUAGES SELECTOR */}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
                                1. Language:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ALLOWED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${ttsLang === lang.code
                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            }`}
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.nativeName}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* VOICE PERSONA & CLONE SELECTOR */}
                        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-950/70 border border-indigo-100 dark:border-slate-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-400">
                                    2. Voice Character &amp; Clone:
                                </label>
                                {!isCloning && (
                                    <button
                                        type="button"
                                        onClick={handleStartCloning}
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        <SparklesIcon />
                                        <span>{clonedProfile ? "Re-Clone Voice (3s)" : "Record & Clone My Voice (3s)"}</span>
                                    </button>
                                )}
                            </div>

                            {/* Voice Cloning Countdown Banner */}
                            {isCloning && (
                                <div className="p-4 rounded-xl bg-rose-500 text-white flex items-center justify-between animate-pulse">
                                    <div className="flex items-center gap-2">
                                        <MicIcon />
                                        <span className="text-xs font-bold">Please speak clearly into your mic...</span>
                                    </div>
                                    <span className="text-xl font-black font-mono">{cloneCountdown}s</span>
                                </div>
                            )}

                            {cloneSuccessMsg && (
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                                    <span>✓</span>
                                    <span>{cloneSuccessMsg}</span>
                                </div>
                            )}

                            {/* Persona Buttons */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(["girl", "boy", "young"] as Persona[]).map((key) => {
                                    const p = PERSONA_CONFIG[key];
                                    const isSelected = persona === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setPersona(key)}
                                            className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${isSelected
                                                    ? "bg-white dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-sm ring-2 ring-indigo-500/20 font-bold"
                                                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                                }`}
                                        >
                                            <span className="text-lg">{p.icon}</span>
                                            <span className="text-xs">{p.label}</span>
                                        </button>
                                    );
                                })}

                                {/* Cloned Voice Persona */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!clonedProfile) {
                                            handleStartCloning();
                                        } else {
                                            setPersona("cloned");
                                        }
                                    }}
                                    className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${persona === "cloned"
                                            ? "bg-white dark:bg-indigo-950/40 border-purple-500 text-purple-600 dark:text-purple-300 shadow-sm ring-2 ring-purple-500/20 font-bold"
                                            : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                                        }`}
                                >
                                    <span className="text-lg">✨</span>
                                    <span className="text-xs truncate">
                                        {clonedProfile ? "My Cloned Voice" : "+ Clone Voice"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Text Area */}
                        <div className="space-y-1.5">
                            <textarea
                                rows={5}
                                value={ttsText}
                                onChange={(e) => setTtsText(e.target.value)}
                                placeholder="Type or paste content here..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white leading-relaxed font-medium"
                            />
                            <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                                <span>Supported: 🇰🇭 ភាសាខ្មែរ • 🇺🇸 English • 🇨🇳 中文 • 🇯🇵 日本語 • 🇰🇷 한국어</span>
                                <span>{ttsText.length} characters</span>
                            </div>
                        </div>

                        {/* Searchable Voice Dropdown */}
                        <div className="space-y-1.5 relative pt-4 border-t border-slate-100 dark:border-slate-800" ref={dropdownRef}>
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Voice Engine (Filter &amp; Select)
                            </label>

                            <button
                                type="button"
                                onClick={() => setIsVoiceOpen(!isVoiceOpen)}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold outline-none transition hover:border-indigo-400 text-left truncate"
                            >
                                <span className="truncate">{selectedVoiceLabel}</span>
                                <svg className={`w-4 h-4 ml-2 shrink-0 transition-transform ${isVoiceOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Combobox */}
                            {isVoiceOpen && (
                                <div className="absolute z-50 left-0 right-0 mt-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                                    <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950">
                                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={voiceSearch}
                                            onChange={(e) => setVoiceSearch(e.target.value)}
                                            placeholder="Filter voices..."
                                            className="w-full bg-transparent text-xs outline-none py-1 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                        />
                                    </div>

                                    <div className="max-h-48 overflow-y-auto p-1 space-y-0.5 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const langObj = ALLOWED_LANGUAGES.find((l) => l.code === ttsLang);
                                                setSelectedVoiceId("cloud-default");
                                                setSelectedVoiceLabel(`${langObj?.flag} ${langObj?.nativeName} (Natural Cloud Voice)`);
                                                setIsVoiceOpen(false);
                                                setVoiceSearch("");
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-bold transition ${selectedVoiceId === "cloud-default"
                                                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                                                }`}
                                        >
                                            <span>Natural Cloud HD Voice</span>
                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                                                Active
                                            </span>
                                        </button>

                                        {filteredVoices.map((v) => (
                                            <button
                                                key={v.name}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedVoiceId(v.name);
                                                    setSelectedVoiceLabel(`${v.name} (${v.lang})`);
                                                    setIsVoiceOpen(false);
                                                    setVoiceSearch("");
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition ${selectedVoiceId === v.name
                                                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold"
                                                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                    }`}
                                            >
                                                <span className="truncate pr-2">{v.name}</span>
                                                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                                    {v.lang}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Player Action Buttons */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSpeak}
                                    disabled={!ttsText.trim()}
                                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    <PlayIcon />
                                    <span>{isPaused ? "Resume" : "Speak Audio"}</span>
                                </button>

                                {isSpeaking && (
                                    <button
                                        onClick={handlePause}
                                        className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold active:scale-95 transition"
                                    >
                                        Pause
                                    </button>
                                )}

                                {(isSpeaking || isPaused) && (
                                    <button
                                        onClick={handleStop}
                                        className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-xs font-bold active:scale-95 transition"
                                    >
                                        Stop
                                    </button>
                                )}
                            </div>

                            {/* Soundwave Animation & Download MP3 */}
                            <div className="flex items-center gap-3">
                                {isSpeaking && (
                                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                        <span className="w-1 h-3 bg-indigo-600 dark:bg-indigo-400 animate-pulse rounded-full" />
                                        <span className="w-1 h-5 bg-indigo-600 dark:bg-indigo-400 animate-pulse delay-75 rounded-full" />
                                        <span className="w-1 h-2 bg-indigo-600 dark:bg-indigo-400 animate-pulse delay-150 rounded-full" />
                                        <span className="text-xs font-mono font-bold ml-1.5 capitalize">
                                            Playing ({PERSONA_CONFIG[persona].label})
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={handleDownloadMp3}
                                    disabled={!ttsText.trim()}
                                    className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold active:scale-95 transition flex items-center gap-1.5 disabled:opacity-40"
                                >
                                    <DownloadIcon />
                                    <span>Download .MP3</span>
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ========================================================= */}
                {/* 2. VOICE TO TEXT (5 LANGUAGES ONLY)                       */}
                {/* ========================================================= */}
                {mode === "stt" && (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/60 space-y-6">
                        {!sttSupported ? (
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs">
                                ⚠️ Speech Recognition is not supported by your browser engine. Please open this page in Google Chrome or Microsoft Edge.
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                            Language:
                                        </label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {ALLOWED_LANGUAGES.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    type="button"
                                                    onClick={() => setSttLang(lang.code)}
                                                    disabled={isListening}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${sttLang === lang.code
                                                            ? "bg-indigo-600 text-white shadow-sm"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    <span>{lang.flag}</span>
                                                    <span>{lang.nativeName}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <button
                                            onClick={() => copyText(transcript)}
                                            disabled={!transcript}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition active:scale-95 disabled:opacity-40"
                                        >
                                            {copied ? "Copied!" : "Copy"}
                                        </button>
                                        <button
                                            onClick={() => downloadTxt(transcript)}
                                            disabled={!transcript}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition active:scale-95 disabled:opacity-40"
                                        >
                                            Export .TXT
                                        </button>
                                        <button
                                            onClick={() => setTranscript("")}
                                            disabled={!transcript}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-xs font-semibold transition active:scale-95 disabled:opacity-40"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center py-6">
                                    <div className="relative">
                                        {isListening && (
                                            <span className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
                                        )}
                                        <button
                                            onClick={toggleListening}
                                            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center gap-1 font-bold text-white shadow-xl transition-all active:scale-90 ${isListening
                                                    ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                                                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                                                }`}
                                        >
                                            <MicLargeIcon />
                                        </button>
                                    </div>
                                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        {isListening ? "Listening... Speak now" : "Click Microphone to Start"}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                                        <span>Live Dictated Text</span>
                                        <span>
                                            {transcript.split(/\s+/).filter(Boolean).length} words • {transcript.length} chars
                                        </span>
                                    </div>
                                    <textarea
                                        rows={6}
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        placeholder="Spoken words appear here automatically in real time..."
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white leading-relaxed"
                                    />
                                </div>
                            </>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}

/* =========================================================
   CLEAN ICONS
========================================================= */

function AudioStudioIcon() {
    return (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    );
}

function MicIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    );
}

function MicLargeIcon() {
    return (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    );
}

function SpeakerIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
    );
}

function PlayIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
        </svg>
    );
}

function SparklesIcon() {
    return (
        <svg className="w-3.5 h-3.5 shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}