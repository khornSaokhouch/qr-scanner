export type ScanType =
    | "QR"
    | "BARCODE"
    | "URL"
    | "TEXT"
    | "UNKNOWN";


export interface ScanResult {

    value: string;

    type: ScanType;

    timestamp: string;

}