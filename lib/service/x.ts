// import { VideoMetadata } from "./types";

// export async function extractX(url: string): Promise<VideoMetadata> {
//     // URL Normalization for X/Twitter
//     let normalizedUrl = url.trim();

//     // Handle mobile and alternate domains
//     normalizedUrl = normalizedUrl.replace(/(mobile\.|vxtwitter\.|fxtwitter\.)twitter\.com/i, "twitter.com");
//     normalizedUrl = normalizedUrl.replace(/(mobile\.|vxtwitter\.|fxtwitter\.)x\.com/i, "twitter.com");
//     normalizedUrl = normalizedUrl.replace(/vxtwitter\.com|fxtwitter\.com|x\.com/i, "twitter.com");

//     // Reconstruct to a very standard format: twitter.com/i/status/[id]
//     const entryMatch = normalizedUrl.match(/\/status\/(\d+)/i);
//     if (entryMatch) {
//         normalizedUrl = `https://twitter.com/i/status/${entryMatch[1]}`;
//     }

//     const headers = {
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//         "Accept": "application/json",
//     };

//     try {
//         const tweetId = entryMatch ? entryMatch[1] : null;

//         // Attempt 0: xdownloader.com (Primary & most reliable for status IDs)
//         if (tweetId) {
//             try {
//                 const response = await fetch(`https://api.xdownloader.com/twitter/tweet/media?id=${tweetId}`, {
//                     headers: {
//                         ...headers,
//                         "Referer": "https://xdownloader.com/",
//                     }
//                 });
//                 const result = await response.json();
//                 if (result.media && result.media.videos && result.media.videos.length > 0) {
//                     const video = result.media.videos[0];
//                     if (video.variants && video.variants.length > 0) {
//                         // Sort by bitrate or resolution to get best quality
//                         const bestVariant = video.variants
//                             .filter((v: any) => v.content_type === "video/mp4")
//                             .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];

//                         if (bestVariant) {
//                             // Robust duration extraction
//                             let durationMs = video.duration_ms || 0;
//                             if (!durationMs && video.duration) {
//                                 // If it's in seconds instead of ms
//                                 durationMs = video.duration * 1000;
//                             }

//                             if (!durationMs) {
//                                 console.log("X Extraction - Duration missing in video object:", JSON.stringify(video));
//                             }

//                             const minutes = Math.floor(durationMs / 60000);
//                             const seconds = Math.floor((durationMs % 60000) / 1000);
//                             const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

//                             // Calculate total size: (bitrate bits/s / 8 bits/byte * duration_ms / 1000 ms/s)
//                             let sizeStr = "7.2 MB";
//                             if (bestVariant.bitrate && durationMs) {
//                                 const sizeBytes = (bestVariant.bitrate / 8) * (durationMs / 1000);
//                                 const sizeMB = sizeBytes / (1024 * 1024);
//                                 sizeStr = sizeMB < 0.1 ? `${(sizeMB * 1024).toFixed(1)} KB` : `${sizeMB.toFixed(1)} MB`;
//                             }

//                             const formats = video.variants
//                                 .filter((v: any) => v.url.includes("mp4") || v.content_type === "video/mp4")
//                                 .map((v: any) => {
//                                     // Try to extract resolution from URL or bitrate
//                                     const resMatch = v.url.match(/\/(\d+x\d+)\//) || v.url.match(/(\d+)p/);
//                                     let height = resMatch ? parseInt(resMatch[1].split('x').pop() || resMatch[1]) : 0;

//                                     // Fallback: estimate height based on bitrate if resolution is missing
//                                     if (!height && v.bitrate) {
//                                         if (v.bitrate > 2000000) height = 1080;
//                                         else if (v.bitrate > 1000000) height = 720;
//                                         else if (v.bitrate > 500000) height = 480;
//                                         else height = 270;
//                                     }

//                                     return {
//                                         url: v.url,
//                                         ext: "mp4",
//                                         height: height || undefined,
//                                         format_id: height ? `${height}p` : "video",
//                                         bitrate: v.bitrate
//                                     };
//                                 })
//                                 .filter((v: any, index: number, self: any[]) =>
//                                     index === self.findIndex((t: any) => t.height === v.height)
//                                 )
//                                 .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

//                             return {
//                                 title: result.meta?.tweet_id || "X Video",
//                                 author: result.meta?.username || "X User",
//                                 thumbnail: video.thumbnail || result.media.images?.[0] || "",
//                                 duration,
//                                 videoUrl: bestVariant.url,
//                                 audioUrl: undefined,
//                                 formats: formats.length > 0 ? formats : undefined,
//                                 size: sizeStr
//                             };
//                         }
//                     }
//                 }
//             } catch (e: any) { }
//         }

//         // Reconstruct URLs for fallbacks that might be picky
//         const fallbackUrl = tweetId ? `https://twitter.com/x/status/${tweetId}` : normalizedUrl;

