"use client";

import {
    memo,
    useCallback,
    useState,
    type MouseEvent,
    type ReactNode,
} from "react";
import { InfoIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
    destructive: {
        icon: TriangleAlertIcon,
        tone: "bg-destructive/10 text-destructive",
        action: "destructive",
    },
    default: {
        icon: InfoIcon,
        tone: "bg-primary/10 text-primary",
        action: "default",
    },
} as const;

export type ConfirmDialogVariant = keyof typeof VARIANT_STYLES;

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    title?: ReactNode;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmDialogVariant;
    icon?: ReactNode;
    className?: string;
}

function ConfirmDialogComponent({
                                    open,
                                    onOpenChange,
                                    onConfirm,
                                    title = "Delete this item?",
                                    description = "This action cannot be undone.",
                                    confirmLabel = "Delete",
                                    cancelLabel = "Cancel",
                                    variant = "destructive",
                                    icon,
                                    className,
                                }: ConfirmDialogProps) {
    const [pending, setPending] = useState(false);
    const styles = VARIANT_STYLES[variant];
    const Icon = styles.icon;

    const handleOpenChange = useCallback(
        (next: boolean) => {
            if (!pending) onOpenChange(next);
        },
        [pending, onOpenChange],
    );

    const handleConfirm = useCallback(
        async (event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            setPending(true);
            try {
                await onConfirm();
                onOpenChange(false);
            } catch {
                return;
            } finally {
                setPending(false);
            }
        },
        [onConfirm, onOpenChange],
    );

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent className={cn("gap-5 sm:max-w-md", className)}>
                <AlertDialogHeader className="items-center gap-4 sm:flex-row sm:items-start">
                    <span
                        aria-hidden
                        className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-full",
                            styles.tone,
                        )}
                    >
                        {icon ?? <Icon className="size-5" />}
                    </span>
                    <div className="grid gap-1.5 text-center sm:text-left">
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {description}
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-3">
                    <AlertDialogCancel
                        disabled={pending}
                        className="w-full sm:w-auto"
                    >
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={pending}
                        aria-busy={pending}
                        className={cn(
                            buttonVariants({ variant: styles.action }),
                            "w-full sm:w-auto",
                        )}
                    >
                        {pending ? <Loader2Icon className="animate-spin" /> : null}
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export const ConfirmDialog = memo(ConfirmDialogComponent);