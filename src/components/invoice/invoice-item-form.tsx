"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Boxes, Coins, Loader2, Percent, Save } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { useForm, useFormState } from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
    FormCheckboxField,
    type FormControl,
    FormSection,
    FormSelectField,
    FormTextField,
    type SelectOptions,
    SroFields,
    TotalsPreview,
} from "./invoice-form-fields";
import {
    buildLineItem,
    DEFAULT_VALUES,
    type InvoiceItemFormValues,
    invoiceItemSchema,
    toFormValues,
} from "./invoice-item-schema";
import {
    type InvoiceLineItem,
    SALE_TYPES,
    UOM_OPTIONS,
} from "./invoice-item-shared";

const SALE_TYPE_OPTIONS: SelectOptions = SALE_TYPES.map((value) => ({
    value,
    label: value,
}));

const FormActions = memo(function FormActions({
                                                  control,
                                                  submitLabel,
                                                  pendingLabel,
                                                  onCancel,
                                              }: {
    control: FormControl;
    submitLabel: string;
    pendingLabel: string;
    onCancel: () => void;
}) {
    const { isSubmitting } = useFormState({ control });

    return (
        <div className="flex flex-col-reverse gap-2 border-t bg-card px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
            <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting}
                onClick={onCancel}
                type="button"
                variant="outline"
            >
                Cancel
            </Button>
            <Button
                aria-busy={isSubmitting}
                className="w-full bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600/40 sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-500"
                disabled={isSubmitting}
                type="submit"
            >
                {isSubmitting ? (
                    <Loader2 aria-hidden="true" className="animate-spin" />
                ) : (
                    <Save aria-hidden="true" />
                )}
                <span>{isSubmitting ? pendingLabel : submitLabel}</span>
            </Button>
        </div>
    );
});

export interface InvoiceItemFormProps {
    item?: InvoiceLineItem;
    submitLabel?: string;
    pendingLabel?: string;
    onSubmit: (item: InvoiceLineItem) => void | Promise<void>;
    onCancel: () => void;
}

function InvoiceItemForm({
                             item,
                             submitLabel = "Add line item",
                             pendingLabel = "Saving…",
                             onSubmit,
                             onCancel,
                         }: InvoiceItemFormProps) {
    const { control, register, handleSubmit, setValue } =
        useForm<InvoiceItemFormValues>({
            defaultValues: item ? toFormValues(item) : DEFAULT_VALUES,
            mode: "onTouched",
            resolver: zodResolver(invoiceItemSchema),
        });

    const itemId = item?.id;

    const onValid = useCallback(
        async (values: InvoiceItemFormValues) => {
            await onSubmit(buildLineItem(values, itemId));
        },
        [itemId, onSubmit],
    );

    const submit = useMemo(() => handleSubmit(onValid), [handleSubmit, onValid]);

    return (
        <form
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={submit}
        >
            <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-muted/30 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
                <FormSection
                    description="What you are selling and how it is classified."
                    icon={Boxes}
                    title="Product"
                    tone="sky"
                >
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="sm:col-span-2 lg:col-span-3">
                            <FormTextField
                                control={control}
                                label="Product description"
                                name="productDescription"
                                placeholder="e.g. Dell Latitude 5440 Laptop"
                                register={register}
                            />
                        </div>
                        <FormSelectField
                            control={control}
                            label="Sale type"
                            name="saleType"
                            options={SALE_TYPE_OPTIONS}
                            placeholder="Select sale type"
                        />
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="HS code"
                            name="hsCode"
                            placeholder="8471.3000"
                            register={register}
                        />
                        <FormSelectField
                            control={control}
                            label="UOM"
                            name="uom"
                            options={UOM_OPTIONS}
                            placeholder="Select UOM"
                        />
                    </div>
                </FormSection>

                <FormSection
                    description="Quantity, price and any discount applied."
                    icon={Coins}
                    title="Pricing"
                    tone="emerald"
                >
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="Quantity"
                            name="quantity"
                            register={register}
                        />
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="Unit price"
                            name="unitPrice"
                            placeholder="0.00"
                            register={register}
                        />
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="Discount"
                            name="discount"
                            register={register}
                        />
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="Cost"
                            name="cost"
                            placeholder="0.00"
                            register={register}
                        />
                    </div>
                </FormSection>

                <FormSection
                    description="Tax rates and any statutory exemption."
                    icon={Percent}
                    title="Tax"
                    tone="amber"
                >
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4 lg:grid-cols-4">
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="GST %"
                            name="gstRate"
                            register={register}
                        />
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="FTT %"
                            name="fttRate"
                            register={register}
                        />
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="FED %"
                            name="fedRate"
                            register={register}
                        />
                        <FormTextField
                            control={control}
                            inputMode="decimal"
                            label="EXT %"
                            name="extRate"
                            register={register}
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 border-t pt-4 sm:grid-cols-2">
                        <SroFields control={control} setValue={setValue} />
                        <FormCheckboxField
                            className="sm:col-span-2"
                            control={control}
                            description="GST amount is set to zero for this line."
                            label="Exempt from GST"
                        />
                    </div>
                </FormSection>

                <TotalsPreview control={control} />
            </div>

            <FormActions
                control={control}
                onCancel={onCancel}
                pendingLabel={pendingLabel}
                submitLabel={submitLabel}
            />
        </form>
    );
}

export default memo(InvoiceItemForm);