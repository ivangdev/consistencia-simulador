---
name: stitch-workflow
description: Ejecuta el workflow de diseño con Stitch para generar UI del simulador de consistencia. Usa cuando el usuario quiere diseñar/regenerar la interfaz del simulador.
mode: primary
---

# Stitch Design Workflow

## Setup (solo ejecutar una vez)
```bash
npx skills add google-labs-code/stitch-skills --skill stitch-design --global
npx skills add google-labs-code/stitch-skills --skill enhance-prompt --global
npx skills add google-labs-code/stitch-skills --skill design-md --global
npx skills add google-labs-code/stitch-skills --skill stitch-loop --global
```

## Flujo de trabajo

### Fase 1: Prompt Enhancement
1. Leer `SPEC.md` para entender el proyecto
2. Usar `enhance-prompt` para refinar el prompt inicial del simulador
3. Aplicar `stitch-design` para sintetizar el design system

### Fase 2: Generación de UI
1. Usar `stitch-loop` con el prompt mejorado para generar todas las páginas
2. Generar el archivo `DESIGN.md` con `design-md`
3. Validar output y generar variantes si es necesario

### Fase 3: Integración
1. Combinar UI generada con la lógica JavaScript existente
2. Extraer CSS/JS a módulos separados
3. Probar con Firefox DevTools o Playwright

## Comandos útiles
- `stitch serve` - Preview local del proyecto
- `stitch upload` - Subir screen a proyecto Stitch
- `stitch generate --variants` - Generar variaciones de diseño
- `stitch doctor` - Verificar configuración de Stitch

## Estructura del proyecto
```
consistencia-simulator/
├── .opencode/
│   └── agent/
│       └── stitch-workflow.md    # Este archivo
├── .stitch/
│   └── DESIGN.md                 # Design system documentado
├── index.html                    # Página principal
├── css/
│   └── styles.css                # Estilos
├── js/
│   ├── app.js                    # UI + eventos
│   ├── state.js                  # Estado réplicas
│   └── models.js                 # Lógica consistencia
├── SPEC.md                       # Especificación
└── README.md                     # Instrucciones
```

## Modelos de consistencia a cubrir
- **Strict**: Write instantáneo en todas las réplicas
- **Sequential**: Todas ven ops en mismo orden
- **Causal**: Respeta relaciones cause-effect
- **Eventual**: Sin garantías, eventual convergence

## Tutorial steps
1. Pantalla bienvenida explaining distributed systems
2. Identificar réplicas (A, B, C)
3. Seleccionar modelo de consistencia
4. Realizar Write (x=42 en replica A)
5. Realizar Read desde otra réplica
6. Comparar comportamiento en modo Eventual
7. Challenge Mode como bonus