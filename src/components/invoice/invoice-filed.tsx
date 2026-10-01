"use client";

import { memo, useCallback, useId, type ChangeEvent } from "react";

import { cn } from "@/lib/utils";

import { formatCurrency, type NumericKey } from "./invoice-item-shared";

export const TONES = {
    gst: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    ftt: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    fed: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
    ext: "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
} as const;

export type Tone = keyof typeof TONES;

export const NumberField = memo(function NumberField({
                                                         label,
                                                         name,
                                                         value,
                                                         max,
                                                         onValueChange,
                                                     }: {
    label: string;
    name: NumericKey;
    value: number;
    max?: number;
    onValueChange: (name: NumericKey, value: number) => void;
}) {
    const id = useId();
    const invalid = value < 0 || (max !== undefined && value > max);
    const errorId = `${id}-error`;

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const parsed = event.target.valueAsNumber;
            onValueChange(name, Number.isFinite(parsed) ? parsed : 0);
        },
        [name, onValueChange],
    );

    return (
        <div className="grid min-w-0 gap-1.5">
            <label className="text-sm font-medium leading-none" htmlFor={id}>
                {label}
            </label>
            <input
                aria-describedby={invalid ? errorId : undefined}
                aria-invalid={invalid}
                className={cn(
                    "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-sm tabular-nums shadow-xs outline-none transition-colors",
                    "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    invalid && "border-destructive focus-visible:ring-destructive/50",
                )}
                id={id}
                inputMode="decimal"
                max={max}
                min={0}
                onChange={handleChange}
                step="any"
                type="number"
                value={value}
            />
            {invalid ? (
                <p className="text-xs font-medium text-destructive" id={errorId} role="alert">
                    {max !== undefined ? `Enter 0 to ${max}` : "Must be 0 or more"}
                </p>
            ) : null}
        </div>
    );
});

export const AmountField = memo(function AmountField({
                                                         label,
                                                         value,
                                                         tone,
                                                     }: {
    label: string;
    value: number;
    tone: string;
}) {
    return (
        <div className="grid min-w-0 gap-1.5">
            <span className="text-sm font-medium leading-none">{label}</span>
            <output
                aria-label={label}
                className={cn(
                    "flex h-9 w-full items-center justify-end rounded-md border px-3 text-sm font-medium tabular-nums",
                    tone,
                )}
            >
                {formatCurrency(value)}
            </output>
        </div>
    );
});