import { Timestamp } from 'firebase/firestore';
import type { UserRole, UserPermissions } from './user';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
    id?: string;
    token: string;
    displayName: string;
    email: string;
    role: UserRole;
    permissions: UserPermissions;
    createdBy: string;
    createdAt: Timestamp;
    expiresAt: Timestamp;
    status: InvitationStatus;
    usedAt?: Timestamp;
}
