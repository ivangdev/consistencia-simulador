/**
 * models.js — Consistency model semantics
 *
 * Strict:     Sync writes. Reads always see the latest write globally.
 * Sequential: Sync writes. Reads see writes up to a sequence boundary — may be stale.
 * Causal:     Writes propagate respecting causal ordering. Reads see causally-safe values.
 * Eventual:   Writes only hit target replica. Reads may see stale if replicas differ.
 */

import { getState, getReplicas } from './state.js';
import { VARIABLES, REPLICAS } from './state.js';

// Global monotonic timestamp for strict/sequential ordering
let globalTimestamp = 0;

// Vector clocks: { replica: logicalTime } per variable
const vectorClocks = {};
VARIABLES.forEach(v => {
  vectorClocks[v] = { A: 0, B: 0, C: 0 };
});

function validateVar(varName) {
  const v = varName?.trim?.().toLowerCase();
  if (!v || !VARIABLES.includes(v)) {
    throw new Error(`Invalid variable: ${varName}`);
  }
  return v;
}

function nextTimestamp() {
  return ++globalTimestamp;
}

function compareVC(vc1, vc2) {
  let dominatesBefore = false;
  let dominatesAfter = false;
  for (const r of REPLICAS) {
    const t1 = vc1[r] || 0;
    const t2 = vc2[r] || 0;
    if (t1 < t2) dominatesBefore = true;
    if (t1 > t2) dominatesAfter = true;
  }
  if (dominatesBefore && dominatesAfter) return 'concurrent';
  if (dominatesBefore) return 'before';
  if (dominatesAfter) return 'after';
  return 'equal';
}

// ─────────────────────────────────────────────────────────────
// EXECUTE WRITE
// ─────────────────────────────────────────────────────────────

export function executeWrite(varName, value, targetReplica) {
  const var_ = validateVar(varName);
  if (!REPLICAS.includes(targetReplica)) {
    throw new Error(`Invalid replica: ${targetReplica}`);
  }
  const state = getState();
  const model = state.model;

  let updatedReplicas = { ...state.replicas };

  if (model === 'strict') {
    const ts = nextTimestamp();
    for (const r of REPLICAS) {
      updatedReplicas[r] = {
        ...updatedReplicas[r],
        [var_]: value,
        [`${var_}_ts`]: ts,
      };
    }
  } else if (model === 'sequential') {
    const ts = nextTimestamp();
    for (const r of REPLICAS) {
      updatedReplicas[r] = {
        ...updatedReplicas[r],
        [var_]: value,
        [`${var_}_seq`]: ts,
        [`${var_}_seq_boundary`]: false,
      };
    }
  } else if (model === 'causal') {
    const prevVC = { ...vectorClocks[var_] };
    vectorClocks[var_][targetReplica]++;
    for (const r of REPLICAS) {
      if (r === targetReplica) {
        updatedReplicas[r] = {
          ...updatedReplicas[r],
          [var_]: value,
          [`${var_}_vc`]: { ...vectorClocks[var_] },
        };
      }
    }
  } else {
    // Eventual: write only to target replica
    updatedReplicas[targetReplica] = {
      ...updatedReplicas[targetReplica],
      [var_]: value,
    };
  }

  state.replicas = updatedReplicas;

  // Logging handled by events.js layer
  return updatedReplicas;
}

// ─────────────────────────────────────────────────────────────
// EXECUTE READ
// ─────────────────────────────────────────────────────────────

