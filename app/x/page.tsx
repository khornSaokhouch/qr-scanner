import ToolClient from "@/components/ToolClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "X (Twitter) Video Downloader",
    description: "Extract high-bitrate video clips and animated GIFs from posts on X.",
};

export default function XPage() {
    return <ToolClient slug="x" />;
}
