// lib/service/instagram.ts
import { VideoMetadata, VideoFormat } from "./types";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Helper: formats raw seconds into "M:SS"
function formatSeconds(sec: number): string {
    if (!sec || isNaN(sec)) return "0:00";
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// Helper: parses ISO-8601 duration strings like "PT18S" or "PT1M15S"
function parseIsoDuration(iso: string): string {
    const match = iso.match(/PT(?:(\d+)M)?(\d+)S/);
    if (!match) return "0:00";
    const mins = parseInt(match[1] || "0", 10);
    const secs = parseInt(match[2] || "0", 10);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export async function extractInstagram(rawUrl: string): Promise<VideoMetadata> {
    const url = rawUrl.trim();

    // 1. Extract shortcode
    const shortcodeMatch = url.match(/(?:p|reels|reel)\/([A-Za-z0-9_-]+)/);
    if (!shortcodeMatch) {
        throw new Error("Invalid Instagram link. Could not detect a reel or post ID.");
    }
    const shortcode = shortcodeMatch[1];
    const normalizedUrl = `https://www.instagram.com/reel/${shortcode}/`;

    let title = `Instagram Reel (${shortcode})`;
    let author = "@instagram_user";
    let thumbnail = "";

    // 2. Fetch public metadata via official Instagram OEmbed (author, title, cover)
    try {
        const oembedRes = await fetch(
            `https://api.instagram.com/oembed/?url=${encodeURIComponent(normalizedUrl)}`,
            { next: { revalidate: 60 } }
        );
        if (oembedRes.ok) {
            const oembed = await oembedRes.json();
            if (oembed.title) title = oembed.title.slice(0, 100);
            if (oembed.author_name) author = `@${oembed.author_name}`;
            if (oembed.thumbnail_url) thumbnail = oembed.thumbnail_url;
        }
    } catch {
        // Continue if OEmbed is unreachable
    }

    // ==========================================
    // METHOD 1: yt-dlp (Fixed format extraction)
    // ==========================================
    try {
        const { stdout } = await execFileAsync("yt-dlp", [
            "--no-warnings",
            "--no-playlist",
            "-j",
            normalizedUrl,
        ], { timeout: 9000 });

        if (stdout) {
            const info = JSON.parse(stdout);

            const bestFormat = (info.formats || [])
                .filter((f: any) => f.url && f.vcodec !== "none")
                .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))[0];

            const directUrl = bestFormat?.url || info.url;

            if (directUrl) {
                // Parse duration from yt-dlp
                const durationVal = info.duration || info.video_duration;
                const duration = durationVal ? formatSeconds(durationVal) : info.duration_string || "0:00";

                const formats: VideoFormat[] = (info.formats || [])
                    .filter((f: any) => f.url && f.vcodec !== "none")
                    .map((f: any) => ({
                        format_id: f.format_id || "mp4",
                        ext: "mp4",
                        height: f.height,
                        url: f.url,
                        format_note: f.height ? `${f.height}p HD (MP4)` : "High Quality (MP4)",
                        filesize: f.filesize,
                    }))
                    .filter((v: any, idx: number, arr: any[]) =>
                        v.height && idx === arr.findIndex((t: any) => t.height === v.height)
                    )
                    .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

                return {
                    title: info.title || info.description?.slice(0, 80) || title,
                    author: info.uploader ? `@${info.uploader}` : author,
                    thumbnail: info.thumbnail || thumbnail,
                    duration,
                    videoUrl: directUrl,
                    formats: formats.length > 0 ? formats : [
                        {
                            format_id: "best",
                            ext: "mp4",
                            url: directUrl,
                            format_note: "Best Available HD (MP4)",
                        },
                    ],
                    videoId: shortcode,
                    size: bestFormat?.filesize
                        ? `${(bestFormat.filesize / (1024 * 1024)).toFixed(1)} MB`
                        : "HD MP4",
                };
            }
        }
    } catch {
        // Fallback to Method 2 if yt-dlp fails
    }

    // ==========================================
    // METHOD 2: Instagram Social Bot Crawler (Bypasses Login Wall)
    // ==========================================
    try {
        const crawlRes = await fetch(normalizedUrl, {
            headers: {
                "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            },
            next: { revalidate: 0 },
        });

        if (crawlRes.ok) {
            const html = await crawlRes.text();

            const ogVideoMatch = html.match(/<meta\s+property="og:video(?::secure_url)?"\s+content="([^"]+)"/i);
            const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
            const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);

            // Extract duration from JSON or Schema.org embedded tags
            let duration = "0:00";
            const durNumMatch = html.match(/"video_duration":\s*([0-9.]+)/);
            const durIsoMatch = html.match(/"duration":\s*"(PT[^"]+)"/);

            if (durNumMatch && durNumMatch[1]) {
                duration = formatSeconds(parseFloat(durNumMatch[1]));
            } else if (durIsoMatch && durIsoMatch[1]) {
                duration = parseIsoDuration(durIsoMatch[1]);
            }

            if (ogVideoMatch && ogVideoMatch[1]) {
                const videoUrl = ogVideoMatch[1].replace(/&amp;/g, "&");
                const resolvedThumb = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, "&") : thumbnail;
                const resolvedTitle = ogTitleMatch ? ogTitleMatch[1] : title;

                return {
                    title: resolvedTitle,
                    author,
                    thumbnail: resolvedThumb,
                    duration,
                    videoUrl,
                    formats: [
                        {
                            format_id: "hd",
                            ext: "mp4",
                            url: videoUrl,
                            format_note: "HD Direct Video (MP4)",
                        },
                    ],
                    videoId: shortcode,
                    size: "Direct MP4",
                };
            }
        }
    } catch {
        // Fallback to Method 3
    }

    // ==========================================
    // METHOD 3: Cobalt API Fallback
    // ==========================================
    try {
        const cobaltRes = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: normalizedUrl }),
            next: { revalidate: 0 },
        });

        if (cobaltRes.ok) {
            const data = await cobaltRes.json();
            if (data.url) {
                return {
                    title,
                    author,
                    thumbnail,
                    duration: "0:00",
                    videoUrl: data.url,
                    formats: [
                        {
                            format_id: "cobalt_hd",
                            ext: "mp4",
                            url: data.url,
                            format_note: "HD Stream (MP4)",
                        },
                    ],
                    videoId: shortcode,
                    size: "High Quality",
                };
            }
        }
    } catch {
        // All methods exhausted
    }

    throw new Error("Unable to analyze Instagram Reel. The post may be private, restricted, or deleted.");
}