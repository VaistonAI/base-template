// Mensajes de error estandarizados
export const getRequiredFieldError = (fieldName: string): string => {
    return `Campo ${fieldName} obligatorio`;
};

// Traducciones de errores de Firebase Auth
export const firebaseErrorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
    'auth/invalid-email': 'Correo electrónico inválido',
    'auth/operation-not-allowed': 'Operación no permitida',
    'auth/weak-password': 'La contraseña es demasiado débil',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Credenciales inválidas',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/popup-closed-by-user': 'Ventana de inicio de sesión cerrada',
    'auth/cancelled-popup-request': 'Solicitud cancelada',
    'auth/popup-blocked': 'Ventana emergente bloqueada por el navegador',
    'auth/missing-email': 'Falta el correo electrónico',
    'auth/internal-error': 'Error interno del servidor',
    'auth/invalid-api-key': 'Clave API inválida',
    'auth/app-deleted': 'Aplicación eliminada',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo',
    'auth/credential-already-in-use': 'Credencial ya en uso',
    'auth/timeout': 'Tiempo de espera agotado',
    'permission-denied': 'Permisos insuficientes',
    'unauthenticated': 'Debes iniciar sesión',
    'not-found': 'Recurso no encontrado',
    'already-exists': 'El recurso ya existe',
    'resource-exhausted': 'Cuota excedida',
    'failed-precondition': 'Operación rechazada',
    'aborted': 'Operación abortada',
    'out-of-range': 'Operación fuera de rango',
    'unimplemented': 'Operación no implementada',
    'internal': 'Error interno',
    'unavailable': 'Servicio no disponible',
    'data-loss': 'Pérdida de datos',
};

export const getFirebaseErrorMessage = (errorCode: string): string => {
    return firebaseErrorMessages[errorCode] || 'Ha ocurrido un error. Intenta nuevamente';
};

// Mensajes de validación comunes
export const validationMessages = {
    email: {
        required: getRequiredFieldError('Correo electrónico'),
        invalid: 'Correo electrónico inválido',
    },
    password: {
        required: getRequiredFieldError('Contraseña'),
        minLength: (min: number) => `La contraseña debe tener al menos ${min} caracteres`,
        weak: 'La contraseña debe contener mayúsculas, minúsculas y números',
    },
    name: {
        required: getRequiredFieldError('Nombre'),
        minLength: (min: number) => `El nombre debe tener al menos ${min} caracteres`,
    },
    phone: {
        required: getRequiredFieldError('Teléfono'),
        invalid: 'Número de teléfono inválido',
    },
    date: {
        required: getRequiredFieldError('Fecha'),
        invalid: 'Fecha inválida',
    },
    time: {
        required: getRequiredFieldError('Hora'),
        invalid: 'Hora inválida',
    },
    amount: {
        required: getRequiredFieldError('Monto'),
        invalid: 'Monto inválido',
        min: (min: number) => `El monto mínimo es ${min}`,
    },
};
