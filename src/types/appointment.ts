import { Timestamp } from 'firebase/firestore';

// Estado de la cita
export const AppointmentStatus = {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

// Tipo de consulta
export const AppointmentType = {
    INITIAL: 'initial',
    FOLLOWUP: 'followup',
    EMERGENCY: 'emergency',
    GROUP: 'group',
} as const;

export type AppointmentType = typeof AppointmentType[keyof typeof AppointmentType];

// Cita
export interface Appointment {
    id: string;
    patientId: string;
    patientName: string; // Desnormalizado para facilitar búsquedas
    officeId: string;
    officeName: string; // Desnormalizado
    psychologistId: string;
    psychologistName: string; // Desnormalizado
    date: Timestamp;
    duration: number; // en minutos
    type: AppointmentType;
    status: AppointmentStatus;
    notes: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
}
