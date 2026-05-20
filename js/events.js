/**
 * events.js — Event handlers
 */

import { executeWrite, executeRead } from './models.js';
import { setModel, resetState, getModel, incrementOps, getState } from './state.js';
import { getPropagationInfo, getReadResult } from './models.js';
import { renderAll } from './render.js';
import { VARIABLES } from './state.js';
import { hideTutorial } from './tutorial.js';

function addLogEntry(type, operation, result, badge = null) {
  const state = getState();
  state.operationLog.unshift({ type, operation, result, badge, timestamp: state.operationCount, id: Date.now() });
  state.operationCount++;
}

export function setupEventListeners() {
  const modelSelect = document.getElementById('model-select');
  if (modelSelect) {
    modelSelect.addEventListener('change', (e) => {
      setModel(e.target.value);
      hideTutorial();
      renderAll();
    });
  }

  const writeBtn = document.getElementById('btn-write');
  if (writeBtn) writeBtn.addEventListener('click', handleWrite);

  const readBtn = document.getElementById('btn-read');
  if (readBtn) readBtn.addEventListener('click', handleRead);

  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetState();
      renderAll();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'r' || e.key === 'R') {
      resetState();
      renderAll();
    }
  });
}

function handleWrite() {
  hideTutorial();

  const varInput = document.getElementById('write-var');
  const valueInput = document.getElementById('write-value');
  const replicaSelect = document.getElementById('write-replica');

  const varName = varInput.value.trim().toLowerCase();
  const valueStr = valueInput.value.trim();
  const replica = replicaSelect.value;

  if (!varName) {
    alert('Ingresá una variable (x, y, o z).');
    return;
  }
  if (!VARIABLES.includes(varName)) {
    alert('Variable inválida. Usa x, y, o z.');
    return;
  }

  const value = parseInt(valueStr, 10);
  if (isNaN(value)) {
    alert('Valor inválido. Ingresa un número.');
    return;
  }

  try {
    executeWrite(varName, value, replica);
    const model = getModel();
    const propagation = getPropagationInfo(model, replica, varName, value);
    addLogEntry('write', `Write(${varName}=${value}) @ ${replica}`, propagation.message, propagation.badge);
    renderAll();
    // Keep var name, clear value only
    varInput.value = varName;
    valueInput.value = '';
  } catch (err) {
    alert(err.message);
  }
}

function handleRead() {
  hideTutorial();

  const varInput = document.getElementById('read-var');
  const replicaSelect = document.getElementById('read-replica');

  const varName = varInput.value.trim().toLowerCase();
  const replica = replicaSelect.value;

  if (!varName || !VARIABLES.includes(varName)) {
    alert('Variable inválida. Usa x, y, o z.');
    return;
  }

  try {
    executeRead(varName, replica);
    const replicas = getState().replicas;
    const model = getModel();
    const replicaData = replicas[replica];
    const displayResult = getReadResult(model, replica, replicaData, replicas, varName);
    addLogEntry('read', `Read(${varName}) @ ${replica}`, `→ ${displayResult.value} ${displayResult.suffix}`, displayResult.badge);
    renderAll();
    varInput.value = '';
  } catch (err) {
    alert(err.message);
  }
}