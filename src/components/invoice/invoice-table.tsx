"use client";

import {
    type ColumnDef,
    columnVisibilityFeature,
    createExpandedRowModel,
    flexRender,
    rowExpandingFeature,
    rowSelectionFeature,
    tableFeatures,
    useTable,
} from "@tanstack/react-table";
import {
    ChevronRightIcon,
    PencilIcon,
    PlusIcon,
    ReceiptTextIcon,
    Trash2Icon,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
    Fragment,
    memo,
    type ReactNode,
    startTransition,
    useCallback,
    useDeferredValue,
    useMemo,
    useState,
} from "react";

import CustomPagination from "@/components/custom-pagination";
import { ConfirmDialog } from "@/components/modal/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { mockInvoiceItems } from "@/data";
import { cn } from "@/lib/utils";

import {
    formatCurrency,
    formatRate,
    type InvoiceLineItem,
    summarizeInvoice,
} from "./invoice-item-shared";

const InvoiceItemModal = dynamic(
    () => import("@/components/invoice/invoice-form"),
);

export type { InvoiceLineItem };
export { mockInvoiceItems };

const features = tableFeatures({
    columnVisibilityFeature,
    rowExpandingFeature,
    expandedRowModel: createExpandedRowModel(),
    rowSelectionFeature,
});

type InvoiceColumn = ColumnDef<typeof features, InvoiceLineItem>;
type ItemHandler = (item: InvoiceLineItem) => void;

interface ModalState {
    open: boolean;
    loaded: boolean;
    item?: InvoiceLineItem;
}

const PAGE_SIZE = 5;

const TONE = {
    sky: {
        soft: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
        ring: "ring-sky-500/20",
        text: "text-sky-700 dark:text-sky-300",
        hover: "hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-300",
    },
    violet: {
        soft: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
        ring: "ring-violet-500/20",
        text: "text-violet-700 dark:text-violet-300",
        hover: "hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300",
    },
    emerald: {
        soft: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        ring: "ring-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-300",
        hover: "hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-300",
    },
    amber: {
        soft: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        ring: "ring-amber-500/20",
        text: "text-amber-700 dark:text-amber-300",
        hover: "hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-300",
    },
    rose: {
        soft: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
        ring: "ring-rose-500/20",
        text: "text-rose-700 dark:text-rose-300",
        hover: "hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300",
    },
} as const;

type Tone = keyof typeof TONE;

const PRIMARY_BUTTON =
    "cursor-pointer bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600/40 dark:bg-emerald-600 dark:hover:bg-emerald-500";

const ICON_BUTTON = "cursor-pointer text-muted-foreground";

const COLUMN_CLASS: Record<string, string> = {
    actions: "w-px text-right",
    discount: "hidden lg:table-cell text-right",
    gstRate: "hidden lg:table-cell text-right",
    saleType: "hidden md:table-cell",
    select: "w-px",
    taxableValue: "hidden xl:table-cell text-right",
    totalValue: "text-right",
};

const pluralize = (count: number) => `${count} item${count === 1 ? "" : "s"}`;

const Pill = memo(function Pill({
                                    tone,
                                    children,
                                }: {
    tone: Tone;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ring-1 ring-inset",
                TONE[tone].soft,
                TONE[tone].ring,
            )}
        >
            {children}
        </span>
    );
});

const SaleTypePill = memo(function SaleTypePill({
                                                    value,
                                                }: {
    value: InvoiceLineItem["saleType"];
}) {
    return <Pill tone={value === "Services" ? "violet" : "sky"}>{value}</Pill>;
});

