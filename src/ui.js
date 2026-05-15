import {
  createState,
  inputDigit,
  inputDecimal,
  selectOperator,
  evaluate,
  clear,
  toggleMode,
  applyScientific,
} from './calc.js';

let state = createState();
let prevMode = state.mode;

function render(s) {
  document.getElementById('display').textContent = s.currentValue;

  const toggle = document.getElementById('mode-toggle');
  const isScientific = s.mode === 'scientific';
  toggle.setAttribute('aria-pressed', String(isScientific));

  const sci = document.getElementById('buttons-scientific');
  if (isScientific) {
    sci.removeAttribute('hidden');
  } else {
    sci.setAttribute('hidden', '');
  }

  if (s.mode !== prevMode) {
    const status = document.getElementById('mode-status');
    status.textContent = isScientific ? 'Scientific mode' : 'Simple mode';
    prevMode = s.mode;
  }
}

document.getElementById('calculator').addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (!action) return;

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
  } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(action)) {
    state = applyScientific(state, action);
  }

  render(state);
});

render(state);
