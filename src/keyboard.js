export function mapKeyToAction(key) {
  if (key.length === 1 && key >= '0' && key <= '9') return 'digit-' + key;
  switch (key) {
    case '.': return 'decimal';
    case '+': return 'add';
    case '-': return 'subtract';
    case '*': return 'multiply';
    case '/': return 'divide';
    case '^': return 'power';
    case 'Enter': case '=': return 'equals';
    case 'Escape': return 'clear';
    case 'Backspace': return 'backspace';
    default: return null;
  }
}
