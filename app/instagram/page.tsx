import ToolClient from "@/components/ToolClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Instagram Video Downloader",
    description: "Save Instagram Reels, video posts, and carousel media directly.",
};

export default function InstagramPage() {
    return <ToolClient slug="instagram" />;
}
