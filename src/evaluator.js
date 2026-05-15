const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
const RIGHT_ASSOC = new Set(['^']);

export function tokenise(tokens) {
  return tokens;
}

export function shuntingYard(tokens) {
  const output = [];
  const opStack = [];

  for (const tok of tokens) {
    if (tok.type === 'number' || tok.type === 'constant') {
      output.push(tok);
    } else if (tok.type === 'function') {
      opStack.push(tok);
    } else if (tok.type === 'operator') {
      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === 'paren') break;
        const topPrec = top.type === 'function' ? 4 : PRECEDENCE[top.value];
        const tokPrec = PRECEDENCE[tok.value];
        if (topPrec > tokPrec || (topPrec === tokPrec && !RIGHT_ASSOC.has(tok.value))) {
          output.push(opStack.pop());
        } else {
          break;
        }
      }
      opStack.push(tok);
    } else if (tok.type === 'paren') {
      if (tok.value === '(') {
        opStack.push(tok);
      } else {
        while (opStack.length > 0 && opStack[opStack.length - 1].value !== '(') {
          output.push(opStack.pop());
        }
        if (opStack.length > 0) opStack.pop(); // discard '('
        if (opStack.length > 0 && opStack[opStack.length - 1].type === 'function') {
          output.push(opStack.pop());
        }
      }
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop();
    if (top.type !== 'paren') output.push(top);
  }

  return output;
}

export function evalRPN(rpn, angleUnit = 'degrees') {
  const stack = [];
  const toRad = angleUnit === 'degrees' ? (x) => x * (Math.PI / 180) : (x) => x;

  for (const tok of rpn) {
    if (tok.type === 'number') {
      stack.push(parseFloat(tok.value));
    } else if (tok.type === 'constant') {
      stack.push(tok.value === 'pi' ? Math.PI : Math.E);
    } else if (tok.type === 'operator') {
      const b = stack.pop();
      const a = stack.pop();
      switch (tok.value) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/': stack.push(b === 0 ? NaN : a / b); break;
        case '^': stack.push(Math.pow(a, b)); break;
        default: stack.push(NaN);
      }
    } else if (tok.type === 'function') {
      const x = stack.pop();
      let result;
      switch (tok.value) {
        case 'sin': result = Math.sin(toRad(x)); break;
        case 'cos': result = Math.cos(toRad(x)); break;
        case 'tan': result = Math.tan(toRad(x)); break;
        case 'log': result = x <= 0 ? NaN : Math.log10(x); break;
        case 'ln':  result = x <= 0 ? NaN : Math.log(x); break;
        case 'sqrt': result = x < 0 ? NaN : Math.sqrt(x); break;
        default: result = NaN;
      }
      stack.push(result);
    }
  }

  return stack.length === 1 ? stack[0] : NaN;
}
