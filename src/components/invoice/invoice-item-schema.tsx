import { z } from "zod";

import {
    calculateTax,
    type InvoiceLineItem,
    SALE_TYPES,
    taxableOfValues,
} from "./invoice-item-shared";

const numeric = z
    .string()
    .trim()
    .min(1, "Required")
    .refine((v) => Number.isFinite(Number(v)), "Enter a valid number");

const amount = numeric.refine((v) => Number(v) >= 0, "Must be 0 or more");

const positiveAmount = numeric.refine(
    (v) => Number(v) > 0,
    "Must be greater than 0",
);

const rate = numeric.refine(
    (v) => Number(v) >= 0 && Number(v) <= 100,
    "Enter a rate from 0 to 100",
);

export const invoiceItemSchema = z
    .object({
        saleType: z.enum(SALE_TYPES),
        productDescription: z
            .string()
            .trim()
            .min(3, "Enter at least 3 characters")
            .max(200, "Keep it under 200 characters"),
        hsCode: z
            .string()
            .trim()
            .regex(/^\d{4}\.?\d{4}$/, "Use 8 digits, for example 8471.3000"),
        uom: z.string().min(1, "Select a unit"),
        quantity: positiveAmount,
        unitPrice: amount,
        discount: amount,
        cost: amount,
        gstRate: rate,
        exempt: z.boolean(),
        fttRate: rate,
        fedRate: rate,
        extRate: rate,
        sro: z.string(),
        srNo: z.string(),
    })
    .superRefine((values, ctx) => {
        if (values.sro && !values.srNo) {
            ctx.addIssue({
                code: "custom",
                message: "Select an SR#",
                path: ["srNo"],
            });
        }

        if (
            Number(values.discount) >
            Number(values.quantity) * Number(values.unitPrice)
        ) {
            ctx.addIssue({
                code: "custom",
                message: "Discount can't exceed quantity × unit price",
                path: ["discount"],
            });
        }
    });

export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;

export const DEFAULT_VALUES: InvoiceItemFormValues = {
    saleType: "Goods",
    productDescription: "",
    hsCode: "",
    uom: "",
    quantity: "1",
    unitPrice: "",
    discount: "0",
    cost: "",
    gstRate: "18",
    exempt: false,
    fttRate: "0",
    fedRate: "0",
    extRate: "0",
    sro: "",
    srNo: "",
};

export const toNumber = (value: string | undefined) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const taxableOf = (values: {
    quantity?: string;
    unitPrice?: string;
    discount?: string;
}) =>
    taxableOfValues(
        toNumber(values.quantity),
        toNumber(values.unitPrice),
        toNumber(values.discount),
    );

export const toFormValues = (item: InvoiceLineItem): InvoiceItemFormValues => ({
    saleType: item.saleType,
    productDescription: item.productDescription,
    hsCode: item.hsCode,
    uom: item.uom,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    discount: String(item.discount),
    cost: String(item.cost),
    gstRate: String(item.gstRate),
    exempt: item.exempt,
    fttRate: String(item.fttRate),
    fedRate: String(item.fedRate),
    extRate: String(item.extRate),
    sro: item.sro,
    srNo: item.srNo,
});

export const buildLineItem = (
    values: InvoiceItemFormValues,
    id?: string,
): InvoiceLineItem => ({
    id: id ?? `INV-ITEM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    saleType: values.saleType,
    productDescription: values.productDescription.trim(),
    hsCode: values.hsCode.trim().replace(".", ""),
    uom: values.uom,
    quantity: toNumber(values.quantity),
    cost: toNumber(values.cost),
    unitPrice: toNumber(values.unitPrice),
    discount: toNumber(values.discount),
    sro: values.sro,
    srNo: values.srNo,
    ...calculateTax({
        taxableValue: taxableOf(values),
        gstRate: toNumber(values.gstRate),
        exempt: values.exempt,
        fttRate: toNumber(values.fttRate),
        fedRate: toNumber(values.fedRate),
        extRate: toNumber(values.extRate),
    }),
});