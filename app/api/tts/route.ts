// app/api/tts/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "km"; // Default to Khmer

    if (!text) {
        return new NextResponse("Text is required", { status: 400 });
    }

    try {
        // High-quality natural Google TTS stream (supports Khmer 'km')
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
            text.slice(0, 300)
        )}&tl=${lang}&client=tw-ob`;

        const response = await fetch(ttsUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                Referer: "https://translate.google.com/",
            },
        });

        if (!response.ok) {
            return new NextResponse("Failed to fetch audio stream", { status: response.status });
        }

        const headers = new Headers();
        headers.set("Content-Type", "audio/mpeg");
        headers.set("Cache-Control", "public, max-age=86400");

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });
    } catch (err: any) {
        return new NextResponse(err.message || "TTS Error", { status: 500 });
    }
}