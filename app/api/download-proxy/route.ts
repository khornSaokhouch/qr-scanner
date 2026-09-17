import { NextRequest, NextResponse } from "next/server";

// Ensure this route is never cached by Next.js
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fileUrl = searchParams.get("url");
    let filename = searchParams.get("filename") || "smartscan-media.mp4";

    // 1. Validate URL presence
    if (!fileUrl) {
        return NextResponse.json(
            { error: "missingUrl", message: "url parameter is required" },
            { status: 400 }
        );
    }

    // 2. Validate URL structure
    try {
        const parsed = new URL(fileUrl);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return NextResponse.json(
                { error: "invalidProtocol", message: "URL must be http or https" },
                { status: 400 }
            );
        }
    } catch {
        return NextResponse.json(
            { error: "invalidUrl", message: "Malformed URL provided" },
            { status: 400 }
        );
    }

    try {
        // 3. Fetch remote media with browser headers to bypass CDN hotlink protections
        const videoResponse = await fetch(fileUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "*/*",
                "Accept-Encoding": "identity", // Stream raw bytes without re-compression
            },
        });

        if (!videoResponse.ok) {
            return NextResponse.json(
                {
                    error: "fetchFailed",
                    message: `Remote server responded with status: ${videoResponse.status}`,
                },
                { status: videoResponse.status }
            );
        }

        const videoStream = videoResponse.body;
        if (!videoStream) {
            throw new Error("Video stream body is null");
        }

        const contentType = videoResponse.headers.get("content-type") || "video/mp4";

        // 4. Auto-correct extension if it's an audio file
        if (contentType.includes("audio") || contentType.includes("mpeg")) {
            if (filename.endsWith(".mp4")) {
                filename = filename.replace(/\.mp4$/i, ".mp3");
            }
        }

        // 5. Sanitize filename for safe HTTP header inclusion (RFC 5987 standard)
        // Clean ASCII fallback name
        const cleanAsciiName = filename
            .replace(/[^\x20-\x7E]/g, "") // remove non-ASCII
            .replace(/["\\/]/g, "_")      // remove quotes and slashes
            .trim() || "download.mp4";

        // UTF-8 encoded name for international & special characters
        const encodedUtf8Name = encodeURIComponent(filename);

        const headers = new Headers();

        // Standard RFC 5987 content-disposition (works on Safari, Chrome, Edge, Firefox)
        headers.set(
            "Content-Disposition",
            `attachment; filename="${cleanAsciiName}"; filename*=UTF-8''${encodedUtf8Name}`
        );
        headers.set("Content-Type", contentType);

        const contentLength = videoResponse.headers.get("content-length");
        if (contentLength) {
            headers.set("Content-Length", contentLength);
        }

        // 6. Return streamed response directly to the browser
        return new NextResponse(videoStream as ReadableStream<Uint8Array>, {
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