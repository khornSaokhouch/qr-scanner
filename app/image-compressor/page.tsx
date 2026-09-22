"use client";

import { useRef, useState } from "react";

type ImageItem = {
    id: string;
    file: File;
    preview: string;
    result?: Blob;
    resultUrl?: string;
    resultSize?: number;
};

export default function ImageCompressorPage() {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [images, setImages] = useState<ImageItem[]>([]);
    const [quality, setQuality] = useState(80);
    const [format, setFormat] = useState<
        "image/jpeg" | "image/png" | "image/webp"
    >("image/jpeg");

    const [loading, setLoading] = useState(false);

    function openPicker() {
        inputRef.current?.click();
    }

    function handleFiles(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const selected = Array.from(
            event.target.files ?? []
        );

        if (!selected.length) return;

        const valid = selected.filter((file) =>
            [
                "image/jpeg",
                "image/png",
                "image/webp",
            ].includes(file.type)
        );

        const newImages: ImageItem[] = valid.map(
            (file) => ({
                id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
                file,
                preview: URL.createObjectURL(file),
            })
        );

        setImages((current) => [
            ...current,
            ...newImages,
        ]);

        event.target.value = "";
    }

    function removeImage(id: string) {
        setImages((current) => {
            const item = current.find(
                (image) => image.id === id
            );

            if (item) {
                URL.revokeObjectURL(item.preview);

                if (item.resultUrl) {
                    URL.revokeObjectURL(
                        item.resultUrl
                    );
                }
            }

            return current.filter(
                (image) => image.id !== id
            );
        });
    }

    async function compressImage(
        item: ImageItem
    ): Promise<ImageItem> {
        const image = await loadImage(
            item.file
        );

        const canvas =
            document.createElement("canvas");

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context =
            canvas.getContext("2d");

        if (!context) {
            throw new Error(
                "Unable to process image."
            );
        }

        /*
         * JPEG does not support transparency.
         * Fill background with white.
         */
        if (format === "image/jpeg") {
            context.fillStyle = "#ffffff";
            context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }

        context.drawImage(
            image,
            0,
            0
        );

        const blob =
            await canvasToBlob(
                canvas,
                format,
                quality / 100
            );

        const resultUrl =
            URL.createObjectURL(blob);

        return {
            ...item,
            result: blob,
            resultUrl,
            resultSize: blob.size,
        };
    }

    async function compressAll() {
        if (!images.length) return;

        setLoading(true);

        try {
            const results: ImageItem[] = [];

            for (const item of images) {
                /*
                 * Revoke previous result URL
                 */
                if (item.resultUrl) {
                    URL.revokeObjectURL(
                        item.resultUrl
                    );
                }

                const result =
                    await compressImage(item);

                results.push(result);
            }

            setImages(results);
        } catch (error) {
            console.error(
                "Compression failed:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    function downloadImage(
        item: ImageItem
    ) {
        if (!item.resultUrl) return;

        const extension =
            getExtension(format);

        const name =
            item.file.name.replace(
                /\.[^/.]+$/,
                ""
            );

        downloadUrl(
            item.resultUrl,
            `${name}-compressed.${extension}`
        );
    }

    function downloadAll() {
        images.forEach((item) => {
            if (item.resultUrl) {
                downloadImage(item);
            }
        });
    }

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                {/* Header */}

                <header className="mx-auto max-w-2xl text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <CompressIcon />
                    </div>

                    <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                        Image Compressor
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                        Reduce image file size while keeping
                        good visual quality.
                    </p>

                </header>


                {/* Main */}

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

                    {/* Images */}

                    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-7">

                        <div className="flex items-center justify-between gap-4">

                            <div>
                                <h2 className="text-lg font-semibold">
                                    Images
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Select one or more images.
                                </p>
                            </div>

                            {images.length > 0 && (
                                <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                    {images.length}
                                </span>
                            )}

                        </div>

                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handleFiles}
                            className="hidden"
                        />

                        {images.length === 0 ? (
                            <button
                                type="button"
                                onClick={openPicker}
                                className="mt-6 flex min-h-[240px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-950"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
                                    <UploadIcon />
                                </div>

                                <p className="mt-5 text-sm font-semibold">
                                    Select Images
                                </p>

                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    JPG, PNG or WebP
                                </p>

                                <span className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white">
                                    Choose Images
                                </span>
                            </button>
                        ) : (
                            <>
                                <div className="mt-6 space-y-3">

                                    {images.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800"
                                        >

                                            <img
                                                src={item.preview}
                                                alt={item.file.name}
                                                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                                            />

                                            <div className="min-w-0 flex-1">

                                                <p className="truncate text-sm font-medium">
                                                    {item.file.name}
                                                </p>

                                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">

                                                    <span>
                                                        Original{" "}
                                                        {formatSize(
                                                            item.file.size
                                                        )}
                                                    </span>

                                                    {item.resultSize && (
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                            New{" "}
                                                            {formatSize(
                                                                item.resultSize
                                                            )}
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                            {item.resultUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        downloadImage(
                                                            item
                                                        )
                                                    }
                                                    className="shrink-0 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
                                                >
                                                    Download
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(
                                                        item.id
                                                    )
                                                }
                                                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                                            >
                                                <TrashIcon />
                                            </button>

                                        </div>
                                    ))}

                                </div>

                                <button
                                    type="button"
                                    onClick={openPicker}
                                    className="mt-4 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                                >
                                    + Add More Images
                                </button>

                            </>
                        )}

                    </section>


                    {/* Settings */}

                    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-7 lg:sticky lg:top-24">

                        <h2 className="text-lg font-semibold">
                            Compression
                        </h2>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Choose quality and output format.
                        </p>


                        {/* Quality */}

                        <div className="mt-7">

                            <div className="flex items-center justify-between">

                                <label
                                    htmlFor="quality"
                                    className="text-sm font-medium"
                                >
                                    Quality
                                </label>

                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                    {quality}%
                                </span>

                            </div>

                            <input
                                id="quality"
                                type="range"
                                min="10"
                                max="100"
                                value={quality}
                                onChange={(event) =>
                                    setQuality(
                                        Number(
                                            event.target.value
                                        )
                                    )
                                }
                                className="mt-4 w-full accent-indigo-600"
                            />

                            <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                                <span>Smaller</span>
                                <span>Better quality</span>
                            </div>

                        </div>


                        {/* Format */}

                        <div className="mt-7">

                            <label
                                htmlFor="format"
                                className="mb-2 block text-sm font-medium"
                            >
                                Output Format
                            </label>

                            <select
                                id="format"
                                value={format}
                                onChange={(event) =>
                                    setFormat(
                                        event.target.value as
                                        | "image/jpeg"
                                        | "image/png"
                                        | "image/webp"
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                            >
                                <option value="image/jpeg">
                                    JPG
                                </option>

                                <option value="image/png">
                                    PNG
                                </option>

                                <option value="image/webp">
                                    WebP
                                </option>
                            </select>

                        </div>


                        {/* Compress */}

                        <button
                            type="button"
                            onClick={compressAll}
                            disabled={
                                loading ||
                                images.length === 0
                            }
                            className="mt-7 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            {loading ? (
                                <>
                                    <Spinner />
                                    Compressing...
                                </>
                            ) : (
                                <>
                                    <CompressIcon />
                                    Compress Images
                                </>
                            )}

                        </button>


                        {images.some(
                            (item) => item.resultUrl
                        ) && (
                                <button
                                    type="button"
                                    onClick={downloadAll}
                                    className="mt-3 flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                                >
                                    <DownloadIcon />
                                    Download All
                                </button>
                            )}


                        <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">

                            <ShieldIcon />

                            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                Images are processed locally in
                                your browser. They are not uploaded
                                to SmartScan.
                            </p>

                        </div>

                    </aside>

                </div>

            </div>

        </main>
    );
}


