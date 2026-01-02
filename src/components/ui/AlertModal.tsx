import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'warning' | 'error' | 'info';
    buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'warning',
    buttonText = 'Entendido',
}) => {
    const iconConfig = {
        warning: {
            bg: 'bg-warning/10',
            color: 'text-warning',
            path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        },
        error: {
            bg: 'bg-danger/10',
            color: 'text-danger',
            path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        info: {
            bg: 'bg-info/10',
            color: 'text-info',
            path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        },
    };

    const config = iconConfig[type];

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center py-4">
                {/* Icon */}
                <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${config.bg} mb-4`}>
                    <svg
                        className={`h-10 w-10 ${config.color}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={config.path}
                        />
                    </svg>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>

                {/* Message */}
                <p className="text-text-secondary mb-6">{message}</p>

                {/* Action */}
                <Button
                    variant="primary"
                    onClick={onClose}
                    className="min-w-[120px]"
                >
                    {buttonText}
                </Button>
            </div>
        </Modal>
    );
};
