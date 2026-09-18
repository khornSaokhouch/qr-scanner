// app/api/convert-to-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { imagesToPdf, convertDocumentToPdf } from '@/lib/service/documentService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const type = formData.get('type') as 'images' | 'document' | null;

        if (!type) {
            return NextResponse.json(
                { message: 'Conversion type (images or document) is required.' },
                { status: 400 }
            );
        }

        // ==========================================
        // 1. IMAGES TO PDF
        // ==========================================
        if (type === 'images') {
            const files = formData.getAll('files') as File[];

            if (!files || files.length === 0) {
                return NextResponse.json(
                    { message: 'Please provide at least one image file.' },
                    { status: 400 }
                );
            }

            const pageSize = (formData.get('pageSize') as 'a4' | 'letter') || 'a4';
            const margin = Number(formData.get('margin') ?? 10);

            // Read all images into Buffers
            const imageBuffers: Buffer[] = [];
            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                imageBuffers.push(Buffer.from(arrayBuffer));
            }

            const pdfBuffer = await imagesToPdf(imageBuffers, {
                pageSize,
                marginMm: isNaN(margin) ? 10 : margin,
            });

            return new NextResponse(new Uint8Array(pdfBuffer), {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="smartscan-document.pdf"',
                },
            });
        }

        // ==========================================
        // 2. DOCUMENT TO PDF
        // ==========================================
        if (type === 'document') {
            const file = formData.get('file') as File | null;

            if (!file) {
                return NextResponse.json(
                    { message: 'Please upload a document to convert.' },
                    { status: 400 }
                );
            }

            const arrayBuffer = await file.arrayBuffer();
            const inputBuffer = Buffer.from(arrayBuffer);

            const pdfBuffer = await convertDocumentToPdf(inputBuffer, file.name);

            const safeDownloadName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';

            return new NextResponse(new Uint8Array(pdfBuffer), {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${encodeURIComponent(safeDownloadName)}"`,
                },
            });
        }

        return NextResponse.json(
            { message: 'Invalid conversion mode.' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('PDF Conversion API Error:', error);
        return NextResponse.json(
            { message: error?.message || 'Failed to generate PDF.' },
            { status: 500 }
        );
    }
}