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
  inputToken,
  inputConstant,
  applyUnary,
  toggleAngleUnit,
  backspace,
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

// ── New state fields (T005) ───────────────────────────────────────────────────

describe('createState: new fields', () => {
  it('includes expression: null', () => {
    assertEqual(createState().expression, null);
  });

  it('includes parenDepth: 0', () => {
    assertEqual(createState().parenDepth, 0);
  });

  it('includes angleUnit: degrees', () => {
    assertEqual(createState().angleUnit, 'degrees');
  });
});

describe('toggleMode: expression initialisation', () => {
  it('sets expression to [] when switching to scientific', () => {
    const s = toggleMode(createState());
    assertDeepEqual(s.expression, []);
  });

  it('sets expression to null when switching back to simple', () => {
    const s = toggleMode(toggleMode(createState()));
    assertEqual(s.expression, null);
  });

  it('preserves angleUnit across toggle', () => {
    let s = { ...createState(), angleUnit: 'radians' };
    s = toggleMode(s);
    assertEqual(s.angleUnit, 'radians');
    s = toggleMode(s);
    assertEqual(s.angleUnit, 'radians');
  });
});

// ── inputDigit / inputDecimal in scientific mode (T009) ──────────────────────

describe('inputDigit: scientific mode appends NumberToken', () => {
  it('first digit appends a NumberToken to expression', () => {
    let s = { ...createState(), mode: 'scientific', expression: [] };
    s = inputDigit(s, '5');
    assertEqual(s.expression.length, 1);
    assertEqual(s.expression[0].type, 'number');
    assertEqual(s.expression[0].value, '5');
  });

  it('subsequent digit extends the last NumberToken', () => {
    let s = { ...createState(), mode: 'scientific', expression: [] };
    s = inputDigit(s, '1');
    s = inputDigit(s, '2');
    s = inputDigit(s, '3');
    assertEqual(s.expression.length, 1);
    assertEqual(s.expression[0].value, '123');
  });

  it('starts a new NumberToken after justEvaluated', () => {
    let s = { ...createState(), mode: 'scientific', expression: [{ type: 'number', value: '5' }], justEvaluated: true };
    s = inputDigit(s, '3');
    assertEqual(s.expression[s.expression.length - 1].value, '3');
    assertEqual(s.justEvaluated, false);
  });

  it('starts a new NumberToken after an operator token', () => {
    let s = { ...createState(), mode: 'scientific', expression: [
      { type: 'number', value: '2' },
      { type: 'operator', value: '+' },
    ]};
    s = inputDigit(s, '7');
    assertEqual(s.expression.length, 3);
    assertEqual(s.expression[2].value, '7');
  });

  it('is a no-op when isError', () => {
    let s = { ...createState(), mode: 'scientific', expression: [], isError: true };
    s = inputDigit(s, '5');
    assertEqual(s.expression.length, 0);
  });
});

describe('inputDecimal: scientific mode', () => {
  it('appends 0. token when expression is empty', () => {
    let s = { ...createState(), mode: 'scientific', expression: [] };
    s = inputDecimal(s);
    assertEqual(s.expression[0].value, '0.');
  });

  it('appends decimal to last NumberToken', () => {
    let s = { ...createState(), mode: 'scientific', expression: [{ type: 'number', value: '3' }] };
    s = inputDecimal(s);
    assertEqual(s.expression[0].value, '3.');
  });

  it('is a no-op if last NumberToken already has a decimal', () => {
    let s = { ...createState(), mode: 'scientific', expression: [{ type: 'number', value: '3.' }] };
    s = inputDecimal(s);
    assertEqual(s.expression[0].value, '3.');
  });
});

// ── evaluate in scientific mode — flat expression (T012) ─────────────────────

describe('evaluate: scientific mode flat expression', () => {
  it('evaluates 2 + 3 = 5', () => {
    let s = { ...createState(), mode: 'scientific', expression: [
      { type: 'number', value: '2' },
      { type: 'operator', value: '+' },
    ]};
    s = inputDigit(s, '3');
    s = evaluate(s);
    assertEqual(s.currentValue, '5');
    assertEqual(s.justEvaluated, true);
    assertDeepEqual(s.expression, []);
    assertEqual(s.parenDepth, 0);
  });

  it('sets error for non-finite result', () => {
    let s = { ...createState(), mode: 'scientific', expression: [
      { type: 'number', value: '5' },
      { type: 'operator', value: '/' },
    ]};
    s = inputDigit(s, '0');
    s = evaluate(s);
    assertEqual(s.isError, true);
    assertEqual(s.currentValue, 'Error');
  });
});

// ── inputToken (T016) ─────────────────────────────────────────────────────────

