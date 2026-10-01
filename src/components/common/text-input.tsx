"use client";

import * as React from "react";
import type { ElementType } from "react";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CommonProps {
    label?: string;
    error?: string;
    icon?: ElementType;
    required?: boolean;
    className?: string;
    helperText?: string;
}

interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className" | "required">,
        CommonProps {
    textarea?: false;
}

interface TextareaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className" | "required">,
        CommonProps {
    textarea: true;
}

type TextInputFieldProps = InputProps | TextareaProps;

const TextInputField = React.memo(
    React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextInputFieldProps>(function TextInputField(
        { label, error, icon: Icon, textarea = false, className, required, helperText, ...props },
        ref
    ) {
        const inputId = React.useId();
        const errorId = `${inputId}-error`;
        const helperId = `${inputId}-helper`;
        const describedBy = error ? errorId : helperText ? helperId : undefined;

        const baseClassName = cn(
            "w-full transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring",
            Icon && "pl-9",
            error && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive",
            className
        );

        return (
            <Field className="w-full space-y-2">
                <FieldLabel htmlFor={inputId}>
                    {label}
                    {required && (
                        <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
                    )}
                </FieldLabel>

                <div className="relative w-full">
                    {Icon && (
                        <div
                            className={cn(
                                "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground",
                                error && "text-destructive"
                            )}
                            aria-hidden="true"
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                        </div>
                    )}

                    {textarea ? (
                        <Textarea
                            ref={ref as React.Ref<HTMLTextAreaElement>}
                            id={inputId}
                            required={required}
                            className={cn(baseClassName, "min-h-24")}
                            aria-invalid={!!error}
                            aria-describedby={describedBy}
                            aria-required={required}
                            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        />
                    ) : (
                        <Input
                            ref={ref as React.Ref<HTMLInputElement>}
                            id={inputId}
                            required={required}
                            className={cn(baseClassName, "")}
                            aria-invalid={!!error}
                            aria-describedby={describedBy}
                            aria-required={required}
                            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
                        />
                    )}
                </div>

                {error ? (
                    <FieldError id={errorId} className="text-destructive">
                        {error}
                    </FieldError>
                ) : helperText ? (
                    <FieldDescription id={helperId} className="text-muted-foreground">
                        {helperText}
                    </FieldDescription>
                ) : null}
            </Field>
        );
    })
);

TextInputField.displayName = "TextInputField";

export default TextInputField;