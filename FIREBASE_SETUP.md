# Guía de Configuración de Firebase CLI

Esta guía te ayudará a conectar tu proyecto local con Firebase para poder desplegar reglas, funciones y hosting directamente desde la terminal.

## 📋 Paso 1: Instalar Firebase CLI

Abre PowerShell como **Administrador** y ejecuta:

```powershell
npm install -g firebase-tools
```

Verifica la instalación:
```powershell
firebase --version
```

---

## 🔐 Paso 2: Iniciar Sesión en Firebase

En la terminal del proyecto, ejecuta:

```powershell
firebase login
```

Esto abrirá tu navegador para que inicies sesión con tu cuenta de Google que tiene acceso al proyecto de Firebase.

**Opciones durante el login:**
- Acepta permitir que Firebase CLI acceda a tu cuenta
- Selecciona la cuenta correcta si tienes varias

---

## 🚀 Paso 3: Inicializar Firebase en el Proyecto

Desde la raíz del proyecto (`c:\Users\Rodrigo\Desktop\CRM\crm-general`), ejecuta:

```powershell
firebase init
```

### Durante la inicialización, selecciona:

1. **¿Qué servicios quieres configurar?** (usa espacio para seleccionar, enter para continuar)
   - [x] Firestore
   - [x] Storage
   - [x] Hosting (opcional, para desplegar la app)

2. **¿Usar un proyecto existente o crear uno nuevo?**
   - Selecciona: **Use an existing project**

3. **Selecciona tu proyecto:**
   - Busca y selecciona tu proyecto de Firebase de la lista

4. **Configuración de Firestore:**
   - Firestore Rules file: `firestore.rules` (ya existe)
   - Firestore Indexes file: `firestore.indexes.json` (acepta el default)

5. **Configuración de Storage:**
   - Storage Rules file: `storage.rules` (ya existe)

6. **Configuración de Hosting (si lo seleccionaste):**
   - Public directory: `dist` (carpeta de build de Vite)
   - Configure as single-page app: **Yes**
   - Set up automatic builds with GitHub: **No** (por ahora)
   - Overwrite index.html: **No**

---

## 📤 Paso 4: Desplegar Reglas de Firestore

Una vez inicializado, despliega las reglas:

```powershell
firebase deploy --only firestore:rules
```

Esto publicará el archivo `firestore.rules` en tu proyecto de Firebase.

---

## 📤 Paso 5: Desplegar Reglas de Storage

```powershell
firebase deploy --only storage:rules
```

Esto publicará el archivo `storage.rules` en tu proyecto de Firebase.

---

## 🎯 Paso 6: Crear Usuario Administrador Automáticamente

Voy a crear un script que automáticamente cree tu usuario administrador después del primer login.

### Opción A: Crear manualmente en Firestore

1. Haz login en la aplicación (http://localhost:5175)
2. Ve a Firebase Console → Firestore Database
3. Busca la colección `users`
4. Encuentra tu documento (con tu UID)
5. Edita y agrega:

```json
{
  "uid": "TU_UID_AQUI",
  "email": "tu-email@gmail.com",
  "displayName": "Tu Nombre",
  "role": "admin",
  "isActive": true,
  "permissions": {
    "canManagePatients": true,
    "canManageOffices": true,
    "canManageAppointments": true,
    "canManageSessions": true,
    "canManageBilling": true,
    "canViewReports": true,
    "canManageUsers": true
  },
  "createdAt": [TIMESTAMP],
  "updatedAt": [TIMESTAMP]
}
```

### Opción B: Usar Cloud Functions (Recomendado para producción)

Puedo crear una Cloud Function que automáticamente asigne rol de admin al primer usuario que se registre.

---

## 📦 Comandos Útiles de Firebase CLI

### Ver proyectos disponibles
```powershell
firebase projects:list
```

### Cambiar de proyecto
```powershell
firebase use [project-id]
```

### Desplegar todo
```powershell
firebase deploy
```

### Desplegar solo reglas
```powershell
firebase deploy --only firestore:rules,storage:rules
```

### Desplegar hosting (después de build)
```powershell
npm run build
firebase deploy --only hosting
```

### Ver logs
```powershell
firebase functions:log
```

---

## 🔧 Configuración del Proyecto

Después de `firebase init`, se crearán estos archivos:

- `.firebaserc` - Configuración del proyecto
- `firebase.json` - Configuración de servicios
- `firestore.rules` - Reglas de Firestore (ya existe)
- `storage.rules` - Reglas de Storage (ya existe)
- `firestore.indexes.json` - Índices de Firestore

---

## ✅ Verificar Configuración

Después de desplegar, verifica en Firebase Console:

1. **Firestore Rules**: Ve a Firestore Database → Rules
   - Deberías ver las reglas actualizadas

2. **Storage Rules**: Ve a Storage → Rules
   - Deberías ver las reglas actualizadas

3. **Hosting** (si lo configuraste): Ve a Hosting
   - Verás tu sitio desplegado

---

## 🚨 Solución de Problemas

### Error: "Permission denied"
- Asegúrate de estar logueado: `firebase login`
- Verifica que tienes permisos en el proyecto de Firebase

### Error: "Project not found"
- Verifica el ID del proyecto en `.firebaserc`
- Usa `firebase use --add` para agregar el proyecto

### Error al desplegar reglas
- Verifica la sintaxis de las reglas
- Usa el simulador en Firebase Console para probar

---

## 📝 Próximos Pasos

Una vez configurado Firebase CLI:

1. ✅ Despliega las reglas de Firestore y Storage
2. ✅ Crea tu usuario administrador
3. ✅ Prueba la aplicación
4. ✅ (Opcional) Configura Cloud Functions para lógica del servidor
5. ✅ (Opcional) Despliega a Firebase Hosting

---

**¿Listo para empezar?** Ejecuta estos comandos en orden:

```powershell
# 1. Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar proyecto
firebase init

# 4. Desplegar reglas
firebase deploy --only firestore:rules,storage:rules
```
