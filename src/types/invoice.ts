import { Timestamp } from 'firebase/firestore';

// Estado de factura
export const InvoiceStatus = {
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

// Estado de pago
export const PaymentStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

// Método de pago
export const PaymentMethod = {
    CASH: 'cash',
    CARD: 'card',
    TRANSFER: 'transfer',
    CHECK: 'check',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// Concepto de factura
export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

// Factura
export interface Invoice {
    id: string;
    invoiceNumber: string;
    patientId?: string;
    patientName?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: InvoiceStatus;
    issueDate: Timestamp;
    dueDate: Timestamp;
    paidDate?: Timestamp;
    notes: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
}

// Pago
export interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    notes: string;
    paymentDate: Timestamp;
    createdAt: Timestamp;
    createdBy: string;
}
