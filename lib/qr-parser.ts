import { ScanType } from "@/types/scanner";


export function detectScanType(
    value: string
): ScanType {


    if (value.startsWith("http")) {

        return "URL";

    }


    if (
        value.startsWith("WIFI:")
    ) {

        return "QR";

    }


    if (
        value.length >= 8 &&
        /^[0-9]+$/.test(value)
    ) {

        return "BARCODE";

    }


    if (value.length > 0) {

        return "TEXT";

    }


    return "UNKNOWN";

}