/**
 * State Management for Consistency Simulator
 */

const INITIAL_STATE = {
  replicas: {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 0, y: 0, z: 0 },
    C: { x: 0, y: 0, z: 0 }
  },
  model: 'sequential',
  operationCount: 0,
  lastWriteReplica: null,
  lastWriteVar: null,
  lastWriteValue: null,
  causalHistory: [],
  tutorialCompleted: false
};

/**
 * Get current state (from localStorage or initial)
 */
export function getState() {
  const saved = localStorage.getItem('consistency-sim-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { ...INITIAL_STATE };
    }
  }
  return { ...INITIAL_STATE };
}

/**
 * Save state to localStorage
 */
export function saveState(state) {
  localStorage.setItem('consistency-sim-state', JSON.stringify(state));
}

/**
 * Update replica value
 */
export function updateReplica(replicaId, varName, value) {
  const state = getState();
  state.replicas[replicaId][varName] = value;
  state.lastWriteReplica = replicaId;
  state.lastWriteVar = varName;
  state.lastWriteValue = value;
  state.causalHistory.push({
    replica: replicaId,
    var: varName,
    value,
    time: Date.now()
  });
  state.operationCount++;
  saveState(state);
  return state;
}

/**
 * Read from replica
 */
export function readFromReplica(replicaId, varName) {
  const state = getState();
  return state.replicas[replicaId][varName] ?? 0;
}

/**
 * Get all replicas data
 */
export function getReplicas() {
  const state = getState();
  return state.replicas;
}

/**
 * Get current consistency model
 */
export function getModel() {
  const state = getState();
  return state.model;
}

/**
 * Set consistency model
 */
export function setModel(model) {
  const state = getState();
  state.model = model;
  saveState(state);
  return state;
}

/**
 * Reset state to initial
 */
export function resetState() {
  const state = { ...INITIAL_STATE };
  saveState(state);
  return state;
}

/**
 * Increment operation count
 */
export function incrementOps() {
  const state = getState();
  state.operationCount++;
  saveState(state);
  return state;
}

/**
 * Mark tutorial as completed
 */
export function completeTutorial() {
  const state = getState();
  state.tutorialCompleted = true;
  saveState(state);
  return state;
}

/**
 * Check if tutorial was completed
 */
export function isTutorialCompleted() {
  const state = getState();
  return state.tutorialCompleted;
}

export default {
  getState,
  saveState,
  updateReplica,
  readFromReplica,
  getReplicas,
  getModel,
  setModel,
  resetState,
  incrementOps,
  completeTutorial,
  isTutorialCompleted
};