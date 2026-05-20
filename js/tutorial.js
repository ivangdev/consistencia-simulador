/**
 * tutorial.js — Interactive walkthrough
 * Shows on first load, step by step.
 */

const TUTORIAL_KEY = 'consistencia-simulador-tutorial-v1';

const STEPS = [
  {
    target: null,
    title: 'Demo del Simulador',
    body: '',
    isGif: true,
    position: 'center',
  },
  {
    target: '.replicas-grid',
    title: 'Réplicas del Sistema',
    body: 'Tienes 3 réplicas (A, B, C) que simulan servidores distribuidos. Cada una mantiene su propia copia de las variables x, y, z.',
    position: 'bottom',
  },
  {
    target: '#write-replica',
    title: 'Escribir un Valor',
    body: 'Selecciona una variable (x, y o z), ingresa un valor, elige la réplica donde escribir, y presiona Write. Dependiendo del modelo, el valor se propagará a todas las réplicas o solo a una.',
    position: 'bottom',
  },
  {
    target: '#read-replica',
    title: 'Leer un Valor',
    body: 'Para leer, selecciona la variable y la réplica. El valor que leas puede estar "stale" (desactualizado) si las réplicas no están sincronizadas según el modelo chosen.',
    position: 'top',
  },
  {
    target: '#model-select',
    title: 'Modelo de Consistencia',
    body: '4 modelos disponibles:\n• Strict: Siempre lee el último valor escrito. Síncrono.\n• Sequential: Las operaciones respetan un orden global, pero pueden haber lecturas stale.\n• Causal: Mantiene orden causal, pero no garantiza orden total.\n• Eventual: Las escrituras se propagan eventualmente. Máxima、性能, pero puede haber lecturas stale.',
    position: 'bottom',
  },
  {
    target: '.log-panel',
    title: 'Log de Operaciones',
    body: 'Cada operación queda registrada aquí. Las entradas con ⚠️ "stale" indican que leíste un valor desactualizado según el modelo activo.',
    position: 'top',
  },
  {
    target: '#btn-reset',
    title: 'Reset',
    body: 'Limpia todas las operaciones y vuelve las 3 réplicas a su estado inicial (x=0, y=0, z=0). También puedes presionar la tecla R.',
    position: 'top',
  },
];

export function isTutorialDone() {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === 'true';
  } catch {
    return false;
  }
}

export function completeTutorial() {
  try {
    localStorage.setItem(TUTORIAL_KEY, 'true');
  } catch {}
}

let currentStep = 0;

export function startTutorial() {
  if (isTutorialDone()) return;
  currentStep = 0;
  renderTutorialStep();
}

export function resetTutorial() {
  currentStep = 0;
  completeTutorial();
  hideTutorial();
}

function renderTutorialStep() {
  removeExisting();

  const step = STEPS[currentStep];

  // GIF step — show the demo image centered
  if (step.isGif) {
    const tooltip = buildGifStep(step, currentStep);
    document.body.appendChild(tooltip);
    return;
  }

  const targetEl = document.querySelector(step.target);
  if (!targetEl) {
    // Element not found, skip to next
    currentStep++;
    if (currentStep < STEPS.length) {
      setTimeout(renderTutorialStep, 100);
    } else {
      hideTutorial();
    }
    return;
  }

  const tooltip = buildTooltip(step, currentStep);
  document.body.appendChild(tooltip);
  positionTooltip(tooltip, targetEl, step.position);
}

function buildTooltip(step, idx) {
  const div = document.createElement('div');
  div.id = 'tutorial-overlay';

  const progress = `${idx + 1}/${STEPS.length}`;

  div.innerHTML = `
    <div class="tutorial-card">
      <div class="tutorial-header">
        <span class="tutorial-step">Paso ${idx + 1}</span>
        <span class="tutorial-progress">${progress}</span>
      </div>
      <h3 class="tutorial-title">${step.title}</h3>
      <p class="tutorial-body">${step.body.replace(/\n/g, '<br>')}</p>
      <div class="tutorial-actions">
        ${idx > 0 ? '<button class="tutorial-btn tutorial-btn-back" id="tut-prev">← Atrás</button>' : ''}
        ${idx < STEPS.length - 1
          ? '<button class="tutorial-btn tutorial-btn-next" id="tut-next">Siguiente →</button>'
          : '<button class="tutorial-btn tutorial-btn-finish" id="tut-finish">¡Entendido!</button>'}
      </div>
      <button class="tutorial-skip" id="tut-skip">Saltar tutorial</button>
    </div>
  `;

  div.querySelector('#tut-next')?.addEventListener('click', () => {
    currentStep++;
    renderTutorialStep();
  });

  div.querySelector('#tut-prev')?.addEventListener('click', () => {
    currentStep--;
    renderTutorialStep();
  });

  div.querySelector('#tut-finish')?.addEventListener('click', () => {
    completeTutorial();
    hideTutorial();
  });

  div.querySelector('#tut-skip')?.addEventListener('click', () => {
    completeTutorial();
    hideTutorial();
  });

  return div;
}

function buildGifStep(step, idx) {
  const div = document.createElement('div');
  div.id = 'tutorial-overlay';

  const progress = `${idx + 1}/${STEPS.length}`;

  div.innerHTML = `
    <div class="tutorial-card tutorial-card-center">
      <div class="tutorial-header">
        <span class="tutorial-step">Paso ${idx + 1}</span>
        <span class="tutorial-progress">${progress}</span>
      </div>
      <h3 class="tutorial-title">${step.title}</h3>
      <img class="tutorial-gif" src="consistencia-demo.gif" alt="Demo del simulador" />
      <p class="tutorial-body">Mira cómo funciona el simulador. Luego exploraremos cada parte.</p>
      <div class="tutorial-actions">
        <button class="tutorial-btn tutorial-btn-next" id="tut-next">Siguiente →</button>
      </div>
      <button class="tutorial-skip" id="tut-skip">Saltar tutorial</button>
    </div>
  `;

  div.querySelector('#tut-next')?.addEventListener('click', () => {
    currentStep++;
    renderTutorialStep();
  });

  div.querySelector('#tut-skip')?.addEventListener('click', () => {
    completeTutorial();
    hideTutorial();
  });

  return div;
}

function positionTooltip(tooltip, targetEl, position) {
  const rect = targetEl.getBoundingClientRect();
  const card = tooltip.querySelector('.tutorial-card');

  card.className = `tutorial-card tutorial-card-${position}`;

  requestAnimationFrame(() => {
    const cardRect = card.getBoundingClientRect();
    let top, left;

    if (position === 'bottom') {
      top = rect.bottom + 8 + window.scrollY;
      left = rect.left + (rect.width / 2) - (cardRect.width / 2);
    } else {
      top = rect.top - cardRect.height - 8 + window.scrollY;
      left = rect.left + (rect.width / 2) - (cardRect.width / 2);
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - cardRect.width - 8));

    card.style.position = 'absolute';
    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
    card.style.zIndex = '9999';
  });
}

function removeExisting() {
  const existing = document.getElementById('tutorial-overlay');
  if (existing) existing.remove();
}

function hideTutorial() {
  removeExisting();
}