import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';

    const variantStyles = {
        primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80 focus:ring-primary/30 shadow-md hover:shadow-lg',
        secondary: 'bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/80 focus:ring-secondary/30 shadow-md hover:shadow-lg',
        danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger/80 focus:ring-danger/30 shadow-md hover:shadow-lg',
        success: 'bg-success text-white hover:bg-success/90 active:bg-success/80 focus:ring-success/30 shadow-md hover:shadow-lg',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/30 transition-colors',
    };

    const sizeStyles = {
        sm: 'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm',
        md: 'px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base',
        lg: 'px-6 sm:px-7 py-3 sm:py-3.5 text-base sm:text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs sm:text-sm">Cargando...</span>
                </span>
            ) : (
                children
            )}
        </button>
    );
};
