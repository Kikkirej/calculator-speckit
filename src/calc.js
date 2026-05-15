function formatResult(value) {
  if (!isFinite(value)) return 'Error';
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
  };
}

export function inputDigit(state, digit) {
  if (state.isError) return state;
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
  if (state.justEvaluated) {
    return { ...state, currentValue: '0.', justEvaluated: false };
  }
  if (state.currentValue.includes('.')) return state;
  return { ...state, currentValue: state.currentValue + '.' };
}

function compute(storedOperand, op, currentValue) {
  switch (op) {
    case '+': return storedOperand + currentValue;
    case '-': return storedOperand - currentValue;
    case '*': return storedOperand * currentValue;
    case '/': return currentValue === 0 ? NaN : storedOperand / currentValue;
    case '^': return Math.pow(storedOperand, currentValue);
    default: return currentValue;
  }
}

export function selectOperator(state, op) {
  if (state.isError) return state;
  const current = parseFloat(state.currentValue);
  if (state.pendingOperator !== null && !state.justEvaluated) {
    const result = compute(state.storedOperand, state.pendingOperator, current);
    if (!isFinite(result)) {
      return { ...state, isError: true, currentValue: 'Error', pendingOperator: op, storedOperand: null, justEvaluated: true };
    }
    const resultStr = formatResult(result);
    return { ...state, currentValue: resultStr, storedOperand: result, pendingOperator: op, justEvaluated: true };
  }
  return { ...state, storedOperand: current, pendingOperator: op, justEvaluated: true };
}

export function evaluate(state) {
  if (state.isError || state.pendingOperator === null) return state;
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

export function clear(state) {
  return { ...createState(), mode: state.mode };
}

export function toggleMode(state) {
  return {
    ...state,
    mode: state.mode === 'simple' ? 'scientific' : 'simple',
    pendingOperator: null,
    storedOperand: null,
    isError: false,
    justEvaluated: false,
  };
}

export function applyScientific(state, fn) {
  if (state.isError || state.mode !== 'scientific') return state;
  const x = parseFloat(state.currentValue);
  const toRad = (deg) => deg * (Math.PI / 180);
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
  return { ...state, currentValue: formatResult(result), justEvaluated: true };
}
