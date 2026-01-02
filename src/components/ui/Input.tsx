import React, { type InputHTMLAttributes, useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    maxLength?: number;
    showCharCount?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    maxLength,
    showCharCount = true,
    className = '',
    value,
    onChange,
    type,
    ...props
}) => {
    const [charCount, setCharCount] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPasswordField = type === 'password';

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
                <label className="block text-xs sm:text-sm font-medium text-text-primary mb-2 transition-colors">
                    {label}
                    {props.required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all duration-200
          ${error
                            ? 'border-danger focus:ring-2 focus:ring-danger/20 bg-danger/5'
                            : isFocused
                                ? 'border-primary focus:ring-2 focus:ring-primary/20 bg-white'
                                : 'border-border focus:border-primary hover:border-primary/70 bg-white/50'
                        }
          outline-none text-text-primary placeholder-text-secondary/70
          ${isPasswordField ? 'pr-10' : ''}
          ${className}`}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    maxLength={maxLength}
                    type={isPasswordField && showPassword ? 'text' : type}
                    {...props}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        tabIndex={-1}
                    >
                        {showPassword ? <FaEyeSlash className="text-base sm:text-lg" /> : <FaEye className="text-base sm:text-lg" />}
                    </button>
                )}
            </div>
            <div className="flex justify-between items-center mt-1.5">
                <div className="min-h-[20px]">
                    {error && (
                        <p className="text-xs sm:text-sm text-danger font-medium">{error}</p>
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
