/**
 * main.js — Bootstrap
 */

import { renderAll } from './render.js';
import { setupEventListeners } from './events.js';
import { resetState, getModel } from './state.js';
import { startTutorial, setupTutorialDismiss } from './tutorial.js';

export function init() {
  resetState();

  const modelSelect = document.getElementById('model-select');
  if (modelSelect) modelSelect.value = getModel();

  renderAll();
  setupEventListeners();
  setupTutorialDismiss();
  setupTutorialHelp();

  // Start interactive tutorial on first visit
  startTutorial();

  console.log('Consistency Simulator initialized');
}

function setupTutorialHelp() {
  const helpBtn = document.getElementById('btn-help');
  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      import('./tutorial.js').then(m => {
        m.resetTutorial();
        m.startTutorial();
      });
    });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}