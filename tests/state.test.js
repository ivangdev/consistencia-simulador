/**
 * Unit tests for state.js
 * Run: npx playwright test tests/state.test.js --project=chromium
 */

import { test, expect } from '@playwright/test';
import { getState, resetState, setModel, getReplicas, addLogEntry, getModel, INITIAL_STATE } from '../js/state.js';
import { VARIABLES, REPLICAS, MODELS } from '../js/state.js';

test.describe('INITIAL_STATE', () => {
  test('has correct model default', () => {
    expect(INITIAL_STATE.model).toBe('eventual');
  });

  test('all replicas start at 0 for all variables', () => {
    for (const r of REPLICAS) {
      for (const v of VARIABLES) {
        expect(INITIAL_STATE.replicas[r][v]).toBe(0);
      }
    }
  });

  test('operationLog starts empty', () => {
    expect(INITIAL_STATE.operationLog).toEqual([]);
  });

  test('operationCount starts at 0', () => {
    expect(INITIAL_STATE.operationCount).toBe(0);
  });
});

test.describe('getState / resetState', () => {
  test.beforeEach(() => resetState());

  test('getState returns current state', () => {
    const state = getState();
    expect(state).toBeDefined();
    expect(state.replicas).toBeDefined();
  });

  test('resetState restores initial values', () => {
    getState().replicas.A.x = 999;
    getState().operationCount = 42;
    resetState();
    expect(getState().replicas.A.x).toBe(0);
    expect(getState().operationCount).toBe(0);
    expect(getState().operationLog).toEqual([]);
  });

  test('getState is stable (same object on repeated calls)', () => {
    const s1 = getState();
    const s2 = getState();
    expect(s1).toBe(s2);
  });
});

test.describe('setModel / getModel', () => {
  test.beforeEach(() => resetState());

  test('getModel returns current model', () => {
    expect(getModel()).toBe('eventual');
  });

  test('setModel changes model', () => {
    setModel('strict');
    expect(getModel()).toBe('strict');
  });

  test('setModel accepts all valid models', () => {
    for (const m of MODELS) {
      setModel(m);
      expect(getModel()).toBe(m);
    }
  });

  test('setModel rejects invalid model', () => {
    expect(() => setModel('invalid')).toThrow();
  });
});

test.describe('addLogEntry', () => {
  test.beforeEach(() => resetState());

  test('adds entry to operationLog', () => {
    addLogEntry({ type: 'write', operation: 'Write(x)' });
    expect(getState().operationLog.length).toBe(1);
  });

  test('prepends (newest first)', () => {
    addLogEntry({ type: 'write', operation: 'Write(x)' });
    addLogEntry({ type: 'read', operation: 'Read(y)' });
    expect(getState().operationLog[0].operation).toBe('Read(y)');
    expect(getState().operationLog[1].operation).toBe('Write(x)');
  });

  test('increments operationCount', () => {
    addLogEntry({ type: 'write', operation: 'Write(x)' });
    addLogEntry({ type: 'read', operation: 'Read(y)' });
    expect(getState().operationCount).toBe(2);
  });

  test('entry has timestamp and id', () => {
    addLogEntry({ type: 'write', operation: 'Write(x)' });
    const entry = getState().operationLog[0];
    expect(entry.timestamp).toBe(0);
    expect(entry.id).toBeDefined();
  });
});