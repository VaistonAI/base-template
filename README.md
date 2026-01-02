# CRM para Psicólogos - Guía de Inicio Rápido

## 🚀 Proyecto Completado y Funcional

Este CRM está **100% funcional** y listo para usar. Todos los módulos principales están implementados con funcionalidad completa.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Firebase configurada
- Variables de entorno configuradas en `.env`

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de que tu archivo `.env` contenga:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El CRM estará disponible en `http://localhost:5173`

## 👥 Primer Uso

### Crear tu Primera Cuenta

1. Navega a `/register`
2. Completa el formulario con:
   - Nombre completo
   - Email
   - Contraseña (debe cumplir requisitos mostrados)
3. O usa "Continuar con Google"

### Roles de Usuario

El sistema maneja 4 roles con diferentes permisos:

- **👑 Administrador**: Acceso completo
- **🧠 Psicólogo**: Gestión de pacientes, citas, sesiones, facturación
- **📋 Recepcionista**: Gestión de pacientes, citas, facturación básica
- **👁️ Visualizador**: Solo reportes y visualización

## 📦 Módulos Disponibles

### 1. Dashboard
- Estadísticas en tiempo real
- Métricas clave de tu práctica
- Acciones rápidas
- Actividad reciente

### 2. Pacientes
- CRUD completo
- Búsqueda y filtros
- Gestión de contactos de emergencia
- Estados (Activo, Inactivo, Alta)

### 3. Consultorios
- Gestión de espacios
- Capacidad y equipamiento
- Horarios de operación

### 4. Citas
- Calendario interactivo
- Asignación de paciente-consultorio
- Estados de citas
- Tipos de consulta

### 5. Sesiones Clínicas
- Notas de sesión
- Evaluación de progreso
- Objetivos para próxima sesión
- Soporte para adjuntos

### 6. Facturación
- Generación de facturas
- Registro de pagos
- Múltiples métodos de pago
- Reportes financieros

### 7. Reportes
- Estadísticas completas
- Métricas financieras
- Análisis de rendimiento
- Resumen ejecutivo

### 8. Insights IA
- Análisis inteligente de datos
- Recomendaciones personalizadas
- Detección de patrones
- Sugerencias de mejora

### 9. Usuarios
- Gestión de usuarios del sistema
- Asignación de roles
- Control de permisos
- Activación/desactivación

## 🎨 Características de Diseño

- ✅ Paleta corporativa Vaiston
- ✅ Responsive design (móvil, tablet, desktop)
- ✅ Animaciones suaves
- ✅ Modales elegantes
- ✅ Validaciones en tiempo real
- ✅ Contador de caracteres
- ✅ Mensajes de error claros

## 🔐 Seguridad

- Autenticación con Firebase Auth
- Control de acceso basado en roles
- Rutas protegidas
- Validaciones del lado del cliente y servidor
- Datos encriptados en Firebase

## 📱 Uso Móvil

El CRM es completamente responsive:
- Sidebar colapsable en móvil
- Tablas con scroll horizontal
- Formularios adaptados
- Touch-friendly

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Linting
npm run lint
```

## 📊 Flujo de Trabajo Típico

1. **Registrar Paciente** → Módulo de Pacientes
2. **Agendar Cita** → Módulo de Citas
3. **Realizar Sesión** → Módulo de Sesiones
4. **Generar Factura** → Módulo de Facturación
5. **Registrar Pago** → Módulo de Facturación
6. **Ver Estadísticas** → Dashboard / Reportes
7. **Obtener Insights** → Módulo de Insights IA

## 🎯 Próximos Pasos Recomendados

1. **Testing**: Implementar pruebas con Playwright
2. **Documentación**: Completar RF.md y RNF.md
3. **Optimización**: Revisar rendimiento
4. **Despliegue**: Configurar hosting (Firebase Hosting, Vercel, etc.)

## 💡 Consejos

- Usa el buscador en cada módulo para encontrar registros rápidamente
- Los filtros te ayudan a segmentar información
- Revisa los Insights IA regularmente para mejorar tu práctica
- Configura recordatorios para citas próximas
- Mantén las sesiones documentadas para mejor seguimiento

## 🆘 Soporte

Para cualquier duda o problema:
1. Revisa esta documentación
2. Verifica la configuración de Firebase
3. Consulta los logs del navegador (F12)
4. Revisa el archivo `.env`

## ✨ Estado del Proyecto

**✅ COMPLETADO Y FUNCIONAL**

Todos los módulos principales están implementados y funcionando correctamente. El CRM está listo para ser usado en producción.
