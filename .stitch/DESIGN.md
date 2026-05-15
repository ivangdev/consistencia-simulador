---
name: Distributed Systems Consistency Simulator
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#5de6ff'
  on-secondary: '#00363e'
  secondary-container: '#00cbe6'
  on-secondary-container: '#00515d'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '450'
    lineHeight: '1.5'
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system is built for high-level technical education, specifically focusing on the visualization and simulation of distributed systems. The brand personality is **scholarly yet cutting-edge**, functioning as a sophisticated laboratory for complex computer science concepts. It prioritizes clarity and precision while maintaining a futuristic, high-performance feel.

The design style utilizes **Glassmorphism** to represent the "layered" nature of network protocols and system stacks. By using translucent surfaces and background blurs, the UI suggests depth and interconnectedness—key themes in distributed computing. The aesthetic is professional and immersive, designed to keep users focused during deep-work simulation sessions.

## Colors

The palette is optimized for a **Dark Mode** primary environment, reducing eye strain during long technical analysis.

- **Primary (Indigo):** Used for main actions, active nodes, and branding elements. It provides a stable, professional anchor.
- **Accent (Cyan):** Used for highlighting data flow, specific system events, and secondary interactive elements to provide high-tech contrast.
- **Background (Dark Slate):** A deep, saturated navy that provides more depth than pure black, essential for the glassmorphism effects to appear natural.
- **Success & Warning:** Emerald and Amber are used strictly for system health indicators (e.g., node synchronization, partition failures, or latency warnings).

## Typography

The typography system balances human-readable UI with machine-readable data. **Inter** is the primary typeface, chosen for its exceptional legibility in dark interfaces and its modern, neutral character.

For logs, terminal outputs, and system metrics, **JetBrains Mono** is utilized. This monospaced font provides the necessary structure for technical data, ensuring that column alignment in logs is preserved and distinguishing code from instructional text. Headlines use tight letter-spacing to maintain a compact, authoritative look.

## Layout & Spacing

The layout employs a **12-column fluid grid** for the main dashboard view, allowing simulation windows to resize dynamically.

- **Desktop:** Features a persistent sidebar for simulation controls (3 columns) and a large canvas area (9 columns) for the node visualization.
- **Padding:** High-density data views use `md` (16px) spacing, while educational prose and landing sections use `xl` (32px) to provide breathing room.
- **Transitions:** All layout shifts and hover states must utilize a smooth **250ms ease-in-out** transition to maintain the premium, fluid feel of the glassmorphic interface.

## Elevation & Depth

Depth is established through **Backdrop Blurs** and **Tonal Layering** rather than traditional heavy shadows.

- **Level 1 (Surface):** The background layer (#0F172A).
- **Level 2 (Cards/Panels):** Semi-transparent fills (White at 5-8% opacity) with a `blur(12px)` backdrop filter. 1px stroke (White at 10% opacity) acts as a highlight.
- **Level 3 (Modals/Popovers):** Higher opacity fills (12%) with a `blur(20px)` and a subtle **Indigo-tinted shadow** (`0px 10px 30px -5px rgba(99, 102, 241, 0.2)`) to suggest a light source from the simulation nodes.

Floating elements should feel like "sheets of glass" suspended over the simulation canvas.

## Shapes

The design system uses a consistent **12px (0.75rem)** corner radius for all primary containers, cards, and input fields. This specific radius balances the professional nature of the tool with a approachable, modern "software" feel.

- **Buttons & Chips:** Use the standard `rounded-lg` (12px) for a unified look.
- **Status Indicators:** Small system nodes in the simulation use a 100% (circle) radius to distinguish them from structural UI elements.
- **Selection States:** Active states should be indicated with a 2px inner border or a glowing outline rather than changing the shape.

## Components

### Buttons
Primary buttons use a solid Indigo gradient with a subtle Cyan outer glow on hover. Secondary buttons use a glass-style background (transparent with a border). Use `label-caps` for button text to increase visual weight.

### Simulation Cards (Nodes)
The core component of the system. Cards must have a 1px border-top that is slightly brighter than the sides to simulate a top-down light source. They display node status (Active, Syncing, Failed) using small colored pips.

### Logs & Console
A dedicated panel using a darker, opaque background (#020617) to ensure maximum contrast for `code-sm` JetBrains Mono text. Include syntax highlighting for JSON payloads using the Cyan and Amber accent colors.

### Inputs
Search and parameter fields should be "ghost" style: no fill, 1px border, becoming slightly more opaque on focus. The cursor should be Indigo.

### System Timeline
A horizontal scrubber for simulation playback. The track is a low-opacity slate line, while the handle is a glowing Cyan pill.