describe('inputToken', () => {
  it('appends an operator token', () => {
    let s = { ...createState(), mode: 'scientific', expression: [{ type: 'number', value: '2' }] };
    s = inputToken(s, { type: 'operator', value: '+' });
    assertEqual(s.expression.length, 2);
    assertEqual(s.expression[1].type, 'operator');
  });

  it('appends open-paren and increments parenDepth', () => {
    let s = { ...createState(), mode: 'scientific', expression: [] };
    s = inputToken(s, { type: 'paren', value: '(' });
    assertEqual(s.parenDepth, 1);
    assertEqual(s.expression[0].value, '(');
  });

  it('appends close-paren and decrements parenDepth', () => {
    let s = { ...createState(), mode: 'scientific', expression: [{ type: 'paren', value: '(' }], parenDepth: 1 };
    s = inputToken(s, { type: 'paren', value: ')' });
    assertEqual(s.parenDepth, 0);
  });

  it('ignores close-paren when parenDepth is 0', () => {
    let s = { ...createState(), mode: 'scientific', expression: [], parenDepth: 0 };
    s = inputToken(s, { type: 'paren', value: ')' });
    assertEqual(s.expression.length, 0);
    assertEqual(s.parenDepth, 0);
  });

  it('is a no-op when isError', () => {
    let s = { ...createState(), mode: 'scientific', expression: [], isError: true };
    s = inputToken(s, { type: 'operator', value: '+' });
    assertEqual(s.expression.length, 0);
  });
});

// ── evaluate: bracketed expressions and auto-close (T018) ────────────────────

describe('evaluate: bracketed expressions', () => {
  it('evaluates (2+3)*4 = 20', () => {
    let s = { ...createState(), mode: 'scientific', expression: [
      { type: 'paren', value: '(' },
      { type: 'number', value: '2' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '3' },
      { type: 'paren', value: ')' },
      { type: 'operator', value: '*' },
    ], parenDepth: 0 };
    s = inputDigit(s, '4');
    s = evaluate(s);
    assertEqual(s.currentValue, '20');
  });

  it('auto-closes unclosed parens: (5+3 evaluates to 8', () => {
    let s = { ...createState(), mode: 'scientific', expression: [
      { type: 'paren', value: '(' },
      { type: 'number', value: '5' },
      { type: 'operator', value: '+' },
    ], parenDepth: 1 };
    s = inputDigit(s, '3');
    s = evaluate(s);
    assertEqual(s.currentValue, '8');
    assertEqual(s.parenDepth, 0);
  });

  it('sets error for div-by-zero inside brackets', () => {
    let s = { ...createState(), mode: 'scientific', expression: [
      { type: 'paren', value: '(' },
      { type: 'number', value: '5' },
      { type: 'operator', value: '/' },
    ], parenDepth: 1 };
    s = inputDigit(s, '0');
    s = evaluate(s);
    assertEqual(s.isError, true);
  });
});

// ── inputConstant (T025) ──────────────────────────────────────────────────────

describe('inputConstant', () => {
  it('inserts pi as a NumberToken', () => {
    let s = { ...createState(), mode: 'scientific', expression: [] };
    s = inputConstant(s, 'pi');
    assertEqual(s.expression.length, 1);
    assertEqual(s.expression[0].type, 'number');
    assertEqual(Math.abs(parseFloat(s.expression[0].value) - Math.PI) < 1e-10, true);
  });

  it('inserts e as a NumberToken', () => {
    let s = { ...createState(), mode: 'scientific', expression: [] };
    s = inputConstant(s, 'e');
    assertEqual(Math.abs(parseFloat(s.expression[0].value) - Math.E) < 1e-10, true);
  });

  it('inserts implicit * before constant when last token is a number', () => {
    let s = { ...createState(), mode: 'scientific', expression: [{ type: 'number', value: '2' }] };
    s = inputConstant(s, 'pi');
    assertEqual(s.expression.length, 3);
    assertEqual(s.expression[1].type, 'operator');
    assertEqual(s.expression[1].value, '*');
  });

  it('does not insert implicit * when last token is an operator', () => {
    let s = { ...createState(), mode: 'scientific', expression: [{ type: 'operator', value: '+' }] };
    s = inputConstant(s, 'pi');
    assertEqual(s.expression[1].type, 'number');
  });
});

// ── applyUnary (T027) ─────────────────────────────────────────────────────────

describe('applyUnary: factorial', () => {
  it('5! = 120', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '5' };
    s = applyUnary(s, 'factorial');
    assertEqual(s.currentValue, '120');
  });

  it('0! = 1', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '0' };
    s = applyUnary(s, 'factorial');
    assertEqual(s.currentValue, '1');
  });

  it('negative! sets error', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '-1' };
    s = applyUnary(s, 'factorial');
    assertEqual(s.isError, true);
  });

  it('non-integer! sets error', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '3.5' };
    s = applyUnary(s, 'factorial');
    assertEqual(s.isError, true);
  });

  it('171! sets error (overflow)', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '171' };
    s = applyUnary(s, 'factorial');
    assertEqual(s.isError, true);
  });

  it('is a no-op when isError', () => {
    let s = { ...createState(), mode: 'scientific', isError: true, currentValue: 'Error' };
    s = applyUnary(s, 'factorial');
    assertEqual(s.currentValue, 'Error');
  });
});

