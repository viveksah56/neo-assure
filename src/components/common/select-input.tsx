"use client";

import * as React from "react";
import type { ElementType, ReactNode, Ref, SVGProps } from "react";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectValueType = string | number;

export interface Option<T extends SelectValueType = SelectValueType> {
    readonly value: T;
    readonly label: string;
    readonly disabled?: boolean;
}

export interface SelectInputFieldProps<T extends SelectValueType = string> {
    readonly options: readonly Option<T>[];
    readonly onValueChange: (value: T) => void | Promise<void>;
    readonly placeholder: string;
    readonly label?: string;
    readonly name?: string;
    readonly value?: T;
    readonly error?: string;
    readonly helperText?: string;
    readonly className?: string;
    readonly required?: boolean;
    readonly disabled?: boolean;
    readonly icon?: ElementType<SVGProps<SVGSVGElement>>;
    readonly ref?: Ref<HTMLButtonElement>;
}

type SelectInputFieldComponent = {
    <T extends SelectValueType = string>(props: SelectInputFieldProps<T>): ReactNode;
    displayName: string;
};

function SelectInputFieldInner<T extends SelectValueType = string>({
                                                                       options,
                                                                       onValueChange,
                                                                       placeholder,
                                                                       label,
                                                                       name,
                                                                       value,
                                                                       error,
                                                                       helperText,
                                                                       className,
                                                                       required,
                                                                       disabled,
                                                                       icon: Icon,
                                                                       ref,
                                                                   }: SelectInputFieldProps<T>): ReactNode {
    const fieldId = React.useId();
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    const hasError = Boolean(error);
    const describedBy = hasError ? errorId : helperText ? helperId : undefined;
    const stringValue = value !== undefined ? String(value) : null;
    const accessibleName = label ? undefined : placeholder;

    const optionsMap = React.useMemo(() => {
        const map = new Map<string, Option<T>>();
        for (const option of options) {
            map.set(String(option.value), option);
        }
        return map;
    }, [options]);

    const handleValueChange = React.useCallback(
        (newValue: string | null) => {
            if (newValue === null) {
                return;
            }
            const matchedOption = optionsMap.get(newValue);
            if (matchedOption) {
                onValueChange(matchedOption.value);
            }
        },
        [optionsMap, onValueChange]
    );

    const optionItems = React.useMemo(
        () =>
            options.map(({ value: optValue, label: optLabel, disabled: optDisabled }) => (
                <SelectItem key={String(optValue)} value={String(optValue)} disabled={optDisabled}>
                    {optLabel}
                </SelectItem>
            )),
        [options]
    );

    return (
        <Field className="w-full space-y-1.5">
            {label ? (
                <FieldLabel
                    htmlFor={fieldId}
                    className={cn(
                        "text-sm font-medium leading-none",
                        hasError && "text-destructive",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    {label}
                    {required ? (
                        <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
                    ) : null}
                </FieldLabel>
            ) : null}

            <div className="relative w-full">
                {Icon ? (
                    <div
                        className={cn(
                            "pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center text-muted-foreground",
                            hasError && "text-destructive"
                        )}
                        aria-hidden="true"
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                    </div>
                ) : null}

                <Select
                    name={name}
                    value={stringValue}
                    onValueChange={handleValueChange}
                    disabled={disabled}
                >
                    <SelectTrigger
                        ref={ref}
                        id={fieldId}
                        aria-label={accessibleName}
                        aria-required={required}
                        aria-invalid={hasError}
                        aria-describedby={describedBy}
                        className={cn(
                            "w-full",
                            Icon && "pl-9",
                            hasError && "border-destructive focus-visible:ring-destructive/50",
                            className
                        )}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectGroup aria-label={label ?? placeholder}>{optionItems}</SelectGroup>
                    </SelectContent>
                </Select>
            </div>

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
                <FieldDescription id={helperId} className="text-sm text-muted-foreground">
                    {helperText}
                </FieldDescription>
            ) : null}
        </Field>
    );
}

const SelectInputField = React.memo(SelectInputFieldInner) as unknown as SelectInputFieldComponent;
SelectInputField.displayName = "SelectInputField";

export { SelectInputField };
export default SelectInputField;