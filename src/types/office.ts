import { Timestamp } from 'firebase/firestore';

// Consultorio
export interface Office {
    id: string;
    name: string;
    address: string;
    capacity: number;
    equipment: string[];
    schedule: {
        [key: string]: { // día de la semana (monday, tuesday, etc.)
            isOpen: boolean;
            openTime: string; // formato HH:mm
            closeTime: string; // formato HH:mm
        };
    };
    isActive: boolean;
    notes: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string;
}
