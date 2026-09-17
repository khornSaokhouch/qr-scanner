// app/api/download-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileUrl = searchParams.get("url");
    let filename = searchParams.get("filename") || "media_download.mp4";

    if (!fileUrl) {
        return NextResponse.json(
            { error: "missingUrl", message: "url parameter is required" },
            { status: 400 }
        );
    }

    try {
        // Fetch remote media with modern desktop headers to bypass CDN hotlink protections
        const response = await fetch(fileUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "*/*",
                "Accept-Encoding": "identity",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: "fetchFailed",
                    message: `Source server responded with status: ${response.status}`,
                },
                { status: response.status }
            );
        }

        const stream = response.body;
        if (!stream) {
            throw new Error("Video stream body is empty");
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";

        // Auto-fix audio extension
        if (contentType.includes("audio") || contentType.includes("mpeg")) {
            if (filename.endsWith(".mp4")) {
                filename = filename.replace(/\.mp4$/i, ".mp3");
            }
        }

        // Clean ASCII fallback name
        const cleanAsciiName = filename
            .replace(/[^\x20-\x7E]/g, "")
            .replace(/["\\/]/g, "_")
            .trim() || "video.mp4";

        const encodedUtf8Name = encodeURIComponent(filename);

        const headers = new Headers();
        // FORCES THE BROWSER TO SAVE TO DISK AND NEVER STREAM IN BROWSER
        headers.set(
            "Content-Disposition",
            `attachment; filename="${cleanAsciiName}"; filename*=UTF-8''${encodedUtf8Name}`
        );
        headers.set("Content-Type", "application/octet-stream");

        const contentLength = response.headers.get("content-length");
        if (contentLength) {
            headers.set("Content-Length", contentLength);
        }

        headers.set("Access-Control-Allow-Origin", "*");

        return new NextResponse(stream as ReadableStream<Uint8Array>, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error("Download proxy error:", error);
        return NextResponse.json(
            { error: "serverError", message: error.message || "Failed to download media" },
            { status: 500 }
        );
    }
}