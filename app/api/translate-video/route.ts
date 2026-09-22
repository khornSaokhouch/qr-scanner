// app/api/translate-video/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "GEMINI_API_KEY is not configured in .env.local" },
            { status: 500 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get("video") as File | null;
        const sourceLang = (formData.get("sourceLang") as string) || "English";

        if (!file) {
            return NextResponse.json(
                { error: "Please upload a video file." },
                { status: 400 }
            );
        }

        // Limit size for direct serverless memory (up to 25MB)
        if (file.size > 25 * 1024 * 1024) {
            return NextResponse.json(
                { error: "Video file is too large. Please upload clips under 25MB." },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        const promptText = `
You are an expert audio translator and dubbing assistant.
1. Listen carefully to all spoken audio in this video (which is in ${sourceLang}).
2. Transcribe the spoken text accurately.
3. Translate the spoken text into natural, spoken Khmer (ភាសាខ្មែរ) suitable for audio dubbing and voiceover.

Return ONLY a valid JSON object matching this schema:
{
  "originalTranscript": "Full transcription of the spoken dialogue in ${sourceLang}",
  "khmerTranslation": "Natural, fluent Khmer translation suitable for speech synthesis",
  "summary": "Brief 1-sentence summary in Khmer of what the video is about"
}
`;

        const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

        // Send video directly to Gemini multimodal endpoint
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    inlineData: {
                                        mimeType: file.type || "video/mp4",
                                        data: base64Data,
                                    },
                                },
                                { text: promptText },
                            ],
                        },
                    ],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.3,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => null);
            console.error("Gemini Video Translation Error:", errData);
            return NextResponse.json(
                { error: errData?.error?.message || "AI failed to process video audio." },
                { status: response.status }
            );
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
            throw new Error("No transcription response from AI model.");
        }

        const parsed = JSON.parse(candidateText);

        return NextResponse.json({
            success: true,
            data: {
                originalTranscript: parsed.originalTranscript || "",
                khmerTranslation: parsed.khmerTranslation || "",
                summary: parsed.summary || "",
            },
        });
    } catch (err: any) {
        console.error("Video Translation Error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to translate video voice." },
            { status: 500 }
        );
    }
}