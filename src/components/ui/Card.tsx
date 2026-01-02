import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-border p-6 transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
                } ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
