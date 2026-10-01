"use client";

import { ReceiptText } from "lucide-react";
import { memo, useCallback } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import InvoiceItemForm from "./invoice-item-form";
import type { InvoiceLineItem } from "./invoice-item-shared";

export { invoiceItemSchema } from "./invoice-item-schema";
export type { InvoiceItemFormValues } from "./invoice-item-schema";

function InvoiceItemModal({
                              open,
                              onOpenChange,
                              onSubmit,
                              item,
                          }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (item: InvoiceLineItem) => void | Promise<void>;
    item?: InvoiceLineItem;
}) {
    const isEdit = item !== undefined;

    const handleSubmit = useCallback(
        async (next: InvoiceLineItem) => {
            await onSubmit(next);
            onOpenChange(false);
        },
        [onOpenChange, onSubmit],
    );

    const handleCancel = useCallback(() => onOpenChange(false), [onOpenChange]);

    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl">
                <DialogHeader className="flex-row items-center gap-3 border-b bg-card px-4 py-3 text-left sm:px-6 sm:py-4">
                    <span
                        aria-hidden="true"
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    >
                        <ReceiptText className="size-5" />
                    </span>
                    <div className="grid min-w-0 gap-0.5">
                        <DialogTitle>
                            {isEdit ? "Edit line item" : "Add line item"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the product, pricing and tax details for this
                            invoice line.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <InvoiceItemForm
                    item={item}
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                    pendingLabel={isEdit ? "Saving…" : "Adding…"}
                    submitLabel={isEdit ? "Save changes" : "Add line item"}
                />
            </DialogContent>
        </Dialog>
    );
}

export default memo(InvoiceItemModal);