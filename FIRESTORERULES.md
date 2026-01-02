# Reglas de Seguridad de Firestore

Este documento contiene las reglas de seguridad recomendadas para Firebase Firestore del CRM para Psicólogos.

## 📋 Reglas Completas

Copia y pega estas reglas en la consola de Firebase (Firestore Database → Rules):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================
    
    // Verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Verificar si el usuario es el propietario del documento
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Obtener el rol del usuario
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Verificar si el usuario es administrador
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Verificar si el usuario es psicólogo
    function isPsychologist() {
      return isAuthenticated() && getUserRole() == 'psychologist';
    }
    
    // Verificar si el usuario es recepcionista
    function isReceptionist() {
      return isAuthenticated() && getUserRole() == 'receptionist';
    }
    
    // Verificar si el usuario puede gestionar pacientes
    function canManagePatients() {
      return isAdmin() || isPsychologist() || isReceptionist();
    }
    
    // Verificar si el usuario puede gestionar citas
    function canManageAppointments() {
      return isAdmin() || isPsychologist() || isReceptionist();
    }
    
    // Verificar si el usuario puede gestionar sesiones
    function canManageSessions() {
      return isAdmin() || isPsychologist();
    }
    
    // Verificar si el usuario puede gestionar facturación
    function canManageBilling() {
      return isAdmin() || isPsychologist() || isReceptionist();
    }
    
    // Verificar si el usuario puede ver reportes
    function canViewReports() {
      return isAuthenticated(); // Todos los usuarios autenticados pueden ver reportes
    }
    
    // Verificar si el usuario puede gestionar usuarios
    function canManageUsers() {
      return isAdmin();
    }
    
    // Verificar si el usuario puede gestionar consultorios
    function canManageOffices() {
      return isAdmin() || isPsychologist();
    }
    
    // ============================================
    // REGLAS POR COLECCIÓN
    // ============================================
    
    // USUARIOS
    match /users/{userId} {
      // Leer: El propio usuario o administradores
      allow read: if isOwner(userId) || isAdmin();
      
      // Crear: Solo administradores
      allow create: if isAdmin();
      
      // Actualizar: El propio usuario (solo ciertos campos) o administradores
      allow update: if isOwner(userId) || isAdmin();
      
      // Eliminar: Solo administradores
      allow delete: if isAdmin();
    }
    
    // PACIENTES
    match /patients/{patientId} {
      // Leer: Usuarios que pueden gestionar pacientes
      allow read: if canManagePatients();
      
      // Crear: Usuarios que pueden gestionar pacientes
      allow create: if canManagePatients() 
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.keys().hasAll(['firstName', 'lastName', 'email', 'phone']);
      
      // Actualizar: Usuarios que pueden gestionar pacientes
      allow update: if canManagePatients();
      
      // Eliminar: Solo administradores y psicólogos
      allow delete: if isAdmin() || isPsychologist();
    }
    
    // CONSULTORIOS
    match /offices/{officeId} {
      // Leer: Todos los usuarios autenticados
      allow read: if isAuthenticated();
      
      // Crear: Usuarios que pueden gestionar consultorios
      allow create: if canManageOffices()
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.keys().hasAll(['name', 'location']);
      
      // Actualizar: Usuarios que pueden gestionar consultorios
      allow update: if canManageOffices();
      
      // Eliminar: Solo administradores
      allow delete: if isAdmin();
    }
    
    // CITAS
    match /appointments/{appointmentId} {
      // Leer: Usuarios que pueden gestionar citas
      allow read: if canManageAppointments();
      
      // Crear: Usuarios que pueden gestionar citas
      allow create: if canManageAppointments()
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.keys().hasAll(['patientId', 'officeId', 'date', 'duration']);
      
      // Actualizar: Usuarios que pueden gestionar citas
      allow update: if canManageAppointments();
      
      // Eliminar: Administradores y psicólogos
      allow delete: if isAdmin() || isPsychologist();
    }
    
    // SESIONES
    match /sessions/{sessionId} {
      // Leer: Usuarios que pueden gestionar sesiones
      allow read: if canManageSessions();
      
      // Crear: Usuarios que pueden gestionar sesiones
      allow create: if canManageSessions()
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.keys().hasAll(['patientId', 'date', 'duration', 'notes']);
      
      // Actualizar: Usuarios que pueden gestionar sesiones
      allow update: if canManageSessions();
      
      // Eliminar: Solo administradores y psicólogos
      allow delete: if isAdmin() || isPsychologist();
    }
    
    // FACTURAS
    match /invoices/{invoiceId} {
      // Leer: Usuarios que pueden gestionar facturación
      allow read: if canManageBilling();
      
      // Crear: Usuarios que pueden gestionar facturación
      allow create: if canManageBilling()
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.keys().hasAll(['patientId', 'amount', 'status']);
      
      // Actualizar: Usuarios que pueden gestionar facturación
      allow update: if canManageBilling();
      
      // Eliminar: Solo administradores
      allow delete: if isAdmin();
    }
    
    // PAGOS
    match /payments/{paymentId} {
      // Leer: Usuarios que pueden gestionar facturación
      allow read: if canManageBilling();
      
      // Crear: Usuarios que pueden gestionar facturación
      allow create: if canManageBilling()
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.keys().hasAll(['invoiceId', 'amount', 'method']);
      
      // Actualizar: Solo administradores
      allow update: if isAdmin();
      
      // Eliminar: Solo administradores
      allow delete: if isAdmin();
    }
    
    // Denegar acceso a cualquier otra colección no especificada
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔐 Descripción de las Reglas

