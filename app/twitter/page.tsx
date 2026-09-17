import ToolClient from "@/components/ToolClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Twitter Video Downloader",
    description: "Extract high-bitrate video clips and animated GIFs from posts on Twitter.",
};

export default function TwitterPage() {
    return <ToolClient slug="twitter" />;
}
