"use client";

import type { LucideIcon } from "lucide-react";
import { memo, type ReactNode, useCallback, useId, useMemo } from "react";
import {
    type Control,
    Controller,
    useController,
    useFormState,
    type UseFormRegister,
    type UseFormSetValue,
    useWatch,
} from "react-hook-form";

import SelectInputField, { type Option } from "@/components/common/select-input";
import TextInputField from "@/components/common/text-input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import {
    type InvoiceItemFormValues,
    taxableOf,
    toNumber,
} from "./invoice-item-schema";
import {
    calculateTax,
    formatCurrency,
    NO_OPTIONS,
    SR_OPTIONS_BY_SRO,
    SRO_OPTIONS,
} from "./invoice-item-shared";

export type FormControl = Control<InvoiceItemFormValues>;
export type SelectOptions = readonly Option<string>[];

const SECTION_TONES = {
    sky: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
} as const;

export type SectionTone = keyof typeof SECTION_TONES;

export const FormSection = memo(function FormSection({
                                                         title,
                                                         description,
                                                         icon: Icon,
                                                         tone,
                                                         children,
                                                     }: {
    title: string;
    description: string;
    icon: LucideIcon;
    tone: SectionTone;
    children: ReactNode;
}) {
    const headingId = useId();

    return (
        <section
            aria-labelledby={headingId}
            className="rounded-xl border bg-card p-4 shadow-xs sm:p-5"
        >
            <div className="mb-4 flex items-start gap-3">
                <span
                    aria-hidden="true"
                    className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        SECTION_TONES[tone],
                    )}
                >
                    <Icon className="size-4.5" />
                </span>
                <div className="grid min-w-0 gap-0.5">
                    <h3
                        className="text-sm font-semibold leading-tight"
                        id={headingId}
                    >
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
});

export const FormTextField = memo(function FormTextField({
                                                             control,
                                                             register,
                                                             name,
                                                             label,
                                                             placeholder,
                                                             inputMode,
                                                         }: {
    control: FormControl;
    register: UseFormRegister<InvoiceItemFormValues>;
    name: keyof InvoiceItemFormValues;
    label: string;
    placeholder?: string;
    inputMode?: "decimal" | "text";
}) {
    const { errors } = useFormState({ control, name });

    return (
        <TextInputField
            error={errors[name]?.message}
            inputMode={inputMode}
            label={label}
            placeholder={placeholder}
            required
            {...register(name)}
        />
    );
});

export const FormSelectField = memo(function FormSelectField({
                                                                 control,
                                                                 name,
                                                                 label,
                                                                 options,
                                                                 placeholder,
                                                                 disabled,
                                                                 onChange,
                                                             }: {
    control: FormControl;
    name: "saleType" | "uom" | "sro" | "srNo";
    label: string;
    options: SelectOptions;
    placeholder: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
}) {
    const { field, fieldState } = useController({ control, name });
    const { onChange: fieldOnChange } = field;

    const handleValueChange = useCallback(
        (value: string) => {
            fieldOnChange(value);
            onChange?.(value);
        },
        [fieldOnChange, onChange],
    );

    return (
        <SelectInputField<string>
            disabled={disabled}
            error={fieldState.error?.message}
            label={label}
            name={field.name}
            onValueChange={handleValueChange}
            options={options}
            placeholder={placeholder}
            value={field.value || undefined}
        />
    );
});

export const FormCheckboxField = memo(function FormCheckboxField({
                                                                     control,
                                                                     label,
                                                                     description,
                                                                     className,
                                                                 }: {
    control: FormControl;
    label: string;
    description: string;
    className?: string;
}) {
    const id = useId();
    const descriptionId = `${id}-description`;

    return (
        <Controller
            control={control}
            name="exempt"
            render={({ field }) => (
                <label
                    className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/60 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40",
                        field.value && "border-emerald-600/40 bg-emerald-500/5",
                        className,
                    )}
                    htmlFor={id}
                >
                    <Checkbox
                        aria-describedby={descriptionId}
                        checked={field.value}
                        className="mt-0.5"
                        id={id}
                        onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                        }
                    />
                    <span className="grid gap-0.5">
                        <span className="text-sm font-medium leading-tight">
                            {label}
                        </span>
                        <span
                            className="text-xs text-muted-foreground"
                            id={descriptionId}
                        >
                            {description}
                        </span>
                    </span>
                </label>
            )}
        />
    );
});

