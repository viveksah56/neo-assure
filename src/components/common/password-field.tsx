"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PasswordAutoComplete = "current-password" | "new-password" | "one-time-code";

type IconComponent = React.ElementType<{ className?: string }>;

export interface PasswordInputFieldProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "autoComplete" | "className"> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: IconComponent;
    autoComplete?: PasswordAutoComplete;
    className?: string;
    containerClassName?: string;
    id?: string;
}

function PasswordInputFieldBase(
    {
        className,
        containerClassName,
        label,
        error,
        helperText,
        icon: Icon,
        required,
        disabled,
        id: externalId,
        autoComplete = "current-password",
        ...props
    }: PasswordInputFieldProps,
    ref: React.ForwardedRef<HTMLInputElement>
) {
    const generatedId = React.useId();
    const id = externalId ?? generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const [showPassword, setShowPassword] = React.useState(false);

    const hasError = !!error;
    const describedBy = hasError ? errorId : helperText ? helperId : undefined;

    const togglePasswordVisibility = React.useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    return (
        <Field className={cn("w-full space-y-1.5", containerClassName)}>
            {label && (
                <FieldLabel
                    htmlFor={id}
                    className={cn(
                        "block text-sm font-medium leading-none",
                        hasError ? "text-destructive" : "text-foreground",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    {label}
                    {required && (
                        <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
                    )}
                </FieldLabel>
            )}

            <div className="relative w-full">
                {Icon && (
                    <span
                        className={cn(
                            "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground",
                            hasError && "text-destructive"
                        )}
                        aria-hidden="true"
                    >
            <Icon className="h-4 w-4 shrink-0" />
          </span>
                )}

                <Input
                    ref={ref}
                    id={id}
                    disabled={disabled}
                    required={required}
                    type={showPassword ? "text" : "password"}
                    autoComplete={autoComplete}
                    aria-invalid={hasError}
                    aria-describedby={describedBy}
                    className={cn(
                        "w-full text-base sm:text-sm pr-10 px-3 sm:px-4",
                        "bg-background text-foreground placeholder:text-muted-foreground",
                        "border border-input rounded-md",
                        "transition-colors duration-150 ease-out",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        Icon && "pl-10",
                        hasError && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                    {...props}
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className={cn(
                        "absolute right-0 top-0 h-full px-3 py-2",
                        "hover:bg-transparent",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                        "text-muted-foreground"
                    )}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                </Button>
            </div>

            {hasError ? (
                <FieldError id={errorId} role="alert" aria-live="assertive" className="text-destructive">
                    {error}
                </FieldError>
            ) : helperText ? (
                <FieldDescription id={helperId} className="break-words text-xs text-muted-foreground">
                    {helperText}
                </FieldDescription>
            ) : null}
        </Field>
    );
}

const PasswordInputField = React.memo(React.forwardRef(PasswordInputFieldBase));
PasswordInputField.displayName = "PasswordInputField";

export default PasswordInputField;