const createColumns = (
    onEdit: ItemHandler,
    onDelete: ItemHandler,
): InvoiceColumn[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                aria-label="Select all items"
                checked={table.getIsAllRowsSelected()}
                className="cursor-pointer"
                onCheckedChange={(value) => table.toggleAllRowsSelected(value === true)}
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                aria-label={`Select ${row.original.productDescription}`}
                checked={row.getIsSelected()}
                className="cursor-pointer"
                onCheckedChange={(value) => row.toggleSelected(value === true)}
            />
        ),
    },
    {
        accessorKey: "productDescription",
        header: "Product",
        cell: ({ row }) => {
            const expanded = row.getIsExpanded();
            const name = row.original.productDescription;
            return (
                <div className="flex min-w-48 items-start gap-2">
                    <Button
                        aria-controls={`row-panel-${row.id}`}
                        aria-expanded={expanded}
                        aria-label={
                            expanded ? `Hide details for ${name}` : `Show details for ${name}`
                        }
                        className={cn(
                            "mt-0.5 size-7 shrink-0",
                            ICON_BUTTON,
                            TONE.emerald.hover,
                            expanded && TONE.emerald.soft,
                        )}
                        onClick={row.getToggleExpandedHandler()}
                        size="icon"
                        type="button"
                        variant="ghost"
                    >
                        <ChevronRightIcon
                            aria-hidden="true"
                            className={cn(
                                "size-4 transition-transform duration-200",
                                expanded && "rotate-90",
                            )}
                        />
                    </Button>
                    <div className="flex min-w-0 flex-col gap-1.5">
                        <span className="whitespace-normal font-medium text-foreground leading-snug">
                            {name}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground text-xs md:hidden">
                            <SaleTypePill value={row.original.saleType} />
                            {formatCurrency(row.original.taxableValue)}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "saleType",
        header: "Sale type",
        cell: ({ row }) => <SaleTypePill value={row.original.saleType} />,
    },
    {
        accessorKey: "discount",
        header: "Discount",
        cell: ({ row }) => (
            <span className={cn("tabular-nums", TONE.rose.text)}>
                {formatCurrency(row.original.discount)}
            </span>
        ),
    },
    {
        accessorKey: "taxableValue",
        header: "Taxable value",
        cell: ({ row }) => (
            <span className="tabular-nums">
                {formatCurrency(row.original.taxableValue)}
            </span>
        ),
    },
    {
        accessorKey: "gstRate",
        header: "GST rate",
        cell: ({ row }) => (
            <span className="text-muted-foreground tabular-nums">
                {formatRate(row.original.gstRate)}
            </span>
        ),
    },
    {
        accessorKey: "totalValue",
        header: "Total",
        cell: ({ row }) => (
            <span className={cn("font-semibold tabular-nums", TONE.emerald.text)}>
                {formatCurrency(row.original.totalValue)}
            </span>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const name = row.original.productDescription;
            return (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        aria-label={`Edit ${name}`}
                        className={cn("size-8", ICON_BUTTON, TONE.sky.hover)}
                        onClick={() => onEdit(row.original)}
                        size="icon"
                        type="button"
                        variant="ghost"
                    >
                        <PencilIcon aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                        aria-label={`Delete ${name}`}
                        className={cn("size-8", ICON_BUTTON, TONE.rose.hover)}
                        onClick={() => onDelete(row.original)}
                        size="icon"
                        type="button"
                        variant="ghost"
                    >
                        <Trash2Icon aria-hidden="true" className="size-4" />
                    </Button>
                </div>
            );
        },
    },
];

const DetailItem = memo(function DetailItem({
                                                label,
                                                children,
                                            }: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="grid min-w-0 gap-0.5">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="wrap-break-word font-medium text-sm tabular-nums">
                {children}
            </dd>
        </div>
    );
});

const TaxLine = memo(function TaxLine({
                                          label,
                                          rate,
                                          amount,
                                      }: {
    label: string;
    rate?: number;
    amount: number;
}) {
    return (
        <div className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="text-muted-foreground">
                {label}
                {rate === undefined ? null : (
                    <span className="ml-1.5 text-xs">{formatRate(rate)}</span>
                )}
            </dt>
            <dd className="font-medium tabular-nums">{formatCurrency(amount)}</dd>
        </div>
    );
});

const DetailCard = memo(function DetailCard({
                                                title,
                                                children,
                                                className,
                                            }: {
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 rounded-lg bg-card p-4 ring-1 ring-foreground/5",
                className,
            )}
        >
            <h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                {title}
            </h4>
            {children}
        </div>
    );
});

