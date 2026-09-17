import { VideoMetadata } from "./types";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function extractPinterest(url: string): Promise<VideoMetadata> {
    // Normalize URL and handle pin.it shortlinks
    let targetUrl = url;
    try {
        if (url.includes("pin.it")) {
            console.log(`Pinterest - Resolving shortlink: ${url}`);
            const res = await fetch(url, { redirect: 'follow', method: 'HEAD' });
            targetUrl = res.url;
            console.log(`Pinterest - Resolved to: ${targetUrl}`);
        }
    } catch (e) {
        console.warn("Pinterest - Shortlink resolution failed:", e);
    }

    const pinIdMatch = targetUrl.match(/\/pin\/(\d+)/);
    const pinId = pinIdMatch ? pinIdMatch[1] : "";

    try {
        // Attempt 0: yt-dlp (Primary)
        try {
            console.log(`Pinterest - Trying yt-dlp for: ${targetUrl}`);
            const { stdout } = await execAsync(`yt-dlp -j --no-playlist "${targetUrl}"`);
            if (stdout) {
                const info = JSON.parse(stdout);
                return {
                    title: info.title || info.description || "Pinterest Media",
                    author: info.uploader || info.creator || "Pinterest User",
                    thumbnail: info.thumbnail || "",
                    videoUrl: info.url,
                    duration: info.duration ? `${Math.floor(info.duration / 60)}:${Math.floor(info.duration % 60).toString().padStart(2, "0")}` : "0:00",
                    size: info.filesize ? `${(info.filesize / (1024 * 1024)).toFixed(1)} MB` : "Dynamic-HD",
                    mediaType: info.vcodec !== "none" ? "video" : "image"
                };
            }
        } catch (e: any) {
            console.warn(`Pinterest - yt-dlp failed: ${e.message?.slice(0, 100)}`);
        }

        // Attempt 1: Manual Scraping (Fallback)
        console.log(`Pinterest - Trying manual scraping (mobile UA) for: ${targetUrl}`);
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Referer': 'https://www.pinterest.com/',
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch Pinterest page (Status: ${response.status})`);

        const html = await response.text();

        // Strategy 1: ld+json (Check all script tags)
        let ldImageUrl = null;
        let ldVideoUrl = null;
        let ldTitle = null;
        let ldAuthor = null;

        try {
            const ldMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
            if (ldMatches) {
                for (const match of ldMatches) {
                    try {
                        const content = match.replace(/<\/?script.*?>/g, '').trim();
                        const data = JSON.parse(content);
                        if (data['@type'] === 'VideoObject' || data['@type'] === 'ImageObject' || data['@type'] === 'SocialMediaPosting') {
                            ldImageUrl = data.thumbnailUrl || data.image || data.thumbnail || (Array.isArray(data.image) ? data.image[0] : null);
                            ldVideoUrl = data.contentUrl || data.embedUrl;
                            ldTitle = data.name || data.headline || data.description;
                            ldAuthor = typeof data.author === 'string' ? data.author : (data.author?.name || data.creator?.name);
                            if (ldImageUrl || ldVideoUrl) break;
                        }
                    } catch (e) { }
                }
            }
        } catch (e) { }

        // Strategy 2: JSON Data (Broad Match)
        let pwsImageUrl = null;
        let pwsVideoUrl = null;
        let pwsTitle = null;
        let pwsAuthor = null;

        try {
            const jsonMatches = html.match(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g);
            if (jsonMatches) {
                for (const match of jsonMatches) {
                    const content = match.replace(/<\/?script.*?>/g, '').trim();
                    if (content.length < 100) continue;

                    try {
                        const data = JSON.parse(content);
                        const state = data?.props?.initialReduxState || data?.props?.initialProps || data?.initial_state;
                        const pinDataMap = state?.pins || state?.pin;

                        if (pinDataMap) {
                            const pin = pinId && pinDataMap[pinId] ? pinDataMap[pinId] : (Object.values(pinDataMap)[0] as any);
                            if (pin) {
                                pwsImageUrl = pin.images?.orig?.url || pin.images?.['736x']?.url;
                                pwsVideoUrl = pin.videos?.video_list?.V_720P?.url || pin.videos?.video_list?.V_HLSV3?.url;
                                pwsTitle = pin.title || pin.description;
                                pwsAuthor = pin.pinner?.full_name || pin.owner?.full_name;
                                if (pwsImageUrl || pwsVideoUrl) break;
                            }
                        }
                    } catch (e) { }
                }
            }
        } catch (e) { }

        // Strategy 3: OpenGraph & Meta Tags
        const ogVideo = html.match(/<meta property="og:video" content="([^"]+)"/)?.[1];
        const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
        const ogAuthor = html.match(/<meta name="author" content="([^"]+)"/)?.[1];

        // Strategy 4: Brute-force Regex (Last Ditch)
        let bfImageUrl = html.match(/"(https:\/\/i\.pinimg\.com\/originals\/[^"]+\.(?:jpg|png|webp|gif))"/i)?.[1] ||
            html.match(/https:\/\/i\.pinimg\.com\/[^\/]+\/[^\/]+\/[^\/]+\/[^"]+\.jpg/i)?.[0];

        // Improved author matching (handles escaped JSON and various structures)
        let bfAuthor = html.match(/"(?:pinner|owner|native_creator)":\s*\{[^}]*"full_name":\s*"([^"]+)"/i)?.[1] ||
            html.match(/"full_name":\s*"([^"]+)"/i)?.[1] ||
            html.match(/<meta\s+name="author"\s+content="([^"]+)"/i)?.[1] ||
            html.match(/<title>.*?\|\s*(.*?)\s*\|\s*Pinterest<\/title>/i)?.[1];

        // Unescape handled if found in JSON-like structure
        if (bfAuthor && bfAuthor.includes('\\')) {
            try { bfAuthor = JSON.parse(`"${bfAuthor}"`); } catch (e) { }
        }

        // Consolidation
        const videoUrl = ldVideoUrl || pwsVideoUrl || ogVideo || null;
        const finalThumbnail = ldImageUrl || pwsImageUrl || ogImage || bfImageUrl || "";
        const finalTitle = ldTitle || pwsTitle || ogTitle || (html.match(/<title>([^<]+)<\/title>/)?.[1] || "Pinterest Media").replace(" | Pinterest", "");
        const finalAuthor = ldAuthor || pwsAuthor || ogAuthor || bfAuthor ||
            html.match(/"fullName":\s*"([^"]+)"/i)?.[1] ||
            html.match(/"name":\s*"([^"]+)"/i)?.[1] ||
            "Pinterest User";

        // Quality Booster
        let highResThumbnail = finalThumbnail;
        if (highResThumbnail && typeof highResThumbnail === 'string' && !highResThumbnail.includes('/originals/') && highResThumbnail.includes('i.pinimg.com')) {
            highResThumbnail = highResThumbnail.replace(/\/\d+x\//, '/originals/');
        }

        if (!videoUrl && !highResThumbnail) {
            console.log("Pinterest - Scraping failed, trying Cobalt...");
        } else {
            return {
                title: (typeof finalTitle === 'string' ? finalTitle : "Pinterest Media").trim(),
                author: (typeof finalAuthor === 'string' ? finalAuthor : "Pinterest User").trim().replace(/\\u0020/g, ' '),
                thumbnail: typeof highResThumbnail === 'string' ? highResThumbnail : "",
                videoUrl: (videoUrl || highResThumbnail || "").replace(/\\u0026/g, '&'),
                duration: videoUrl ? "0:00" : "", // Hide duration for photos
                size: "Dynamic-HD",
                mediaType: videoUrl ? "video" : "image"
            };
        }

        // Attempt 2: Cobalt API (v10)
        try {
            console.log(`Pinterest - Trying Cobalt for: ${targetUrl}`);
            const response = await fetch("https://api.cobalt.tools/", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ url: targetUrl }),
            });
            if (response.ok) {
                const result = await response.json();
                console.log(`Pinterest - Cobalt result status: ${result.status}`);
                if (result.url || (result.picker && result.picker[0]?.url)) {
                    return {
                        title: result.filename || "Pinterest Media",
                        author: "Pinterest User",
                        thumbnail: "",
                        videoUrl: result.url || result.picker[0].url,
                        duration: "0:00",
                        size: "Dynamic-HD",
                        mediaType: result.status === "picker" || result.url?.includes(".jpg") || result.url?.includes(".png") ? "image" : "video"
                    };
                } else {
                    console.warn("Pinterest - Cobalt successful but no URL/picker found in result.");
                }
            } else {
                const text = await response.text();
                console.warn(`Pinterest - Cobalt failed (${response.status}): ${text.slice(0, 100)}`);
            }
        } catch (e: any) {
            console.warn(`Pinterest - Cobalt error: ${e.message}`);
        }

        throw new Error("Could not find any media on this Pinterest page.");
    } catch (error: any) {
        console.error("Pinterest Extraction Error:", error);
        throw new Error(`Failed to extract Pinterest media: ${error.message}`);
    }
}