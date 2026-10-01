"use client";

import * as React from "react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    boundaryCount?: number;
    showFirstLast?: boolean;
    pageSize?: number;
    totalItems?: number;
    itemLabel?: string;
    disabled?: boolean;
    ariaLabel?: string;
    className?: string;
}

type PageItem = number | "start-ellipsis" | "end-ellipsis";

const styles = {
    base:
        "h-10 min-w-10 shrink-0 select-none rounded-xl border px-2 text-sm font-semibold tabular-nums " +
        "transition-all duration-150 ease-out " +
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
        "active:scale-95",
    idle:
        "border-border bg-card text-foreground/80 " +
        "hover:border-emerald-400 hover:bg-emerald-500 hover:text-white",
    active:
        "border-transparent bg-emerald-600 text-white " +
        "hover:bg-emerald-700 hover:text-white",
    nav:
        "border-border/60 bg-card/50 text-muted-foreground " +
        "hover:border-muted-foreground/50 hover:bg-muted hover:text-foreground",
    off: "pointer-events-none opacity-40",
    disabledAll: "pointer-events-none opacity-50",
    ellipsis:
        "flex h-10 min-w-8 items-end justify-center pb-2.5 text-sm font-semibold text-muted-foreground",
} as const;

const range = (start: number, end: number): number[] =>
    Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);

export function getPaginationRange(
    currentPage: number,
    totalPages: number,
    siblingCount = 1,
    boundaryCount = 1,
): PageItem[] {
    const totalSlots = boundaryCount * 2 + siblingCount * 2 + 3;
    if (totalPages <= totalSlots) return range(1, totalPages);

    const startPages = range(1, boundaryCount);
    const endPages = range(totalPages - boundaryCount + 1, totalPages);

    const siblingsStart = Math.max(
        Math.min(
            currentPage - siblingCount,
            totalPages - boundaryCount - siblingCount * 2 - 1,
        ),
        boundaryCount + 2,
    );
    const siblingsEnd = Math.min(
        Math.max(currentPage + siblingCount, boundaryCount + siblingCount * 2 + 2),
        endPages.length > 0 ? endPages[0] - 2 : totalPages - 1,
    );

    return [
        ...startPages,
        siblingsStart > boundaryCount + 2 ? "start-ellipsis" : boundaryCount + 1,
        ...range(siblingsStart, siblingsEnd),
        siblingsEnd < totalPages - boundaryCount - 1
            ? "end-ellipsis"
            : totalPages - boundaryCount,
        ...endPages,
    ];
}

function CustomPaginationComponent({
                                       currentPage,
                                       totalPages,
                                       onPageChange,
                                       siblingCount = 1,
                                       boundaryCount = 1,
                                       showFirstLast = true,
                                       pageSize,
                                       totalItems,
                                       itemLabel = "results",
                                       disabled = false,
                                       ariaLabel = "Pagination",
                                       className,
                                   }: CustomPaginationProps) {
    const safeTotal = Math.max(1, totalPages);
    const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
    const isFirst = safeCurrent === 1;
    const isLast = safeCurrent === safeTotal;

    const hasSummary = totalItems !== undefined && pageSize !== undefined;
    const hasLeft = hasSummary;

    const items = React.useMemo(
        () => getPaginationRange(safeCurrent, safeTotal, siblingCount, boundaryCount),
        [safeCurrent, safeTotal, siblingCount, boundaryCount],
    );

    const handleClick = React.useCallback(
        (page: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            if (disabled) return;
            const target = Math.min(Math.max(1, page), safeTotal);
            if (target !== safeCurrent) onPageChange(target);
        },
        [disabled, safeTotal, safeCurrent, onPageChange],
    );

    if (safeTotal <= 1 && !hasLeft) return null;

    const from = hasSummary && totalItems > 0 ? (safeCurrent - 1) * pageSize + 1 : 0;
    const to = hasSummary ? Math.min(safeCurrent * pageSize, totalItems) : 0;

    const navLink = (
        page: number,
        label: string,
        off: boolean,
        icon: React.ReactNode,
    ) => (
        <PaginationItem>
            <PaginationLink
                href="#"
                size="icon"
                aria-label={label}
                aria-disabled={off || disabled}
                tabIndex={off || disabled ? -1 : undefined}
                onClick={handleClick(page)}
                className={cn(styles.base, styles.nav, (off || disabled) && styles.off)}
            >
                {icon}
            </PaginationLink>
        </PaginationItem>
    );

    return (
        <div
            className={cn(
                "flex w-full flex-col-reverse items-center gap-3 lg:flex-row lg:gap-6",
                hasLeft ? "lg:justify-between" : "lg:justify-center",
                className,
            )}
        >
            {hasLeft && (
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm lg:justify-start">
                    {hasSummary && (
                        <p className="whitespace-nowrap text-muted-foreground">
                            Showing {from} - {to} of {totalItems} {itemLabel}
                        </p>
                    )}
                </div>
            )}

            {safeTotal > 1 && (
                <Pagination
                    aria-label={ariaLabel}
                    className={cn(
                        "mx-0 w-full sm:w-auto",
                        disabled && styles.disabledAll,
                    )}
                >
                    <PaginationContent className="w-full flex-nowrap justify-between gap-2 sm:w-auto sm:justify-center">
                        {showFirstLast &&
                            navLink(1, "First page", isFirst, <ChevronsLeft className="h-4 w-4" />)}
                        {navLink(
                            safeCurrent - 1,
                            "Previous page",
                            isFirst,
                            <ChevronLeft className="h-4 w-4" />,
                        )}

                        <PaginationItem className="sm:hidden">
                            <span
                                className="block min-w-16 text-center text-sm font-semibold tabular-nums text-foreground"
                                aria-hidden="true"
                            >
                                {safeCurrent} / {safeTotal}
                            </span>
                        </PaginationItem>

                        {items.map((item) =>
                            typeof item === "number" ? (
                                <PaginationItem key={item} className="hidden sm:block">
                                    <PaginationLink
                                        href="#"
                                        size="icon"
                                        isActive={item === safeCurrent}
                                        aria-label={`Page ${item}`}
                                        aria-disabled={disabled}
                                        onClick={handleClick(item)}
                                        className={cn(
                                            styles.base,
                                            item === safeCurrent ? styles.active : styles.idle,

                                        )}
                                    >
                                        {item}
                                    </PaginationLink>
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={item} className="hidden sm:block">
                                    <PaginationEllipsis className={styles.ellipsis} />
                                </PaginationItem>
                            ),
                        )}

                        {navLink(
                            safeCurrent + 1,
                            "Next page",
                            isLast,
                            <ChevronRight className="h-4 w-4" />,
                        )}
                        {showFirstLast &&
                            navLink(
                                safeTotal,
                                "Last page",
                                isLast,
                                <ChevronsRight className="h-4 w-4" />,
                            )}
                    </PaginationContent>
                </Pagination>
            )}

            <p className="sr-only" role="status" aria-live="polite">
                Page {safeCurrent} of {safeTotal}
            </p>
        </div>
    );
}

export const CustomPagination = React.memo(CustomPaginationComponent);
CustomPagination.displayName = "CustomPagination";

export default CustomPagination;