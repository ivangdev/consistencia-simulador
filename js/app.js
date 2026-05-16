/**
 * Consistency Simulator - Main Application
 */

import * as state from './state.js';
import { CONSISTENCY_MODELS, getReadResult, getPropagationInfo } from './models.js';

let logEntries = [];

/**
 * Initialize the application
 */
export function init() {
  renderReplicas();
  setupEventListeners();
  updateExplanation();
  loadLogEntries();
  
  // Check if tutorial should run (TutorialUI handles its own display)
  const tutorialCompleted = state.isTutorialCompleted();
  console.log('Tutorial completed:', tutorialCompleted);
}

/**
 * Render replica cards
 */
function renderReplicas() {
  const grid = document.getElementById('replicas-grid');
  if (!grid) return;
  
  const replicas = state.getReplicas();
  const model = state.getModel();
  
  grid.innerHTML = ['A', 'B', 'C'].map(id => {
    const replica = replicas[id];
    const replicaState = determineReplicaState(id, replicas, model);
    
    return `
      <div class="glass-card replica-card" id="replica-${id}" data-replica="${id}">
        <div class="replica-header">
          <div class="replica-title">
            <div class="replica-icon">${id}</div>
            <span class="replica-label">Réplica ${id}</span>
          </div>
          <div class="replica-status">
            <span class="status-dot ${replicaState.stale ? 'stale' : ''}"></span>
            <span class="status-label">${replicaState.status}</span>
          </div>
        </div>
        <div class="replica-vars">
          ${renderVarRow('x', replica.x, id)}
          ${renderVarRow('y', replica.y, id)}
          ${renderVarRow('z', replica.z, id)}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render a single variable row
 */
function renderVarRow(name, value, replicaId) {
  return `
    <div class="var-row" data-var="${name}" data-replica="${replicaId}">
      <span class="font-mono text-secondary">${name}</span>
      <span class="font-mono font-bold">${value}</span>
    </div>
  `;
}

/**
 * Determine replica state based on model
 */
function determineReplicaState(replicaId, replicas, model) {
  if (model === 'strict' || model === 'sequential' || model === 'causal') {
    return { status: 'Consistente', stale: false };
  }
  
  // Eventual consistency - might be stale
  const thisReplica = replicas[replicaId];
  const hasStale = Object.entries(replicas).some(([id, data]) => {
    return id !== replicaId && JSON.stringify(data) !== JSON.stringify(thisReplica);
  });
  
  return { 
    status: hasStale ? 'Posible stale' : 'Consistente', 
    stale: hasStale 
  };
}

/**
 * Perform a write operation
 */
export function performWrite() {
  const varInput = document.getElementById('write-var');
  const valueInput = document.getElementById('write-value');
  const replicaSelect = document.getElementById('write-replica');
  
  const varName = varInput.value.trim().toLowerCase();
  const value = parseInt(valueInput.value);
  const replica = replicaSelect.value;
  
  if (!varName) {
    alert('Ingresá una variable (x, y, o z)');
    return;
  }
  if (isNaN(value)) {
    alert('Ingresá un valor numérico');
    return;
  }
  
  const newState = state.updateReplica(replica, varName, value);
  const model = newState.model;
  
  const propagation = getPropagationInfo(model, replica, varName, value);
  
  addLogEntry('write', `Write(${varName}=${value}) @ ${replica}`, propagation.message, propagation.badge);
  
  highlightReplica(replica);
  renderReplicas();
  updateExplanation();
  
  // Clear inputs
  varInput.value = '';
  valueInput.value = '';
}

/**
 * Perform a read operation
 */
export function performRead() {
  const varInput = document.getElementById('read-var');
  const replicaSelect = document.getElementById('read-replica');
  
  const varName = varInput.value.trim().toLowerCase();
  const replica = replicaSelect.value;
  
  if (!varName) {
    alert('Ingresá una variable (x, y, o z)');
    return;
  }
  
  const replicas = state.getReplicas();
  const model = state.getModel();
  const replicaData = replicas[replica];
  
  const result = getReadResult(model, replica, replicaData, replicas, varName);
  
  addLogEntry('read', `Read(${varName}) @ ${replica}`, `→ ${result.value} ${result.suffix}`, result.badge);
  
  highlightReplica(replica);
  renderReplicas();
  updateExplanation();
  
  // Clear input
  varInput.value = '';
}

/**
 * Add entry to log panel
 */
function addLogEntry(type, operation, result, badge = null) {
  const entries = document.getElementById('log-entries');
  const countEl = document.getElementById('log-count');
  
  if (!entries) return;
  
  const now = new Date();
  const time = now.toTimeString().split(' ')[0];
  
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `
    <span class="log-time">${time}</span>
    <div class="log-entry-content">
      <span class="log-operation">${operation}</span>
      <span class="log-result">${result}</span>
    </div>
  `;
  
  entries.insertBefore(entry, entries.firstChild);
  
  // Update count
  if (countEl) {
    const count = parseInt(countEl.textContent || '0') + 1;
    countEl.textContent = count;
  }
  
  // Store in memory
  logEntries.unshift({ type, operation, result, badge, time });
}

/**
 * Highlight a replica (visual feedback)
 */
function highlightReplica(replicaId) {
  const card = document.getElementById(`replica-${replicaId}`);
  if (card) {
    card.classList.add('active');
    setTimeout(() => card.classList.remove('active'), 500);
  }
}

/**
 * Update explanation panel
 */
function updateExplanation(overrideModel = null) {
  const model = overrideModel || state.getModel();
  const info = CONSISTENCY_MODELS[model];
  
  const nameEl = document.getElementById('model-name');
  const descEl = document.getElementById('model-explanation');
  const rulesEl = document.getElementById('model-rules-list');
  
  if (nameEl) nameEl.textContent = info.name;
  if (descEl) descEl.innerHTML = `<p><strong>${info.name}</strong>: ${info.description}</p>`;
  if (rulesEl) rulesEl.innerHTML = info.rules.map(r => `<li>${r}</li>`).join('');
}

/**
 * Reset simulator state
 */
export function resetSimulator() {
  const currentModel = state.getModel();
  state.resetState();
  logEntries = [];
  
  const entries = document.getElementById('log-entries');
  const countEl = document.getElementById('log-count');
  const modelSelect = document.getElementById('model-select');
  
  if (entries) {
    entries.innerHTML = `
      <div class="log-entry" style="border-left-color: var(--on-surface-variant);">
        <span class="log-time">--:--:--</span>
        <div class="text-muted">Estado reseteado — Esperando operaciones...</div>
      </div>
    `;
  }
  
  if (countEl) countEl.textContent = '0';
  
  state.setModel(currentModel);
  if (modelSelect) modelSelect.value = currentModel;
  
  renderReplicas();
  updateExplanation(currentModel);
}

/**
 * Change consistency model
 */
export function changeModel(model) {
  state.setModel(model);
  renderReplicas();
  updateExplanation();
  
  const modelInfo = document.getElementById('model-info');
  const modelInfoName = document.getElementById('model-info-name');
  const modelInfoDesc = document.getElementById('model-info-desc');
  
  if (modelInfo && modelInfoName && modelInfoDesc) {
    const modelDescriptions = {
      'strict': { name: 'Modelo Strict', desc: 'Consistencia atómica perfecta' },
      'sequential': { name: 'Modelo Secuencial', desc: 'Todas las operaciones en orden' },
      'causal': { name: 'Modelo Causal', desc: 'Relaciones causales garantizadas' },
      'eventual': { name: 'Modelo Eventual', desc: 'Consistencia eventual con stale' }
    };
    
    if (modelDescriptions[model]) {
      modelInfoName.textContent = modelDescriptions[model].name;
      modelInfoDesc.textContent = modelDescriptions[model].desc;
    }
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Write button
  const writeBtn = document.getElementById('btn-write');
  if (writeBtn) {
    writeBtn.addEventListener('click', performWrite);
  }
  
  // Read button
  const readBtn = document.getElementById('btn-read');
  if (readBtn) {
    readBtn.addEventListener('click', performRead);
  }
  
  // Reset button
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetSimulator);
  }
  
  // Model selector
  const modelSelectEl = document.getElementById('model-select');
  if (modelSelectEl) {
    const modelDescriptions = {
      'strict': { name: 'Modelo Strict', desc: 'Consistencia atómica perfecta' },
      'sequential': { name: 'Modelo Secuencial', desc: 'Todas las operaciones en orden' },
      'causal': { name: 'Modelo Causal', desc: 'Relaciones causales garantizadas' },
      'eventual': { name: 'Modelo Eventual', desc: 'Consistencia eventual con stale' }
    };
    
    modelSelectEl.addEventListener('change', (e) => changeModel(e.target.value));
    
    const modelInfo = document.getElementById('model-info');
    const modelInfoName = document.getElementById('model-info-name');
    const modelInfoDesc = document.getElementById('model-info-desc');
    
    modelSelectEl.title = 'Seleccionar modelo de consistencia';
    
    modelSelectEl.addEventListener('mouseenter', () => {
      const selected = modelSelectEl.value;
      
      if (modelDescriptions[selected]) {
        modelInfoName.textContent = modelDescriptions[selected].name;
        modelInfoDesc.textContent = modelDescriptions[selected].desc;
        modelInfo.classList.add('visible');
      }
    });
    
    modelSelectEl.addEventListener('mouseleave', () => {
      modelInfo.classList.remove('visible');
    });
  }
  
  // Challenge toggle
  const challengeToggle = document.getElementById('challenge-toggle');
  const challengeBody = document.getElementById('challenge-body');
  if (challengeToggle && challengeBody) {
    challengeToggle.addEventListener('click', () => {
      challengeBody.classList.toggle('open');
      challengeToggle.querySelector('.challenge-toggle')?.classList.toggle('open');
    });
  }
  
  // Challenge cards
  document.querySelectorAll('.challenge-card').forEach(card => {
    card.addEventListener('click', () => {
      const wasExpanded = card.classList.contains('expanded');
      
      // Collapse all cards first
      document.querySelectorAll('.challenge-card').forEach(c => {
        c.classList.remove('expanded');
        const desc = c.querySelector('.challenge-description');
        if (desc) desc.remove();
      });
      
      // If it wasn't already expanded, expand it
      if (!wasExpanded) {
        card.classList.add('expanded');
        
        const challengeNum = card.dataset.challenge;
        const descriptions = {
          '1': 'Lost Update: Dos clientes escriben simultáneamente en réplicas distintas. ¿Se pierde alguna actualización? Escribe x=10 en A y x=20 en B simultáneamente.',
          '2': 'Stale Read: Un cliente lee datos obsoletos después de una escritura. Escribe x=100 en A, luego intenta leer x desde C (que aún tiene el valor antiguo).',
          '3': 'Causal Violation: El orden causal de eventos no se respeta. Escribe en A, luego lee de B para verificar si B vio el write de A.'
        };
        
        const desc = document.createElement('div');
        desc.className = 'challenge-description';
        desc.style.cssText = `
          padding: 12px;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          margin-top: 8px;
          font-size: 0.875rem;
          color: var(--on-surface-variant);
          line-height: 1.5;
        `;
        desc.textContent = descriptions[challengeNum] || '';
        card.querySelector('.challenge-info')?.appendChild(desc);
        
        // Also trigger challenge loading
        loadChallenge(challengeNum);
      }
    });
  });
  
  // Enter key for inputs
  document.getElementById('write-var')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performWrite();
  });
  document.getElementById('write-value')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performWrite();
  });
  document.getElementById('read-var')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performRead();
  });
  
  // Bottom nav controls
  let replaySpeed = 1;
  
  document.querySelectorAll('.nav-control').forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('.material-symbols-outlined');
      if (!icon) return;
      
      const iconName = icon.textContent.trim();
      
      if (iconName === 'restart_alt') {
        resetSimulator();
      } else if (iconName === 'pause' || iconName === 'play_arrow') {
        const isActive = btn.classList.contains('active');
        btn.classList.toggle('active');
        icon.textContent = isActive ? 'play_arrow' : 'pause';
      } else if (iconName === 'fast_rewind') {
        replaySpeed = Math.max(0.5, replaySpeed - 0.5);
        showReplaySpeedIndicator('rewind', replaySpeed);
      } else if (iconName === 'fast_forward') {
        replaySpeed = Math.min(4, replaySpeed + 0.5);
        showReplaySpeedIndicator('forward', replaySpeed);
      }
    });
  });

  function showReplaySpeedIndicator(direction, speed) {
    let indicator = document.getElementById('replay-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'replay-indicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--surface-container-high);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 0.875rem;
        color: var(--secondary);
        z-index: 100;
        animation: fadeInOut 1s ease-out forwards;
      `;
      document.body.appendChild(indicator);
    }
    indicator.textContent = `${direction === 'rewind' ? '←' : '→'} ${speed}x`;
    setTimeout(() => indicator.remove(), 1000);
  }
  
  // Model selector hover info
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    const shortcutsHint = document.getElementById('shortcuts-hint');
    
    if (e.key === '?') {
      shortcutsHint?.classList.toggle('visible');
      return;
    }
    
    if (shortcutsHint?.classList.contains('visible')) {
      setTimeout(() => shortcutsHint.classList.remove('visible'), 2000);
    }
    
    if (e.key === 'r' || e.key === 'R') {
      resetSimulator();
    } else if (e.key === 'w' || e.key === 'W') {
      document.getElementById('write-var')?.focus();
    } else if (e.key === 's' || e.key === 'S') {
      document.getElementById('read-var')?.focus();
    } else if (e.key === '1') {
      document.getElementById('model-select').value = 'strict';
      changeModel('strict');
    } else if (e.key === '2') {
      document.getElementById('model-select').value = 'sequential';
      changeModel('sequential');
    } else if (e.key === '3') {
      document.getElementById('model-select').value = 'causal';
      changeModel('causal');
    } else if (e.key === '4') {
      document.getElementById('model-select').value = 'eventual';
      changeModel('eventual');
    }
  });
}

