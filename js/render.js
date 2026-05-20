/**
 * render.js — Pure rendering functions
 * Given state, return HTML string or DOM operations.
 * Does NOT modify state.
 */

import { getState, REPLICAS, VARIABLES } from './state.js';

export function renderReplicas() {
  const grid = document.getElementById('replicas-grid');
  if (!grid) return;

  const state = getState();
  grid.innerHTML = REPLICAS.map(id => {
    const replica = state.replicas[id];
    return `
      <div class="replica-card" id="replica-${id}">
        <div class="replica-header">
          <div class="replica-icon">${id}</div>
          <div class="replica-title">Réplica ${id}</div>
        </div>
        <div class="replica-vars">
          ${VARIABLES.map(v => `
            <div class="var-row">
              <span class="var-name">${v}:</span>
              <span class="var-value" id="var-${id}-${v}">${replica[v]}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

export function renderLogEntries() {
  const container = document.getElementById('log-entries');
  if (!container) return;

  const state = getState();
  const entries = state.operationLog;

  if (entries.length === 0) {
    container.innerHTML = `<div class="log-empty">Esperando operaciones...</div>`;
    return;
  }

  container.innerHTML = entries.map(entry => `
    <div class="log-entry ${entry.type}">
      <span class="log-op-count">#${entry.timestamp}</span>
      <div class="log-content">
        <span class="log-operation">${entry.operation}</span>
        <span class="log-result">${entry.result}</span>
        ${entry.stale ? '<span class="log-stale">⚠️ stale</span>' : ''}
      </div>
    </div>
  `).join('');
}

export function renderOperationCount() {
  const el = document.getElementById('op-count');
  if (el) {
    el.textContent = getState().operationCount;
  }
}

export function renderAll() {
  renderReplicas();
  renderLogEntries();
  renderOperationCount();
}