/* =========================================================
   IMAGE RESIZE
========================================================= */

function loadImage(
    file: File
): Promise<HTMLImageElement> {
    return new Promise(
        (resolve, reject) => {
            const url =
                URL.createObjectURL(file);

            const image = new Image();

            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(
                    new Error(
                        "Unable to load image."
                    )
                );
            };

            image.src = url;
        }
    );
}


function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
): Promise<Blob> {
    return new Promise(
        (resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(
                            new Error(
                                "Unable to create image."
                            )
                        );
                        return;
                    }

                    resolve(blob);
                },
                type,
                quality
            );
        }
    );
}


function getExtension(
    format: string
) {
    if (format === "image/png") {
        return "png";
    }

    if (format === "image/webp") {
        return "webp";
    }

    return "jpg";
}


function formatSize(
    bytes: number
) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes /
        1024 /
        1024
    ).toFixed(2)} MB`;
}


function downloadUrl(
    url: string,
    filename: string
) {
    const link =
        document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();
}


/* =========================================================
   ICONS
========================================================= */

function UploadIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16V4m0 0 4 4m-4-4L8 8"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
            />
        </svg>
    );
}


function DownloadIcon() {
    return (
        <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
            />
        </svg>
    );
}


function TrashIcon() {
    return (
        <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
            />
        </svg>
    );
}


function CompressIcon() {
    return (
        <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 3H5a2 2 0 00-2 2v3m13-5h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3m13 5h3a2 2 0 002-2v-3"
            />

            <path
                strokeLinecap="round"
                d="M8 12h8"
            />
        </svg>
    );
}


function ShieldIcon() {
    return (
        <svg
            className="h-5 w-5 shrink-0 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"
            />
        </svg>
    );
}


function Spinner() {
    return (
        <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                className="opacity-25"
                stroke="currentColor"
                strokeWidth="3"
            />

            <path
                d="M21 12a9 9 0 0 1-9 9"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    );
}