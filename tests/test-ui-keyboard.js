import { assert, test } from './harness.js';
import { mapKeyToAction } from '../src/keyboard.js';

// ── mapKeyToAction ────────────────────────────────────────────────────────────

test('mapKeyToAction: digit 0', () => {
  assert(mapKeyToAction('0') === 'digit-0');
});

test('mapKeyToAction: digit 9', () => {
  assert(mapKeyToAction('9') === 'digit-9');
});

test('mapKeyToAction: each digit 0-9 maps to digit-N', () => {
  for (const d of '0123456789') {
    assert(mapKeyToAction(d) === 'digit-' + d, `digit ${d}`);
  }
});

test('mapKeyToAction: decimal point', () => {
  assert(mapKeyToAction('.') === 'decimal');
});

test('mapKeyToAction: plus', () => {
  assert(mapKeyToAction('+') === 'add');
});

test('mapKeyToAction: minus', () => {
  assert(mapKeyToAction('-') === 'subtract');
});

test('mapKeyToAction: asterisk', () => {
  assert(mapKeyToAction('*') === 'multiply');
});

test('mapKeyToAction: slash', () => {
  assert(mapKeyToAction('/') === 'divide');
});

test('mapKeyToAction: caret', () => {
  assert(mapKeyToAction('^') === 'power');
});

test('mapKeyToAction: Enter', () => {
  assert(mapKeyToAction('Enter') === 'equals');
});

test('mapKeyToAction: equals sign', () => {
  assert(mapKeyToAction('=') === 'equals');
});

test('mapKeyToAction: Escape', () => {
  assert(mapKeyToAction('Escape') === 'clear');
});

test('mapKeyToAction: Backspace', () => {
  assert(mapKeyToAction('Backspace') === 'backspace');
});

test('mapKeyToAction: unmapped letter returns null', () => {
  assert(mapKeyToAction('a') === null);
});

test('mapKeyToAction: unmapped F-key returns null', () => {
  assert(mapKeyToAction('F1') === null);
});

test('mapKeyToAction: Tab returns null', () => {
  assert(mapKeyToAction('Tab') === null);
});

test('mapKeyToAction: empty string returns null', () => {
  assert(mapKeyToAction('') === null);
});