const RowPanel = memo(function RowPanel({
                                            item,
                                            onEdit,
                                        }: {
    item: InvoiceLineItem;
    onEdit: ItemHandler;
}) {
    const handleEdit = useCallback(() => onEdit(item), [item, onEdit]);

    return (
        <div className="flex w-full flex-col gap-4 py-2" id={`row-panel-${item.id}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid min-w-0 gap-0.5">
                    <h3 className="wrap-break-word font-semibold text-sm">
                        {item.productDescription}
                    </h3>
                    <p className="text-muted-foreground text-xs">{item.id}</p>
                </div>
                <Button
                    className="w-full cursor-pointer sm:w-auto"
                    onClick={handleEdit}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    <PencilIcon aria-hidden="true" className="size-3.5" />
                    Edit item
                </Button>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <DetailCard title="Classification">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailItem label="Sale type">
                            <SaleTypePill value={item.saleType} />
                        </DetailItem>
                        <DetailItem label="HS code">{item.hsCode || "—"}</DetailItem>
                        <DetailItem label="UOM">{item.uom || "—"}</DetailItem>
                        <DetailItem label="GST status">
                            <Pill tone={item.exempt ? "amber" : "emerald"}>
                                {item.exempt ? "Exempt" : "Taxable"}
                            </Pill>
                        </DetailItem>
                        <DetailItem label="SRO">{item.sro || "—"}</DetailItem>
                        <DetailItem label="SR#">{item.srNo || "—"}</DetailItem>
                    </dl>
                </DetailCard>

                <DetailCard title="Pricing">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailItem label="Quantity">{item.quantity}</DetailItem>
                        <DetailItem label="Unit price">
                            {formatCurrency(item.unitPrice)}
                        </DetailItem>
                        <DetailItem label="Discount">
                            {formatCurrency(item.discount)}
                        </DetailItem>
                        <DetailItem label="Cost">{formatCurrency(item.cost)}</DetailItem>
                        <DetailItem label="Taxable value">
                            {formatCurrency(item.taxableValue)}
                        </DetailItem>
                    </dl>
                </DetailCard>

                <DetailCard className="md:col-span-2 xl:col-span-1" title="Tax breakdown">
                    <dl className="flex flex-col gap-2">
                        <TaxLine
                            amount={item.exempt ? 0 : item.gstAmount}
                            label="GST"
                            rate={item.gstRate}
                        />
                        <TaxLine amount={item.fttAmount} label="FTT" rate={item.fttRate} />
                        <TaxLine amount={item.fedAmount} label="FED" rate={item.fedRate} />
                        <TaxLine amount={item.extAmount} label="EXT" rate={item.extRate} />
                        <div className="mt-1 flex flex-col gap-2 border-t pt-3">
                            <TaxLine amount={item.totalTax} label="Total tax" />
                            <div className="flex items-baseline justify-between gap-3">
                                <dt className="font-medium text-sm">Line total</dt>
                                <dd
                                    className={cn(
                                        "font-semibold text-base tabular-nums",
                                        TONE.emerald.text,
                                    )}
                                >
                                    {formatCurrency(item.totalValue)}
                                </dd>
                            </div>
                        </div>
                    </dl>
                </DetailCard>
            </div>
        </div>
    );
});

type SummaryTone = "neutral" | "primary" | "rose" | "emerald" | "amber";

const SUMMARY_SURFACE: Record<SummaryTone, string> = {
    neutral: "bg-muted/60",
    primary: "bg-linear-to-br from-emerald-700 to-teal-600 text-white",
    rose: TONE.rose.soft,
    emerald: TONE.emerald.soft,
    amber: TONE.amber.soft,
};

const SummaryCard = memo(function SummaryCard({
                                                  label,
                                                  value,
                                                  tone,
                                                  className,
                                              }: {
    label: string;
    value: number;
    tone: SummaryTone;
    className?: string;
}) {
    const inverted = tone === "primary";
    return (
        <div
            className={cn(
                "grid min-w-0 gap-1 rounded-xl p-3 sm:p-4",
                SUMMARY_SURFACE[tone],
                className,
            )}
        >
            <dt className={cn("text-xs", inverted ? "text-white/80" : "text-muted-foreground")}>
                {label}
            </dt>
            <dd
                className={cn(
                    "truncate font-semibold tabular-nums",
                    inverted ? "text-lg sm:text-xl" : "text-base sm:text-lg",
                )}
            >
                {formatCurrency(value)}
            </dd>
        </div>
    );
});

const InvoiceSummaryPanel = memo(function InvoiceSummaryPanel({
                                                                  items,
                                                              }: {
    items: readonly InvoiceLineItem[];
}) {
    const summary = useMemo(() => summarizeInvoice(items), [items]);

    return (
        <section aria-label="Invoice summary" className="grid gap-3">
            <h3 className="font-semibold text-base sm:text-lg">Invoice summary</h3>
            <dl
                aria-live="polite"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5"
            >
                <SummaryCard label="Subtotal" tone="neutral" value={summary.subtotal} />
                <SummaryCard label="Discount" tone="rose" value={summary.discount} />
                <SummaryCard label="GST" tone="emerald" value={summary.gst} />
                <SummaryCard label="Other Taxes" tone="amber" value={summary.otherTaxes} />
                <SummaryCard
                    className="col-span-2 sm:col-span-3 xl:col-span-1"
                    label="Grand Total"
                    tone="primary"
                    value={summary.grandTotal}
                />
            </dl>
        </section>
    );
});

const EmptyState = memo(function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <span
                aria-hidden="true"
                className={cn(
                    "flex size-12 items-center justify-center rounded-full",
                    TONE.emerald.soft,
                )}
            >
                <ReceiptTextIcon className="size-6" />
            </span>
            <div className="grid gap-1">
                <p className="font-semibold text-sm">No line items yet</p>
                <p className="text-muted-foreground text-sm">
                    Add your first item to start building this invoice.
                </p>
            </div>
            <Button className={PRIMARY_BUTTON} onClick={onAdd} type="button">
                <PlusIcon aria-hidden="true" />
                Add line item
            </Button>
        </div>
    );
});

export default function InvoiceTable() {
    const [data, setData] = useState<InvoiceLineItem[]>(mockInvoiceItems);
    const [modal, setModal] = useState<ModalState>({ open: false, loaded: false });
    const [deleteItem, setDeleteItem] = useState<InvoiceLineItem | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkCount, setBulkCount] = useState(0);
    const [page, setPage] = useState(1);
    const deferredData = useDeferredValue(data);

    const openAdd = useCallback(
        () => setModal({ open: true, loaded: true, item: undefined }),
        [],
    );

    const openEdit = useCallback<ItemHandler>(
        (item) => setModal({ open: true, loaded: true, item }),
        [],
    );

    const handleModalOpenChange = useCallback(
        (open: boolean) => setModal((prev) => ({ ...prev, open })),
        [],
    );

    const handleSubmit = useCallback((next: InvoiceLineItem) => {
        startTransition(() => {
            setData((prev) =>
                prev.some((item) => item.id === next.id)
                    ? prev.map((item) => (item.id === next.id ? next : item))
                    : [...prev, next],
            );
        });
    }, []);

    const handleDelete = useCallback<ItemHandler>((item) => {
        setDeleteItem(item);
        setDeleteOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (!deleteItem) return;
        startTransition(() => {
            setData((prev) => prev.filter((row) => row.id !== deleteItem.id));
        });
    }, [deleteItem]);

    const columns = useMemo(
        () => createColumns(openEdit, handleDelete),
        [openEdit, handleDelete],
    );

    const table = useTable(
        {
            columns,
            data,
            features,
            getRowCanExpand: () => true,
            getRowId: (row) => row.id,
        },
        (state) => ({
            expanded: state.expanded,
            rowSelection: state.rowSelection,
        }),
    );

    const allRows = table.getRowModel().rows;
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCount = selectedRows.length;

    const pageCount = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageStart = (currentPage - 1) * PAGE_SIZE;

    const rows = useMemo(
        () => allRows.slice(pageStart, pageStart + PAGE_SIZE),
        [allRows, pageStart],
    );

    const openBulkDelete = useCallback(() => {
        setBulkCount(selectedCount);
        setBulkDeleteOpen(true);
    }, [selectedCount]);

    const handleConfirmBulkDelete = useCallback(() => {
        const ids = new Set(selectedRows.map((row) => row.id));
        startTransition(() => {
            setData((prev) => prev.filter((row) => !ids.has(row.id)));
        });
        table.resetRowSelection();
    }, [selectedRows, table]);

    return (
        <section
            aria-labelledby="line-items-heading"
            className="flex w-full min-w-0 flex-col gap-4"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="grid gap-0.5">
                    <h2
                        className="font-semibold text-base sm:text-lg"
                        id="line-items-heading"
                    >
                        Line items
                    </h2>
                    <p className="text-muted-foreground text-sm" role="status">
                        {selectedCount > 0
                            ? `${selectedCount} of ${pluralize(data.length)} selected`
                            : pluralize(data.length)}
                    </p>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                    {selectedCount > 0 ? (
                        <Button
                            className={cn("w-full sm:w-auto", ICON_BUTTON, TONE.rose.text, TONE.rose.hover)}
                            onClick={openBulkDelete}
                            type="button"
                            variant="outline"
                        >
                            <Trash2Icon aria-hidden="true" />
                            Delete selected
                        </Button>
                    ) : null}
                    <Button
                        className={cn("w-full sm:w-auto", PRIMARY_BUTTON)}
                        onClick={openAdd}
                        type="button"
                    >
                        <PlusIcon aria-hidden="true" />
                        Add line item
                    </Button>
                </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
                {allRows.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableCaption className="sr-only">
                                    Invoice line items with tax breakdown
                                </TableCaption>
                                <TableHeader className="bg-muted/60">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow
                                            className="hover:bg-transparent"
                                            key={headerGroup.id}
                                        >
                                            {headerGroup.headers.map((header) => (
                                                <TableHead
                                                    className={cn(
                                                        "h-11 whitespace-nowrap font-semibold text-muted-foreground text-xs uppercase tracking-wider",
                                                        COLUMN_CLASS[header.column.id],
                                                    )}
                                                    key={header.id}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext(),
                                                        )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <Fragment key={row.id}>
                                            <TableRow
                                                className={cn(
                                                    "transition-colors hover:bg-emerald-500/5",
                                                    row.getIsSelected() && "bg-emerald-500/10",
                                                )}
                                                data-state={row.getIsSelected() ? "selected" : undefined}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell
                                                        className={cn("py-3", COLUMN_CLASS[cell.column.id])}
                                                        key={cell.id}
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                            {row.getIsExpanded() ? (
                                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                                    <TableCell
                                                        className="whitespace-normal px-3 py-3 sm:px-4"
                                                        colSpan={row.getVisibleCells().length}
                                                    >
                                                        <RowPanel item={row.original} onEdit={openEdit} />
                                                    </TableCell>
                                                </TableRow>
                                            ) : null}
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="border-t px-3 py-3 sm:px-4">
                            <CustomPagination
                                currentPage={currentPage}
                                itemLabel="items"
                                onPageChange={setPage}
                                pageSize={PAGE_SIZE}
                                totalItems={allRows.length}
                                totalPages={pageCount}
                            />
                        </div>
                    </>
                ) : (
                    <EmptyState onAdd={openAdd} />
                )}
            </div>

            <InvoiceSummaryPanel items={deferredData} />

            {modal.loaded ? (
                <InvoiceItemModal
                    item={modal.item}
                    onOpenChange={handleModalOpenChange}
                    onSubmit={handleSubmit}
                    open={modal.open}
                />
            ) : null}

            <ConfirmDialog
                confirmLabel="Delete item"
                description={
                    deleteItem
                        ? `"${deleteItem.productDescription}" will be removed from this invoice.`
                        : undefined
                }
                onConfirm={handleConfirmDelete}
                onOpenChange={setDeleteOpen}
                open={deleteOpen}
                title="Delete line item?"
            />

            <ConfirmDialog
                confirmLabel={`Delete ${pluralize(bulkCount)}`}
                description="The selected items will be removed from this invoice."
                onConfirm={handleConfirmBulkDelete}
                onOpenChange={setBulkDeleteOpen}
                open={bulkDeleteOpen}
                title={`Delete ${pluralize(bulkCount)}?`}
            />
        </section>
    );
}