// app/create-cv/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ExperienceItem {
    id: string;
    role: string;
    company: string;
    period: string;
    description: string;
}

interface EducationItem {
    id: string;
    degree: string;
    school: string;
    year: string;
}

interface CvData {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
    skills: string[];
    experience: ExperienceItem[];
    education: EducationItem[];
}

const INITIAL_CV: CvData = {
    fullName: "Alex Rivera",
    jobTitle: "Senior Full Stack Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 349-2041",
    location: "San Francisco, CA",
    website: "github.com/alexrivera",
    summary:
        "Results-driven Software Engineer with 6+ years of experience leading cross-functional teams to build high-scale web platforms. Specialized in Next.js, distributed microservices, and modern cloud architectures.",
    skills: ["TypeScript", "Next.js", "React", "Node.js", "Tailwind CSS", "PostgreSQL", "Docker", "AWS", "GraphQL", "CI/CD"],
    experience: [
        {
            id: "exp-1",
            role: "Lead Full Stack Engineer",
            company: "Apex Cloud Technologies",
            period: "2022 - Present",
            description:
                "Spearheaded core platform rewrite into Next.js App Router, boosting page speed by 45% and driving $1.2M in annual recurring revenue. Mentored 8 junior engineers.",
        },
        {
            id: "exp-2",
            role: "Frontend Engineer",
            company: "Vanguard Digital Media",
            period: "2019 - 2022",
            description:
                "Engineered scalable UI component design system adopted by 14 product squads. Reduced UI regression bugs by 35% using automated Cypress and Jest test suites.",
        },
    ],
    education: [
        {
            id: "edu-1",
            degree: "B.S. in Computer Science & Engineering",
            school: "University of California, Berkeley",
            year: "2015 - 2019",
        },
    ],
};

type TemplateLayout = "executive" | "classic" | "creative" | "minimal";
type AccentTheme = "indigo" | "emerald" | "blue" | "rose" | "slate";

