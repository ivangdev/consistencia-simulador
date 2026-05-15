/**
 * Consistency Model Rules
 * Defines behavior for each consistency model
 */

export const CONSISTENCY_MODELS = {
  strict: {
    name: 'Strict',
    description: 'Todas las operaciones de escritura son visibles instantáneamente en todas las réplicas. Garantía máxima pero imposible en sistemas distribuidos reales.',
    rules: [
      'Toda lectura ve el valor más reciente escrito',
      'No existen stale reads',
      'Orden total de operaciones'
    ],
    propagateImmediately: true
  },
  sequential: {
    name: 'Sequential',
    description: 'Todas las operaciones aparecen en el mismo orden en todas las réplicas, como si fueran ejecutadas en un solo procesador.',
    rules: [
      'Reads ven todos los writes en orden',
      'No hay reads no-monotónicos',
      'Todas las réplicas acuerdan el orden'
    ],
    propagateImmediately: true
  },
  causal: {
    name: 'Causal',
    description: 'Writes que están causalmente relacionados son vistos en el mismo orden por todas las réplicas. Writes independientes pueden verse en diferente orden.',
    rules: [
      'Reads respetan relaciones causa-efecto',
      'Writes causalmente relacionados se ordenan juntos',
      'Writes concurrentes pueden tener orden diferente'
    ],
    propagateImmediately: false,
    trackCausality: true
  },
  eventual: {
    name: 'Eventual',
    description: 'Las réplicas eventualmente convergen al mismo valor si no hay más writes. No hay garantías sobre el orden o timing de lecturas.',
    rules: [
      'Sin garantías en el orden de reads',
      'Stale reads son posibles',
      'Eventualmente todas las réplicas convergen'
    ],
    propagateImmediately: false,
    eventualConsistency: true
  }
};

/**
 * Check if a write should propagate immediately based on model
 */
export function shouldPropagateImmediately(model) {
  return CONSISTENCY_MODELS[model]?.propagateImmediately ?? false;
}

/**
 * Check if a replica might have stale data
 */
export function mightHaveStaleData(model, replicaId, otherReplicas) {
  if (model === 'strict' || model === 'sequential') {
    return false;
  }
  if (model === 'causal') {
    return false; // Causal guarantees prevent staleness
  }
  if (model === 'eventual') {
    return Object.values(otherReplicas).some(r => 
      JSON.stringify(r) !== JSON.stringify(otherReplicas[replicaId])
    );
  }
  return false;
}

/**
 * Get read result info based on model
 */
export function getReadResult(model, replicaData, allReplicas, varName) {
  const modelInfo = CONSISTENCY_MODELS[model];
  
  if (model === 'strict' || model === 'sequential') {
    return {
      value: replicaData[varName] ?? 0,
      suffix: ' (valor actualizado)',
      badge: 'ok'
    };
  }
  
  if (model === 'causal') {
    return {
      value: replicaData[varName] ?? 0,
      suffix: ' (causalmente consistente)',
      badge: 'ok'
    };
  }
  
  if (model === 'eventual') {
    const hasStale = Object.entries(allReplicas).some(([id, data]) => {
      return id !== replicaId && data[varName] !== replicaData[varName];
    });
    
    if (hasStale) {
      return {
        value: replicaData[varName] ?? 0,
        suffix: ' (⚠️ posible stale read)',
        badge: 'stale'
      };
    }
    return {
      value: replicaData[varName] ?? 0,
      suffix: ' (valor actualizado)',
      badge: 'ok'
    };
  }
  
  return {
    value: replicaData[varName] ?? 0,
    suffix: '',
    badge: 'ok'
  };
}

/**
 * Get propagation info after a write
 */
export function getPropagationInfo(model, writeReplica, varName, value) {
  if (model === 'strict') {
    return { message: 'Propagado instantáneamente a todas las réplicas', badge: 'ok' };
  }
  if (model === 'sequential') {
    return { message: 'Orden garantizado en todas las réplicas', badge: 'ok' };
  }
  if (model === 'causal') {
    return { message: 'Propagado según dependencias causales', badge: 'ok' };
  }
  if (model === 'eventual') {
    return { message: 'Propagación eventual — sin garantías de timing', badge: 'warning' };
  }
  return { message: 'Propagación completada', badge: 'ok' };
}

export default CONSISTENCY_MODELS;