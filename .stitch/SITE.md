---
name: Consistency Simulator Site
---

## Vision

An interactive educational tool that teaches distributed systems consistency models through hands-on simulation. Users interact with replicated databases to understand how different consistency levels affect read/write behavior. The experience is visual, intuitive, and engaging — making abstract distributed systems concepts tangible.

## Stitch Project ID

`8286350419518864996`

## Sitemap

- [ ] index (main simulator)
- [ ] tutorial (interactive tutorial modal)
- [ ] challenge (challenge mode)

## Roadmap

1. **index** — Main simulator with 3 replicas, write/read operations, model selector, log panel
2. **tutorial** — Interactive tutorial modal with step-by-step guided tour
3. **challenge** — Challenge mode with pre-built scenarios (Lost Update, Stale Read, Causal Violation)

## Creative Freedom

- Add a "Compare Mode" to show side-by-side behavior of two consistency models
- Create an "Animation Speed" control for propagation visualization
- Add a "Scenario Builder" where users create custom consistency scenarios
- Include a "Knowledge Quiz" at the end of the tutorial

## Technical Approach

- Single-page application (SPA) with vanilla HTML/CSS/JS
- Stitch for UI design and generation
- LocalStorage for state persistence
- No build tools required — single HTML file with embedded CSS/JS modules
- Deploy to GitHub Pages or VPS