import { VideoMetadata } from "./types";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function extractYouTube(url: string): Promise<VideoMetadata> {
    // 1. Strict URL Sanitization & ID Extraction
    let videoId = "";
    if (url.includes("v=")) {
        videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("embed/")) {
        videoId = url.split("embed/")[1]?.split(/[?#]/)[0];
    } else if (url.includes("shorts/")) {
        videoId = url.split("shorts/")[1]?.split(/[?#]/)[0];
    }

    if (!videoId) {
        throw new Error("Invalid YouTube URL. Could not detect video ID.");
    }

    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        console.log(`YouTube Extraction - Calling yt-dlp for: ${normalizedUrl}`);

        // Call yt-dlp with --json to get all format info
        const { stdout, stderr } = await execAsync(`yt-dlp -j "${normalizedUrl}"`);

        if (stderr && !stdout) {
            console.warn("yt-dlp stderr:", stderr);
        }

        const info = JSON.parse(stdout);

        // 1. Find best progressive format (video + audio in one file)
        // Adaptive formats (separate V/A) are harder to handle without server-side merging
        const progressiveFormats = info.formats
            .filter((f: any) => f.vcodec !== "none" && f.acodec !== "none" && f.ext === "mp4")
            .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

        const bestProgressive = progressiveFormats[0];

        // 2. Find best audio format
        const audioFormats = info.formats
            .filter((f: any) => f.vcodec === "none" && f.acodec !== "none")
            .sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0));

        const bestAudio = audioFormats[0];

        // Format duration
        const lengthSeconds = info.duration || 0;
        const minutes = Math.floor(lengthSeconds / 60);
        const seconds = lengthSeconds % 60;
        const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        // Calculate size
        let sizeStr = "15.0 MB";
        if (bestProgressive && bestProgressive.filesize) {
            sizeStr = `${(bestProgressive.filesize / (1024 * 1024)).toFixed(1)} MB`;
        } else if (bestProgressive && bestProgressive.tbr && lengthSeconds) {
            // Estimated size from bitrate
            const sizeMB = (bestProgressive.tbr * 1024 / 8 * lengthSeconds) / (1024 * 1024);
            sizeStr = `${sizeMB.toFixed(1)} MB`;
        }

        return {
            title: info.title || "YouTube Video",
            author: info.uploader || "YouTube",
            thumbnail: info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration,
            videoId,
            videoUrl: bestProgressive?.url || info.url || normalizedUrl,
            audioUrl: bestAudio?.url || undefined,
            formats: info.formats
                .filter((f: any) => f.vcodec !== "none" && (f.ext === "mp4" || f.ext === "webm"))
                .map((f: any) => ({
                    url: f.url,
                    ext: f.ext,
                    height: f.height,
                    width: f.width,
                    filesize: f.filesize,
                    format_id: f.format_id,
                    format_note: `${f.height}p ${f.acodec === 'none' ? '(No Audio)' : ''}`,
                    vcodec: f.vcodec,
                    acodec: f.acodec,
                    hasVideo: f.vcodec !== "none",
                    hasAudio: f.acodec !== "none",
                }))
                // Filter unique by height, preferring the one with audio if available
                .reduce((acc: any[], current: any) => {
                    const x = acc.find(item => item.height === current.height);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        // If already exists, replace only if current has audio and previous didn't
                        if (current.acodec !== 'none' && x.acodec === 'none') {
                            return acc.filter(item => item.height !== current.height).concat([current]);
                        }
                        return acc;
                    }
                }, [])
                .sort((a: any, b: any) => (b.height || 0) - (a.height || 0)),
            size: sizeStr
        };

    } catch (error: any) {
        console.error("YouTube yt-dlp Extraction Error:", error);

        // Fallback if yt-dlp fails (e.g. not installed or blocked)
        // We can still try the old mirror-based approach as a secondary fallback if needed,
        // but for now let's just throw or provide the basic fallback info.

        return {
            title: "YouTube Video",
            author: "YouTube",
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: "0:00",
            videoUrl: normalizedUrl,
            audioUrl: undefined,
            size: "Pending",
            error: "Local extraction failed. This might be due to YouTube blocks. Please try again soon."
        };
    }
}