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
} from './calc.js';
import { mapKeyToAction } from './keyboard.js';

let state = createState();
let prevMode = state.mode;

const OPERATOR_SYMBOLS = {
  '+': '+', '-': '−', '*': '×', '/': '÷', '^': '^',
};

function serializeExpression(tokens) {
  if (!tokens || tokens.length === 0) return '';
  return tokens.map(tok => {
    if (tok.type === 'number') return tok.value;
    if (tok.type === 'operator') return ` ${OPERATOR_SYMBOLS[tok.value] ?? tok.value} `;
    if (tok.type === 'paren') return tok.value;
    if (tok.type === 'function') return tok.value + '(';
    if (tok.type === 'constant') return tok.value === 'pi' ? 'π' : 'e';
    return '';
  }).join('');
}

function render(s) {
  document.getElementById('display').textContent = s.currentValue;

  const toggle = document.getElementById('mode-toggle');
  const isScientific = s.mode === 'scientific';
  toggle.setAttribute('aria-pressed', String(isScientific));

  const sci = document.getElementById('buttons-scientific');
  const exprDisplay = document.getElementById('expression-display');
  const angleUnit = document.getElementById('angle-unit');
  const angleToggle = document.getElementById('angle-toggle');

  if (isScientific) {
    sci.removeAttribute('hidden');
    if (exprDisplay) {
      exprDisplay.removeAttribute('hidden');
      exprDisplay.textContent = serializeExpression(s.expression);
    }
    if (angleUnit) {
      angleUnit.removeAttribute('hidden');
      angleUnit.textContent = s.angleUnit === 'degrees' ? 'DEG' : 'RAD';
    }
    if (angleToggle) {
      angleToggle.textContent = s.angleUnit === 'degrees' ? 'DEG' : 'RAD';
      angleToggle.setAttribute('aria-pressed', String(s.angleUnit === 'radians'));
    }
  } else {
    sci.setAttribute('hidden', '');
    if (exprDisplay) exprDisplay.setAttribute('hidden', '');
    if (angleUnit) angleUnit.setAttribute('hidden', '');
  }

  if (s.mode !== prevMode) {
    const status = document.getElementById('mode-status');
    status.textContent = isScientific ? 'Scientific mode' : 'Simple mode';
    prevMode = s.mode;
  }
}

function dispatch(action) {
  if (action === 'mode-toggle') {
    state = toggleMode(state);
  } else if (action.startsWith('digit-')) {
    state = inputDigit(state, action.slice(6));
  } else if (action === 'decimal') {
    state = inputDecimal(state);
  } else if (action === 'add') {
    state = selectOperator(state, '+');
  } else if (action === 'subtract') {
    state = selectOperator(state, '-');
  } else if (action === 'multiply') {
    state = selectOperator(state, '*');
  } else if (action === 'divide') {
    state = selectOperator(state, '/');
  } else if (action === 'power') {
    state = selectOperator(state, '^');
  } else if (action === 'equals') {
    state = evaluate(state);
  } else if (action === 'clear') {
    state = clear(state);
  } else if (action === 'backspace') {
    state = backspace(state);
  } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(action)) {
    state = applyScientific(state, action);
  } else if (action === 'open-paren') {
    state = inputToken(state, { type: 'paren', value: '(' });
  } else if (action === 'close-paren') {
    state = inputToken(state, { type: 'paren', value: ')' });
  } else if (action === 'constant-pi') {
    state = inputConstant(state, 'pi');
  } else if (action === 'constant-e') {
    state = inputConstant(state, 'e');
  } else if (action === 'factorial') {
    state = applyUnary(state, 'factorial');
  } else if (action === 'reciprocal') {
    state = applyUnary(state, 'reciprocal');
  } else if (action === 'percent') {
    state = applyUnary(state, 'percent');
  } else if (action === 'toggle-angle') {
    state = toggleAngleUnit(state);
  }
}

document.getElementById('calculator').addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  dispatch(action);
  render(state);
});

document.addEventListener('keydown', (e) => {
  const action = mapKeyToAction(e.key);
  if (!action) return;
  if (e.key === '/') e.preventDefault();
  dispatch(action);
  render(state);
});

render(state);
