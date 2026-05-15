import { describe, it, assertEqual } from './harness.js';
import { evalRPN, shuntingYard } from '../src/evaluator.js';

// ── evalRPN: numbers and binary operators ─────────────────────────────────────

describe('evalRPN: basic numbers', () => {
  it('evaluates a single number token', () => {
    assertEqual(evalRPN([{ type: 'number', value: '7' }]), 7);
  });

  it('evaluates constant pi', () => {
    const result = evalRPN([{ type: 'constant', value: 'pi' }]);
    assertEqual(Math.abs(result - Math.PI) < 1e-10, true);
  });

  it('evaluates constant e', () => {
    const result = evalRPN([{ type: 'constant', value: 'e' }]);
    assertEqual(Math.abs(result - Math.E) < 1e-10, true);
  });
});

describe('evalRPN: binary operators', () => {
  it('computes 3 + 4 = 7', () => {
    assertEqual(evalRPN([
      { type: 'number', value: '3' },
      { type: 'number', value: '4' },
      { type: 'operator', value: '+' },
    ]), 7);
  });

  it('computes 9 - 3 = 6', () => {
    assertEqual(evalRPN([
      { type: 'number', value: '9' },
      { type: 'number', value: '3' },
      { type: 'operator', value: '-' },
    ]), 6);
  });

  it('computes 6 * 7 = 42', () => {
    assertEqual(evalRPN([
      { type: 'number', value: '6' },
      { type: 'number', value: '7' },
      { type: 'operator', value: '*' },
    ]), 42);
  });

  it('computes 8 / 4 = 2', () => {
    assertEqual(evalRPN([
      { type: 'number', value: '8' },
      { type: 'number', value: '4' },
      { type: 'operator', value: '/' },
    ]), 2);
  });

  it('returns NaN for division by zero', () => {
    const result = evalRPN([
      { type: 'number', value: '5' },
      { type: 'number', value: '0' },
      { type: 'operator', value: '/' },
    ]);
    assertEqual(isNaN(result), true);
  });

  it('computes 2 ^ 3 = 8', () => {
    assertEqual(evalRPN([
      { type: 'number', value: '2' },
      { type: 'number', value: '3' },
      { type: 'operator', value: '^' },
    ]), 8);
  });
});

describe('evalRPN: function tokens', () => {
  it('computes sin(90) in degrees = 1', () => {
    const result = evalRPN([
      { type: 'number', value: '90' },
      { type: 'function', value: 'sin' },
    ], 'degrees');
    assertEqual(Math.round(result), 1);
  });

  it('computes sin(pi/2) in radians = 1', () => {
    const result = evalRPN([
      { type: 'constant', value: 'pi' },
      { type: 'number', value: '2' },
      { type: 'operator', value: '/' },
      { type: 'function', value: 'sin' },
    ], 'radians');
    assertEqual(Math.round(result), 1);
  });

  it('computes cos(0) = 1 in both modes', () => {
    assertEqual(Math.round(evalRPN([
      { type: 'number', value: '0' },
      { type: 'function', value: 'cos' },
    ], 'degrees')), 1);
  });

  it('computes log(100) = 2', () => {
    assertEqual(evalRPN([
      { type: 'number', value: '100' },
      { type: 'function', value: 'log' },
    ]), 2);
  });

  it('computes sqrt(9) = 3', () => {
    assertEqual(evalRPN([
      { type: 'number', value: '9' },
      { type: 'function', value: 'sqrt' },
    ]), 3);
  });

  it('returns NaN for sqrt of negative', () => {
    const result = evalRPN([
      { type: 'number', value: '-4' },
      { type: 'function', value: 'sqrt' },
    ]);
    assertEqual(isNaN(result), true);
  });

  it('returns NaN for log of non-positive', () => {
    assertEqual(isNaN(evalRPN([{ type: 'number', value: '0' }, { type: 'function', value: 'log' }])), true);
    assertEqual(isNaN(evalRPN([{ type: 'number', value: '-1' }, { type: 'function', value: 'log' }])), true);
  });
});

// ── shuntingYard: flat infix ──────────────────────────────────────────────────

describe('shuntingYard: flat expressions', () => {
  it('passes a single number through', () => {
    const rpn = shuntingYard([{ type: 'number', value: '5' }]);
    assertEqual(evalRPN(rpn), 5);
  });

  it('converts 2 + 3 to RPN and evaluates to 5', () => {
    const rpn = shuntingYard([
      { type: 'number', value: '2' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '3' },
    ]);
    assertEqual(evalRPN(rpn), 5);
  });

  it('respects * over + precedence: 2 + 3 * 4 = 14', () => {
    const rpn = shuntingYard([
      { type: 'number', value: '2' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '3' },
      { type: 'operator', value: '*' },
      { type: 'number', value: '4' },
    ]);
    assertEqual(evalRPN(rpn), 14);
  });

  it('handles right-associative ^: 2 ^ 3 ^ 2 = 512', () => {
    const rpn = shuntingYard([
      { type: 'number', value: '2' },
      { type: 'operator', value: '^' },
      { type: 'number', value: '3' },
      { type: 'operator', value: '^' },
      { type: 'number', value: '2' },
    ]);
    assertEqual(evalRPN(rpn), 512);
  });
});

describe('shuntingYard: parentheses', () => {
  it('evaluates (2+3)*4 = 20', () => {
    const rpn = shuntingYard([
      { type: 'paren', value: '(' },
      { type: 'number', value: '2' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '3' },
      { type: 'paren', value: ')' },
      { type: 'operator', value: '*' },
      { type: 'number', value: '4' },
    ]);
    assertEqual(evalRPN(rpn), 20);
  });

  it('evaluates ((1+2)*(3+4)) = 21', () => {
    const rpn = shuntingYard([
      { type: 'paren', value: '(' },
      { type: 'paren', value: '(' },
      { type: 'number', value: '1' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '2' },
      { type: 'paren', value: ')' },
      { type: 'operator', value: '*' },
      { type: 'paren', value: '(' },
      { type: 'number', value: '3' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '4' },
      { type: 'paren', value: ')' },
      { type: 'paren', value: ')' },
    ]);
    assertEqual(evalRPN(rpn), 21);
  });

  it('discards unmatched ): 2+3) evaluates to 5', () => {
    const rpn = shuntingYard([
      { type: 'number', value: '2' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '3' },
      { type: 'paren', value: ')' },
    ]);
    assertEqual(evalRPN(rpn), 5);
  });

  it('auto-closes unmatched (: (2+3 evaluates to 5', () => {
    const rpn = shuntingYard([
      { type: 'paren', value: '(' },
      { type: 'number', value: '2' },
      { type: 'operator', value: '+' },
      { type: 'number', value: '3' },
    ]);
    assertEqual(evalRPN(rpn), 5);
  });
});