export function executeRead(varName, targetReplica) {
  const var_ = validateVar(varName);
  if (!REPLICAS.includes(targetReplica)) {
    throw new Error(`Invalid replica: ${targetReplica}`);
  }
  const state = getState();
  const model = state.model;

  let value = state.replicas[targetReplica][var_];
  let stale = false;
  let explanation = '';

  if (model === 'strict') {
    let latestValue = value;
    let latestTS = state.replicas[targetReplica][`${var_}_ts`] || 0;
    let sourceReplica = targetReplica;

    for (const r of REPLICAS) {
      const ts = state.replicas[r][`${var_}_ts`] || 0;
      if (ts > latestTS) {
        latestTS = ts;
        latestValue = state.replicas[r][var_];
        sourceReplica = r;
      }
    }

    let updatedReplicas = { ...state.replicas };
    updatedReplicas[targetReplica] = {
      ...updatedReplicas[targetReplica],
      [var_]: latestValue,
      [`${var_}_ts`]: latestTS,
    };
    state.replicas = updatedReplicas;

    value = latestValue;
    explanation = sourceReplica !== targetReplica
      ? `via sync propagation from ${sourceReplica}`
      : 'local';

  } else if (model === 'sequential') {
    const localSeq = state.replicas[targetReplica][`${var_}_seq`] || 0;
    const globalSeq = globalTimestamp;
    if (localSeq < globalSeq - 1) {
      stale = true;
      explanation = `sequence lag (local seq ${localSeq} < global ${globalSeq})`;
    }
  } else if (model === 'causal') {
    const targetVC = state.replicas[targetReplica][`${var_}_vc`] || vectorClocks[var_];
    for (const r of REPLICAS) {
      if (r === targetReplica) continue;
      const otherVC = state.replicas[r][`${var_}_vc`];
      if (!otherVC) continue;
      const comp = compareVC(targetVC, otherVC);
      if (comp === 'before') {
        stale = true;
        explanation = 'causally unreadable write detected';
        break;
      }
    }
  } else {
    const allValues = REPLICAS.map(r => state.replicas[r][var_]);
    const allSame = allValues.every(v => v === value);
    if (!allSame) {
      stale = true;
      explanation = 'propagation pending';
    }
  }

  return { value, replica: targetReplica, stale, explanation };
}

// ─────────────────────────────────────────────────────────────
// UI HELPERS — called by app.js
// ─────────────────────────────────────────────────────────────

export function getPropagationInfo(model, targetReplica, varName, value) {
  const labels = {
    strict: { message: 'Sincronizado a A, B, C', badge: 'sync' },
    sequential: { message: 'Sincronizado a A, B, C', badge: 'sync' },
    causal: { message: `Propagacion causal a ${targetReplica}`, badge: 'causal' },
    eventual: { message: `Solo en ${targetReplica} (propagacion asincrona)`, badge: 'async' },
  };
  return labels[model] || labels.eventual;
}

export function getReadResult(model, replica, replicaData, allReplicas, varName) {
  const value = replicaData[varName] ?? 0;

  if (model === 'strict') {
    let latestValue = value;
    let latestTS = replicaData[`${varName}_ts`] || 0;
    for (const r of Object.keys(allReplicas)) {
      const ts = allReplicas[r][`${varName}_ts`] || 0;
      if (ts > latestTS) {
        latestTS = ts;
        latestValue = allReplicas[r][varName] ?? 0;
      }
    }
    return {
      value: latestValue,
      suffix: latestValue !== value ? '🔄 sync' : '',
      badge: latestValue !== value ? 'sync' : null,
    };
  }

  if (model === 'sequential') {
    return { value, suffix: '', badge: null };
  }

  if (model === 'causal') {
    const targetVC = replicaData[`${varName}_vc`];
    let stale = false;
    if (targetVC) {
      for (const r of Object.keys(allReplicas)) {
        if (r === replica) continue;
        const otherVC = allReplicas[r][`${varName}_vc`];
        if (!otherVC) continue;
        const comp = compareVC(targetVC, otherVC);
        if (comp === 'before') { stale = true; break; }
      }
    }
    return { value, suffix: stale ? '⚠️ causal' : '', badge: stale ? 'causal' : null };
  }

  // Eventual
  const allValues = Object.values(allReplicas).map(r => r[varName] ?? 0);
  const allSame = allValues.every(v => v === value);
  return {
    value,
    suffix: allSame ? '' : '⚠️ stale',
    badge: allSame ? null : 'stale',
  };
}

export const CONSISTENCY_MODELS = ['strict', 'sequential', 'causal', 'eventual'];