//         // Attempt 1: douyin.wtf (Fallback)
//         try {
//             const response = await fetch(`https://api.douyin.wtf/api/twitter/video?url=${encodeURIComponent(fallbackUrl)}`, { headers });
//             const result = await response.json();
//             if (result.status === "success" && result.data) {
//                 return {
//                     title: result.data.title || "X (Twitter) Video",
//                     author: result.data.author || "X User",
//                     thumbnail: result.data.cover || result.data.thumbnail,
//                     duration: result.data.duration || "0:00",
//                     videoUrl: result.data.url || result.data.video,
//                     audioUrl: undefined,
//                     size: result.data.size || "5.4 MB"
//                 };
//             }
//         } catch (e: any) { }

//         // Attempt 2: TikViewer Bridge
//         try {
//             const response = await fetch(`https://api.tikviewer.com/api/v1/twitter/video?url=${encodeURIComponent(fallbackUrl)}`, { headers });
//             const result = await response.json();
//             if (result.status === "success" && result.data) {
//                 return {
//                     title: result.data.title || "X Video",
//                     author: result.data.author || "X",
//                     thumbnail: result.data.thumbnail,
//                     duration: "0:00",
//                     videoUrl: result.data.video,
//                     audioUrl: undefined,
//                     size: "6.2 MB"
//                 };
//             }
//         } catch (e: any) { }

//         throw new Error("Unable to analyze X link. The tweet may be private or restricted.");
//     } catch (error) {
//         throw new Error("Could not analyze X link. Please check the URL and try again.");
//     }
// }


// lib/service/x.ts
import { VideoMetadata } from "./types";

export async function extractX(url: string): Promise<VideoMetadata> {
    let normalizedUrl = url.trim();

    // Handle mobile and alternate domains
    normalizedUrl = normalizedUrl.replace(/(mobile\.|vxtwitter\.|fxtwitter\.)twitter\.com/i, "twitter.com");
    normalizedUrl = normalizedUrl.replace(/(mobile\.|vxtwitter\.|fxtwitter\.)x\.com/i, "twitter.com");
    normalizedUrl = normalizedUrl.replace(/vxtwitter\.com|fxtwitter\.com|x\.com/i, "twitter.com");

    const entryMatch = normalizedUrl.match(/\/status\/(\d+)/i);
    const tweetId = entryMatch ? entryMatch[1] : null;

    if (entryMatch) {
        normalizedUrl = `https://twitter.com/i/status/${entryMatch[1]}`;
    }

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
    };

    // Attempt 1: xdownloader API
    if (tweetId) {
        try {
            const response = await fetch(`https://api.xdownloader.com/twitter/tweet/media?id=${tweetId}`, {
                headers: {
                    ...headers,
                    "Referer": "https://xdownloader.com/",
                },
                next: { revalidate: 0 },
            });
            const result = await response.json();

            if (result.media?.videos && result.media.videos.length > 0) {
                const video = result.media.videos[0];
                if (video.variants && video.variants.length > 0) {
                    const mp4Variants = video.variants
                        .filter((v: any) => v.content_type === "video/mp4" || v.url?.includes(".mp4"))
                        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

                    const bestVariant = mp4Variants[0];

                    if (bestVariant) {
                        let durationMs = video.duration_ms || (video.duration ? video.duration * 1000 : 0);
                        const minutes = Math.floor(durationMs / 60000);
                        const seconds = Math.floor((durationMs % 60000) / 1000);
                        const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

                        const formats = mp4Variants.map((v: any) => {
                            const resMatch = v.url.match(/\/(\d+x\d+)\//) || v.url.match(/(\d+)p/);
                            let height = resMatch ? parseInt(resMatch[1].split("x").pop() || resMatch[1]) : 0;

                            if (!height && v.bitrate) {
                                if (v.bitrate > 2000000) height = 1080;
                                else if (v.bitrate > 1000000) height = 720;
                                else if (v.bitrate > 500000) height = 480;
                                else height = 360;
                            }

                            return {
                                url: v.url,
                                ext: "mp4",
                                height: height || undefined,
                                format_note: height ? `${height}p (MP4)` : "High Quality (MP4)",
                                bitrate: v.bitrate,
                            };
                        }).filter((v: any, index: number, self: any[]) =>
                            index === self.findIndex((t: any) => t.height === v.height)
                        );

                        return {
                            title: result.meta?.tweet_id ? `X Video (${result.meta.tweet_id})` : "X Video",
                            author: result.meta?.username ? `@${result.meta.username}` : "X User",
                            thumbnail: video.thumbnail || result.media.images?.[0] || "",
                            duration,
                            videoUrl: bestVariant.url,
                            formats: formats.length > 0 ? formats : undefined,
                            videoId: tweetId,
                        };
                    }
                }
            }
        } catch { }
    }

    // Attempt 2: Fallback API (douyin.wtf)
    try {
        const response = await fetch(`https://api.douyin.wtf/api/twitter/video?url=${encodeURIComponent(normalizedUrl)}`, { headers });
        const result = await response.json();
        if (result.status === "success" && result.data) {
            return {
                title: result.data.title || "X Video",
                author: result.data.author ? `@${result.data.author}` : "X User",
                thumbnail: result.data.cover || result.data.thumbnail || "",
                duration: result.data.duration || "0:00",
                videoUrl: result.data.url || result.data.video,
                videoId: tweetId || "x_video",
            };
        }
    } catch { }

    throw new Error("Unable to analyze X link. The tweet may be private or restricted.");
}