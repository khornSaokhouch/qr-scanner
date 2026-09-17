import ToolClient from "@/components/ToolClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "TikTok Video Downloader",
    description: "Download TikTok videos without watermark in HD or extract MP3 audio.",
};

export default function TikTokPage() {
    return <ToolClient slug="tiktok" />;
}
