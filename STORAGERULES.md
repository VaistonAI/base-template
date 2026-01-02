# Reglas de Seguridad de Firebase Storage

Este documento contiene las reglas de seguridad recomendadas para Firebase Storage del CRM para Psicólogos.

## 📋 Reglas Completas

Copia y pega estas reglas en la consola de Firebase (Storage → Rules):

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================
    
    // Verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Verificar si el usuario es el propietario del archivo
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Obtener el rol del usuario desde Firestore
    function getUserRole() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Verificar si el usuario es administrador
    function isAdmin() {
      return isAuthenticated() && getUserRole() == 'admin';
    }
    
    // Verificar si el usuario es psicólogo
    function isPsychologist() {
      return isAuthenticated() && getUserRole() == 'psychologist';
    }
    
    // Verificar tamaño del archivo (máximo 10MB)
    function isValidSize() {
      return request.resource.size <= 10 * 1024 * 1024;
    }
    
    // Verificar tipo de archivo permitido para imágenes
    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    // Verificar tipo de archivo permitido para documentos
    function isValidDocumentType() {
      return request.resource.contentType.matches('application/pdf') ||
             request.resource.contentType.matches('application/msword') ||
             request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
             request.resource.contentType.matches('text/plain');
    }
    
    // Verificar tipo de archivo permitido para adjuntos de sesiones
    function isValidAttachmentType() {
      return isValidImageType() || isValidDocumentType();
    }
    
    // ============================================
    // REGLAS POR CARPETA
    // ============================================
    
    // AVATARES DE USUARIOS
    // Ruta: /users/{userId}/avatar/{fileName}
    match /users/{userId}/avatar/{fileName} {
      // Leer: El propio usuario o administradores
      allow read: if isAuthenticated();
      
      // Escribir: Solo el propio usuario
      allow write: if isOwner(userId) 
        && isValidImageType() 
        && isValidSize();
      
      // Eliminar: El propio usuario o administradores
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // DOCUMENTOS DE PACIENTES
    // Ruta: /patients/{patientId}/documents/{fileName}
    match /patients/{patientId}/documents/{fileName} {
      // Leer: Psicólogos y administradores
      allow read: if isPsychologist() || isAdmin();
      
      // Escribir: Psicólogos y administradores
      allow write: if (isPsychologist() || isAdmin())
        && isValidDocumentType()
        && isValidSize();
      
      // Eliminar: Solo administradores
      allow delete: if isAdmin();
    }
    
    // ADJUNTOS DE SESIONES
    // Ruta: /sessions/{sessionId}/attachments/{fileName}
    match /sessions/{sessionId}/attachments/{fileName} {
      // Leer: Psicólogos y administradores
      allow read: if isPsychologist() || isAdmin();
      
      // Escribir: Psicólogos y administradores
      allow write: if (isPsychologist() || isAdmin())
        && isValidAttachmentType()
        && isValidSize();
      
      // Eliminar: Psicólogos y administradores
      allow delete: if isPsychologist() || isAdmin();
    }
    
    // FACTURAS Y RECIBOS
    // Ruta: /invoices/{invoiceId}/documents/{fileName}
    match /invoices/{invoiceId}/documents/{fileName} {
      // Leer: Usuarios autenticados
      allow read: if isAuthenticated();
      
      // Escribir: Psicólogos, recepcionistas y administradores
      allow write: if isAuthenticated()
        && request.resource.contentType.matches('application/pdf')
        && isValidSize();
      
      // Eliminar: Solo administradores
      allow delete: if isAdmin();
    }
    
    // LOGOS Y RECURSOS DE LA APLICACIÓN
    // Ruta: /app/{resource}
    match /app/{resource=**} {
      // Leer: Todos (público)
      allow read: if true;
      
      // Escribir: Solo administradores
      allow write: if isAdmin();
      
      // Eliminar: Solo administradores
      allow delete: if isAdmin();
    }
    
    // BACKUPS
    // Ruta: /backups/{backupId}/{fileName}
    match /backups/{backupId}/{fileName} {
      // Leer: Solo administradores
      allow read: if isAdmin();
      
      // Escribir: Solo administradores
      allow write: if isAdmin();
      
      // Eliminar: Solo administradores
      allow delete: if isAdmin();
    }
    
    // ARCHIVOS TEMPORALES
    // Ruta: /temp/{userId}/{fileName}
    match /temp/{userId}/{fileName} {
      // Leer: El propio usuario
      allow read: if isOwner(userId);
      
      // Escribir: El propio usuario (con límite de tamaño)
      allow write: if isOwner(userId) && isValidSize();
      
      // Eliminar: El propio usuario
      allow delete: if isOwner(userId);
    }
    
    // Denegar acceso a cualquier otra ruta no especificada
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔐 Descripción de las Reglas

### Estructura de Carpetas

```
storage/
├── users/
│   └── {userId}/
│       └── avatar/
│           └── {fileName}
├── patients/
│   └── {patientId}/
│       └── documents/
│           └── {fileName}
├── sessions/
│   └── {sessionId}/
│       └── attachments/
│           └── {fileName}
├── invoices/
│   └── {invoiceId}/
│       └── documents/
│           └── {fileName}
├── app/
│   └── {resource}
├── backups/
│   └── {backupId}/
│       └── {fileName}
└── temp/
    └── {userId}/
        └── {fileName}
```

### Tipos de Archivo Permitidos

| Carpeta | Tipos Permitidos | Tamaño Máximo |
|---------|------------------|---------------|
| **avatares** | Imágenes (jpg, png, gif, webp) | 10 MB |
| **documentos de pacientes** | PDF, Word, TXT | 10 MB |
| **adjuntos de sesiones** | Imágenes + Documentos | 10 MB |
| **facturas** | PDF únicamente | 10 MB |
| **recursos de app** | Cualquiera | 10 MB |
| **backups** | Cualquiera | Sin límite |
| **temporales** | Cualquiera | 10 MB |

### Permisos por Carpeta

| Carpeta | Leer | Escribir | Eliminar |
|---------|------|----------|----------|
| **avatares** | Todos autenticados | Propietario | Propietario/Admin |
| **documentos pacientes** | Psicólogo/Admin | Psicólogo/Admin | Admin |
| **adjuntos sesiones** | Psicólogo/Admin | Psicólogo/Admin | Psicólogo/Admin |
| **facturas** | Todos autenticados | Autenticados | Admin |
| **recursos app** | Público | Admin | Admin |
| **backups** | Admin | Admin | Admin |
| **temporales** | Propietario | Propietario | Propietario |

## 📝 Validaciones Implementadas

### Seguridad

- ✅ Autenticación obligatoria para la mayoría de operaciones
- ✅ Validación de roles usando Firestore
- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño de archivo (10 MB)
- ✅ Restricción de eliminación a administradores
- ✅ Aislamiento de archivos por usuario/entidad

### Tipos de Archivo

```javascript
// Imágenes permitidas
image/jpeg
image/png
image/gif
image/webp
image/svg+xml

// Documentos permitidos
application/pdf
application/msword (.doc)
application/vnd.openxmlformats-officedocument.wordprocessingml.document (.docx)
text/plain (.txt)
```

## 🚀 Implementación

### Paso 1: Copiar Reglas

1. Ve a la consola de Firebase
2. Selecciona tu proyecto
3. Ve a Storage → Rules
4. Copia y pega las reglas de arriba
5. Haz clic en "Publicar"

### Paso 2: Crear Estructura de Carpetas

Las carpetas se crean automáticamente al subir el primer archivo. Ejemplo con el servicio de Firebase:

```typescript
// Subir avatar de usuario
const avatarRef = ref(storage, `users/${userId}/avatar/profile.jpg`);
await uploadBytes(avatarRef, file);

// Subir documento de paciente
const docRef = ref(storage, `patients/${patientId}/documents/historia_clinica.pdf`);
await uploadBytes(docRef, file);

// Subir adjunto de sesión
const attachmentRef = ref(storage, `sessions/${sessionId}/attachments/notas.pdf`);
await uploadBytes(attachmentRef, file);
```

### Paso 3: Configurar CORS (Opcional)

Si necesitas acceder a Storage desde un dominio web, configura CORS:

```json
[
  {
    "origin": ["https://tu-dominio.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Aplica con:
```bash
gsutil cors set cors.json gs://tu-bucket.appspot.com
```

## 📊 Uso en la Aplicación

### Subir Archivo

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config/firebase';

async function uploadPatientDocument(patientId: string, file: File) {
  try {
    // Crear referencia
    const storageRef = ref(
      storage, 
      `patients/${patientId}/documents/${file.name}`
    );
    
    // Subir archivo
    await uploadBytes(storageRef, file);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
```

### Descargar Archivo

```typescript
import { ref, getDownloadURL } from 'firebase/storage';

async function downloadFile(path: string) {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    
    // Abrir en nueva pestaña o descargar
    window.open(url, '_blank');
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}
```

### Eliminar Archivo

```typescript
import { ref, deleteObject } from 'firebase/storage';

async function deleteFile(path: string) {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
```

## ⚠️ Consideraciones de Seguridad

### Validación del Lado del Cliente

Aunque las reglas de Storage validan en el servidor, también valida en el cliente:

```typescript
function validateFile(file: File): boolean {
  // Validar tamaño (10 MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('El archivo es demasiado grande (máximo 10 MB)');
  }
  
  // Validar tipo
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido');
  }
  
  return true;
}
```

### Nombres de Archivo Seguros

Sanitiza los nombres de archivo para evitar problemas:

```typescript
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}
```

### Límites de Cuota

Firebase Storage tiene límites de cuota:
- **Spark (gratis)**: 5 GB almacenamiento, 1 GB/día descarga
- **Blaze (pago)**: $0.026/GB almacenamiento, $0.12/GB descarga

## 🔄 Mejoras Futuras

1. **Compresión de imágenes**: Usar Cloud Functions para comprimir automáticamente
2. **Escaneo de virus**: Integrar escaneo de malware
3. **Versionado**: Implementar versionado de archivos
4. **Limpieza automática**: Eliminar archivos temporales antiguos
5. **Thumbnails**: Generar miniaturas automáticas de imágenes
6. **Encriptación**: Encriptar archivos sensibles antes de subir

## 📈 Monitoreo

Monitorea el uso de Storage en la consola de Firebase:
- Almacenamiento total usado
- Descargas por día
- Errores de permisos
- Archivos más descargados

---

**Desarrollado para CRM Vaiston - Sistema de Gestión para Psicólogos**