describe('applyUnary: reciprocal', () => {
  it('4 → 1/x = 0.25', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '4' };
    s = applyUnary(s, 'reciprocal');
    assertEqual(s.currentValue, '0.25');
  });

  it('0 → 1/x sets error', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '0' };
    s = applyUnary(s, 'reciprocal');
    assertEqual(s.isError, true);
  });
});

describe('applyUnary: percent', () => {
  it('50 → % = 0.5', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '50' };
    s = applyUnary(s, 'percent');
    assertEqual(s.currentValue, '0.5');
  });
});

// ── toggleAngleUnit (T031) ────────────────────────────────────────────────────

describe('toggleAngleUnit', () => {
  it('defaults to degrees', () => {
    assertEqual(createState().angleUnit, 'degrees');
  });

  it('switches degrees to radians', () => {
    const s = toggleAngleUnit(createState());
    assertEqual(s.angleUnit, 'radians');
  });

  it('switches radians back to degrees', () => {
    const s = toggleAngleUnit(toggleAngleUnit(createState()));
    assertEqual(s.angleUnit, 'degrees');
  });

  it('does not change any other state field', () => {
    const before = createState();
    const after = toggleAngleUnit(before);
    assertEqual(after.currentValue, before.currentValue);
    assertEqual(after.mode, before.mode);
    assertEqual(after.isError, before.isError);
  });
});

// ── applyScientific with angleUnit (T033) ─────────────────────────────────────

describe('applyScientific: respects angleUnit', () => {
  it('sin(90 degrees) = 1', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '90', angleUnit: 'degrees' };
    s = applyScientific(s, 'sin');
    assertEqual(s.currentValue, '1');
  });

  it('sin(pi/2 radians) = 1', () => {
    const halfPi = String(Math.PI / 2);
    let s = { ...createState(), mode: 'scientific', currentValue: halfPi, angleUnit: 'radians' };
    s = applyScientific(s, 'sin');
    assertEqual(s.currentValue, '1');
  });

  it('cos(0) = 1 regardless of angleUnit', () => {
    let s1 = { ...createState(), mode: 'scientific', currentValue: '0', angleUnit: 'degrees' };
    let s2 = { ...createState(), mode: 'scientific', currentValue: '0', angleUnit: 'radians' };
    assertEqual(applyScientific(s1, 'cos').currentValue, '1');
    assertEqual(applyScientific(s2, 'cos').currentValue, '1');
  });

  it('log(100) = 2 unaffected by angleUnit', () => {
    let s = { ...createState(), mode: 'scientific', currentValue: '100', angleUnit: 'radians' };
    s = applyScientific(s, 'log');
    assertEqual(s.currentValue, '2');
  });
});

// ── backspace ─────────────────────────────────────────────────────────────────

describe('backspace', () => {
  it('single digit resets to 0', () => {
    let s = { ...createState(), currentValue: '5' };
    assertEqual(backspace(s).currentValue, '0');
  });

  it('already 0 stays 0', () => {
    let s = createState();
    assertEqual(backspace(s).currentValue, '0');
  });

  it('multi-digit removes last char', () => {
    let s = { ...createState(), currentValue: '123' };
    assertEqual(backspace(s).currentValue, '12');
  });

  it('two-digit number becomes single digit (not 0)', () => {
    let s = { ...createState(), currentValue: '42' };
    assertEqual(backspace(s).currentValue, '4');
  });

  it('bare minus resets to 0', () => {
    let s = { ...createState(), currentValue: '-' };
    assertEqual(backspace(s).currentValue, '0');
  });

  it('does nothing in error state', () => {
    let s = { ...createState(), isError: true, currentValue: 'Error' };
    assertEqual(backspace(s).currentValue, 'Error');
  });

  it('scientific mode: single digit NumberToken resets to 0', () => {
    let s = toggleMode(createState());
    s = inputDigit(s, '7');
    s = backspace(s);
    assertEqual(s.currentValue, '0');
    assertEqual(s.expression[s.expression.length - 1].value, '0');
  });

  it('scientific mode: multi-digit NumberToken removes last char', () => {
    let s = toggleMode(createState());
    s = inputDigit(s, '4');
    s = inputDigit(s, '2');
    s = backspace(s);
    assertEqual(s.currentValue, '4');
    assertEqual(s.expression[s.expression.length - 1].value, '4');
  });

  it('scientific mode: no last NumberToken — state unchanged', () => {
    let s = toggleMode(createState());
    s = inputToken(s, { type: 'paren', value: '(' });
    const before = s.currentValue;
    s = backspace(s);
    assertEqual(s.currentValue, before);
  });
});
