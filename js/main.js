/**
 * main.js — Bootstrap
 */

import { renderAll } from './render.js';
import { setupEventListeners } from './events.js';
import { resetState, getModel } from './state.js';

export function init() {
  resetState();

  const modelSelect = document.getElementById('model-select');
  if (modelSelect) modelSelect.value = getModel();

  renderAll();
  setupEventListeners();

  console.log('Consistency Simulator initialized');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}