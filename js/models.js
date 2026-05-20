/**
 * models.js — Pure consistency logic
 * No DOM, no side effects.
 */

import { getState, getReplicas, addLogEntry } from './state.js';
import { VARIABLES, REPLICAS } from './state.js';

function validateVar(varName) {
  const v = varName?.trim?.().toLowerCase();
  if (!v || !VARIABLES.includes(v)) {
    throw new Error(`Invalid variable: ${varName}`);
  }
  return v;
}

export function executeWrite(varName, value, targetReplica) {
  const var_ = validateVar(varName);
  if (!REPLICAS.includes(targetReplica)) {
    throw new Error(`Invalid replica: ${targetReplica}`);
  }
  const state = getState();
  const model = state.model;

  let updatedReplicas = { ...state.replicas };

  if (model === 'strict' || model === 'sequential') {
    for (const r of REPLICAS) {
      updatedReplicas[r] = { ...updatedReplicas[r], [var_]: value };
    }
  } else {
    updatedReplicas[targetReplica] = { ...updatedReplicas[targetReplica], [var_]: value };
  }

  state.replicas = updatedReplicas;

  const label = (model === 'strict' || model === 'sequential') ? 'A,B,C' : targetReplica;
  addLogEntry({
    type: 'write',
    operation: `Write(${var_}=${value}) @ ${label}`,
    result: `value=${value}`,
    replica: targetReplica,
  });

  return updatedReplicas;
}

export function executeRead(varName, targetReplica) {
  const var_ = validateVar(varName);
  if (!REPLICAS.includes(targetReplica)) {
    throw new Error(`Invalid replica: ${targetReplica}`);
  }
  const state = getState();
  const model = state.model;

  let value = state.replicas[targetReplica][var_];
  let stale = false;

  if (model === 'eventual') {
    const allValues = REPLICAS.map(r => state.replicas[r][var_]);
    stale = !allValues.every(v => v === value);
  }

  addLogEntry({
    type: 'read',
    operation: `Read(${var_}) @ ${targetReplica}`,
    result: `value=${value}${stale ? ' (stale)' : ''}`,
    replica: targetReplica,
    stale,
  });

  return { value, replica: targetReplica, stale };
}