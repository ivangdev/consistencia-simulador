---
page: index
---
Main simulator page for distributed systems consistency model education tool.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web Desktop-first
- Palette: Indigo (#6366F1) primary, Cyan (#22D3EE) accent, Dark slate (#051424) background
- Styles: Rounded corners (12px), glassmorphism, smooth 250ms transitions
- Typography: Inter for UI, JetBrains Mono for code/data

**Page Structure:**
1. **Header:** Logo "⚡ Simulador de Consistencia" + dropdown to select consistency model (Strict, Sequential, Causal, Eventual)
2. **Replicas Grid:** Three glassmorphic cards showing distributed replicas (A, B, C) with variables (x, y, z) and freshness status
3. **Operations Panel:** Write section (variable, value, replica selector, button) and Read section (variable, replica selector, button) + Reset button
4. **Log Panel:** Scrolling log with timestamps, color-coded by operation type
5. **Explanation Panel:** Shows rules of currently selected consistency model
6. **Challenge Mode:** Collapsible section with 3 challenge cards

**Atmosphere:** Professional dark mode with glassmorphism. Educational yet engaging.