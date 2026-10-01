"use client";

import * as React from "react";
import type { ElementType, Ref, SVGProps } from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field";

interface DateInputProps {
    label?: string;
    value?: Date;
    onValueChange: (date: Date | undefined) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: ElementType<SVGProps<SVGSVGElement>>;
    minDate?: Date;
    maxDate?: Date;
    ref?: Ref<HTMLButtonElement>;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

const DateInput = React.memo(function DateInput({
                                                    label,
                                                    value,
                                                    onValueChange,
                                                    placeholder = "Pick a date",
                                                    error,
                                                    helperText,
                                                    required,
                                                    disabled,
                                                    className,
                                                    icon: Icon = CalendarIcon,
                                                    minDate,
                                                    maxDate,
                                                    ref,
                                                }: DateInputProps) {
    const fieldId = React.useId();
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    const [open, setOpen] = React.useState(false);

    const hasError = Boolean(error);

    const describedBy = hasError
        ? errorId
        : helperText
            ? helperId
            : undefined;

    const isDateDisabled = React.useCallback(
        (date: Date) => {
            if (minDate && date < minDate) {
                return true;
            }

            return !!(maxDate && date > maxDate);


        },
        [minDate, maxDate]
    );

    const handleSelect = React.useCallback(
        (date: Date | undefined) => {
            onValueChange(date);
            setOpen(false);
        },
        [onValueChange]
    );

    return (
        <Field className="w-full space-y-1.5">
            {label && (
                <FieldLabel
                    htmlFor={fieldId}
                    className={cn(
                        "text-sm font-medium leading-none",
                        hasError && "text-destructive",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    {label}

                    {required && (
                        <span
                            className="ml-1 text-destructive"
                            aria-hidden="true"
                        >
                            *
                        </span>
                    )}
                </FieldLabel>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    ref={ref}
                    id={fieldId}
                    type="button"
                    disabled={disabled}
                    aria-label={label ?? placeholder}
                    aria-required={required}
                    aria-invalid={hasError}
                    aria-describedby={describedBy}
                    className={cn(
                        "flex h-9 w-full items-center justify-start gap-2",
                        "rounded-md border border-input",
                        "bg-transparent px-3 py-2",
                        "text-sm font-normal",
                        "shadow-xs outline-none",
                        "transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:border-ring",
                        "focus-visible:ring-[3px]",
                        "focus-visible:ring-ring/50",
                        "disabled:pointer-events-none disabled:opacity-50",
                        !value && "text-muted-foreground",
                        hasError &&
                        "border-destructive focus-visible:ring-destructive/50",
                        className
                    )}
                >
                    <Icon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                    />

                    <span className="truncate">
                        {value
                            ? dateFormatter.format(value)
                            : placeholder}
                    </span>
                </PopoverTrigger>

                <PopoverContent
                    className="w-auto p-0"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleSelect}
                        disabled={isDateDisabled}
                        className={cn(
                            "[&_.rdp-month_grid]:gap-2",
                            "[&_.rdp-day_button[data-selected-single=true]]:bg-green-600",
                            "[&_.rdp-day_button[data-selected-single=true]]:text-white",
                            "[&_.rdp-day_button[data-selected-single=true]]:hover:bg-green-700",
                            "[&_.rdp-day_button[data-selected-single=true]]:ring-4",
                            "[&_.rdp-day_button[data-selected-single=true]]:ring-green-200"
                        )}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>

            {hasError ? (
                <FieldDescription
                    id={errorId}
                    role="alert"
                    aria-live="polite"
                    className="text-sm font-medium text-destructive"
                >
                    {error}
                </FieldDescription>
            ) : helperText ? (
                <FieldDescription
                    id={helperId}
                    className="text-sm text-muted-foreground"
                >
                    {helperText}
                </FieldDescription>
            ) : null}
        </Field>
    );
});

DateInput.displayName = "DateInput";

export default DateInput;