import ToolClient from "@/components/ToolClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pinterest Video Downloader",
    description: "Save high-resolution video pins and animated media from Pinterest.",
};

export default function PinterestPage() {
    return <ToolClient slug="pinterest" />;
}
