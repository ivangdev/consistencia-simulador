/**
 * State — single source of truth
 * All state changes go through functions in this file.
 */

export const VARIABLES = ['x', 'y', 'z'];
export const REPLICAS = ['A', 'B', 'C'];
export const MODELS = ['strict', 'sequential', 'causal', 'eventual'];

export const INITIAL_STATE = Object.freeze({
  model: 'eventual',
  replicas: {
    A: { x: 0, y: 0, z: 0 },
    B: { x: 0, y: 0, z: 0 },
    C: { x: 0, y: 0, z: 0 },
  },
  operationLog: [],
  operationCount: 0,
});

let _state = null;

export function getState() {
  if (!_state) {
    _state = JSON.parse(JSON.stringify(INITIAL_STATE));
  }
  return _state;
}

export function resetState() {
  _state = JSON.parse(JSON.stringify(INITIAL_STATE));
  return _state;
}

export function setModel(model) {
  if (!MODELS.includes(model)) {
    throw new Error(`Invalid model: ${model}`);
  }
  getState().model = model;
}

export function getModel() {
  return getState().model;
}

export function getReplicas() {
  return getState().replicas;
}

export function addLogEntry(entry) {
  const state = getState();
  state.operationLog.unshift({
    ...entry,
    timestamp: state.operationCount,
    id: Date.now(),
  });
  state.operationCount++;
}