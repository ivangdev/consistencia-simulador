# Simulador de Modelos de Consistencia Distribuida

## Concept & Vision

Un simulador visual educativo donde estudiantes interactúan con réplicas distribuidas para entender cómo diferentes modelos de consistencia afectan el comportamiento de lectura/escritura. La experiencia es fluida, con animaciones que hacen tangible lo abstracto —ideal para aprender jugando.

## Design Language

**Aesthetic**: Moderno, limpio, con toques de glassmorphism y gradientes suaves. Inspirado en dashboards de monitoreo moderno.

**Color Palette**:
- Primary: `#6366F1` (Indigo vibrante)
- Secondary: `#8B5CF6` (Violet)
- Accent: `#22D3EE` (Cyan)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)
- Background: `#0F172A` (Slate oscuro)
- Surface: `#1E293B` (Slate medio)
- Text: `#F1F5F9` (Slate claro)

**Typography**:
- Headings: Inter (bold)
- Body: Inter (regular)
- Monospace: JetBrains Mono (para logs/código)

**Spatial System**:
- Base unit: 8px
- Border radius: 12px (cards), 8px (buttons), 4px (inputs)
- Shadows: Subtle con tintes de color

**Motion**:
- Transiciones suaves 200-300ms
- Animaciones en operaciones de lectura/escritura
- Feedback visual inmediato en hover/click

## Layout & Structure

```
┌────────────────────────────────────────────────────────────┐
│  HEADER: Logo + Título + Modelo selector                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │Replica A │  │Replica B │  │Replica C │  ← 3 réplicas    │
│  │  x: 5    │  │  x: 5    │  │  x: 3    │                  │
│  │  y: 2    │  │  y: 2    │  │  y: 2    │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                            │
│  ┌──────────────────────────────────────────────┐          │
│  │ LOG DE OPERACIONES                            │          │
│  │ [timestamp] Write(x=7) @ A → propagado        │          │
│  │ [timestamp] Read(x) @ B → 5 ⚠️ STALE         │          │
│  └──────────────────────────────────────────────┘          │
│                                                            │
│  [WRITE] [READ @ A] [READ @ B] [READ @ C] [RESET]          │
│                                                            │
│  ┌──────────────────────────────────────────────┐          │
│  │ PANEL EXPLICACIÓN                             │          │
│  │ Explica por qué ocurrió la anomalía          │          │
│  └──────────────────────────────────────────────┘          │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  CHALLENGE MODE (pestaña):                                 │
│  - Escenario 1: "Lost Update"                              │
│  - Escenario 2: "Stale Read"                               │
│  - Escenario 3: "Causal Violation"                          │
└────────────────────────────────────────────────────────────┘
```

## Features & Interactions

### Operaciones Core

1. **Write(variable, valor, replica)**:
   - User selecciona variable (x, y, z), valor, y replica origen
   - Según el modelo de consistencia, la propagación varía
   - Animación de escritura en replica origen
   - Indicador de propagación a otras réplicas

2. **Read(variable, replica)**:
   - User selecciona variable y replica
   - Muestra el valor actual
   - Si es stale según el modelo, mostrar warning

3. **Selector de Modelo de Consistencia**:
   - Dropdown con: Strict, Sequential, Causal, Eventual
   - Al cambiar, explanation panel se actualiza

4. **Log de Operaciones**:
   - Historial completo con timestamps
   - Color coding: verde (ok), amarillo (warning), rojo (anomalía)

5. **Panel de Explicación**:
   - Explica qué acaba de pasar
   - Muestra las reglas del modelo seleccionado
   - Consejos para evitar anomalías

6. **Reset**:
   - Limpia todo y vuelve a estado inicial

### Challenge Mode

Escenarios pre-armados donde el usuario debe:
- Identificar la anomalía
- Proponer la solución
- Aplicar el modelo correcto

## Component Inventory

### Replica Card
- Estados: normal, highlight (operación reciente), stale (valores desactualizados)
- Muestra variables y valores
- Indicador visual de " freshness"

### Operation Button
- Estados: default, hover, active, disabled
- Con icono + texto
- Feedback tactile (scale en click)

### Log Entry
- Timestamp
- Tipo de operación (color coding)
- Resultado y warnings

### Model Selector
- Dropdown estilizado
- Preview del modelo al hover

### Explanation Panel
- Título de sección
- Contenido formateado
- Tips prácticos

## Technical Approach

- **Single HTML file** con CSS y JS embebidos
- **Vanilla JS** — sin frameworks, sin build tools
- **LocalStorage** para guardar estado entre sesiones
- **CSS Variables** para theming consistente
- **Stitch** para UI initial y refinamiento visual