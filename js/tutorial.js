/**
 * tutorial.js — Interactive walkthrough
 * Shows on first load, step by step.
 */

const TUTORIAL_KEY = 'consistencia-simulador-tutorial-v1';

const STEPS = [
  {
    target: null,
    title: '¿Qué es este simulador?',
    body: 'Simula un sistema distribuido con 3 réplicas (A, B, C) que almacenan las mismas variables (x, y, z). Explora cómo los diferentes modelos de consistencia afectan cuándo y cómo se ven reflejadas las escrituras entre las réplicas.',
    position: 'center',
  },
  {
    target: '.replicas-grid',
    title: 'Réplicas del Sistema',
    body: 'Tienes 3 réplicas (A, B, C). Cada una mantiene su propia copia de x, y, z. En Strict y Sequential se mantienen idénticas; en Causal y Eventual pueden divergir temporalmente.',
    position: 'bottom',
  },
  {
    target: '#write-replica',
    title: 'Escribir un Valor',
    body: 'Selecciona una variable (x, y o z), escribe un valor, elige la réplica destino y presiona Write. Según el modelo chosen, el valor se propaga a todas las réplicas o solo a una.',
    position: 'bottom',
  },
  {
    target: '#read-replica',
    title: 'Leer un Valor',
    body: 'Selecciona la variable y la réplica que quieres leer. Dependiendo del modelo de consistencia, puedes obtener el valor más reciente o uno "stale" (desactualizado).',
    position: 'top',
  },
  {
    target: '#model-select',
    title: 'Modelo de Consistencia',
    body: '4 modelos disponibles:\n• Strict: Escritura síncrona a todas las réplicas. Cualquier lectura siempre ve el valor más reciente — nunca stale.\n• Sequential: Escritura síncrona a todas, pero las lecturas pueden ver valores ligeramente antiguos (lag de secuencia).\n• Causal: Las escrituras se propagan respetando el orden causal. Si escribir en A causa lógicamente una escritura en B, B la recibirá en orden causal correcto.\n• Eventual: La escritura solo se aplica a la réplica destino. Otras réplicas pueden tener valores antiguos (stale) mientras la propagación está pendiente.',
    position: 'bottom',
  },
  {
    target: '.log-panel',
    title: 'Log de Operaciones',
    body: 'Cada operación queda registrada aquí. Las entradas con ⚠️ indican que leíste un valor desactualizado (stale) según el modelo activo.',
    position: 'top',
  },
  {
    target: '#btn-reset',
    title: 'Reset',
    body: 'Limpia todas las operaciones y devuelve las 3 réplicas a su estado inicial (x=0, y=0, z=0). También puedes presionar la tecla R.',
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
  try {
    localStorage.removeItem(TUTORIAL_KEY);
  } catch {}
  currentStep = 0;
  removeExisting();
  if (!isTutorialDone()) {
    renderTutorialStep();
  }
}

function renderTutorialStep() {
  removeExisting();

  const step = STEPS[currentStep];
  const tooltip = buildTooltip(step, currentStep);
  document.body.appendChild(tooltip);

  if (step.target) {
    const targetEl = document.querySelector(step.target);
    if (!targetEl) {
      currentStep++;
      if (currentStep < STEPS.length) {
        setTimeout(renderTutorialStep, 100);
      } else {
        hideTutorial();
      }
      return;
    }
    positionTooltip(tooltip, targetEl, step.position);
  }
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
    } else if (position === 'top') {
      top = rect.top - cardRect.height - 8 + window.scrollY;
      left = rect.left + (rect.width / 2) - (cardRect.width / 2);
    }

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

// Auto-dismiss tutorial overlay when user interacts with controls
export function setupTutorialDismiss() {
  ['#btn-write', '#btn-read', '#btn-reset', '#model-select', '#write-var',
   '#write-value', '#read-var'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) {
      el.addEventListener('click', hideTutorial, { once: true });
      el.addEventListener('change', hideTutorial, { once: true });
    }
  });
}

export { hideTutorial };