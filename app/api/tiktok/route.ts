// app/api/tiktok/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractTikTok } from "@/lib/service/tiktok";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        // Validate TikTok domain
        let parsed: URL;
        try {
            parsed = new URL(url.trim());
        } catch {
            return NextResponse.json(
                { error: "Please enter a valid URL." },
                { status: 400 }
            );
        }

        const isTikTok =
            parsed.hostname === "tiktok.com" ||
            parsed.hostname.endsWith(".tiktok.com");

        if (!isTikTok) {
            return NextResponse.json(
                { error: "URL must be from tiktok.com or vt.tiktok.com" },
                { status: 400 }
            );
        }

        const data = await extractTikTok(url);
        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error("TikTok extract error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to extract TikTok video." },
            { status: 500 }
        );
    }
}