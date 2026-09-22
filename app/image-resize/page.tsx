"use client";

import { useEffect, useRef, useState } from "react";

type ResizePreset = {
    name: string;
    width: number;
    height: number;
};

const PRESETS: ResizePreset[] = [
    {
        name: "Original",
        width: 0,
        height: 0,
    },
    {
        name: "HD",
        width: 1280,
        height: 720,
    },
    {
        name: "Full HD",
        width: 1920,
        height: 1080,
    },
    {
        name: "Square",
        width: 1080,
        height: 1080,
    },
    {
        name: "Instagram",
        width: 1080,
        height: 1350,
    },
    {
        name: "Story",
        width: 1080,
        height: 1920,
    },
];

export default function ImageResizePage() {
    const inputRef =
        useRef<HTMLInputElement | null>(null);

    const [file, setFile] =
        useState<File | null>(null);

    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);

    const [resultUrl, setResultUrl] =
        useState<string | null>(null);

    const [resultBlob, setResultBlob] =
        useState<Blob | null>(null);

    const [originalWidth, setOriginalWidth] =
        useState(0);

    const [originalHeight, setOriginalHeight] =
        useState(0);

    const [width, setWidth] =
        useState(0);

    const [height, setHeight] =
        useState(0);

    const [keepRatio, setKeepRatio] =
        useState(true);

    const [format, setFormat] = useState<
        "image/jpeg" | "image/png" | "image/webp"
    >("image/jpeg");

    const [quality, setQuality] =
        useState(90);

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState<{
            type: "success" | "error";
            text: string;
        } | null>(null);


    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            if (resultUrl) {
                URL.revokeObjectURL(resultUrl);
            }
        };
    }, [previewUrl, resultUrl]);


    /*
     * =========================================================
     * OPEN PICKER
     * =========================================================
     */

    function openPicker() {
        inputRef.current?.click();
    }


    /*
     * =========================================================
     * SELECT IMAGE
     * =========================================================
     */

    function handleFile(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const selected =
            event.target.files?.[0];

        if (!selected) {
            return;
        }

        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp",
            ].includes(selected.type)
        ) {
            setMessage({
                type: "error",
                text:
                    "Please select a JPG, PNG or WebP image.",
            });

            event.target.value = "";

            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(
                previewUrl
            );
        }

        if (resultUrl) {
            URL.revokeObjectURL(
                resultUrl
            );
        }

        const url =
            URL.createObjectURL(selected);

        const image = new Image();

        image.onload = () => {
            setFile(selected);
            setPreviewUrl(url);

            setResultUrl(null);
            setResultBlob(null);

            setOriginalWidth(
                image.naturalWidth
            );

            setOriginalHeight(
                image.naturalHeight
            );

            setWidth(
                image.naturalWidth
            );

            setHeight(
                image.naturalHeight
            );

            setMessage(null);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);

            setMessage({
                type: "error",
                text:
                    "Unable to read this image.",
            });
        };

        image.src = url;

        event.target.value = "";
    }


    /*
     * =========================================================
     * WIDTH CHANGE
     * =========================================================
     */

    function handleWidthChange(
        value: number
    ) {
        setWidth(value);

        if (
            keepRatio &&
            originalWidth > 0 &&
            originalHeight > 0
        ) {
            const newHeight =
                Math.round(
                    (value *
                        originalHeight) /
                    originalWidth
                );

            setHeight(newHeight);
        }
    }


    /*
     * =========================================================
     * HEIGHT CHANGE
     * =========================================================
     */

    function handleHeightChange(
        value: number
    ) {
        setHeight(value);

        if (
            keepRatio &&
            originalWidth > 0 &&
            originalHeight > 0
        ) {
            const newWidth =
                Math.round(
                    (value *
                        originalWidth) /
                    originalHeight
                );

            setWidth(newWidth);
        }
    }


    /*
     * =========================================================
     * PRESET
     * =========================================================
     */

    function applyPreset(
        preset: ResizePreset
    ) {
        if (
            preset.name === "Original"
        ) {
            setWidth(originalWidth);
            setHeight(originalHeight);

            return;
        }

        setWidth(preset.width);
        setHeight(preset.height);

        /*
         * Presets can intentionally
         * change aspect ratio.
         */
        setKeepRatio(false);
    }


    /*
     * =========================================================
     * RESIZE IMAGE
     * =========================================================
     */

    async function resizeImage() {
        if (!file) {
            setMessage({
                type: "error",
                text:
                    "Please select an image.",
            });

            return;
        }

        if (
            width <= 0 ||
            height <= 0
        ) {
            setMessage({
                type: "error",
                text:
                    "Width and height must be greater than zero.",
            });

            return;
        }

        if (
            width > 10000 ||
            height > 10000
        ) {
            setMessage({
                type: "error",
                text:
                    "Maximum image dimension is 10,000 × 10,000 pixels.",
            });

            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const image =
                await loadImage(file);

            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width = width;
            canvas.height = height;

            const context =
                canvas.getContext("2d");

            if (!context) {
                throw new Error(
                    "Unable to create canvas."
                );
            }

            /*
             * JPEG doesn't support transparency.
             */
            if (
                format === "image/jpeg"
            ) {
                context.fillStyle =
                    "#ffffff";

                context.fillRect(
                    0,
                    0,
                    width,
                    height
                );
            }

            /*
             * Better image quality.
             */
            context.imageSmoothingEnabled =
                true;

            context.imageSmoothingQuality =
                "high";

            context.drawImage(
                image,
                0,
                0,
                width,
                height
            );

            const blob =
                await canvasToBlob(
                    canvas,
                    format,
                    quality / 100
                );

            if (resultUrl) {
                URL.revokeObjectURL(
                    resultUrl
                );
            }

            const newResultUrl =
                URL.createObjectURL(blob);

            setResultBlob(blob);
            setResultUrl(newResultUrl);

            setMessage({
                type: "success",
                text:
                    `Image resized to ${width} × ${height}px.`,
            });
        } catch (error) {
            console.error(
                "Image resize failed:",
                error
            );

            setMessage({
                type: "error",
                text:
                    "Unable to resize the image.",
            });
        } finally {
            setLoading(false);
        }
    }


    /*
     * =========================================================
     * DOWNLOAD
     * =========================================================
     */

    function downloadImage() {
        if (!resultUrl || !file) {
            return;
        }

        const extension =
            getExtension(format);

        const originalName =
            file.name.replace(
                /\.[^/.]+$/,
                ""
            );

        const filename =
            `${originalName}-${width}x${height}.${extension}`;

        const link =
            document.createElement("a");

        link.href = resultUrl;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        link.remove();
    }


    /*
     * =========================================================
     * REMOVE
     * =========================================================
     */

    function removeImage() {
        if (previewUrl) {
            URL.revokeObjectURL(
                previewUrl
            );
        }

        if (resultUrl) {
            URL.revokeObjectURL(
                resultUrl
            );
        }

        setFile(null);
        setPreviewUrl(null);
        setResultUrl(null);
        setResultBlob(null);

        setOriginalWidth(0);
        setOriginalHeight(0);

        setWidth(0);
        setHeight(0);

        setMessage(null);
    }


    return (
        <main className="min-h-[calc(100vh-4rem)] w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">

                {/* ==================================================
            HEADER
        ================================================== */}

                <header className="mx-auto max-w-2xl text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <ResizeIcon />
                    </div>

                    <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                        Image Resize
                    </h1>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                        Resize your images to exact dimensions
                        without uploading them to SmartScan.
                    </p>

                </header>


                {/* ==================================================
            MESSAGE
        ================================================== */}

                {message && (
                    <div
                        role="status"
                        className={`mx-auto mt-6 flex w-full max-w-3xl items-start gap-3 rounded-xl border px-4 py-3 text-sm ${message.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                            }`}
                    >
                        {message.type ===
                            "success" ? (
                            <CheckIcon />
                        ) : (
                            <AlertIcon />
                        )}

                        <span className="min-w-0 break-words">
                            {message.text}
                        </span>
                    </div>
                )}


                {/* ==================================================
            MAIN
        ================================================== */}

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">


                    {/* ==================================================
              LEFT
          ================================================== */}

                    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-7 lg:p-8">

                        <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">

                                <h2 className="text-lg font-semibold">
                                    Image
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Upload one image to resize.
                                </p>

                            </div>

                            {file && (
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                                >
                                    Remove
                                </button>
                            )}

                        </div>


                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFile}
                            className="hidden"
                        />


                        {!file ? (

                            <button
                                type="button"
                                onClick={openPicker}
                                className="mt-6 flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-500"
                            >

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
                                    <UploadIcon />
                                </div>

                                <p className="mt-5 text-sm font-semibold">
                                    Select an image
                                </p>

                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    JPG, PNG or WebP
                                </p>

                                <span className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white">
                                    Choose Image
                                </span>

                            </button>

                        ) : (

                            <div className="mt-6">

                                {/* Preview */}

                                <div className="flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950">

                                    <img
                                        src={
                                            resultUrl ??
                                            previewUrl ??
                                            ""
                                        }
                                        alt="Image preview"
                                        className="max-h-[500px] max-w-full object-contain"
                                    />

                                </div>


                                {/* Original information */}

                                <div className="mt-4 grid grid-cols-2 gap-3">

                                    <InfoBox
                                        label="Original"
                                        value={`${originalWidth} × ${originalHeight}px`}
                                    />

                                    <InfoBox
                                        label="New Size"
                                        value={`${width} × ${height}px`}
                                    />

                                </div>


                                {resultBlob && (
                                    <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">

                                        Output:
                                        {" "}
                                        {formatSize(
                                            resultBlob.size
                                        )}

                                    </div>
                                )}

                            </div>

                        )}

                    </section>


                    {/* ==================================================
              SETTINGS
          ================================================== */}

                    <aside className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-7 lg:sticky lg:top-24">

                        <h2 className="text-lg font-semibold">
                            Resize Settings
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                            Set the exact output dimensions.
                        </p>


                        {/* ==================================================
                DIMENSIONS
            ================================================== */}

                        <div className="mt-6 grid grid-cols-2 gap-3">

                            <DimensionInput
                                label="Width"
                                value={width}
                                onChange={
                                    handleWidthChange
                                }
                            />

                            <DimensionInput
                                label="Height"
                                value={height}
                                onChange={
                                    handleHeightChange
                                }
                            />

                        </div>


                        {/* Keep ratio */}

                        <label className="mt-4 flex cursor-pointer items-center gap-3">

                            <input
                                type="checkbox"
                                checked={keepRatio}
                                onChange={(event) =>
                                    setKeepRatio(
                                        event.target.checked
                                    )
                                }
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
                            />

                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                Keep aspect ratio
                            </span>

                        </label>


                        {/* ==================================================
                PRESETS
            ================================================== */}

                        <div className="mt-7">

                            <p className="text-sm font-medium">
                                Presets
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2">

                                {PRESETS.map(
                                    (preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() =>
                                                applyPreset(
                                                    preset
                                                )
                                            }
                                            className="min-h-[42px] rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                                        >
                                            {preset.name}

                                            {preset.width >
                                                0 && (
                                                    <span className="ml-1 hidden text-[10px] font-normal opacity-60 sm:inline">
                                                        {preset.width}×
                                                        {preset.height}
                                                    </span>
                                                )}
                                        </button>
                                    )
                                )}

                            </div>

                        </div>


                        {/* ==================================================
                FORMAT
            ================================================== */}

                        <div className="mt-7">

                            <label
                                htmlFor="output-format"
                                className="mb-2 block text-sm font-medium"
                            >
                                Output Format
                            </label>

                            <select
                                id="output-format"
                                value={format}
                                onChange={(event) =>
                                    setFormat(
                                        event.target.value as
                                        | "image/jpeg"
                                        | "image/png"
                                        | "image/webp"
                                    )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
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


                        {/* ==================================================
                QUALITY
            ================================================== */}

                        {format !==
                            "image/png" && (
                                <div className="mt-6">

                                    <div className="flex items-center justify-between">

                                        <label
                                            htmlFor="quality"
                                            className="text-sm font-medium"
                                        >
                                            Quality
                                        </label>

                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
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

                                </div>
                            )}


                        {/* ==================================================
                RESIZE BUTTON
            ================================================== */}

                        <button
                            type="button"
                            onClick={resizeImage}
                            disabled={
                                loading ||
                                !file
                            }
                            className="mt-7 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                        >

                            {loading ? (
                                <>
                                    <Spinner />
                                    Resizing...
                                </>
                            ) : (
                                <>
                                    <ResizeIcon />
                                    Resize Image
                                </>
                            )}

                        </button>


                        {/* ==================================================
                DOWNLOAD
            ================================================== */}

                        {resultUrl && (
                            <button
                                type="button"
                                onClick={downloadImage}
                                className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                <DownloadIcon />
                                Download Image
                            </button>
                        )}


                        {/* ==================================================
                PRIVACY
            ================================================== */}

                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">

                            <ShieldIcon />

                            <div>

                                <h3 className="text-xs font-semibold">
                                    Private by design
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    Your image is resized directly
                                    in your browser and is not
                                    uploaded to SmartScan.
                                </p>

                            </div>

                        </div>

                    </aside>

                </div>


                {/* ==================================================
            INFO
        ================================================== */}

                <section className="mx-auto mt-6 max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50 sm:p-7">

                    <h2 className="text-sm font-semibold">
                        Image Resize
                    </h2>

                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        SmartScan lets you resize images to
                        exact pixel dimensions. You can keep
                        the original aspect ratio or enter
                        custom width and height values.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">

                        <Tag>JPG</Tag>
                        <Tag>PNG</Tag>
                        <Tag>WebP</Tag>
                        <Tag>Custom Size</Tag>
                        <Tag>HD</Tag>
                        <Tag>Full HD</Tag>
                        <Tag>Square</Tag>

                    </div>

                </section>

            </div>

        </main>
    );
}


