// app/api/tools/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { extractMetadata } from "@/lib/service/extractor";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;
        const body = await req.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "URL is required" },
                { status: 400 }
            );
        }

        const data = await extractMetadata(slug, url);
        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error("Extraction error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to extract video metadata." },
            { status: 500 }
        );
    }
}