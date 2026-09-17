import ToolClient from "@/components/ToolClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Facebook Video Downloader",
    description: "Download public Facebook videos, reels, and watch clips in HD.",
};

export default function FacebookPage() {
    return <ToolClient slug="facebook" />;
}