export const SroFields = memo(function SroFields({
                                                     control,
                                                     setValue,
                                                 }: {
    control: FormControl;
    setValue: UseFormSetValue<InvoiceItemFormValues>;
}) {
    const sro = useWatch({ control, name: "sro" });

    const srOptions = useMemo<SelectOptions>(
        () => SR_OPTIONS_BY_SRO[sro] ?? NO_OPTIONS,
        [sro],
    );

    const handleSroChange = useCallback(() => {
        setValue("srNo", "", {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }, [setValue]);

    return (
        <>
            <FormSelectField
                control={control}
                label="SRO"
                name="sro"
                onChange={handleSroChange}
                options={SRO_OPTIONS}
                placeholder="Select SRO"
            />
            <FormSelectField
                control={control}
                disabled={!sro}
                label="SR#"
                name="srNo"
                options={srOptions}
                placeholder={sro ? "Select SR#" : "Select SRO first"}
            />
        </>
    );
});

const SummaryStat = memo(function SummaryStat({
                                                  label,
                                                  value,
                                                  emphasized = false,
                                              }: {
    label: string;
    value: string;
    emphasized?: boolean;
}) {
    return (
        <div
            className={cn(
                "grid min-w-0 gap-0.5 rounded-lg border p-3",
                emphasized
                    ? "col-span-2 border-emerald-600/30 bg-emerald-500/10 lg:col-span-1"
                    : "bg-card",
            )}
        >
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd
                className={cn(
                    "truncate tabular-nums",
                    emphasized
                        ? "text-lg font-semibold text-emerald-800 dark:text-emerald-300"
                        : "text-sm font-medium",
                )}
            >
                {value}
            </dd>
        </div>
    );
});

export const TotalsPreview = memo(function TotalsPreview({
                                                             control,
                                                         }: {
    control: FormControl;
}) {
    const quantity = useWatch({ control, name: "quantity" });
    const unitPrice = useWatch({ control, name: "unitPrice" });
    const discount = useWatch({ control, name: "discount" });
    const gstRate = useWatch({ control, name: "gstRate" });
    const exempt = useWatch({ control, name: "exempt" });
    const fttRate = useWatch({ control, name: "fttRate" });
    const fedRate = useWatch({ control, name: "fedRate" });
    const extRate = useWatch({ control, name: "extRate" });

    const { taxableValue, totals } = useMemo(() => {
        const taxable = taxableOf({ quantity, unitPrice, discount });
        return {
            taxableValue: taxable,
            totals: calculateTax({
                taxableValue: taxable,
                gstRate: toNumber(gstRate),
                exempt: Boolean(exempt),
                fttRate: toNumber(fttRate),
                fedRate: toNumber(fedRate),
                extRate: toNumber(extRate),
            }),
        };
    }, [quantity, unitPrice, discount, gstRate, exempt, fttRate, fedRate, extRate]);

    return (
        <dl
            aria-atomic="true"
            aria-label="Line total preview"
            aria-live="polite"
            className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/40 p-3 sm:gap-3 sm:p-4 lg:grid-cols-4"
        >
            <SummaryStat label="Taxable value" value={formatCurrency(taxableValue)} />
            <SummaryStat label="GST" value={formatCurrency(totals.gstAmount)} />
            <SummaryStat label="Total tax" value={formatCurrency(totals.totalTax)} />
            <SummaryStat
                emphasized
                label="Line total"
                value={formatCurrency(totals.totalValue)}
            />
        </dl>
    );
});