### Funciones Auxiliares

Las funciones auxiliares permiten reutilizar lógica de seguridad:

- **`isAuthenticated()`**: Verifica que el usuario esté autenticado
- **`isOwner(userId)`**: Verifica que el usuario sea el propietario del documento
- **`getUserRole()`**: Obtiene el rol del usuario desde la colección `users`
- **`isAdmin()`**: Verifica si el usuario es administrador
- **`isPsychologist()`**: Verifica si el usuario es psicólogo
- **`isReceptionist()`**: Verifica si el usuario es recepcionista
- **`canManage*()`**: Funciones específicas para cada tipo de permiso

### Permisos por Rol

| Colección | Admin | Psicólogo | Recepcionista | Visualizador |
|-----------|-------|-----------|---------------|--------------|
| **users** | CRUD | Read (propio) | Read (propio) | Read (propio) |
| **patients** | CRUD | CRUD | CRUD | Read |
| **offices** | CRUD | CRUD | Read | Read |
| **appointments** | CRUD | CRUD | CRUD | Read |
| **sessions** | CRUD | CRUD | Read | Read |
| **invoices** | CRUD | CRUD | CRUD | Read |
| **payments** | CRUD | Read | CRUD | Read |

### Validaciones Implementadas

1. **Autenticación obligatoria**: Todos los accesos requieren autenticación
2. **Validación de campos**: Se verifica que los documentos tengan campos requeridos
3. **Validación de creador**: Se verifica que `createdBy` sea el usuario actual
4. **Validación de rol**: Se verifica el rol del usuario para cada operación
5. **Protección de eliminación**: Solo administradores pueden eliminar la mayoría de documentos

## 📝 Notas Importantes

### Seguridad

- ✅ Todas las operaciones requieren autenticación
- ✅ Los roles se verifican en cada operación
- ✅ Los usuarios solo pueden ver/editar lo que les corresponde
- ✅ Las eliminaciones están restringidas a administradores
- ✅ Se validan campos requeridos en creación

### Rendimiento

- ⚠️ Las reglas usan `get()` para obtener el rol del usuario, lo que cuenta como una lectura adicional
- 💡 Considera usar Custom Claims de Firebase Auth para mejorar el rendimiento en producción

### Testing

Para probar las reglas en la consola de Firebase:

1. Ve a Firestore Database → Rules
2. Haz clic en "Rules Playground"
3. Simula operaciones con diferentes usuarios y roles

## 🚀 Implementación

### Paso 1: Copiar Reglas

1. Ve a la consola de Firebase
2. Selecciona tu proyecto
3. Ve a Firestore Database → Rules
4. Copia y pega las reglas de arriba
5. Haz clic en "Publicar"

### Paso 2: Crear Usuario Inicial

Asegúrate de crear al menos un usuario administrador:

```javascript
// En la consola de Firestore, crea un documento en la colección 'users'
{
  uid: "ID_DEL_USUARIO_DE_AUTH",
  email: "admin@vaiston.com",
  displayName: "Administrador",
  role: "admin",
  isActive: true,
  permissions: {
    canManagePatients: true,
    canManageOffices: true,
    canManageAppointments: true,
    canManageSessions: true,
    canManageBilling: true,
    canViewReports: true,
    canManageUsers: true
  },
  createdAt: [TIMESTAMP],
  updatedAt: [TIMESTAMP]
}
```

### Paso 3: Verificar

Prueba las reglas intentando:
- Leer documentos sin autenticación (debería fallar)
- Crear documentos con diferentes roles
- Eliminar documentos con diferentes roles

## ⚠️ Advertencias

1. **No uses estas reglas en desarrollo sin modificar**: Son muy restrictivas
2. **Crea un usuario admin primero**: O no podrás acceder a nada
3. **Prueba las reglas**: Usa el Rules Playground antes de publicar
4. **Backup**: Guarda una copia de las reglas anteriores antes de actualizar

## 🔄 Mejoras Futuras

Para producción, considera:

1. **Custom Claims**: Mover roles a Custom Claims para mejor rendimiento
2. **Índices**: Crear índices compuestos para queries complejas
3. **Rate Limiting**: Implementar límites de tasa en Cloud Functions
4. **Auditoría**: Agregar logging de accesos en Cloud Functions
5. **Validación de datos**: Validaciones más estrictas de tipos y formatos

---

**Desarrollado para CRM Vaiston - Sistema de Gestión para Psicólogos**
