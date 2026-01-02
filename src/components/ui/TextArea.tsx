import React, { type TextareaHTMLAttributes, useState, useEffect } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    maxLength?: number;
    showCharCount?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    maxLength,
    showCharCount = true,
    className = '',
    value,
    onChange,
    rows = 4,
    ...props
}) => {
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        if (value) {
            setCharCount(String(value).length);
        } else {
            setCharCount(0);
        }
    }, [value]);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-text-primary mb-1">
                    {label}
                    {props.required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <textarea
                className={`w-full px-4 py-2 border rounded-lg transition-all duration-200 resize-none
          ${error
                        ? 'border-danger focus:ring-2 focus:ring-danger/20'
                        : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }
          outline-none bg-white text-text-primary placeholder-text-secondary
          ${className}`}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                rows={rows}
                {...props}
            />
            <div className="flex justify-between items-center mt-1">
                <div className="min-h-[20px]">
                    {error && (
                        <p className="text-sm text-danger">{error}</p>
                    )}
                </div>
                {maxLength && showCharCount && (
                    <p className="text-xs text-text-secondary">
                        {charCount}/{maxLength}
                    </p>
                )}
            </div>
        </div>
    );
};
