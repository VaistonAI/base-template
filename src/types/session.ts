import { Timestamp } from 'firebase/firestore';

// Sesión clínica
export interface Session {
    id: string;
    patientId: string;
    patientName: string;
    appointmentId?: string;
    psychologistId: string;
    psychologistName: string;
    date: Timestamp;
    duration: number; // en minutos
    notes: string;
    progress: string;
    nextObjectives: string;
    attachments: SessionAttachment[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
}

// Adjunto de sesión
export interface SessionAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Timestamp;
}
