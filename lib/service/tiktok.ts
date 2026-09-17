// lib/tiktok.ts
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface VideoFormat {
    format_id: string;
    ext: string;
    height?: number;
    url: string;
    format_note: string;
    filesize?: number;
    vcodec?: string;
    acodec?: string;
}

export interface VideoMetadata {
    title: string;
    author: string;
    authorAvatar?: string;
    thumbnail: string;
    duration: string;
    videoUrl: string;
    audioUrl?: string;
    formats: VideoFormat[];
    videoId: string;
    size?: string;
    images?: string[]; // In case the link is a photo carousel
}

export async function extractTikTok(rawUrl: string): Promise<VideoMetadata> {
    const cleanUrl = rawUrl.trim();

    // 1. Fetch from TikWM API
    const response = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`,
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
            next: { revalidate: 0 },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to contact TikTok extraction server.");
    }

    const result = await response.json();

    if (result.code === 0 && result.data) {
        const formats: VideoFormat[] = [];
        const data = result.data;

        // Ensure relative URLs are resolved to absolute URLs
        const resolveUrl = (link?: string) => {
            if (!link) return "";
            if (link.startsWith("http")) return link;
            return `https://www.tikwm.com${link}`;
        };

        // HD No Watermark
        if (data.hdplay) {
            formats.push({
                format_id: "hd",
                ext: "mp4",
                height: 1080,
                url: resolveUrl(data.hdplay),
                format_note: "HD No Watermark",
                filesize: data.hd_size,
                vcodec: "h264",
                acodec: "aac",
            });
        }

        // Standard No Watermark
        if (data.play) {
            formats.push({
                format_id: "standard",
                ext: "mp4",
                height: 720,
                url: resolveUrl(data.play),
                format_note: "Standard No Watermark",
                filesize: data.size,
                vcodec: "h264",
                acodec: "aac",
            });
        }

        // Watermarked version
        if (data.wmplay) {
            formats.push({
                format_id: "watermarked",
                ext: "mp4",
                height: 720,
                url: resolveUrl(data.wmplay),
                format_note: "Standard (Watermarked)",
                vcodec: "h264",
                acodec: "aac",
            });
        }

        // Audio Only
        if (data.music) {
            formats.push({
                format_id: "audio",
                ext: "mp3",
                height: 0,
                url: resolveUrl(data.music),
                format_note: "Audio Only (MP3)",
                acodec: "mp3",
                vcodec: "none",
            });
        }

        // Optional: Safe yt-dlp fallback (uses execFile to prevent RCE)
        try {
            const { stdout } = await execFileAsync("yt-dlp", [
                "--no-warnings",
                "--no-playlist",
                "-j",
                cleanUrl,
            ], { timeout: 8000 });

            if (stdout) {
                const ytdlInfo = JSON.parse(stdout);
                if (Array.isArray(ytdlInfo.formats)) {
                    ytdlInfo.formats.forEach((f: any) => {
                        if (f.vcodec !== "none" && f.url) {
                            const exists = formats.some((item) => item.height === f.height);
                            if (!exists && f.height) {
                                formats.push({
                                    format_id: f.format_id || "ytdl",
                                    ext: f.ext || "mp4",
                                    height: f.height,
                                    url: f.url,
                                    format_note: `${f.height}p (Native)`,
                                    filesize: f.filesize,
                                });
                            }
                        }
                    });
                }
            }
        } catch {
            // yt-dlp is optional; silently fallback to TikWM results
        }

        formats.sort((a, b) => (b.height || 0) - (a.height || 0));

        const durationSeconds = Number(data.duration) || 0;
        const durationFormatted = `${Math.floor(durationSeconds / 60)}:${(durationSeconds % 60)
            .toString()
            .padStart(2, "0")}`;

        return {
            title: data.title || "TikTok Video",
            author: `@${data.author?.unique_id || data.author?.nickname || "creator"}`,
            authorAvatar: data.author?.avatar,
            thumbnail: resolveUrl(data.cover || data.origin_cover),
            duration: durationFormatted,
            videoUrl: resolveUrl(data.hdplay || data.play),
            audioUrl: resolveUrl(data.music),
            formats,
            videoId: data.id || String(Date.now()),
            size: data.hd_size
                ? `${(data.hd_size / (1024 * 1024)).toFixed(1)} MB`
                : data.size
                    ? `${(data.size / (1024 * 1024)).toFixed(1)} MB`
                    : undefined,
            images: Array.isArray(data.images) ? data.images.map(resolveUrl) : undefined,
        };
    } else {
        throw new Error(result.msg || "Invalid TikTok link or video is private.");
    }
}