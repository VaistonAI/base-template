# Pruebas Automatizadas con Playwright

Este documento describe las pruebas automatizadas implementadas para el CRM de Psicólogos.

## 📋 Cobertura de Pruebas

Se han implementado pruebas E2E (End-to-End) completas para todos los módulos CRUD del sistema:

### Módulos Cubiertos

1. **Pacientes** (`tests/patients.spec.ts`)
   - ✅ Listar pacientes
   - ✅ Crear nuevo paciente
   - ✅ Editar paciente existente
   - ✅ Eliminar paciente
   - ✅ Buscar pacientes

2. **Consultorios** (`tests/offices.spec.ts`)
   - ✅ Listar consultorios
   - ✅ Crear nuevo consultorio
   - ✅ Editar consultorio existente
   - ✅ Eliminar consultorio

3. **Citas** (`tests/appointments.spec.ts`)
   - ✅ Mostrar calendario de citas
   - ✅ Crear nueva cita
   - ✅ Editar cita existente
   - ✅ Eliminar cita
   - ✅ Filtrar citas por fecha

4. **Sesiones** (`tests/sessions.spec.ts`)
   - ✅ Listar sesiones
   - ✅ Crear nueva sesión
   - ✅ Editar sesión existente
   - ✅ Eliminar sesión
   - ✅ Filtrar sesiones por paciente

5. **Facturación** (`tests/billing.spec.ts`)
   - ✅ Listar facturas
   - ✅ Crear nueva factura
   - ✅ Registrar pago
   - ✅ Editar factura existente
   - ✅ Eliminar factura
   - ✅ Filtrar facturas por estado

6. **Usuarios** (`tests/users.spec.ts`)
   - ✅ Listar usuarios
   - ✅ Crear nuevo usuario
   - ✅ Editar usuario existente
   - ✅ Eliminar usuario
   - ✅ Buscar usuarios
   - ✅ Mostrar permisos por rol

7. **Dashboard** (`tests/dashboard.spec.ts`)
   - ✅ Mostrar estadísticas
   - ✅ Mostrar acciones rápidas
   - ✅ Navegar desde acciones rápidas
   - ✅ Mostrar actividad reciente

8. **Reportes** (`tests/reports.spec.ts`)
   - ✅ Mostrar estadísticas de pacientes
   - ✅ Mostrar estadísticas de citas
   - ✅ Mostrar estadísticas de sesiones
   - ✅ Mostrar análisis financiero

9. **Insights IA** (`tests/insights.spec.ts`)
   - ✅ Mostrar análisis inteligente
   - ✅ Mostrar patrones detectados
   - ✅ Mostrar recomendaciones
   - ✅ Mostrar alertas

## 🚀 Cómo Ejecutar las Pruebas

### Prerrequisitos

1. Asegúrate de tener el servidor de desarrollo corriendo:
```bash
npm run dev
```

2. Asegúrate de tener un usuario de prueba creado en Firebase:
   - Email: `test@vaiston.com`
   - Password: `Test123456!`

### Comandos de Testing

```bash
# Ejecutar todas las pruebas (modo headless)
npm test

# Ejecutar pruebas con interfaz UI de Playwright
npm run test:ui

# Ejecutar pruebas en modo headed (ver el navegador)
npm run test:headed

# Ver el reporte HTML de las pruebas
npm run test:report
```

### Ejecutar Pruebas Específicas

```bash
# Solo pruebas de pacientes
npx playwright test patients

# Solo pruebas de facturación
npx playwright test billing

# Solo pruebas de un archivo específico
npx playwright test tests/dashboard.spec.ts
```

## 📊 Reportes

Después de ejecutar las pruebas, se generan reportes automáticamente:

- **HTML Report**: `playwright-report/index.html`
  - Incluye screenshots de fallos
  - Videos de pruebas fallidas
  - Traces para debugging

Para ver el reporte:
```bash
npm run test:report
```

## 🔧 Configuración

La configuración de Playwright se encuentra en `playwright.config.ts`:

- **Browser**: Chromium (Desktop Chrome)
- **Base URL**: `http://localhost:5173`
- **Retries**: 2 en CI, 0 en local
- **Workers**: 1 (ejecución secuencial para evitar conflictos)
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Traces**: En primer reintento

## 📝 Estructura de Pruebas

```
tests/
├── helpers/
│   └── auth.helper.ts          # Helper de autenticación
├── appointments.spec.ts        # Pruebas de Citas
├── billing.spec.ts             # Pruebas de Facturación
├── dashboard.spec.ts           # Pruebas de Dashboard
├── insights.spec.ts            # Pruebas de Insights IA
├── offices.spec.ts             # Pruebas de Consultorios
├── patients.spec.ts            # Pruebas de Pacientes
├── reports.spec.ts             # Pruebas de Reportes
├── sessions.spec.ts            # Pruebas de Sesiones
└── users.spec.ts               # Pruebas de Usuarios
```

## ✅ Best Practices Implementadas

1. **Autenticación Reutilizable**: Helper de autenticación para evitar duplicación
2. **Esperas Inteligentes**: Uso de `waitForLoadState` y `waitForSelector`
3. **Selectores Robustos**: Uso de selectores semánticos y aria-labels
4. **Datos Únicos**: Timestamps para evitar conflictos en creación de datos
5. **Verificaciones Completas**: Validación de mensajes de éxito y cambios en UI
6. **Manejo de Estados**: Verificación de existencia antes de editar/eliminar

## 🐛 Debugging

Si una prueba falla:

1. Ejecutar en modo headed para ver qué sucede:
```bash
npm run test:headed
```

2. Usar el modo UI para debugging interactivo:
```bash
npm run test:ui
```

3. Revisar screenshots y videos en `test-results/`

4. Revisar traces en el reporte HTML

## 📌 Notas Importantes

- Las pruebas requieren que el servidor de desarrollo esté corriendo
- Se recomienda tener datos de prueba en Firebase antes de ejecutar
- Las pruebas se ejecutan secuencialmente para evitar conflictos
- Los datos creados durante las pruebas permanecen en Firebase
- Se recomienda usar una base de datos de prueba separada

## 🔄 Integración Continua

Para ejecutar en CI/CD:

```bash
# Las pruebas se ejecutarán automáticamente con:
# - 2 reintentos en caso de fallo
# - Modo headless
# - Servidor de desarrollo iniciado automáticamente
npm test
```

## 📈 Métricas

- **Total de Pruebas**: ~45 pruebas
- **Módulos Cubiertos**: 9/9 (100%)
- **Operaciones CRUD**: Todas cubiertas
- **Tiempo Estimado**: ~5-10 minutos (depende de la red y Firebase)

---

**Desarrollado con ❤️ para garantizar la calidad del CRM Vaiston**
