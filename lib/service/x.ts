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
import { VideoMetadata, VideoFormat } from "./types";

export async function extractX(rawUrl: string): Promise<VideoMetadata> {
    const url = rawUrl.trim();

    // 1. Extract the Tweet / Status ID
    const statusMatch = url.match(/\/status\/(\d+)/i);
    if (!statusMatch) {
        throw new Error("Invalid X (Twitter) URL. Could not find a status ID.");
    }
    const tweetId = statusMatch[1];

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json",
    };

    // ==========================================
    // ATTEMPT 1: FixTweet / FxTwitter API (Primary)
    // ==========================================
    try {
        const res = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
            headers,
            next: { revalidate: 0 },
        });

        if (res.ok) {
            const data = await res.json();
            const tweet = data.tweet;

            if (tweet) {
                const videos = tweet.media?.videos || [];
                const photos = tweet.media?.photos || [];

                if (videos.length > 0) {
                    const primaryVideo = videos[0];

                    // Format duration
                    let durationFormatted = "0:00";
                    if (primaryVideo.duration) {
                        const totalSec = Math.floor(primaryVideo.duration);
                        const mins = Math.floor(totalSec / 60);
                        const secs = totalSec % 60;
                        durationFormatted = `${mins}:${secs.toString().padStart(2, "0")}`;
                    }

                    // Build formats array
                    const formats: VideoFormat[] = [];

                    // Check if multiple variants exist
                    if (Array.isArray(primaryVideo.variants) && primaryVideo.variants.length > 0) {
                        primaryVideo.variants
                            .filter((v: any) => v.url && (v.content_type === "video/mp4" || v.url.includes(".mp4")))
                            .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))
                            .forEach((v: any, index: number) => {
                                const heightMatch = v.url.match(/vid\/(\d+x\d+)\//) || v.url.match(/(\d+)p/);
                                let height: number | undefined = undefined;
                                if (heightMatch) {
                                    const part = heightMatch[1].split("x").pop();
                                    height = part ? parseInt(part, 10) : undefined;
                                }

                                formats.push({
                                    format_id: `v_${index}`,
                                    ext: "mp4",
                                    height,
                                    url: v.url,
                                    format_note: height ? `${height}p HD (MP4)` : `Video Option ${index + 1} (MP4)`,
                                });
                            });
                    }

                    // Fallback to primary video URL if no variants found
                    if (formats.length === 0 && primaryVideo.url) {
                        formats.push({
                            format_id: "best",
                            ext: "mp4",
                            url: primaryVideo.url,
                            format_note: "Best Available MP4",
                        });
                    }

                    return {
                        title: tweet.text ? tweet.text.slice(0, 100) : "X Video",
                        author: tweet.author?.screen_name ? `@${tweet.author.screen_name}` : "@x_user",
                        thumbnail: primaryVideo.thumbnail_url || photos[0]?.url || "",
                        duration: durationFormatted,
                        videoUrl: formats[0]?.url || primaryVideo.url,
                        formats: formats.length > 0 ? formats : undefined,
                        videoId: tweetId,
                    };
                }
            }
        }
    } catch {
        // Continue to fallback
    }

    // ==========================================
    // ATTEMPT 2: VxTwitter API (Fallback)
    // ==========================================
    try {
        const res = await fetch(`https://api.vxtwitter.com/Twitter/status/${tweetId}`, {
            headers,
            next: { revalidate: 0 },
        });

        if (res.ok) {
            const data = await res.json();
            const videoUrl = data.video_url || data.mediaURLs?.find((u: string) => u.includes(".mp4"));

            if (videoUrl) {
                return {
                    title: data.text ? data.text.slice(0, 100) : "X Video",
                    author: data.user_screen_name ? `@${data.user_screen_name}` : "@x_user",
                    thumbnail: data.mediaURLs?.[0] || "",
                    duration: "0:00",
                    videoUrl,
                    formats: [
                        {
                            format_id: "hd",
                            ext: "mp4",
                            url: videoUrl,
                            format_note: "High Quality (MP4)",
                        },
                    ],
                    videoId: tweetId,
                };
            }
        }
    } catch {
        // Continue to fallback
    }

    // ==========================================
    // ATTEMPT 3: Cobalt Engine Fallback
    // ==========================================
    try {
        const res = await fetch("https://api.cobalt.tools/api/json", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: `https://twitter.com/i/status/${tweetId}`,
            }),
            next: { revalidate: 0 },
        });

        const data = await res.json();
        if (data && data.url) {
            return {
                title: "X Video",
                author: "@x_user",
                thumbnail: "",
                duration: "0:00",
                videoUrl: data.url,
                formats: [
                    {
                        format_id: "cobalt",
                        ext: "mp4",
                        url: data.url,
                        format_note: "HD Direct (MP4)",
                    },
                ],
                videoId: tweetId,
            };
        }
    } catch {
        // All attempts exhausted
    }

    throw new Error("Unable to analyze X link. The post may be restricted, deleted, or contains no video.");
}