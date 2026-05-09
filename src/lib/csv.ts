import { FlatAnalyticsRow } from '../types/index';
import { mkConfig, generateCsv, download } from "export-to-csv";

const csvConfig = mkConfig({ useKeysAsHeaders: true });

type CsvRowValue = string | number;
type CsvRow = Record<string, CsvRowValue>;

export function exportTransformFromDataArray(data: FlatAnalyticsRow[]): CsvRow[] {
    return data.map((row) => exportTransformFromDataRow(row));
}

export function generateAndDownloadCsv(data: CsvRow[]) {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
}

function exportTransformFromDataRow(data: FlatAnalyticsRow): CsvRow {
    return {
        "Flat Number": data.flatNumber,
        "Initiative Name": data.initiativeName,
        "Paid Amount": data.paid,
        "Expected Amount": data.expected,
        "Balance": data.balance,
        "Payment Count": data.paymentCount,
        "Last Paid At": data.lastPaidAt ? new Date(data.lastPaidAt).toLocaleString() : 'N/A',
        "Email": data.email || 'N/A',
    }
}


