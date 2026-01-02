import { Timestamp } from 'firebase/firestore';

export type NotificationType =
    | 'patient_created'
    | 'patient_updated'
    | 'patient_deleted'
    | 'record_created'
    | 'record_updated'
    | 'record_deleted'
    | 'office_created'
    | 'office_updated'
    | 'office_deleted'
    | 'consultation_created'
    | 'consultation_updated'
    | 'consultation_deleted'
    | 'invoice_created'
    | 'invoice_updated'
    | 'invoice_deleted'
    | 'invoice_paid'
    | 'user_created'
    | 'user_updated'
    | 'user_deleted'
    | 'invitation_created'
    | 'invitation_accepted'
    | 'invitation_revoked';

export interface Notification {
    id?: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: Timestamp;
    userId: string; // Usuario que debe ver la notificación
    relatedId?: string; // ID relacionado
}
