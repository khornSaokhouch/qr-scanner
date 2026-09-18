// app/convert-to-pdf/page.tsx
"use client";

import {
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type ReactNode,
} from "react";
import Link from "next/link";

type Mode = "images" | "document";

type PdfImage = {
    id: string;
    file: File;
    preview: string;
};

type Message = {
    type: "success" | "error";
    text: string;
} | null;

const DOCUMENT_ACCEPT = [
    ".doc",
    ".docx",
    ".docm",
    ".rtf",
    ".odt",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
].join(",");

export default function ConvertToPdfPage() {
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const documentInputRef = useRef<HTMLInputElement | null>(null);

    const [mode, setMode] = useState<Mode>("images");
    const [images, setImages] = useState<PdfImage[]>([]);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("smartscan-document");
    const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
    const [margin, setMargin] = useState(10);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<Message>(null);
    const [isDragging, setIsDragging] = useState(false);

    function openImagePicker() {
        imageInputRef.current?.click();
    }

    function openDocumentPicker() {
        documentInputRef.current?.click();
    }

    function processSelectedImages(selectedFiles: File[]) {
        const validImages = selectedFiles.filter(
            (file) =>
                file.type === "image/jpeg" ||
                file.type === "image/png" ||
                file.type === "image/webp"
        );

        if (!validImages.length) {
            setMessage({
                type: "error",
                text: "Please select valid JPG, PNG, or WebP images.",
            });
            return;
        }

        const newImages: PdfImage[] = validImages.map((file) => ({
            id: createFileId(file),
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages((current) => [...current, ...newImages]);
        setMessage(null);
    }

    function handleImages(event: ChangeEvent<HTMLInputElement>) {
        const selected = Array.from(event.target.files ?? []);
        if (selected.length) {
            processSelectedImages(selected);
        }
        event.target.value = "";
    }

    function processSelectedDocument(file: File) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!DOCUMENT_ACCEPT.includes(ext)) {
            setMessage({
                type: "error",
                text: `Unsupported document type (${ext}). Please choose a Word, Excel, or PowerPoint file.`,
            });
            return;
        }

        setDocumentFile(file);
        const name = file.name.replace(/\.[^/.]+$/, "");
        setFileName(name);
        setMessage(null);
    }

    function handleDocument(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            processSelectedDocument(file);
        }
        event.target.value = "";
    }

    // Drag and drop handlers
    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave() {
        setIsDragging(false);
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files ?? []);
        if (!droppedFiles.length) return;

        if (mode === "images") {
            processSelectedImages(droppedFiles);
        } else {
            processSelectedDocument(droppedFiles[0]);
        }
    }

    function removeImage(id: string) {
        setImages((current) => {
            const item = current.find((img) => img.id === id);
            if (item) URL.revokeObjectURL(item.preview);
            return current.filter((img) => img.id !== id);
        });
    }

    function moveImageUp(index: number) {
        if (index <= 0) return;
        setImages((current) => {
            const next = [...current];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    }

    function moveImageDown(index: number) {
        if (index >= images.length - 1) return;
        setImages((current) => {
            const next = [...current];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return next;
        });
    }

    function removeDocument() {
        setDocumentFile(null);
        setFileName("smartscan-document");
        setMessage(null);
    }

    function clearAll() {
        images.forEach((item) => URL.revokeObjectURL(item.preview));
        setImages([]);
        setDocumentFile(null);
        setFileName("smartscan-document");
        setMessage(null);
    }

    function changeMode(newMode: Mode) {
        setMode(newMode);
        setMessage(null);
    }

    function getPdfFileName() {
        const name = fileName.trim() || "smartscan-document";
        return `${name.replace(/\.pdf$/i, "")}.pdf`;
    }

    async function handleConvert() {
        if (mode === "images" && !images.length) {
            setMessage({ type: "error", text: "Please add at least one image." });
            return;
        }

        if (mode === "document" && !documentFile) {
            setMessage({ type: "error", text: "Please upload a document." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("type", mode);
            formData.append("pageSize", pageSize);
            formData.append("margin", String(margin));

            if (mode === "images") {
                images.forEach((item) => {
                    formData.append("files", item.file);
                });
            } else if (documentFile) {
                formData.append("file", documentFile);
            }

            const response = await fetch("/api/convert-to-pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw await createApiError(response, "PDF conversion failed.");
            }

            const blob = await response.blob();
            downloadBlob(blob, getPdfFileName());

            setMessage({
                type: "success",
                text: mode === "images" ? "PDF generated successfully!" : "Document converted to PDF!",
            });
        } catch (error: any) {
            console.error("Conversion failed:", error);
            setMessage({
                type: "error",
                text: error?.message || "Failed to create PDF. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
                {/* Back Button */}
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
                <header className="mx-auto max-w-2xl text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm">
                        <PdfIcon />
                    </div>
                    <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
                        Convert to PDF
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                        Combine images into a clean document or convert Word, Excel, and PowerPoint files to PDF.
                    </p>
                </header>

                {/* Status Message */}
                {message && (
                    <div
                        role="status"
                        className={`mx-auto mt-6 flex w-full max-w-3xl items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm transition-all ${message.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                            }`}
                    >
                        {message.type === "success" ? <CheckIcon /> : <AlertIcon />}
                        <span className="min-w-0 break-words">{message.text}</span>
                    </div>
                )}

                {/* Mode Selector */}
                <div className="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={() => changeMode("images")}
                            className={`min-h-[46px] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition ${mode === "images"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                }`}
                        >
                            Images → PDF
                        </button>
                        <button
                            type="button"
                            onClick={() => changeMode("document")}
                            className={`min-h-[46px] rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition ${mode === "document"
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                }`}
                        >
                            Word / Office → PDF
                        </button>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="mt-8 grid w-full grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">

                    {/* Left Column: File Upload Area */}
                    <section
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`min-w-0 rounded-3xl border bg-white p-5 shadow-sm dark:bg-slate-900/50 sm:p-7 transition-colors ${isDragging
                                ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-500/5"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                    >
                        {mode === "images" ? (
                            <ImageMode
                                images={images}
                                inputRef={imageInputRef}
                                onOpenPicker={openImagePicker}
                                onSelect={handleImages}
                                onRemove={removeImage}
                                onMoveUp={moveImageUp}
                                onMoveDown={moveImageDown}
                            />
                        ) : (
                            <DocumentMode
                                file={documentFile}
                                inputRef={documentInputRef}
                                onOpenPicker={openDocumentPicker}
                                onSelect={handleDocument}
                                onRemove={removeDocument}
                            />
                        )}
                    </section>

                    {/* Right Column: Sticky Settings Panel */}
                    <aside className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-7 lg:sticky lg:top-24">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                            PDF Settings
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Configure output size and margins.
                        </p>

                        {/* File Name */}
                        <div className="mt-5">
                            <label htmlFor="pdf-file-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Output File Name
                            </label>
                            <div className="flex min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950">
                                <input
                                    id="pdf-file-name"
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm outline-none"
                                    placeholder="document"
                                />
                                <span className="flex shrink-0 items-center border-l border-slate-200 px-3 text-xs text-slate-400 dark:border-slate-700">
                                    .pdf
                                </span>
                            </div>
                        </div>

                        {/* Image Settings */}
                        {mode === "images" && (
                            <>
                                <div className="mt-5">
                                    <label htmlFor="page-size" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Page Standard
                                    </label>
                                    <select
                                        id="page-size"
                                        value={pageSize}
                                        onChange={(e) => setPageSize(e.target.value as "a4" | "letter")}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
                                    >
                                        <option value="a4">A4 (210 × 297 mm)</option>
                                        <option value="letter">US Letter (8.5 × 11 in)</option>
                                    </select>
                                </div>

                                <div className="mt-5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="pdf-margin" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Page Margins
                                        </label>
                                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                            {margin} mm
                                        </span>
                                    </div>
                                    <input
                                        id="pdf-margin"
                                        type="range"
                                        min="0"
                                        max="30"
                                        step="2"
                                        value={margin}
                                        onChange={(e) => setMargin(Number(e.target.value))}
                                        className="mt-3 w-full accent-indigo-600 cursor-pointer"
                                    />
                                </div>
                            </>
                        )}

                        {/* Convert Button */}
                        <button
                            type="button"
                            onClick={handleConvert}
                            disabled={loading || (mode === "images" ? images.length === 0 : !documentFile)}
                            className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {loading ? (
                                <>
                                    <Spinner />
                                    <span>Generating PDF...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadIcon />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>

                        {/* Clear All */}
                        {(images.length > 0 || documentFile) && (
                            <button
                                type="button"
                                onClick={clearAll}
                                disabled={loading}
                                className="mt-3 min-h-[42px] w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Clear All
                            </button>
                        )}

                        {/* Security Badge */}
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950 text-xs">
                            <ShieldIcon />
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                Files are converted in an isolated sandbox and immediately deleted from server memory.
                            </p>
                        </div>
                    </aside>
                </div>

                {/* Supported Formats Footer */}
                <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Supported Source Formats
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {mode === "images" ? (
                            <>
                                <Tag>JPG</Tag>
                                <Tag>JPEG</Tag>
                                <Tag>PNG</Tag>
                                <Tag>WebP</Tag>
                                <Tag>A4 Standard</Tag>
                                <Tag>US Letter</Tag>
                            </>
                        ) : (
                            <>
                                <Tag>DOCX</Tag>
                                <Tag>DOC</Tag>
                                <Tag>XLSX</Tag>
                                <Tag>XLS</Tag>
                                <Tag>PPTX</Tag>
                                <Tag>PPT</Tag>
                                <Tag>ODT</Tag>
                                <Tag>RTF</Tag>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

function ImageMode({
    images,
    inputRef,
    onOpenPicker,
    onSelect,
    onRemove,
    onMoveUp,
    onMoveDown,
}: {
    images: PdfImage[];
    inputRef: React.RefObject<HTMLInputElement | null>;
    onOpenPicker: () => void;
    onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemove: (id: string) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
}) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Select Images</h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Upload JPG or PNG files. Reorder pages using the arrow buttons.
                    </p>
                </div>
                {images.length > 0 && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                        {images.length} {images.length === 1 ? "page" : "pages"}
                    </span>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={onSelect}
                className="hidden"
            />

            {/* Drop / Click Trigger */}
            <div
                onClick={onOpenPicker}
                className="mt-5 flex min-h-[170px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-500"
            >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
                    <UploadIcon />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Click to browse or drop images here
                </p>
                <p className="mt-1 text-xs text-slate-400">JPG, PNG, WebP supported</p>
            </div>

            {/* Image List */}
            {images.length > 0 && (
                <div className="mt-6 space-y-2.5">
                    {images.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950"
                        >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {index + 1}
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.preview}
                                alt={item.file.name}
                                className="h-12 w-12 shrink-0 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {item.file.name}
                                </p>
                                <p className="text-[11px] text-slate-400">{formatFileSize(item.file.size)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onMoveUp(index)}
                                    disabled={index === 0}
                                    className="rounded-lg p-1.5 text-xs text-slate-400 hover:bg-slate-200 disabled:opacity-20 dark:hover:bg-slate-800"
                                    title="Move up"
                                >
                                    ▲
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onMoveDown(index)}
                                    disabled={index === images.length - 1}
                                    className="rounded-lg p-1.5 text-xs text-slate-400 hover:bg-slate-200 disabled:opacity-20 dark:hover:bg-slate-800"
                                    title="Move down"
                                >
                                    ▼
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRemove(item.id)}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                                    title="Remove"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={onOpenPicker}
                        className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <PlusIcon />
                        <span>Add More Pages</span>
                    </button>
                </div>
            )}
        </>
    );
}

function DocumentMode({
    file,
    inputRef,
    onOpenPicker,
    onSelect,
    onRemove,
}: {
    file: File | null;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onOpenPicker: () => void;
    onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}) {
    return (
        <>
            <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Upload Document</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Upload Word (.docx), Excel (.xlsx), or PowerPoint (.pptx) documents.
                </p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={DOCUMENT_ACCEPT}
                onChange={onSelect}
                className="hidden"
            />

            {!file ? (
                <div
                    onClick={onOpenPicker}
                    className="mt-5 flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-500"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
                        <DocumentIcon />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Click or drag document here
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Supports DOCX, DOC, XLSX, PPTX, RTF, ODT</p>
                </div>
            ) : (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
                            <DocumentIcon />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {file.name}
                            </p>
                            <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onRemove}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                            aria-label="Remove document"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onOpenPicker}
                        className="mt-4 min-h-[40px] w-full rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 transition hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                        Choose Different Document
                    </button>
                </div>
            )}
        </>
    );
}

function Tag({ children }: { children: ReactNode }) {
    return (
        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {children}
        </span>
    );
}

function createFileId(file: File) {
    return [file.name, file.size, file.lastModified, Math.random().toString(36).substring(7)].join("-");
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function createApiError(response: Response, fallback: string) {
    try {
        const data = await response.json();
        return new Error(data.message || data.error || fallback);
    } catch {
        return new Error(fallback);
    }
}

function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

/* =========================================================
   SVG ICONS
========================================================= */

function PdfIcon() {
    return (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h8l4 4v14H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M8 13h2M8 16h5" />
        </svg>
    );
}

function DocumentIcon() {
    return (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h8l4 4v14H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M8 12h5M8 15h7M8 18h4" />
        </svg>
    );
}

function UploadIcon() {
    return (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0 4 4m-4-4L8 8M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" />
        </svg>
    );
}

function DownloadIcon() {
    return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}

function ShieldIcon() {
    return (
        <svg className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3zm-3 9 2 2 4-4" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 4.3 2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z" />
        </svg>
    );
}

function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" className="opacity-25" stroke="currentColor" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}