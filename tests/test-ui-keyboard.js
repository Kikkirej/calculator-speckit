import { describe, it, assertEqual } from './harness.js';
import { mapKeyToAction } from '../src/keyboard.js';

// ── mapKeyToAction ────────────────────────────────────────────────────────────

describe('mapKeyToAction', () => {
  it('digit 0', () => {
    assertEqual(mapKeyToAction('0'), 'digit-0');
  });

  it('digit 9', () => {
    assertEqual(mapKeyToAction('9'), 'digit-9');
  });

  it('each digit 0-9 maps to digit-N', () => {
    for (const d of '0123456789') {
      assertEqual(mapKeyToAction(d), 'digit-' + d);
    }
  });

  it('decimal point', () => {
    assertEqual(mapKeyToAction('.'), 'decimal');
  });

  it('plus', () => {
    assertEqual(mapKeyToAction('+'), 'add');
  });

  it('minus', () => {
    assertEqual(mapKeyToAction('-'), 'subtract');
  });

  it('asterisk', () => {
    assertEqual(mapKeyToAction('*'), 'multiply');
  });

  it('slash', () => {
    assertEqual(mapKeyToAction('/'), 'divide');
  });

  it('caret', () => {
    assertEqual(mapKeyToAction('^'), 'power');
  });

  it('Enter', () => {
    assertEqual(mapKeyToAction('Enter'), 'equals');
  });

  it('equals sign', () => {
    assertEqual(mapKeyToAction('='), 'equals');
  });

  it('Escape', () => {
    assertEqual(mapKeyToAction('Escape'), 'clear');
  });

  it('Backspace', () => {
    assertEqual(mapKeyToAction('Backspace'), 'backspace');
  });

  it('unmapped letter returns null', () => {
    assertEqual(mapKeyToAction('a'), null);
  });

  it('unmapped F-key returns null', () => {
    assertEqual(mapKeyToAction('F1'), null);
  });

  it('Tab returns null', () => {
    assertEqual(mapKeyToAction('Tab'), null);
  });

  it('empty string returns null', () => {
    assertEqual(mapKeyToAction(''), null);
  });
});
