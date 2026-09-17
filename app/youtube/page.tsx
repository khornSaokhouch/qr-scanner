import ToolClient from "@/components/ToolClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "YouTube Video Downloader",
    description: "Download YouTube videos, Shorts, and audio tracks in high quality.",
};

export default function YouTubePage() {
    return <ToolClient slug="youtube" />;
}