const THEME_COLORS: Record<AccentTheme, { primary: string; lightBg: string; text: string; hex: string }> = {
    indigo: { primary: "bg-indigo-600", lightBg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-600 dark:text-indigo-400", hex: "#4f46e5" },
    emerald: { primary: "bg-emerald-600", lightBg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", hex: "#059669" },
    blue: { primary: "bg-blue-600", lightBg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", hex: "#2563eb" },
    rose: { primary: "bg-rose-600", lightBg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-400", hex: "#e11d48" },
    slate: { primary: "bg-slate-900", lightBg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-900 dark:text-slate-200", hex: "#0f172a" },
};

const SAMPLE_PROMPTS = [
    "Full Stack Developer with 5 years in Next.js & AWS",
    "Digital Marketing Manager specializing in SEO & Growth",
    "Product Designer with 4 years in Figma & Design Systems",
    "Senior Financial Analyst with experience in M&A models",
];

const STORAGE_KEYS = {
    CV: "smartscan_cv_data_v2",
    AVATAR: "smartscan_cv_avatar_v2",
    LAYOUT: "smartscan_cv_layout_v2",
    ACCENT: "smartscan_cv_accent_v2",
};

export default function CreateCvPage() {
    const [cv, setCv] = useState<CvData>(INITIAL_CV);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [prompt, setPrompt] = useState("");
    const [layout, setLayout] = useState<TemplateLayout>("executive");
    const [accent, setAccent] = useState<AccentTheme>("indigo");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"ai" | "edit" | "design">("ai");
    const [newSkill, setNewSkill] = useState("");
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // 1. Load from localStorage on mount
    useEffect(() => {
        try {
            const savedCv = localStorage.getItem(STORAGE_KEYS.CV);
            const savedAvatar = localStorage.getItem(STORAGE_KEYS.AVATAR);
            const savedLayout = localStorage.getItem(STORAGE_KEYS.LAYOUT);
            const savedAccent = localStorage.getItem(STORAGE_KEYS.ACCENT);

            if (savedCv) setCv(JSON.parse(savedCv));
            if (savedAvatar) setAvatar(savedAvatar);
            if (savedLayout) setLayout(savedLayout as TemplateLayout);
            if (savedAccent) setAccent(savedAccent as AccentTheme);
        } catch (e) {
            console.warn("Error reading CV from localStorage", e);
        }
    }, []);

    // 2. Auto-save CV content to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.CV, JSON.stringify(cv));
            localStorage.setItem(STORAGE_KEYS.LAYOUT, layout);
            localStorage.setItem(STORAGE_KEYS.ACCENT, accent);
        } catch (e) {
            console.warn("Error saving CV to localStorage", e);
        }
    }, [cv, layout, accent]);

    // 3. Compress and store avatar image in Base64
    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file (JPG, PNG, WebP).");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                // Resize image to max 360x360 so localStorage stays fast and tiny (~30KB)
                const canvas = document.createElement("canvas");
                const MAX_DIM = 360;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_DIM) {
                        height = Math.round((height * MAX_DIM) / width);
                        width = MAX_DIM;
                    }
                } else {
                    if (height > MAX_DIM) {
                        width = Math.round((width * MAX_DIM) / height);
                        height = MAX_DIM;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);

                setAvatar(compressedBase64);
                try {
                    localStorage.setItem(STORAGE_KEYS.AVATAR, compressedBase64);
                } catch (err) {
                    console.warn("Storage quota warning:", err);
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    }

    function removeAvatar() {
        setAvatar(null);
        localStorage.removeItem(STORAGE_KEYS.AVATAR);
    }

    function handleResetAll() {
        if (confirm("Reset CV and photo back to sample data?")) {
            setCv(INITIAL_CV);
            setAvatar(null);
            localStorage.removeItem(STORAGE_KEYS.CV);
            localStorage.removeItem(STORAGE_KEYS.AVATAR);
        }
    }

    // AI Generation via Google AI Studio
    async function handleGenerateAi(promptText?: string) {
        const query = promptText || prompt;
        if (!query.trim()) {
            setError("Please enter a description or click a sample prompt.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/generate-cv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: query.trim(),
                    currentCv: cv,
                    style: layout,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success || !json.cv) {
                throw new Error(json.error || "Failed to generate CV with AI.");
            }

            const formattedCv: CvData = {
                ...json.cv,
                experience: (json.cv.experience || []).map((e: any, i: number) => ({
                    ...e,
                    id: e.id || `exp-${Date.now()}-${i}`,
                })),
                education: (json.cv.education || []).map((e: any, i: number) => ({
                    ...e,
                    id: e.id || `edu-${Date.now()}-${i}`,
                })),
            };

            setCv(formattedCv);
            setPrompt("");
        } catch (err: any) {
            setError(err.message || "Failed to generate. Check your API key in .env.local.");
        } finally {
            setLoading(false);
        }
    }

    function updateField(key: keyof CvData, value: any) {
        setCv((prev) => ({ ...prev, [key]: value }));
    }

    function updateExp(id: string, key: keyof ExperienceItem, value: string) {
        setCv((prev) => ({
            ...prev,
            experience: prev.experience.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
        }));
    }

    function addExp() {
        const newEntry: ExperienceItem = {
            id: `exp-${Date.now()}`,
            role: "Job Title",
            company: "Company Name",
            period: "2023 - Present",
            description: "Describe your key contributions and metric achievements.",
        };
        setCv((prev) => ({ ...prev, experience: [newEntry, ...prev.experience] }));
    }

    function removeExp(id: string) {
        setCv((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));
    }

    function updateEdu(id: string, key: keyof EducationItem, value: string) {
        setCv((prev) => ({
            ...prev,
            education: prev.education.map((e) => (e.id === id ? { ...e, [key]: value } : e)),
        }));
    }

    function addEdu() {
        const newEntry: EducationItem = {
            id: `edu-${Date.now()}`,
            degree: "Degree / Certification",
            school: "University / Institute",
            year: "2020 - 2024",
        };
        setCv((prev) => ({ ...prev, education: [...prev.education, newEntry] }));
    }

    function removeEdu(id: string) {
        setCv((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
    }

    function handleAddSkill() {
        if (!newSkill.trim()) return;
        if (!cv.skills.includes(newSkill.trim())) {
            setCv((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
        }
        setNewSkill("");
    }

    function removeSkill(index: number) {
        setCv((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
    }

    const currentTheme = THEME_COLORS[accent];

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">

            {/* Screen Controls Header (Hidden in Print Mode) */}
            <div className="print:hidden max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Back to Home Link */}
                <div className="mb-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                    >
                        &larr; Back to Home
                    </Link>
                </div>

                {/* Header */}
                <header className="text-center max-w-2xl mx-auto mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 mb-3">
                        AI Executive Resume Builder
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                        Craft Your Professional CV
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Upload your photo, prompt Google AI, customize ATS layouts, and save directly to your browser.
                    </p>
                </header>

                {/* Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT CONTROLS PANEL (5 Columns) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Control Tabs */}
                        <div className="flex rounded-2xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <button
                                onClick={() => setActiveTab("ai")}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${activeTab === "ai"
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                <SparklesIcon />
                                AI Writer
                            </button>
                            <button
                                onClick={() => setActiveTab("edit")}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === "edit"
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                Edit &amp; Photo
                            </button>
                            <button
                                onClick={() => setActiveTab("design")}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === "design"
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                Layout &amp; Theme
                            </button>
                        </div>

                        {/* TAB 1: AI WRITER */}
                        {activeTab === "ai" && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm space-y-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Describe your career or request updates
                                </label>
                                <textarea
                                    rows={4}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g. 'I am a Cloud Engineer with 5 years in AWS, Terraform, and Docker. Emphasize microservices and cost-reduction achievements...'"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />

                                {/* Sample Prompt Pills */}
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-400 mb-2">Or try a 1-click sample role:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SAMPLE_PROMPTS.map((sample, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setPrompt(sample);
                                                    handleGenerateAi(sample);
                                                }}
                                                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition text-left"
                                            >
                                                {sample}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}

                                <button
                                    onClick={() => handleGenerateAi()}
                                    disabled={loading}
                                    className="w-full min-h-[46px] rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs sm:text-sm text-white shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Drafting with Gemini AI...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon />
                                            <span>Generate CV with AI</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* TAB 2: MANUAL EDITING & PHOTO UPLOAD */}
                        {activeTab === "edit" && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm space-y-5 max-h-[680px] overflow-y-auto pr-2">

                                {/* Photo Upload Section */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Profile Photo (Saved to Local Storage)</h3>
                                    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                                            {avatar ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon />
                                            )}
                                        </div>

                                        <div className="flex-1 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
                                            >
                                                {avatar ? "Change Photo" : "Upload Photo"}
                                            </button>

                                            {avatar && (
                                                <button
                                                    type="button"
                                                    onClick={removeAvatar}
                                                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 text-xs font-semibold transition"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Personal Info</h3>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={cv.fullName}
                                            onChange={(e) => updateField("fullName", e.target.value)}
                                            className="p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Job Title"
                                            value={cv.jobTitle}
                                            onChange={(e) => updateField("jobTitle", e.target.value)}
                                            className="p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={cv.email}
                                            onChange={(e) => updateField("email", e.target.value)}
                                            className="p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Phone"
                                            value={cv.phone}
                                            onChange={(e) => updateField("phone", e.target.value)}
                                            className="p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Location"
                                            value={cv.location}
                                            onChange={(e) => updateField("location", e.target.value)}
                                            className="p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Portfolio / LinkedIn"
                                            value={cv.website}
                                            onChange={(e) => updateField("website", e.target.value)}
                                            className="p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase">Summary</label>
                                    <textarea
                                        rows={3}
                                        value={cv.summary}
                                        onChange={(e) => updateField("summary", e.target.value)}
                                        className="w-full mt-1 p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                                    />
                                </div>

                                {/* Experience Manager */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Work Experience</h3>
                                        <button onClick={addExp} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            + Add Position
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {cv.experience.map((exp) => (
                                            <div key={exp.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
                                                <div className="flex justify-between items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={exp.role}
                                                        onChange={(e) => updateExp(exp.id, "role", e.target.value)}
                                                        placeholder="Role"
                                                        className="font-bold text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex-1 bg-white dark:bg-slate-900"
                                                    />
                                                    <button onClick={() => removeExp(exp.id)} className="text-rose-500 hover:text-rose-700 p-1">
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        value={exp.company}
                                                        onChange={(e) => updateExp(exp.id, "company", e.target.value)}
                                                        placeholder="Company"
                                                        className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={exp.period}
                                                        onChange={(e) => updateExp(exp.id, "period", e.target.value)}
                                                        placeholder="e.g. 2022 - Present"
                                                        className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                                                    />
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={exp.description}
                                                    onChange={(e) => updateExp(exp.id, "description", e.target.value)}
                                                    placeholder="Achievements and duties"
                                                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Education Manager */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Education</h3>
                                        <button onClick={addEdu} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            + Add Education
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {cv.education.map((edu) => (
                                            <div key={edu.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
                                                <div className="flex justify-between items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={edu.degree}
                                                        onChange={(e) => updateEdu(edu.id, "degree", e.target.value)}
                                                        placeholder="Degree"
                                                        className="font-bold text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex-1 bg-white dark:bg-slate-900"
                                                    />
                                                    <button onClick={() => removeEdu(edu.id)} className="text-rose-500 hover:text-rose-700 p-1">
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        value={edu.school}
                                                        onChange={(e) => updateEdu(edu.id, "school", e.target.value)}
                                                        placeholder="Institution"
                                                        className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={edu.year}
                                                        onChange={(e) => updateEdu(edu.id, "year", e.target.value)}
                                                        placeholder="Year"
                                                        className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills Manager */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-2">Skills</label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Add skill..."
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                                            className="flex-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                                        />
                                        <button onClick={handleAddSkill} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {cv.skills.map((s, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 font-medium">
                                                {s}
                                                <button onClick={() => removeSkill(idx)} className="text-slate-400 hover:text-rose-500 font-bold">
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: LAYOUT & DESIGN */}
                        {activeTab === "design" && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                        Choose CV Layout
                                    </label>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        {[
                                            { id: "executive", name: "Executive Sidebar", desc: "Two-column modern split" },
                                            { id: "classic", name: "Harvard Classic", desc: "Corporate ATS format" },
                                            { id: "creative", name: "Creative Timeline", desc: "Accent header banner" },
                                            { id: "minimal", name: "Minimal Swiss", desc: "Generous whitespace" },
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setLayout(t.id as TemplateLayout)}
                                                className={`p-3 rounded-2xl border text-left transition-all ${layout === t.id
                                                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20"
                                                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                                                    }`}
                                            >
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                        Accent Color
                                    </label>
                                    <div className="flex items-center gap-3">
                                        {(Object.keys(THEME_COLORS) as AccentTheme[]).map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setAccent(c)}
                                                style={{ backgroundColor: THEME_COLORS[c].hex }}
                                                className={`w-8 h-8 rounded-full transition-transform active:scale-90 flex items-center justify-center ${accent === c ? "ring-4 ring-offset-2 ring-indigo-500 scale-110" : ""
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={handleResetAll}
                                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition"
                                    >
                                        Reset to Sample Defaults
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Export Action Bar */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-3 shadow-sm">
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-Saved to Browser</p>
                                <p className="text-[11px] text-slate-400">Export vector PDF without watermarks</p>
                            </div>
                            <button
                                onClick={() => window.print()}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md active:scale-95 transition flex items-center gap-2"
                            >
                                <DownloadIcon />
                                <span>Save PDF / Print</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PREVIEW CONTAINER (7 Columns) */}
                    <div className="lg:col-span-7 flex flex-col items-center">
                        <div className="w-full flex items-center justify-between mb-3 px-2 text-xs text-slate-400 font-semibold">
                            <span>A4 Live Preview</span>
                            <span className="capitalize">{layout} layout • {accent}</span>
                        </div>

                        {/* PRINTABLE CANVAS CONTAINER */}
                        <div
                            id="cv-document"
                            className="w-full max-w-[650px] aspect-[1/1.414] bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 select-text"
                        >
                            {/* LAYOUT 1: EXECUTIVE TWO-COLUMN SIDEBAR */}
                            {layout === "executive" && (
                                <div className="w-full h-full flex flex-row">
                                    {/* Left Tinted Sidebar */}
                                    <div className="w-5/12 bg-slate-100 p-6 flex flex-col justify-between border-r border-slate-200 text-xs">
                                        <div className="space-y-5">
                                            {/* Photo (If uploaded) */}
                                            {avatar && (
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md mx-auto sm:mx-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={avatar} alt="Profile photo" className="w-full h-full object-cover" />
                                                </div>
                                            )}

                                            <div>
                                                <div className={`w-8 h-1 ${currentTheme.primary} rounded-full mb-2.5`} />
                                                <h1 className="text-lg font-extrabold leading-tight tracking-tight text-slate-900">{cv.fullName}</h1>
                                                <p className={`font-bold mt-1 text-[10px] uppercase tracking-wider ${currentTheme.text}`}>{cv.jobTitle}</p>
                                            </div>

                                            {/* Contact */}
                                            <div className="space-y-1.5 text-[10px] text-slate-600 font-medium">
                                                {cv.email && <p className="truncate">{cv.email}</p>}
                                                {cv.phone && <p>{cv.phone}</p>}
                                                {cv.location && <p>{cv.location}</p>}
                                                {cv.website && <p className="truncate font-mono">{cv.website}</p>}
                                            </div>

                                            {/* Skills */}
                                            <div>
                                                <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 mb-2">Technical Skills</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {cv.skills.map((s, i) => (
                                                        <span key={i} className="px-2 py-0.5 rounded bg-white text-[9px] font-semibold text-slate-700 border border-slate-200">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Education */}
                                        <div className="border-t border-slate-200 pt-3">
                                            <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 mb-1">Education</h4>
                                            {cv.education.map((edu) => (
                                                <div key={edu.id} className="text-[10px] mb-2">
                                                    <p className="font-bold text-slate-800">{edu.degree}</p>
                                                    <p className="text-slate-500 text-[9px]">{edu.school}</p>
                                                    <p className="font-mono text-[9px] text-slate-400">{edu.year}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Main Body */}
                                    <div className="w-7/12 p-6 flex flex-col justify-between text-xs space-y-5">
                                        {cv.summary && (
                                            <div>
                                                <h3 className={`font-bold uppercase text-[10px] tracking-wider mb-1 ${currentTheme.text}`}>About Me</h3>
                                                <p className="text-slate-600 leading-relaxed text-[11px]">{cv.summary}</p>
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h3 className={`font-bold uppercase text-[10px] tracking-wider mb-3 ${currentTheme.text}`}>Experience</h3>
                                            <div className="space-y-4">
                                                {cv.experience.map((exp) => (
                                                    <div key={exp.id} className="border-l-2 border-slate-200 pl-3">
                                                        <div className="flex justify-between items-baseline">
                                                            <h4 className="font-bold text-slate-900 text-xs">{exp.role}</h4>
                                                            <span className="font-mono text-[9px] text-slate-400">{exp.period}</span>
                                                        </div>
                                                        <p className="text-[10px] font-semibold text-slate-500 mb-1">{exp.company}</p>
                                                        <p className="text-slate-600 text-[10px] leading-relaxed">{exp.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LAYOUT 2: HARVARD / CORPORATE ATS CLASSIC */}
                            {layout === "classic" && (
                                <div className="p-8 font-serif text-slate-900 flex flex-col h-full space-y-4">
                                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                                        <div className="text-left">
                                            <h1 className="text-2xl font-bold tracking-normal uppercase">{cv.fullName}</h1>
                                            <p className="font-sans text-xs font-semibold text-slate-600 mt-0.5">{cv.jobTitle}</p>
                                            <div className="font-sans text-[10px] text-slate-500 mt-1 flex flex-wrap gap-2">
                                                <span>{cv.location}</span>
                                                <span>•</span>
                                                <span>{cv.phone}</span>
                                                <span>•</span>
                                                <span>{cv.email}</span>
                                            </div>
                                        </div>
                                        {avatar && (
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={avatar} alt="Profile photo" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>

                                    {cv.summary && (
                                        <div>
                                            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-1 font-sans">
                                                Professional Summary
                                            </h2>
                                            <p className="text-[11px] text-slate-700 leading-relaxed">{cv.summary}</p>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-300 pb-0.5 mb-2 font-sans">
                                            Work Experience
                                        </h2>
                                        <div className="space-y-3">
                                            {cv.experience.map((exp) => (
                                                <div key={exp.id}>
                                                    <div className="flex justify-between font-sans text-xs">
                                                        <span className="font-bold">{exp.role} — <span className="font-normal italic">{exp.company}</span></span>
                                                        <span className="text-[10px] text-slate-500 font-mono">{exp.period}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-700 mt-0.5 leading-relaxed">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 font-sans">
                                        <div>
                                            <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1">Education</h2>
                                            {cv.education.map((edu) => (
                                                <div key={edu.id} className="text-[10px]">
                                                    <p className="font-bold">{edu.degree}</p>
                                                    <p className="text-slate-500 text-[9px]">{edu.school}, {edu.year}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1">Core Skills</h2>
                                            <p className="text-[10px] text-slate-600 leading-snug">{cv.skills.join(" • ")}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LAYOUT 3: CREATIVE TIMELINE BANNER */}
                            {layout === "creative" && (
                                <div className="flex flex-col h-full">
                                    <div className={`p-6 ${currentTheme.primary} text-white flex justify-between items-center`}>
                                        <div className="flex items-center gap-4">
                                            {avatar && (
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/80 shadow-md shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={avatar} alt="Profile photo" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div>
                                                <h1 className="text-xl sm:text-2xl font-black">{cv.fullName}</h1>
                                                <p className="text-xs font-bold text-white/90 uppercase tracking-widest mt-0.5">{cv.jobTitle}</p>
                                            </div>
                                        </div>
                                        <div className="text-right text-[10px] text-white/80 font-mono">
                                            <p>{cv.email}</p>
                                            <p>{cv.phone}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col space-y-4 text-xs">
                                        {cv.summary && (
                                            <p className="text-slate-600 italic text-[11px] border-l-2 border-slate-300 pl-3 leading-relaxed">
                                                {cv.summary}
                                            </p>
                                        )}

                                        <div className="flex-1">
                                            <h3 className="font-bold uppercase text-[10px] tracking-wider text-slate-400 mb-2.5">Timeline Experience</h3>
                                            <div className="space-y-3">
                                                {cv.experience.map((exp) => (
                                                    <div key={exp.id} className="relative pl-4 border-l-2 border-slate-200">
                                                        <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${currentTheme.primary}`} />
                                                        <div className="flex justify-between text-xs">
                                                            <span className="font-bold text-slate-900">{exp.role} <span className="font-normal text-slate-500">at {exp.company}</span></span>
                                                            <span className="text-[10px] font-mono text-slate-400">{exp.period}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{exp.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-1">
                                            {cv.skills.map((s, i) => (
                                                <span key={i} className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${currentTheme.lightBg} ${currentTheme.text}`}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LAYOUT 4: MINIMAL SWISS DESIGN */}
                            {layout === "minimal" && (
                                <div className="p-8 flex flex-col h-full justify-between space-y-5 text-slate-900">
                                    <div>
                                        <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                                            <div>
                                                <h1 className="text-2xl font-light tracking-tight">{cv.fullName}</h1>
                                                <span className="text-xs font-mono text-slate-500">{cv.jobTitle}</span>
                                            </div>
                                            {avatar && (
                                                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-300 shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={avatar} alt="Profile photo" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-4 text-[10px] text-slate-400 font-mono mt-1">
                                            <span>{cv.email}</span>
                                            <span>{cv.phone}</span>
                                            <span>{cv.location}</span>
                                        </div>
                                    </div>

                                    {cv.summary && (
                                        <p className="text-xs text-slate-600 font-light leading-relaxed">{cv.summary}</p>
                                    )}

                                    <div className="flex-1 space-y-4">
                                        <p className="text-[10px] font-mono uppercase text-slate-400 tracking-widest">Selected Experience</p>
                                        {cv.experience.map((exp) => (
                                            <div key={exp.id} className="grid grid-cols-4 gap-4 text-xs">
                                                <span className="font-mono text-[9px] text-slate-400">{exp.period}</span>
                                                <div className="col-span-3">
                                                    <p className="font-medium text-slate-900 text-xs">{exp.role}, <span className="text-slate-500">{exp.company}</span></p>
                                                    <p className="text-[10px] text-slate-600 font-light mt-0.5 leading-relaxed">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px]">
                                        <span className="font-mono text-slate-400">Expertise:</span>
                                        <span className="text-slate-700">{cv.skills.slice(0, 7).join(" • ")}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Stylesheet */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #cv-document,
                    #cv-document * {
                        visibility: visible !important;
                    }
                    #cv-document {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        max-width: 210mm !important;
                        border: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </main>
    );
}

/* =========================================================
   ICONS
========================================================= */

function SparklesIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    );
}