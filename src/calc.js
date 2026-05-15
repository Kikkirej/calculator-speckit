import { shuntingYard, evalRPN } from './evaluator.js';

function formatResult(value) {
  if (!isFinite(value) || isNaN(value)) return 'Error';
  return parseFloat(value.toPrecision(10)).toString();
}

export function createState() {
  return {
    currentValue: '0',
    storedOperand: null,
    pendingOperator: null,
    mode: 'simple',
    isError: false,
    justEvaluated: false,
    expression: null,
    parenDepth: 0,
    angleUnit: 'degrees',
  };
}

// ── Digit / decimal input ─────────────────────────────────────────────────────

export function inputDigit(state, digit) {
  if (state.isError) return state;

  if (state.mode === 'scientific') {
    const expr = state.expression ?? [];
    const last = expr[expr.length - 1];
    if (state.justEvaluated || !last || last.type !== 'number') {
      return {
        ...state,
        expression: [...expr, { type: 'number', value: digit }],
        currentValue: digit,
        justEvaluated: false,
      };
    }
    const newVal = last.value + digit;
    const updated = [...expr];
    updated[updated.length - 1] = { type: 'number', value: newVal };
    return { ...state, expression: updated, currentValue: newVal };
  }

  if (state.justEvaluated) {
    return { ...state, currentValue: digit, justEvaluated: false };
  }
  if (state.currentValue === '0') {
    return digit === '0' ? state : { ...state, currentValue: digit };
  }
  return { ...state, currentValue: state.currentValue + digit };
}

export function inputDecimal(state) {
  if (state.isError) return state;

  if (state.mode === 'scientific') {
    const expr = state.expression ?? [];
    const last = expr[expr.length - 1];
    if (!last || last.type !== 'number') {
      return {
        ...state,
        expression: [...expr, { type: 'number', value: '0.' }],
        currentValue: '0.',
      };
    }
    if (last.value.includes('.')) return state;
    const newVal = last.value + '.';
    const updated = [...expr];
    updated[updated.length - 1] = { type: 'number', value: newVal };
    return { ...state, expression: updated, currentValue: newVal };
  }

  if (state.justEvaluated) {
    return { ...state, currentValue: '0.', justEvaluated: false };
  }
  if (state.currentValue.includes('.')) return state;
  return { ...state, currentValue: state.currentValue + '.' };
}

// ── Simple mode binary operator chain ────────────────────────────────────────

function compute(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b === 0 ? NaN : a / b;
    case '^': return Math.pow(a, b);
    default: return b;
  }
}

export function selectOperator(state, op) {
  if (state.isError) return state;

  if (state.mode === 'scientific') {
    return inputToken(state, { type: 'operator', value: op });
  }

  const current = parseFloat(state.currentValue);
  if (state.pendingOperator !== null && !state.justEvaluated) {
    const result = compute(state.storedOperand, state.pendingOperator, current);
    if (!isFinite(result)) {
      return { ...state, isError: true, currentValue: 'Error', pendingOperator: op, storedOperand: null, justEvaluated: true };
    }
    return { ...state, currentValue: formatResult(result), storedOperand: result, pendingOperator: op, justEvaluated: true };
  }
  return { ...state, storedOperand: current, pendingOperator: op, justEvaluated: true };
}

// ── Evaluate ──────────────────────────────────────────────────────────────────

export function evaluate(state) {
  if (state.isError) return state;

  if (state.mode === 'scientific') {
    const tokens = [...(state.expression ?? [])];
    if (tokens.length === 0) return state;

    // auto-close unclosed parens
    for (let i = 0; i < state.parenDepth; i++) {
      tokens.push({ type: 'paren', value: ')' });
    }

    const rpn = shuntingYard(tokens);
    const result = evalRPN(rpn, state.angleUnit);

    if (!isFinite(result) || isNaN(result)) {
      return { ...state, isError: true, currentValue: 'Error', expression: [], parenDepth: 0, justEvaluated: true };
    }
    return {
      ...state,
      currentValue: formatResult(result),
      expression: [],
      parenDepth: 0,
      justEvaluated: true,
    };
  }

  if (state.pendingOperator === null) return state;
  const current = parseFloat(state.currentValue);
  const result = compute(state.storedOperand, state.pendingOperator, current);
  if (!isFinite(result)) {
    return { ...state, isError: true, currentValue: 'Error', storedOperand: null, pendingOperator: null, justEvaluated: true };
  }
  return {
    ...state,
    currentValue: formatResult(result),
    storedOperand: null,
    pendingOperator: null,
    justEvaluated: true,
  };
}

