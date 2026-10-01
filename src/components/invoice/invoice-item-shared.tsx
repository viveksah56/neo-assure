import { formatCurrency } from "@/lib/utils";

export { formatCurrency };

export const SALE_TYPES = ["Goods", "Services"] as const;

export type SaleType = (typeof SALE_TYPES)[number];

export interface InvoiceLineItem {
    id: string;
    saleType: SaleType;
    productDescription: string;
    hsCode: string;
    uom: string;
    quantity: number;
    cost: number;
    unitPrice: number;
    discount: number;
    taxableValue: number;
    gstRate: number;
    exempt: boolean;
    gstAmount: number;
    fttRate: number;
    fttAmount: number;
    fedRate: number;
    fedAmount: number;
    extRate: number;
    extAmount: number;
    totalTax: number;
    sro: string;
    srNo: string;
    totalValue: number;
}

export type NumericKey = "cost" | "fttRate" | "fedRate" | "extRate";

export const EDITABLE_KEYS = [
    "hsCode",
    "uom",
    "cost",
    "sro",
    "srNo",
    "exempt",
    "fttRate",
    "fedRate",
    "extRate",
] as const satisfies readonly (keyof InvoiceLineItem)[];

export interface SelectOption {
    label: string;
    value: string;
}

const toOptions = (values: string[]): SelectOption[] =>
    values.map((value) => ({ label: value, value }));

export const NO_OPTIONS: SelectOption[] = [];

export const UOM_OPTIONS = toOptions(["PCS", "HOUR", "MONTH", "MTR", "KG", "BOX"]);

export const SRO_OPTIONS = toOptions(["SRO-2024-01", "SRO-2024-02", "SRO-2024-03"]);

export const SR_OPTIONS_BY_SRO: Record<string, SelectOption[]> = {
    "SRO-2024-01": toOptions(["SR-001", "SR-002", "SR-006"]),
    "SRO-2024-02": toOptions(["SR-003", "SR-005", "SR-008"]),
    "SRO-2024-03": toOptions(["SR-004", "SR-007"]),
};

export const round2 = (value: number) =>
    Math.round((value + Number.EPSILON) * 100) / 100;

const percentOf = (base: number, rate: number) => round2((base * rate) / 100);

export const grossOf = (quantity: number, unitPrice: number) =>
    round2(quantity * unitPrice);

export const discountOf = (gross: number, discount: number) =>
    round2(Math.min(Math.max(discount, 0), gross));

export const taxableOfValues = (
    quantity: number,
    unitPrice: number,
    discount: number,
) => {
    const gross = grossOf(quantity, unitPrice);
    return round2(gross - discountOf(gross, discount));
};

export type TaxInput = Pick<
    InvoiceLineItem,
    "taxableValue" | "gstRate" | "exempt" | "fttRate" | "fedRate" | "extRate"
>;

export type TaxResult = TaxInput &
    Pick<
        InvoiceLineItem,
        | "gstAmount"
        | "fttAmount"
        | "fedAmount"
        | "extAmount"
        | "totalTax"
        | "totalValue"
    >;

export const calculateTax = (input: TaxInput): TaxResult => {
    const gstAmount = input.exempt
        ? 0
        : percentOf(input.taxableValue, input.gstRate);
    const fttAmount = percentOf(input.taxableValue, input.fttRate);
    const fedAmount = percentOf(input.taxableValue, input.fedRate);
    const extAmount = percentOf(input.taxableValue, input.extRate);
    const totalTax = round2(gstAmount + fttAmount + fedAmount + extAmount);

    return {
        ...input,
        extAmount,
        fedAmount,
        fttAmount,
        gstAmount,
        totalTax,
        totalValue: round2(input.taxableValue + totalTax),
    };
};

export const calculate = (item: InvoiceLineItem): InvoiceLineItem => ({
    ...item,
    ...calculateTax({
        ...item,
        taxableValue: taxableOfValues(item.quantity, item.unitPrice, item.discount),
    }),
});

export interface InvoiceSummary {
    subtotal: number;
    discount: number;
    gst: number;
    otherTaxes: number;
    grandTotal: number;
}

export const summarizeInvoice = (
    items: readonly InvoiceLineItem[],
): InvoiceSummary => {
    let subtotal = 0;
    let discount = 0;
    let gst = 0;
    let otherTaxes = 0;
    let grandTotal = 0;

    for (const item of items) {
        const gross = grossOf(item.quantity, item.unitPrice);
        subtotal += gross;
        discount += discountOf(gross, item.discount);
        gst += item.gstAmount;
        otherTaxes += item.fttAmount + item.fedAmount + item.extAmount;
        grandTotal += item.totalValue;
    }

    return {
        subtotal: round2(subtotal),
        discount: round2(discount),
        gst: round2(gst),
        otherTaxes: round2(otherTaxes),
        grandTotal: round2(grandTotal),
    };
};

type LineItemSeed = Pick<
    InvoiceLineItem,
    | "id"
    | "saleType"
    | "productDescription"
    | "hsCode"
    | "uom"
    | "quantity"
    | "cost"
    | "unitPrice"
    | "discount"
    | "sro"
    | "srNo"
> &
    Partial<InvoiceLineItem>;

export const createLineItem = (seed: LineItemSeed): InvoiceLineItem =>
    calculate({
        exempt: false,
        extAmount: 0,
        extRate: 0,
        fedAmount: 0,
        fedRate: 0,
        fttAmount: 0,
        fttRate: 0,
        gstAmount: 0,
        gstRate: 18,
        taxableValue: 0,
        totalTax: 0,
        totalValue: 0,
        ...seed,
    });

export const formatRate = (value: number) => `${Number(value.toFixed(2))}%`;