import { VideoMetadata } from "./types";
import { extractTikTok } from "./tiktok";
import { extractFacebook } from "./facebook";
import { extractInstagram } from "./instagram";
import { extractYouTube } from "./youtube";
import { extractX } from "./x";
import { extractPinterest } from "./pinterest";

export async function extractMetadata(slug: string, url: string): Promise<VideoMetadata> {
    // Normalize slug for Twitter/X
    const platform = slug === "twitter" ? "x" : slug;

    switch (platform) {
        case "tiktok":
            return await extractTikTok(url);
        case "facebook":
            return await extractFacebook(url);
        case "youtube":
            return await extractYouTube(url);
        case "instagram":
            return await extractInstagram(url);
        case "x":
            return await extractX(url);
        case "pinterest":
            return await extractPinterest(url);
        default:
            throw new Error(`Platform ${slug} is not yet supported for real extraction.`);
    }
}
