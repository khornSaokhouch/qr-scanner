// app/api/tts/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get("text");
    const lang = searchParams.get("lang") || "km";
    const voice = searchParams.get("voice") || "km-KH-PisethNeural";

    // 1. Validate text input
    if (!text || !text.trim()) {
        return new NextResponse("Text parameter is required", { status: 400 });
    }

    const cleanText = text.trim().slice(0, 300);

    // 2. Try Microsoft Azure Speech (Piseth Neural Voice) if configured
    if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
        try {
            const azureUrl = `https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
            const ssml = `<speak version='1.0' xml:lang='km-KH'><voice xml:lang='km-KH' name='${voice}'>${cleanText}</voice></speak>`;

            const azRes = await fetch(azureUrl, {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY,
                    "Content-Type": "application/ssml+xml",
                    "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
                },
                body: ssml,
            });

            if (azRes.ok && azRes.body) {
                return new NextResponse(azRes.body, {
                    status: 200,
                    headers: {
                        "Content-Type": "audio/mpeg",
                        "Cache-Control": "public, max-age=31536000, immutable",
                    },
                });
            }
        } catch (e) {
            console.warn("Azure Speech failed, falling back to natural stream:", e);
        }
    }

    // 3. High-speed natural Google TTS fallback (supports Khmer 'km', English, etc.)
    try {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
            cleanText
        )}&tl=${lang}&client=tw-ob`;

        const response = await fetch(ttsUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                Referer: "https://translate.google.com/",
            },
        });

        if (!response.ok || !response.body) {
            return new NextResponse("Failed to fetch audio stream", { status: response.status || 500 });
        }

        const headers = new Headers();
        headers.set("Content-Type", "audio/mpeg");
        headers.set("Cache-Control", "public, max-age=86400");
        headers.set("Access-Control-Allow-Origin", "*");

        return new NextResponse(response.body, {
            status: 200,
            headers,
        });
    } catch (err: any) {
        console.error("TTS Route Error:", err);
        return new NextResponse(err.message || "TTS Service Error", { status: 500 });
    }
}