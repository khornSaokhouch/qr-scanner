import { VideoMetadata } from "./types";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function extractInstagram(url: string): Promise<VideoMetadata> {
    // 1. Extract shortcode
    const shortcodeMatch = url.match(/(?:p|reels|reel)\/([A-Za-z0-9_-]+)/);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;

    if (!shortcode) {
        throw new Error("Invalid Instagram URL. Could not detect shortcode.");
    }

    // Normalize URL to remove tracking parameters
    const normalizedUrl = `https://www.instagram.com/reel/${shortcode}/`;

    const headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/14.2 Chrome/87.0.4280.141 Mobile Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/x-www-form-urlencoded",
        "X-FB-Friendly-Name": "PolarisPostActionLoadPostQueryQuery",
        "X-BLOKS-VERSION-ID": "0d99de0d13662a50e0958bcb112dd651f70dea02e1859073ab25f8f2a477de96",
        "X-CSRFToken": "uy8OpI1kndx4oUHjlHaUfu",
        "X-IG-App-ID": "1217981644879628",
        "X-FB-LSD": "AVrqPT0gJDo",
        "X-ASBD-ID": "359341",
        "Sec-GPC": "1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Origin": "https://www.instagram.com",
        "Referer": `https://www.instagram.com/p/${shortcode}/`,
    };

    try {
        // Attempt 0: yt-dlp (Primary & Most Robust)
        try {
            console.log(`Instagram - Trying yt-dlp for: ${normalizedUrl}`);
            const { stdout, stderr } = await execAsync(`yt-dlp -j --no-playlist --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${normalizedUrl}"`);
            if (stdout) {
                const info = JSON.parse(stdout);
                const videoFormat = info.formats
                    ?.filter((f: any) => f.vcodec !== "none" && f.acodec !== "none" && f.ext === "mp4")
                    .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))[0];

                if (videoFormat || info.url) {
                    const rawThumbnail = info.thumbnail || info.thumbnails?.[0]?.url || "";
                    const thumbnail = rawThumbnail ? `/api/proxy?url=${encodeURIComponent(rawThumbnail)}` : "";

                    const formats = info.formats
                        .map((f: any) => ({
                            url: f.url,
                            ext: f.ext,
                            height: f.height,
                            width: f.width,
                            filesize: f.filesize,
                            format_id: f.format_id,
                            format_note: f.format_note || (f.height ? `${f.height}p` : undefined)
                        }))
                        .filter((f: any, index: number, self: any[]) =>
                            f.height && index === self.findIndex((t: any) => t.height === f.height)
                        ) || [];

                    return {
                        title: info.title || info.description?.slice(0, 50) || "Instagram Video",
                        author: info.uploader || "Instagram User",
                        thumbnail,
                        duration: info.duration ? `${Math.floor(info.duration / 60)}:${Math.floor(info.duration % 60).toString().padStart(2, "0")}` : "0:00",
                        videoUrl: videoFormat?.url || info.url,
                        audioUrl: undefined,
                        formats: formats.length > 0 ? formats : undefined,
                        size: videoFormat?.filesize ? `${(videoFormat.filesize / (1024 * 1024)).toFixed(1)} MB` : "Dynamic-HD"
                    };
                }
            }
            if (stderr) console.warn(`Instagram yt-dlp stderr: ${stderr.slice(0, 200)}`);
        } catch (e: any) {
            console.warn(`Instagram - yt-dlp error: ${e.stderr || e.message}`);
        }

        // Attempt 1: GraphQL Query (Secondary)
        try {
            console.log(`Instagram - Trying GraphQL for: ${shortcode}`);
            const variables = JSON.stringify({
                shortcode: shortcode,
                fetch_tagged_user_count: null,
                hoisted_comment_id: null,
                hoisted_reply_id: null,
            });

            const body = new URLSearchParams({
                av: "0",
                __d: "www",
                __user: "0",
                __a: "1",
                __req: "b",
                __hs: "20183.HYP:instagram_web_pkg.2.1...0",
                dpr: "3",
                __ccg: "GOOD",
                __rev: "1021613311",
                __s: "hm5eih:ztapmw:x0losd",
                __hsi: "7489787314313612244",
                __dyn: "7xeUjG1mxu1syUbFp41twpUnwgU7SbzEdF8aUco2qwJw5ux609vCwjE1EE2Cw8G11wBz81s8hwGxu786a3a1YwBgao6C0Mo2swtUd8-U2zxe2GewGw9a361qw8Xxm16wa-0oa2-azo7u3C2u2J0bS1LwTwKG1pg2fwxyo6O1FwlA3a3zhA6bwIxe6V8aUuwm8jwhU3cyVrDyo",
                __csr: "goMJ6MT9Z48KVkIBBvRfqKOkinBtG-FfLaRgG-lZ9Qji9XGexh7VozjHRKq5J6KVqjQdGl2pAFmvK5GWGXyk8h9GA-m6V5yF4UWagnJzazAbZ5osXuFkVeGCHG8GF4l5yp9oOezpo88PAlZ1Pxa5bxGQ7o9VrFbg-8wwxp1G2acxacGVQ00jyoE0ijonyXwfwEnwWwkA2m0dLw3tE1I80hCg8UeU4Ohox0clAhAtsM0iCA9wap4DwhS1fxW0fLhpRB51m13xC3e0h2t2H801HQw1bu02j-",
                __comet_req: "7",
                lsd: "AVrqPT0gJDo",
                jazoest: "2946",
                __spin_r: "1021613311",
                __spin_b: "trunk",
                __spin_t: "1743852001",
                __crn: "comet.igweb.PolarisPostRoute",
                fb_api_caller_class: "RelayModern",
                fb_api_req_friendly_name: "PolarisPostActionLoadPostQueryQuery",
                variables: variables,
                server_timestamps: "true",
                doc_id: "8845758582119845",
            });

            const response = await fetch("https://www.instagram.com/graphql/query", {
                method: "POST",
                headers,
                body: body.toString(),
            });

            if (response.ok) {
                const json = await response.json();
                const media = json.data?.xdt_shortcode_media;

                if (media && media.is_video) {
                    const rawThumbnail = media.display_url || media.display_resources?.[0]?.src || "";
                    const thumbnail = rawThumbnail ? `/api/proxy?url=${encodeURIComponent(rawThumbnail)}` : "";

                    return {
                        title: media.edge_media_to_caption?.edges[0]?.node?.text || "Instagram Video",
                        author: media.owner?.username || "Instagram User",
                        thumbnail,
                        duration: media.video_duration ? `${Math.floor(media.video_duration / 60)}:${Math.floor(media.video_duration % 60).toString().padStart(2, "0")}` : "0:00",
                        videoUrl: media.video_url,
                        audioUrl: undefined,
                        size: "Dynamic-HD"
                    };
                } else {
                    console.warn(`Instagram - GraphQL: Post found but no video or media is missing (is_video: ${media?.is_video})`);
                }
            } else {
                const text = await response.text();
                console.warn(`Instagram - GraphQL failed (${response.status}): ${text.slice(0, 100)}`);
            }
        } catch (e: any) {
            console.warn(`Instagram - GraphQL failed: ${e.message}`);
        }

        // Attempt 2: Cobalt API (v10+)
        try {
            console.log(`Instagram - Trying Cobalt (v10) for: ${normalizedUrl}`);
            const response = await fetch("https://api.cobalt.tools/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    url: normalizedUrl,
                    vQuality: "720",
                    vCodec: "h264",
                    isNoTTWatermark: true,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.url || result.picker) {
                    const videoUrl = result.url || (result.picker && result.picker[0]?.url);
                    if (videoUrl) {
                        return {
                            title: result.filename || "Instagram Content",
                            author: "Instagram",
                            thumbnail: "",
                            duration: "0:00",
                            videoUrl: videoUrl,
                            audioUrl: undefined,
                            size: "Dynamic-HD"
                        };
                    }
                }
            } else if (response.status === 400 || response.status === 404) {
                // Try alternate Cobalt instance if the main one fails
                const altResponse = await fetch("https://cobalt.tools/api/json", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({ url: normalizedUrl }),
                });
                if (altResponse.ok) {
                    const result = await altResponse.json();
                    if (result.url) {
                        return {
                            title: "Instagram Content",
                            author: "Instagram",
                            thumbnail: "",
                            duration: "0:00",
                            videoUrl: result.url,
                            audioUrl: undefined,
                            size: "Dynamic-HD"
                        };
                    }
                }
            }
            const text = await response.text();
            console.warn(`Instagram - Cobalt failed (${response.status}): ${text.slice(0, 100)}`);
        } catch (e: any) {
            console.warn(`Instagram - Cobalt failed: ${e.message}`);
        }

        // Attempt 3: SnapInsta Fallback API
        try {
            console.log(`Instagram - Trying SnapInsta fallback for: ${normalizedUrl}`);
            const response = await fetch(`https://instagram-video-downloader.vercel.app/api/video?url=${encodeURIComponent(normalizedUrl)}`);
            if (response.ok) {
                const result = await response.json();
                if (result.video_url || result.url) {
                    console.log("Instagram - SnapInsta successful");
                    return {
                        title: "Instagram Video",
                        author: "Instagram",
                        thumbnail: result.thumbnail || "",
                        duration: "0:00",
                        videoUrl: result.video_url || result.url,
                        audioUrl: undefined,
                        size: "Dynamic-HD"
                    };
                } else {
                    console.warn("Instagram - SnapInsta: No video URL in response");
                }
            } else {
                const text = await response.text();
                console.warn(`Instagram - SnapInsta failed (${response.status}): ${text.slice(0, 50)}`);
            }
        } catch (e: any) {
            console.warn(`Instagram - SnapInsta error: ${e.message}`);
        }

        // Attempt 4: douyin.wtf (Last Resort)
        try {
            console.log(`Instagram - Trying Douyin for: ${normalizedUrl}`);
            const response = await fetch(`https://api.douyin.wtf/api/instagram/video?url=${encodeURIComponent(normalizedUrl)}`, { headers });
            if (response.ok) {
                const result = await response.json();
                if (result.status === "success" && result.data) {
                    return {
                        title: result.data.title || "Instagram Post",
                        author: result.data.author || "Instagram User",
                        thumbnail: result.data.cover || result.data.thumbnail,
                        duration: result.data.duration || "0:00",
                        videoUrl: result.data.url || result.data.video,
                        audioUrl: undefined,
                        size: result.data.size || "8.2 MB"
                    };
                }
            } else {
                const text = await response.text();
                console.warn(`Instagram - Douyin failed (${response.status}): ${text.slice(0, 100)}`);
            }
        } catch (e: any) {
            console.warn(`Instagram - Douyin failed: ${e.message}`);
        }

        throw new Error("Unable to analyze Instagram link. The post may be private or restricted.");
    } catch (error) {
        console.error("Instagram Extraction Error:", error);
        throw new Error("Could not analyze Instagram link. Please check the URL and try again.");
    }

}