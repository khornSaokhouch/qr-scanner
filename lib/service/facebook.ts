// lib/service/facebook.ts
import { VideoMetadata, VideoFormat } from "./types";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

function formatSeconds(sec: number): string {
    if (!sec || isNaN(sec)) return "0:00";
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function extractFacebook(rawUrl: string): Promise<VideoMetadata> {
    const url = rawUrl.trim();

    // 1. Extract Facebook Video/Reel ID
    const idMatch =
        url.match(/(?:reel|videos|watch|share\/r|share\/v)\/(\d+)/i) ||
        url.match(/[?&]v=(\d+)/i);
    const videoId = idMatch ? idMatch[1] : String(Date.now());

    // Normalize URL
    const normalizedUrl = idMatch
        ? `https://www.facebook.com/reel/${videoId}`
        : url;

    // ==========================================
    // METHOD 1: yt-dlp (Primary format extractor)
    // ==========================================
    try {
        console.log(`Facebook Extraction - Calling yt-dlp for: ${normalizedUrl}`);

        const { stdout } = await execFileAsync("yt-dlp", [
            "--no-warnings",
            "--no-playlist",
            "-j",
            normalizedUrl,
        ], { timeout: 10000 });

        if (stdout) {
            const info = JSON.parse(stdout);

            // Collect all unique video formats (HD, SD, etc.)
            const formats: VideoFormat[] = (info.formats || [])
                .filter((f: any) => f.url && f.vcodec !== "none")
                .map((f: any) => ({
                    format_id: f.format_id || "mp4",
                    ext: "mp4",
                    height: f.height,
                    url: f.url,
                    format_note: f.height
                        ? `${f.height}p ${f.height >= 720 ? "HD" : "SD"} (MP4)`
                        : (f.format_note || "Standard Video (MP4)"),
                    filesize: f.filesize,
                }))
                .filter((v: any, idx: number, arr: any[]) =>
                    v.height && idx === arr.findIndex((t: any) => t.height === v.height)
                )
                .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

            // Select best progressive format or fallback URL
            const bestUrl = formats[0]?.url || info.url;

            if (bestUrl) {
                const duration = info.duration
                    ? formatSeconds(info.duration)
                    : info.duration_string || "0:00";

                return {
                    title: info.title || info.description?.slice(0, 80) || "Facebook Reel",
                    author: info.uploader ? `@${info.uploader}` : "@facebook_creator",
                    thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || "",
                    duration,
                    videoUrl: bestUrl,
                    formats: formats.length > 0 ? formats : [
                        {
                            format_id: "best",
                            ext: "mp4",
                            url: bestUrl,
                            format_note: "High Quality (MP4)",
                        },
                    ],
                    videoId,
                    size: formats[0]?.filesize
                        ? `${(formats[0].filesize / (1024 * 1024)).toFixed(1)} MB`
                        : "HD MP4",
                };
            }
        }
    } catch (err: any) {
        console.warn("Facebook yt-dlp error, falling back to direct scrapers:", err.message);
    }

    // ==========================================
    // METHOD 2: Direct Facebook Native Stream Parser
    // ==========================================
    try {
        const crawlRes = await fetch(normalizedUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Fetch-Site": "none",
            },
            next: { revalidate: 0 },
        });

        if (crawlRes.ok) {
            const html = await crawlRes.text();

            // Extract HD & SD stream URLs directly from Facebook's page payload
            const hdMatch =
                html.match(/["']playable_url_quality_hd["']:\s*["']([^"']+)["']/) ||
                html.match(/["']browser_native_hd_url["']:\s*["']([^"']+)["']/);

            const sdMatch =
                html.match(/["']playable_url["']:\s*["']([^"']+)["']/) ||
                html.match(/["']browser_native_sd_url["']:\s*["']([^"']+)["']/) ||
                html.match(/<meta\s+property="og:video(?::secure_url)?"\s+content="([^"]+)"/i);

            const thumbMatch =
                html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                html.match(/["']preferred_thumbnail["']:\s*\{["']image["']:\s*\{["']uri["']:\s*["']([^"']+)["']/);

            const titleMatch =
                html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                html.match(/<title>([^<]+)<\/title>/i);

            const formats: VideoFormat[] = [];

            if (hdMatch && hdMatch[1]) {
                const hdUrl = JSON.parse(`"${hdMatch[1]}"`);
                formats.push({
                    format_id: "hd",
                    ext: "mp4",
                    height: 720,
                    url: hdUrl,
                    format_note: "HD 720p (MP4)",
                });
            }

            if (sdMatch && sdMatch[1]) {
                const sdUrl = sdMatch[1].startsWith("http")
                    ? sdMatch[1].replace(/&amp;/g, "&")
                    : JSON.parse(`"${sdMatch[1]}"`);

                formats.push({
                    format_id: "sd",
                    ext: "mp4",
                    height: 480,
                    url: sdUrl,
                    format_note: "SD 480p (MP4)",
                });
            }

            if (formats.length > 0) {
                const thumbnail = thumbMatch
                    ? (thumbMatch[1].startsWith("http") ? thumbMatch[1].replace(/&amp;/g, "&") : JSON.parse(`"${thumbMatch[1]}"`))
                    : "";

                const title = titleMatch ? titleMatch[1].replace(/&amp;/g, "&").slice(0, 100) : "Facebook Video";

                return {
                    title,
                    author: "@facebook_creator",
                    thumbnail,
                    duration: "0:00", // Will be auto-resolved on client side via onloadedmetadata
                    videoUrl: formats[0].url,
                    formats,
                    videoId,
                    size: "Direct MP4",
                };
            }
        }
    } catch {
        // Continue to Method 3
    }

    // ==========================================
    // METHOD 3: Cobalt API Engine
    // ==========================================
    try {
        const cobaltRes = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: normalizedUrl,
                videoQuality: "1080",
            }),
            next: { revalidate: 0 },
        });

        if (cobaltRes.ok) {
            const data = await cobaltRes.json();
            if (data.url) {
                return {
                    title: `Facebook Reel (${videoId})`,
                    author: "@facebook_user",
                    thumbnail: "",
                    duration: "0:00",
                    videoUrl: data.url,
                    formats: [
                        {
                            format_id: "hd",
                            ext: "mp4",
                            height: 720,
                            url: data.url,
                            format_note: "HD Direct Video (MP4)",
                        },
                    ],
                    videoId,
                    size: "Direct MP4",
                };
            }
        }
    } catch {
        // All methods failed
    }

    throw new Error("Unable to analyze Facebook Reel. The post may be private, deleted, or restricted by Facebook.");
}