/**
 * Load a challenge scenario
 */
function loadChallenge(num) {
  const challenges = {
    '1': () => {
      state.resetState();
      state.setModel('eventual');
      document.getElementById('model-select').value = 'eventual';
      updateExplanation();
      renderReplicas();
      addLogEntry('warning', 'Challenge: Lost Update', 'Simula dos writes concurrentes en réplicas distintas', 'warning');
    },
    '2': () => {
      // Setup stale state
      const currentState = state.getState();
      currentState.replicas.A = { x: 10, y: 0, z: 0 };
      currentState.replicas.B = { x: 10, y: 0, z: 0 };
      currentState.replicas.C = { x: 5, y: 0, z: 0 };
      state.setModel('eventual');
      document.getElementById('model-select').value = 'eventual';
      state.saveState(currentState);
      updateExplanation();
      renderReplicas();
      addLogEntry('warning', 'Challenge: Stale Read', 'Replica C tiene x=5 (stale). Intenta leer desde C.', 'warning');
    },
    '3': () => {
      state.resetState();
      state.setModel('causal');
      document.getElementById('model-select').value = 'causal';
      updateExplanation();
      renderReplicas();
      addLogEntry('warning', 'Challenge: Causal Violation', 'Escribe en A, luego lee de B. ¿B ve el write?', 'warning');
    }
  };
  
  if (challenges[num]) {
    challenges[num]();
  }
}

/**
 * Show tutorial modal
 */
export function showTutorialModal() {
  const modal = document.getElementById('tutorial-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * Hide tutorial modal
 */
export function hideTutorialModal() {
  const modal = document.getElementById('tutorial-modal');
  if (modal) {
    modal.style.display = 'none';
    state.completeTutorial();
  }
}

/**
 * Load log entries from memory (for persistence)
 */
function loadLogEntries() {
  // For now, just render empty state
}

export default {
  init,
  performWrite,
  performRead,
  resetSimulator,
  changeModel,
  showTutorialModal,
  hideTutorialModal
};