import { Timestamp } from 'firebase/firestore';

// Roles de usuario
export const UserRole = {
    ADMIN: 'admin',
    PSYCHOLOGIST: 'psychologist',
    RECEPTIONIST: 'receptionist',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Permisos
export interface UserPermissions {
    canManageUsers: boolean;
    canManagePatients: boolean;
    canManageAppointments: boolean;
    canManageOffices: boolean;
    canManageBilling: boolean;
    canViewReports: boolean;
    canManageSessions: boolean;
}

// Usuario del sistema
export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    permissions: UserPermissions;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isActive: boolean;
}

// Función para obtener permisos por rol
export const getPermissionsByRole = (_role: UserRole): UserPermissions => {
    // Todos los roles tienen acceso completo por simplificación
    return {
        canManageUsers: true,
        canManagePatients: true,
        canManageAppointments: true,
        canManageOffices: true,
        canManageBilling: true,
        canViewReports: true,
        canManageSessions: true,
    };
};
