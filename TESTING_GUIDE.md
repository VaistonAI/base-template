# 🧪 Guía de Testing - Login Responsivo

## ✅ Testing Checklist

### 📱 Móvil (375px - iPhone SE)

- [ ] **Layout**
  - [ ] Logo visible en esquina superior
  - [ ] Form ocupa 100% del ancho
  - [ ] Padding no causa overflow
  - [ ] Sin scroll horizontal
  - [ ] Footer "¿Necesitas ayuda?" visible

- [ ] **Inputs**
  - [ ] Font size 16px (sin zoom automático)
  - [ ] Focus ring azul visible
  - [ ] Espacio adecuado entre campos
  - [ ] Toggle password funciona
  - [ ] Errores mostrados en rojo
  - [ ] Placeholder visible y legible

- [ ] **Botón**
  - [ ] Tamaño mínimo 44x44px
  - [ ] Presionable fácilmente con dedo
  - [ ] Animación loading visible
  - [ ] Efecto active (press-down)

- [ ] **Tarjeta Demo**
  - [ ] Credenciales legibles
  - [ ] Layout responsive (vertical en móvil)
  - [ ] Copiar email/password funciona
  - [ ] Badge "Demo" visible

- [ ] **Animaciones**
  - [ ] Entrada suave (slideInUp)
  - [ ] Sin stuttering o jank
  - [ ] Partículas no visibles (background)
  - [ ] Transiciones smooth

- [ ] **Teclado**
  - [ ] Tab navega por inputs
  - [ ] Focus visible en todos
  - [ ] Enter en email → password
  - [ ] Enter en password → submit

---

### 📱 Tablet (768px - iPad)

- [ ] **Layout**
  - [ ] Formulario centrado
  - [ ] Máximo ancho respetado
  - [ ] Logo en parte superior
  - [ ] Espacio simétrico

- [ ] **Componentes**
  - [ ] Inputs escalados correctamente
  - [ ] Tarjeta demo en 2 columnas
  - [ ] Botón grande y visible
  - [ ] Características en grid

- [ ] **Interactividad**
  - [ ] Hover effects funcionan
  - [ ] Touch events funcionales
  - [ ] Inputs responden bien

- [ ] **Sombras**
  - [ ] Card tiene sombra visible
  - [ ] Hover aumenta sombra
  - [ ] No es excesivo

---

### 🖥️ Desktop (1920px)

- [ ] **Layout**
  - [ ] Lado izquierdo visible (marketing)
  - [ ] Lado derecho visible (login)
  - [ ] Proporción 50/50
  - [ ] Alturas iguales

- [ ] **Lado Izquierdo**
  - [ ] Logo visible
  - [ ] Título legible
  - [ ] Lista de características en grid 2x5
  - [ ] Pricing visible
  - [ ] Botones WhatsApp y Email funcionales
  - [ ] Animaciones de fondo fluidas

- [ ] **Lado Derecho**
  - [ ] Form bien posicionado
  - [ ] Inputs con tamaño adecuado
  - [ ] Botón visible y clickeable
  - [ ] Tarjeta blanca sobre background

- [ ] **Animaciones**
  - [ ] Partículas flotantes suaves
  - [ ] Formas geométricas rotando
  - [ ] Líneas diagonales animadas
  - [ ] Pulso en círculos
  - [ ] Sin lag (60fps)

- [ ] **Hover Effects**
  - [ ] Input border cambia color
  - [ ] Botón cambia background
  - [ ] Card sombra aumenta
  - [ ] Links subrayados

---

## 🌐 Cross-Browser Testing

### Chrome
- [ ] Renders correcto
- [ ] Animaciones suaves
- [ ] DevTools responsive mode funciona
- [ ] Console sin errores

### Firefox
- [ ] Renders correcto
- [ ] Animaciones suaves
- [ ] Responsive Design Mode funciona
- [ ] Console sin errores

### Safari (iOS)
- [ ] No hace zoom automático (font 16px)
- [ ] Teclado aparece correctamente
- [ ] Inputs con borde visible
- [ ] Botón presionable

### Edge
- [ ] Renders idéntico a Chrome
- [ ] Animaciones suaves
- [ ] DevTools funciona

---

## ⚡ Performance Testing

### Lighthouse (Chrome DevTools)

```
Comando en consola:
1. F12 → Lighthouse tab
2. Generate report (Mobile y Desktop)

Objetivos:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
```

### Mediciones
- [ ] FCP (First Contentful Paint): < 1.5s
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] CLS (Cumulative Layout Shift): < 0.1
- [ ] TTI (Time to Interactive): < 3.5s

### Herramientas
```bash
# Usar Chrome DevTools Performance tab
1. F12 → Performance
2. Click record
3. Interactuar con página
4. Stop recording
5. Analizar resultados
```

---

## ♿ Accesibilidad Testing

### Keyboard Navigation
- [ ] Tab → Email input
- [ ] Tab → Password input
- [ ] Tab → Remember me (si existe)
- [ ] Tab → Login button
- [ ] Tab → Terms link
- [ ] Shift+Tab → Navega hacia atrás

