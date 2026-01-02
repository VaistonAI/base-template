import { Timestamp } from 'firebase/firestore';

// Estado del paciente
export const PatientStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISCHARGED: 'discharged',
} as const;

export type PatientStatus = typeof PatientStatus[keyof typeof PatientStatus];

// Paciente
export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Timestamp;
    address: string;
    emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
    };
    status: PatientStatus;
    notes: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string; // UID del usuario que creó el registro
}
