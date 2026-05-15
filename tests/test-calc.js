import { describe, it, assertEqual, assertDeepEqual } from './harness.js';
import {
  createState,
  inputDigit,
  inputDecimal,
  selectOperator,
  evaluate,
  clear,
  toggleMode,
  applyScientific,
} from '../src/calc.js';

// ── User Story 1: Simple Mode ─────────────────────────────────────────────────

describe('createState', () => {
  it('returns default initial state', () => {
    const s = createState();
    assertEqual(s.currentValue, '0');
    assertEqual(s.storedOperand, null);
    assertEqual(s.pendingOperator, null);
    assertEqual(s.mode, 'simple');
    assertEqual(s.isError, false);
    assertEqual(s.justEvaluated, false);
  });
});

describe('inputDigit', () => {
  it('appends a digit to display', () => {
    const s = inputDigit(createState(), '5');
    assertEqual(s.currentValue, '5');
  });

  it('replaces leading zero', () => {
    const s = inputDigit(createState(), '3');
    assertEqual(s.currentValue, '3');
  });

  it('appends multiple digits', () => {
    let s = createState();
    s = inputDigit(s, '1');
    s = inputDigit(s, '2');
    s = inputDigit(s, '3');
    assertEqual(s.currentValue, '123');
  });

  it('replaces value after justEvaluated', () => {
    let s = { ...createState(), justEvaluated: true, currentValue: '42' };
    s = inputDigit(s, '7');
    assertEqual(s.currentValue, '7');
    assertEqual(s.justEvaluated, false);
  });

  it('is a no-op when isError is true', () => {
    const s = { ...createState(), isError: true, currentValue: 'Error' };
    assertEqual(inputDigit(s, '5').currentValue, 'Error');
  });
});

describe('inputDecimal', () => {
  it('appends decimal point', () => {
    const s = inputDecimal(createState());
    assertEqual(s.currentValue, '0.');
  });

  it('is a no-op if decimal already present', () => {
    let s = inputDecimal(createState());
    s = inputDecimal(s);
    assertEqual(s.currentValue, '0.');
  });

  it('is a no-op when isError is true', () => {
    const s = { ...createState(), isError: true, currentValue: 'Error' };
    assertEqual(inputDecimal(s).currentValue, 'Error');
  });

  it('resets to 0. after justEvaluated', () => {
    const s = { ...createState(), justEvaluated: true, currentValue: '5' };
    assertEqual(inputDecimal(s).currentValue, '0.');
  });
});

describe('selectOperator', () => {
  it('stores currentValue as storedOperand', () => {
    let s = inputDigit(createState(), '4');
    s = selectOperator(s, '+');
    assertEqual(s.storedOperand, 4);
    assertEqual(s.pendingOperator, '+');
  });

  it('chains: evaluates pending op before setting new one', () => {
    let s = createState();
    s = inputDigit(s, '2');
    s = selectOperator(s, '+');
    s = inputDigit(s, '3');
    s = selectOperator(s, '+'); // should evaluate 2+3=5 first
    assertEqual(s.currentValue, '5');
    assertEqual(s.storedOperand, 5);
    assertEqual(s.pendingOperator, '+');
  });

  it('is a no-op when isError is true', () => {
    const s = { ...createState(), isError: true };
    assertEqual(selectOperator(s, '+').pendingOperator, null);
  });
});

describe('evaluate', () => {
  it('computes addition', () => {
    let s = createState();
    s = inputDigit(s, '3');
    s = selectOperator(s, '+');
    s = inputDigit(s, '4');
    s = evaluate(s);
    assertEqual(s.currentValue, '7');
    assertEqual(s.justEvaluated, true);
    assertEqual(s.pendingOperator, null);
  });

  it('computes subtraction', () => {
    let s = createState();
    s = inputDigit(s, '9');
    s = selectOperator(s, '-');
    s = inputDigit(s, '3');
    s = evaluate(s);
    assertEqual(s.currentValue, '6');
  });

  it('computes multiplication', () => {
    let s = createState();
    s = inputDigit(s, '7');
    s = selectOperator(s, '*');
    s = inputDigit(s, '8');
    s = evaluate(s);
    assertEqual(s.currentValue, '56');
  });

  it('computes division', () => {
    let s = createState();
    s = inputDigit(s, '8');
    s = selectOperator(s, '/');
    s = inputDigit(s, '4');
    s = evaluate(s);
    assertEqual(s.currentValue, '2');
  });

  it('handles division by zero with error state', () => {
    let s = createState();
    s = inputDigit(s, '5');
    s = selectOperator(s, '/');
    s = inputDigit(s, '0');
    s = evaluate(s);
    assertEqual(s.isError, true);
    assertEqual(s.currentValue, 'Error');
  });

  it('is a no-op when pendingOperator is null', () => {
    const s = createState();
    assertEqual(evaluate(s).currentValue, '0');
  });

  it('is a no-op when isError is true', () => {
    const s = { ...createState(), isError: true };
    assertEqual(evaluate(s).isError, true);
  });
});

