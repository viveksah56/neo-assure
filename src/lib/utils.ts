import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const CURRENCY_CODE = "USD";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    currency: CURRENCY_CODE,
    style: "currency",
});

const rupeeFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatRs = (value: number) => `Rs ${rupeeFormatter.format(value)}`;

export const parseNumber = (raw: string, max = Number.POSITIVE_INFINITY) => {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.min(value, max);
};
