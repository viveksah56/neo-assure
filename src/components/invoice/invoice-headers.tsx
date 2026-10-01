"use client";

import { ArrowLeft, Building2, FileText, Save } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

import DateInput from "@/components/common/date-input";
import SelectInputField, { type Option } from "@/components/common/select-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CLIENT_OPTIONS: readonly Option<string>[] = [
    { value: "acme", label: "Acme Traders" },
    { value: "globex", label: "Globex Industries" },
    { value: "initech", label: "Initech Solutions" },
    { value: "umbrella", label: "Umbrella Logistics" },
];

const STATUS_OPTIONS: readonly Option<string>[] = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
];

const STATUS_TONES: Record<string, string> = {
    draft: "border-violet-500/40 bg-violet-500/10 text-violet-800 dark:text-violet-300",
    sent: "border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-300",
    paid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
};

const PanelTitle = memo(function PanelTitle({
                                                icon: Icon,
                                                children,
                                            }: {
    icon: typeof Building2;
    children: string;
}) {
    return (
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
            {children}
        </h3>
    );
});

const PoField = memo(function PoField({
                                          label,
                                          value,
                                          onChange,
                                      }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="grid gap-1.5 text-sm font-medium">
            {label}
            <input
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                onChange={(event) => onChange(event.target.value)}
                placeholder="Optional"
                type="text"
                value={value}
            />
        </label>
    );
});

function InvoiceHeaders() {
    const [client, setClient] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState("draft");
    const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(undefined);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [clientPo, setClientPo] = useState("");
    const [internalPo, setInternalPo] = useState("");

    useEffect(() => {
        setInvoiceDate((current) => current ?? new Date());
    }, []);

    const handleClient = useCallback((value: string) => setClient(value), []);
    const handleStatus = useCallback((value: string) => setStatus(value), []);

    const dueError =
        invoiceDate && dueDate && dueDate < invoiceDate
            ? "Due date can't be before the invoice date"
            : undefined;

    return (
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                    <Button
                        aria-label="Go back"
                        className="size-9"
                        size="icon"
                        type="button"
                        variant="ghost"
                    >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                    </Button>
                    <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                        New Invoice
                    </h2>
                    <div className="w-32">
                        <SelectInputField<string>
                            className={cn(
                                "h-8 rounded-full text-xs font-medium",
                                STATUS_TONES[status],
                            )}
                            onValueChange={handleStatus}
                            options={STATUS_OPTIONS}
                            placeholder="Status"
                            value={status}
                        />
                    </div>
                </div>
                <Button
                    className="w-full bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600/40 sm:w-auto dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    type="button"
                >
                    <Save aria-hidden="true" />
                    Create Draft
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
                <section
                    aria-label="Client"
                    className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4"
                >
                    <PanelTitle icon={Building2}>Client</PanelTitle>
                    <SelectInputField<string>
                        onValueChange={handleClient}
                        options={CLIENT_OPTIONS}
                        placeholder="Select a client"
                        required
                        value={client}
                    />
                </section>

                <section
                    aria-label="Invoice details"
                    className="rounded-xl border bg-card p-4"
                >
                    <PanelTitle icon={FileText}>Invoice Details</PanelTitle>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        <DateInput
                            label="Invoice date"
                            onValueChange={setInvoiceDate}
                            required
                            value={invoiceDate}
                        />
                        <DateInput
                            error={dueError}
                            label="Due date"
                            minDate={invoiceDate}
                            onValueChange={setDueDate}
                            placeholder="dd/mm/yyyy"
                            value={dueDate}
                        />
                        <PoField
                            label="Client PO #"
                            onChange={setClientPo}
                            value={clientPo}
                        />
                        <PoField
                            label="Internal PO #"
                            onChange={setInternalPo}
                            value={internalPo}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}

export default memo(InvoiceHeaders);