// ── Clear / mode toggle ───────────────────────────────────────────────────────

export function clear(state) {
  return {
    ...createState(),
    mode: state.mode,
    angleUnit: state.angleUnit,
    expression: state.mode === 'scientific' ? [] : null,
  };
}

export function toggleMode(state) {
  const toScientific = state.mode !== 'scientific';
  return {
    ...state,
    mode: toScientific ? 'scientific' : 'simple',
    expression: toScientific ? [] : null,
    parenDepth: 0,
    pendingOperator: null,
    storedOperand: null,
    isError: false,
    justEvaluated: false,
  };
}

// ── Scientific unary functions (immediate evaluation) ─────────────────────────

export function applyScientific(state, fn) {
  if (state.isError || state.mode !== 'scientific') return state;
  const x = parseFloat(state.currentValue);
  const toRad = state.angleUnit === 'degrees' ? (v) => v * (Math.PI / 180) : (v) => v;
  let result;
  switch (fn) {
    case 'sin': result = Math.sin(toRad(x)); break;
    case 'cos': result = Math.cos(toRad(x)); break;
    case 'tan': result = Math.tan(toRad(x)); break;
    case 'log': result = Math.log10(x); break;
    case 'ln':  result = Math.log(x); break;
    case 'sqrt': result = x < 0 ? NaN : Math.sqrt(x); break;
    default: return state;
  }
  if (!isFinite(result) || isNaN(result)) {
    return { ...state, isError: true, currentValue: 'Error', justEvaluated: true };
  }
  const resultStr = formatResult(result);
  // Sync the last NumberToken in expression with the result
  const expr = state.expression ?? [];
  const last = expr[expr.length - 1];
  if (last && last.type === 'number') {
    const newExpr = [...expr];
    newExpr[newExpr.length - 1] = { type: 'number', value: resultStr };
    return { ...state, currentValue: resultStr, expression: newExpr, justEvaluated: true };
  }
  return { ...state, currentValue: resultStr, justEvaluated: true };
}

// ── New exports ───────────────────────────────────────────────────────────────

export function inputToken(state, token) {
  if (state.isError) return state;
  const expr = state.expression ?? [];

  if (token.type === 'paren') {
    if (token.value === ')') {
      if (state.parenDepth === 0) return state;
      return { ...state, expression: [...expr, token], parenDepth: state.parenDepth - 1, justEvaluated: false };
    }
    return { ...state, expression: [...expr, token], parenDepth: state.parenDepth + 1, justEvaluated: false };
  }

  return { ...state, expression: [...expr, token], justEvaluated: false };
}

export function inputConstant(state, name) {
  if (state.isError) return state;
  const expr = state.expression ?? [];
  const numVal = name === 'pi' ? Math.PI : Math.E;
  const valStr = String(numVal);
  const constToken = { type: 'number', value: valStr };

  const last = expr[expr.length - 1];
  const needsMul = last && last.type === 'number';
  const tokens = needsMul
    ? [...expr, { type: 'operator', value: '*' }, constToken]
    : [...expr, constToken];

  return { ...state, expression: tokens, currentValue: valStr, justEvaluated: false };
}

function factorial(n) {
  if (!Number.isInteger(n) || n < 0) return NaN;
  if (n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function applyUnary(state, fn) {
  if (state.isError) return state;

  // In scientific mode, read from last NumberToken if available
  let x;
  const expr = state.expression ?? [];
  const last = expr[expr.length - 1];
  if (state.mode === 'scientific' && last && last.type === 'number') {
    x = parseFloat(last.value);
  } else {
    x = parseFloat(state.currentValue);
  }

  let result;
  switch (fn) {
    case 'factorial': result = factorial(x); break;
    case 'reciprocal': result = x === 0 ? NaN : 1 / x; break;
    case 'percent': result = x / 100; break;
    default: return state;
  }

  if (!isFinite(result) || isNaN(result)) {
    return { ...state, isError: true, currentValue: 'Error', justEvaluated: true };
  }

  const resultStr = formatResult(result);

  // In scientific mode, replace the last NumberToken with the result
  if (state.mode === 'scientific' && last && last.type === 'number') {
    const newExpr = [...expr];
    newExpr[newExpr.length - 1] = { type: 'number', value: resultStr };
    return { ...state, expression: newExpr, currentValue: resultStr, justEvaluated: true };
  }

  return { ...state, currentValue: resultStr, justEvaluated: true };
}

export function toggleAngleUnit(state) {
  return { ...state, angleUnit: state.angleUnit === 'degrees' ? 'radians' : 'degrees' };
}
