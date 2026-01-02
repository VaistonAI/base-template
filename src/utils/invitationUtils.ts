import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un token único para invitación
 */
export const generateInvitationToken = (): string => {
    return uuidv4();
};

/**
 * Genera el link completo de invitación
 */
export const generateInvitationLink = (token: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?invite=${token}`;
};

/**
 * Valida si una invitación ha expirado
 */
export const isInvitationExpired = (expiresAt: Date): boolean => {
    return new Date() > expiresAt;
};

/**
 * Copia texto al portapapeles
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Fallback para navegadores que no soportan clipboard API
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackError) {
            console.error('Fallback copy failed:', fallbackError);
            return false;
        }
    }
};

/**
 * Calcula la fecha de expiración (7 días desde ahora)
 */
export const getExpirationDate = (): Date => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
};

/**
 * Formatea la fecha de expiración para mostrar
 */
export const formatExpirationDate = (expiresAt: Date): string => {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return 'Expirada';
    } else if (diffDays === 0) {
        return 'Expira hoy';
    } else if (diffDays === 1) {
        return 'Expira mañana';
    } else {
        return `Expira en ${diffDays} días`;
    }
};
