/**
 * Unit tests for models.js
 */

import { test, expect } from '@playwright/test';
import { executeWrite, executeRead } from '../js/models.js';
import { getReplicas, getState, resetState, setModel } from '../js/state.js';

test.describe('executeWrite stubs', () => {
  test.beforeEach(() => resetState());

  test('executeWrite exists and is a function', () => {
    expect(typeof executeWrite).toBe('function');
  });

  test('executeWrite throws on invalid variable', () => {
    expect(() => executeWrite('w', 1, 'A')).toThrow();
    expect(() => executeWrite('', 1, 'A')).toThrow();
  });

  test('executeWrite throws on invalid replica', () => {
    expect(() => executeWrite('x', 1, 'Z')).toThrow();
    expect(() => executeWrite('x', 1, '')).toThrow();
  });
});

test.describe('executeWrite — strict model', () => {
  test.beforeEach(() => resetState());

  test('write propagates to ALL 3 replicas', () => {
    setModel('strict');
    executeWrite('x', 42, 'A');
    const r = getReplicas();
    expect(r.A.x).toBe(42);
    expect(r.B.x).toBe(42);
    expect(r.C.x).toBe(42);
  });

  test('write does NOT affect other variables', () => {
    setModel('strict');
    executeWrite('x', 10, 'B');
    const r = getReplicas();
    expect(r.B.y).toBe(0);
    expect(r.B.z).toBe(0);
  });

  test('write from any replica reaches all', () => {
    setModel('strict');
    executeWrite('y', 7, 'C');
    const r = getReplicas();
    expect(r.A.y).toBe(7);
    expect(r.B.y).toBe(7);
    expect(r.C.y).toBe(7);
  });
});

test.describe('executeWrite — eventual model', () => {
  test.beforeEach(() => resetState());

  test('write only affects target replica', () => {
    setModel('eventual');
    executeWrite('x', 99, 'B');
    const r = getReplicas();
    expect(r.B.x).toBe(99);
    expect(r.A.x).toBe(0);
    expect(r.C.x).toBe(0);
  });

  test('second write to same replica overwrites', () => {
    setModel('eventual');
    executeWrite('x', 1, 'B');
    executeWrite('x', 2, 'B');
    expect(getReplicas().B.x).toBe(2);
  });
});

test.describe('executeWrite — sequential model', () => {
  test.beforeEach(() => resetState());

  test('sequential behaves like strict (all replicas)', () => {
    setModel('sequential');
    executeWrite('z', 5, 'A');
    const r = getReplicas();
    expect(r.A.z).toBe(5);
    expect(r.B.z).toBe(5);
    expect(r.C.z).toBe(5);
  });
});

test.describe('executeRead stubs', () => {
  test.beforeEach(() => resetState());

  test('executeRead exists and is a function', () => {
    expect(typeof executeRead).toBe('function');
  });

  test('executeRead throws on invalid variable', () => {
    expect(() => executeRead('q', 'A')).toThrow();
  });

  test('executeRead throws on invalid replica', () => {
    expect(() => executeRead('x', 'Z')).toThrow();
  });
});

test.describe('executeRead — strict model', () => {
  test.beforeEach(() => resetState());

  test('read returns value written to any replica', () => {
    setModel('strict');
    executeWrite('x', 7, 'A');
    const result = executeRead('x', 'C');
    expect(result.value).toBe(7);
    expect(result.stale).toBe(false);
  });
});

test.describe('executeRead — eventual model', () => {
  test.beforeEach(() => resetState());

  test('read returns local replica value (may be stale)', () => {
    setModel('eventual');
    executeWrite('x', 5, 'A');
    const result = executeRead('x', 'B');
    expect(result.value).toBe(0);
    expect(result.stale).toBe(true);
  });
});