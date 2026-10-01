
export interface LineItem {
    id: string;
    saleType: string;
    description: string;
    hsCode: string;
    uom: string;
    qty: string;
    cost: string;
    unitPrice: string;
    discount: string;
    gstRate: string;
    exempt: boolean;
    fttRate: string;
    fedRate: string;
    extRate: string;
    sro: string;
    srNo: string;
}

export interface InvoiceMaster {
    clientId: string;
    invoiceDate?: Date;
    dueDate?: Date;
    clientPo: string;
    internalPo: string;
    status: string;
    notes: string;
}

export interface LineCalc {
    gross: number;
    discount: number;
    taxable: number;
    gst: number;
    ftt: number;
    fed: number;
    ext: number;
    totalTax: number;
    total: number;
}

export interface InvoiceTotals {
    subtotal: number;
    discount: number;
    gst: number;
    otherTaxes: number;
    grandTotal: number;
}

export type ItemErrors = Partial<Record<keyof LineItem, string>>;
