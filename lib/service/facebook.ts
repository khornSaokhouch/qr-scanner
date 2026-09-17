import { VideoMetadata } from "./types";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function extractFacebook(url: string): Promise<VideoMetadata> {
    const normalizedUrl = url.trim();

    try {
        console.log(`Facebook Extraction - Calling yt-dlp for: ${normalizedUrl}`);

        // Call yt-dlp with --json to get all format info
        const { stdout, stderr } = await execAsync(`yt-dlp -j "${normalizedUrl}"`);

        if (stderr && !stdout) {
            console.warn("yt-dlp stderr:", stderr);
        }

        const info = JSON.parse(stdout);

        // Find best progressive format (video+audio)
        const progressiveFormats = info.formats
            .filter((f: any) => f.vcodec !== "none" && f.acodec !== "none" && f.ext === "mp4")
            .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

        const bestProgressive = progressiveFormats[0];

        // Format duration
        const lengthSeconds = info.duration || 0;
        const minutes = Math.floor(lengthSeconds / 60);
        const seconds = lengthSeconds % 60;
        const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        // Calculate size
        let sizeStr = "25.0 MB";
        if (bestProgressive && bestProgressive.filesize) {
            sizeStr = `${(bestProgressive.filesize / (1024 * 1024)).toFixed(1)} MB`;
        } else if (bestProgressive && bestProgressive.tbr && lengthSeconds) {
            const sizeMB = (bestProgressive.tbr * 1024 / 8 * lengthSeconds) / (1024 * 1024);
            sizeStr = `${sizeMB.toFixed(1)} MB`;
        }

        const rawThumbnail = info.thumbnail || info.thumbnails?.[0]?.url || "";
        // Route thumbnail through proxy to avoid CORS
        const thumbnail = rawThumbnail ? `/api/proxy?url=${encodeURIComponent(rawThumbnail)}` : "";

        return {
            title: info.title || "Facebook Video",
            author: info.uploader || "Facebook User",
            thumbnail,
            duration,
            videoUrl: bestProgressive?.url || info.url || normalizedUrl,
            audioUrl: undefined,
            size: sizeStr
        };

    } catch (error: any) {
        console.error("Facebook yt-dlp Extraction Error:", error);

        return {
            title: "Facebook Video",
            author: "Facebook",
            thumbnail: "https://via.placeholder.com/640x360.png?text=Facebook+Preview",
            duration: "0:00",
            videoUrl: normalizedUrl,
            audioUrl: undefined,
            size: "Pending",
            error: "Facebook extraction failed. This might be due to privacy settings or platform blocks."
        };
    }
}