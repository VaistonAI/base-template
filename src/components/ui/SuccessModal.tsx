import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttonText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    buttonText = 'Aceptar',
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center py-4">
                {/* Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
                    <svg
                        className="h-10 w-10 text-success"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>

                {/* Message */}
                <p className="text-text-secondary mb-6">{message}</p>

                {/* Action */}
                <Button
                    variant="success"
                    onClick={onClose}
                    className="min-w-[120px]"
                >
                    {buttonText}
                </Button>
            </div>
        </Modal>
    );
};
