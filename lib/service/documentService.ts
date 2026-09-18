// lib/service/documentService.ts
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);

// Common installation paths for LibreOffice across Windows, Mac, and Linux
const LIBREOFFICE_PATHS = [
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/usr/bin/soffice',
    '/usr/bin/libreoffice',
    '/usr/local/bin/soffice',
    '/usr/local/bin/libreoffice',
];

export const SUPPORTED_DOC_EXTENSIONS = [
    '.doc', '.docx', '.docm', '.rtf', '.odt',
    '.xls', '.xlsx', '.ppt', '.pptx', '.txt'
];

/**
 * Finds the soffice binary path across different OS environments.
 */
function getSofficePath(): string | undefined {
    if (process.env.SOFFICE_PATH) return process.env.SOFFICE_PATH;

    for (const sofficePath of LIBREOFFICE_PATHS) {
        try {
            if (fs.existsSync(sofficePath)) return sofficePath;
        } catch { }
    }
    return undefined;
}

export interface ImageToPdfOptions {
    pageSize?: 'a4' | 'letter';
    marginMm?: number;
}

// 1 mm = 72 / 25.4 points ≈ 2.83465
const MM_TO_POINTS = 72 / 25.4;

const PAGE_SIZES = {
    a4: [595.28, 841.89] as [number, number], // 210mm x 297mm
    letter: [612.0, 792.0] as [number, number], // 8.5in x 11in
};

/**
 * Converts multiple JPG/PNG image buffers to a unified PDF with standard A4/Letter dimensions & margins.
 */
export async function imagesToPdf(
    imageBuffers: Buffer[],
    options: ImageToPdfOptions = {}
): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const selectedSize = options.pageSize || 'a4';
    const marginMm = options.marginMm ?? 10;
    const marginPoints = marginMm * MM_TO_POINTS;

    const [pageWidth, pageHeight] = PAGE_SIZES[selectedSize];
    const maxContentWidth = pageWidth - marginPoints * 2;
    const maxContentHeight = pageHeight - marginPoints * 2;

    for (const buffer of imageBuffers) {
        let image;
        const isPng = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50;

        try {
            if (isPng) {
                image = await pdfDoc.embedPng(buffer);
            } else {
                image = await pdfDoc.embedJpg(buffer);
            }
        } catch {
            // If embed fails as JPG, attempt PNG fallback
            try {
                image = await pdfDoc.embedPng(buffer);
            } catch {
                console.warn('Skipping unsupported or corrupt image buffer');
                continue;
            }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Calculate aspect ratio scaling
        const scale = Math.min(
            maxContentWidth / image.width,
            maxContentHeight / image.height
        );

        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;

        // Center image within the margins
        const x = marginPoints + (maxContentWidth - drawWidth) / 2;
        const y = marginPoints + (maxContentHeight - drawHeight) / 2;

        page.drawImage(image, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
        });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

/**
 * Converts Word/Office documents to PDF using headless LibreOffice.
 */
export async function convertDocumentToPdf(
    inputBuffer: Buffer,
    originalFilename: string
): Promise<Buffer> {
    const ext = path.extname(originalFilename).toLowerCase() || '.docx';
    const sofficePath = getSofficePath();

    if (!sofficePath) {
        throw new Error(
            'LibreOffice (soffice) not found on this server. Please install LibreOffice or set the SOFFICE_PATH environment variable.'
        );
    }

    const tempDir = path.join(os.tmpdir(), `smartscan_${Date.now()}_${Math.random().toString(36).substring(7)}`);
    await mkdirAsync(tempDir, { recursive: true });

    // IMPORTANT: Keep original extension so LibreOffice knows the file format
    const inputFileName = `input_file${ext}`;
    const inputPath = path.join(tempDir, inputFileName);
    const expectedOutputName = `input_file.pdf`;
    const outputPath = path.join(tempDir, expectedOutputName);

    try {
        await writeFileAsync(inputPath, inputBuffer);

        // Run headless LibreOffice via safe execFile (prevents command injection)
        await execFileAsync(sofficePath, [
            '--headless',
            '--convert-to',
            'pdf',
            '--outdir',
            tempDir,
            inputPath,
        ], { timeout: 30000 });

        if (!fs.existsSync(outputPath)) {
            throw new Error('Conversion completed but PDF output file was not generated.');
        }

        const outputBuffer = await readFileAsync(outputPath);
        return outputBuffer;
    } finally {
        // Clean up temporary directory safely
        try {
            await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.warn('Temporary directory cleanup failed:', e);
        }
    }
}