### Screen Reader (NVDA/JAWS)
- [ ] Logo anunciado
- [ ] Título anunciado
- [ ] Campos anunciados correctamente
- [ ] Errores anunciados
- [ ] Botón anunciado
- [ ] Links anunciados

### Color Contrast
```
Usar: Chrome DevTools → Lighthouse
o WebAIM Color Contrast Checker

Mínimos:
- Normal text: 4.5:1
- Large text: 3:1
- UI Components: 3:1
```

### Focus Indicators
- [ ] Focus ring visible en inputs
- [ ] Focus ring visible en botón
- [ ] Focus ring visible en links
- [ ] Contraste suficiente

---

## 🔐 Validación Testing

### Campos Vacíos
```
Email vacío:
- [ ] Error: "Correo requerido"
- [ ] Campo rojo
- [ ] Ring rojo en focus

Password vacío:
- [ ] Error: "Contraseña requerida"
- [ ] Campo rojo
```

### Email Inválido
```
Entrada: "notanemail"
- [ ] Error: "Formato inválido"
- [ ] Campo rojo
- [ ] Focus ring rojo
```

### Email Válido
```
Entrada: "test@example.com"
- [ ] Sin error
- [ ] Borde normal
```

### Password
```
Minimo 1 carácter:
- [ ] Aceptado
- [ ] Toggle eye funciona
- [ ] Muestra/oculta texto
```

---

## 🔄 Flujo Completo Testing

### Escenario 1: Login Exitoso
```
1. [ ] Navegar a /login
2. [ ] Ingresar admin@admin.com
3. [ ] Ingresar $Vaiston123
4. [ ] Click Iniciar Sesión
5. [ ] Loading spinner aparece
6. [ ] Redirige a /dashboard
7. [ ] Sessión inicia correctamente
```

### Escenario 2: Login Fallido
```
1. [ ] Navegar a /login
2. [ ] Ingresar email inválido
3. [ ] Click Iniciar Sesión
4. [ ] Error mostrado
5. [ ] Spinner desaparece
6. [ ] Form sigue disponible
```

### Escenario 3: Validación
```
1. [ ] Click Iniciar sin llenar campos
2. [ ] Error en email
3. [ ] Error en password
4. [ ] Botón deshabilitado si hay errores
```

---

## 📊 Viewport Testing

### Puntos de Quiebre

```
320px:   Small phone
375px:   iPhone SE
390px:   iPhone 12
480px:   Large phone
600px:   Small tablet
768px:   iPad
1024px:  Desktop
1440px:  Large desktop
1920px:  Full HD
2560px:  2K
```

### Orientaciones
- [ ] Portrait - 375x667
- [ ] Landscape - 812x375
- [ ] Tablet Vertical - 768x1024
- [ ] Tablet Horizontal - 1024x768

---

## 🎨 Visual Regression Testing

### Screenshots por Dispositivo
```
Usar: Percy o BackstopJS

Guardar:
- Mobile baseline
- Tablet baseline  
- Desktop baseline

Luego comparar con nuevos cambios
```

---

## 🐛 Bug Report Template

Si encuentras problemas:

```markdown
## Título
[Descripción breve del bug]

## Entorno
- Navegador: [Chrome/Firefox/Safari/Edge]
- Dispositivo: [iPhone/iPad/Desktop]
- Resolución: [375x667]

## Pasos para reproducir
1. Ir a /login
2. [Acción]
3. [Resultado esperado vs actual]

## Captura de pantalla
[Adjuntar imagen]

## Severidad
[Critical/High/Medium/Low]
```

---

## 📝 Testing Manual Checklist

### Antes de cada despliegue
- [ ] Probar en 3+ navegadores
- [ ] Probar en 3+ dispositivos
- [ ] Validar con Chrome DevTools
- [ ] Check Lighthouse score
- [ ] Verificar accesibilidad
- [ ] Sin errores en console
- [ ] Sin warnings de TypeScript
- [ ] Performance aceptable

---

## 🚀 Automated Testing (Playwright)

```bash
# Ejecutar tests
npm run test

# Con interfaz visual
npm run test:ui

# Con navegador visible
npm run test:headed

# Ver reporte HTML
npm run test:report
```

### Test Ejemplo
```typescript
test('login form should be responsive', async ({ page }) => {
  await page.goto('/login');
  
  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('input[type="email"]')).toBeVisible();
  
  // Tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('input[type="email"]')).toBeVisible();
  
  // Desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('.hidden.lg\\:block')).toBeVisible();
});
```

---

## 🎓 Notas de Testing

1. **Siempre testear en móvil real**: Los emuladores no son 100% precisos
2. **Probar con conexión lenta**: Throttle en DevTools
3. **Probar sin JS**: Algunos usuarios lo desactivan
4. **Probar con extensiones**: Pueden afectar el layout
5. **Probar sin CSS**: Verificar HTML structure

---

**Última actualización**: 2025-12-02
**Status**: Lista completa de testing
**Tiempo estimado**: 2-3 horas de testing exhaustivo