/* =========================================================
   COMPONENTS
========================================================= */

function DimensionInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <div>

            <label className="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400">
                {label}
            </label>

            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950">

                <input
                    type="number"
                    min="1"
                    max="10000"
                    value={value || ""}
                    onChange={(event) =>
                        onChange(
                            Number(
                                event.target.value
                            )
                        )
                    }
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                />

                <span className="px-3 text-xs text-slate-400">
                    px
                </span>

            </div>

        </div>
    );
}


function InfoBox({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">

            <p className="text-[11px] text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold">
                {value}
            </p>

        </div>
    );
}


function Tag({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {children}
        </span>
    );
}


/* =========================================================
   HELPERS
========================================================= */

function loadImage(
    file: File
): Promise<HTMLImageElement> {
    return new Promise(
        (resolve, reject) => {
            const url =
                URL.createObjectURL(file);

            const image =
                new Image();

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

    if (
        bytes <
        1024 * 1024
    ) {
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


/* =========================================================
   ICONS
========================================================= */

function ResizeIcon() {
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
                d="M4 9V5a1 1 0 011-1h4M15 4h3a2 2 0 012 2v3M20 15v3a2 2 0 01-2 2h-3M9 20H6a2 2 0 01-2-2v-3"
            />

            <path
                strokeLinecap="round"
                d="M8 8l8 8M16 8l-8 8"
            />
        </svg>
    );
}


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

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12 2 2 4-4"
            />
        </svg>
    );
}


function CheckIcon() {
    return (
        <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m5 12 4 4L19 6"
            />
        </svg>
    );
}


function AlertIcon() {
    return (
        <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4M12 17h.01"
            />

            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.3 4.3 2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z"
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