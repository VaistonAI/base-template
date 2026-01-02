import { Timestamp } from 'firebase/firestore';

export type ConsultationStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type PaymentStatus = 'pending' | 'paid';

export interface Consultation {
    id: string;
    patientId?: string;
    patientName?: string; // Denormalizado para búsquedas
    psychologistId?: string; // ID del psicólogo asignado
    psychologistName?: string; // Denormalizado para búsquedas
    officeId?: string;
    officeName?: string; // Denormalizado para búsquedas
    date: Timestamp;
    duration: number; // en minutos
    status: ConsultationStatus;

    // Notas clínicas (antes en Session)
    reason?: string; // Motivo de consulta
    notes?: string; // Notas de la sesión
    diagnosis?: string; // Diagnóstico
    treatmentPlan?: string; // Plan de tratamiento
    nextSessionGoals?: string; // Objetivos para próxima sesión
    attachments?: string[]; // URLs de archivos adjuntos

    // Cobro integrado
    amount?: number; // Monto de la consulta
    paymentMethod?: PaymentMethod;
    paymentStatus: PaymentStatus;
    invoiceId?: string; // Referencia a factura generada automáticamente

    // Metadata
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ConsultationFormData {
    patientId?: string;
    patientName?: string; // Nombre libre o del paciente
    psychologistId?: string;
    officeId?: string;
    date: Date;
    time: string;
    duration: number;
    status: ConsultationStatus;
    reason?: string;
    notes?: string;
    diagnosis?: string;
    treatmentPlan?: string;
    nextSessionGoals?: string;
    amount?: number;
    paymentMethod?: PaymentMethod;
    tax?: number; // IVA para el cobro
}
