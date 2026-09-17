export interface VideoFormat {
    url: string;
    ext: string;
    height?: number;
    width?: number;
    filesize?: number;
    format_id: string;
    format_note?: string;
    vcodec?: string;
    acodec?: string;
}

export interface VideoMetadata {
    title: string;
    author: string;
    thumbnail: string;
    duration: string;
    videoUrl: string;
    audioUrl?: string;
    formats?: VideoFormat[];
    videoId?: string;
    size?: string;
    width?: number;
    height?: number;
    error?: string;
    mediaType?: "video" | "image";
    transcription?: string;
}

export type ExtractorStatus = "idle" | "processing" | "success" | "error";
