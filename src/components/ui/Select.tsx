import React, { type SelectHTMLAttributes, useState } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    className = '',
    children,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-text-primary mb-2 transition-colors">
                    {label}
                    {props.required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all duration-200
          ${error
                            ? 'border-danger focus:ring-2 focus:ring-danger/20 bg-danger/5'
                            : isFocused
                                ? 'border-primary focus:ring-2 focus:ring-primary/20 bg-white'
                                : 'border-border focus:border-primary hover:border-primary/70 bg-white/50'
                        }
          outline-none text-text-primary cursor-pointer
          ${className}`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                >
                    {children}
                </select>
            </div>
            <div className="flex justify-between items-center mt-1.5">
                <div className="min-h-[20px]">
                    {error && (
                        <p className="text-xs sm:text-sm text-danger font-medium">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};