describe('clear', () => {
  it('resets all fields to defaults', () => {
    let s = createState();
    s = inputDigit(s, '9');
    s = selectOperator(s, '+');
    s = inputDigit(s, '1');
    s = clear(s);
    assertDeepEqual(s, createState());
  });

  it('preserves mode when in scientific', () => {
    const s = { ...createState(), mode: 'scientific' };
    assertEqual(clear(s).mode, 'scientific');
  });
});

// ── User Story 2: Scientific Mode ─────────────────────────────────────────────

describe('toggleMode', () => {
  it('switches from simple to scientific', () => {
    const s = toggleMode(createState());
    assertEqual(s.mode, 'scientific');
  });

  it('switches from scientific back to simple', () => {
    const s = toggleMode(toggleMode(createState()));
    assertEqual(s.mode, 'simple');
  });

  it('preserves currentValue', () => {
    let s = inputDigit(createState(), '9');
    s = toggleMode(s);
    assertEqual(s.currentValue, '9');
  });

  it('clears pendingOperator and storedOperand', () => {
    let s = createState();
    s = inputDigit(s, '3');
    s = selectOperator(s, '+');
    s = toggleMode(s);
    assertEqual(s.pendingOperator, null);
    assertEqual(s.storedOperand, null);
  });
});

describe('applyScientific', () => {
  it('computes sin(90 degrees) = 1', () => {
    let s = { ...createState(), mode: 'scientific' };
    s = inputDigit(s, '9');
    s = inputDigit(s, '0');
    s = applyScientific(s, 'sin');
    assertEqual(s.currentValue, '1');
  });

  it('computes cos(0 degrees) = 1', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '0' };
    s = applyScientific(s, 'cos');
    assertEqual(s.currentValue, '1');
  });

  it('computes tan(45 degrees) ≈ 1', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '45' };
    s = applyScientific(s, 'tan');
    assertEqual(s.currentValue, '1');
  });

  it('computes log(100) = 2', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '100' };
    s = applyScientific(s, 'log');
    assertEqual(s.currentValue, '2');
  });

  it('computes ln(e) = 1', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: String(Math.E) };
    s = applyScientific(s, 'ln');
    assertEqual(s.currentValue, '1');
  });

  it('computes sqrt(4) = 2', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '4' };
    s = applyScientific(s, 'sqrt');
    assertEqual(s.currentValue, '2');
  });

  it('sets error state for sqrt of negative', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '-1' };
    s = applyScientific(s, 'sqrt');
    assertEqual(s.isError, true);
    assertEqual(s.currentValue, 'Error');
  });

  it('is a no-op when mode is simple', () => {
    let s = createState();
    s = inputDigit(s, '9');
    s = applyScientific(s, 'sin');
    assertEqual(s.currentValue, '9');
  });

  it('is a no-op when isError is true', () => {
    const s = { ...createState(), mode: 'scientific', isError: true, currentValue: 'Error' };
    assertEqual(applyScientific(s, 'sin').currentValue, 'Error');
  });

  it('sets justEvaluated to true on success', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '4' };
    s = applyScientific(s, 'sqrt');
    assertEqual(s.justEvaluated, true);
  });
});

describe('evaluate with power operator', () => {
  it('computes 2^3 = 8', () => {
    let s = { ...createState(), mode: 'scientific' };
    s = inputDigit(s, '2');
    s = selectOperator(s, '^');
    s = inputDigit(s, '3');
    s = evaluate(s);
    assertEqual(s.currentValue, '8');
  });
});
