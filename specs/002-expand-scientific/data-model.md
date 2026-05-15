# Data Model: Expanded Scientific Mode

**Phase**: 1 | **Branch**: `002-expand-scientific` | **Date**: 2026-05-15

## Updated Entity: CalculatorState

Extends the existing state with three new fields. Simple mode ignores `expression` and `parenDepth`; `angleUnit` is shared.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentValue` | `string` | `"0"` | **Simple mode only**: value on display. Unchanged from v1. |
| `storedOperand` | `number \| null` | `null` | **Simple mode only**: LHS of pending binary op. Unchanged. |
| `pendingOperator` | `string \| null` | `null` | **Simple mode only**: pending operator. Unchanged. |
| `mode` | `"simple" \| "scientific"` | `"simple"` | Active view mode. |
| `isError` | `boolean` | `false` | True when display shows an error. |
| `justEvaluated` | `boolean` | `false` | True immediately after `=`; resets digit entry. |
| `expression` | `Token[] \| null` | `null` | **Scientific mode only**: the expression buffer being built. `null` in simple mode. |
| `parenDepth` | `number` | `0` | **Scientific mode only**: count of unclosed `(`. 0 = balanced. |
| `angleUnit` | `"degrees" \| "radians"` | `"degrees"` | Controls how sin/cos/tan interpret input. Shared across modes. |

---

## New Entity: Token

A single element in the scientific-mode expression buffer. Discriminated union — exactly one of the shapes below.

### NumberToken
```
{ type: "number", value: string }
  value: a valid numeric string (e.g., "3", "3.14", "-1")
```

### OperatorToken
```
{ type: "operator", value: "+" | "-" | "*" | "/" | "^" }
  value: one of the five binary operators
```

### FunctionToken
```
{ type: "function", value: "sin" | "cos" | "tan" | "log" | "ln" | "sqrt" | "factorial" | "reciprocal" | "percent" }
  value: the function to apply to the immediately following sub-expression or number
```

### ConstantToken
```
{ type: "constant", value: "pi" | "e" }
  value: inserts Math.PI or Math.E into the expression
```

### ParenToken
```
{ type: "paren", value: "(" | ")" }
  value: open or close parenthesis
```

---

## State Transitions (Scientific Mode)

```
toggleMode(state) → CalculatorState
  - Flips mode; if entering scientific:
      set expression = [], parenDepth = 0
  - If leaving scientific:
      set expression = null, parenDepth = 0
      set currentValue = result of last evaluation (or "0")
  - Preserves angleUnit across toggle
  - Clears pendingOperator, storedOperand, isError, justEvaluated

inputToken(state, token: Token) → CalculatorState  [scientific mode only]
  - If isError: no-op
  - Implicit multiplication guard: if token is ConstantToken and last token in
    expression is NumberToken, prepend an OperatorToken{value:"*"} first
  - Appends token to expression
  - If token is ParenToken{value:"("}: parenDepth++
  - If token is ParenToken{value:")"}:
      - If parenDepth === 0: no-op (unmatched close paren, ignored per FR-004)
      - Else: parenDepth--
  - justEvaluated = false

evaluate(state) → CalculatorState  [= button, scientific mode]
  - If isError: no-op
  - Auto-close: append parenDepth close-paren tokens
  - Run shunting-yard on expression → RPN token list
  - Evaluate RPN stack → numeric result
  - If result is not finite: isError = true, currentValue = "Error"
  - Else: currentValue = formatResult(result), expression = null,
          parenDepth = 0, justEvaluated = true

inputDigit(state, digit) → CalculatorState  [scientific mode]
  - If isError: no-op
  - If justEvaluated or expression is empty or last token is not NumberToken:
      append NumberToken{value: digit}
  - Else: extend last NumberToken's value with digit (append)

inputDecimal(state) → CalculatorState  [scientific mode]
  - If isError: no-op
  - If last token is NumberToken and value contains ".": no-op
  - If last token is NumberToken: append "." to its value
  - Else: append NumberToken{value: "0."}

clear(state) → CalculatorState
  - Returns initial state with mode and angleUnit preserved

toggleAngleUnit(state) → CalculatorState
  - Flips angleUnit: "degrees" → "radians" or "radians" → "degrees"
  - Does not clear expression or currentValue

applyUnary(state, fn: "factorial"|"reciprocal"|"percent") → CalculatorState
  - If isError: no-op
  - Appends FunctionToken{value: fn} to expression
  - (Evaluated lazily when = is pressed)
  OR for simple unary-on-current-value:
  - Immediately applies fn to the last NumberToken / currentValue
  - Decision: apply immediately (matches physical calculator UX for %, 1/x, !)
    after = or after a digit sequence

applyScientific(state, fn: "sin"|"cos"|"tan"|"log"|"ln"|"sqrt") → CalculatorState
  - Appends FunctionToken{value: fn} to expression
  - Function is evaluated during shunting-yard/RPN evaluation
  - angleUnit controls radian conversion for sin/cos/tan
```

---

## Shunting-Yard Evaluator (src/evaluator.js)

### Input: `Token[]`
### Output: `number`

```
PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 }
FUNCTIONS have precedence 4 (right-associative)

Algorithm:
  output = []   (queue, produces RPN)
  opStack = []  (operator/function stack)

  For each token in tokens:
    NumberToken  → push value to output
    ConstantToken → push Math.PI or Math.E to output
    FunctionToken → push to opStack
    OperatorToken →
      while opStack top is not "(" AND
            (top has higher prec, OR same prec AND left-assoc):
        pop from opStack → output
      push operator to opStack
    ParenToken "(" → push to opStack
    ParenToken ")" →
      while opStack top !== "(": pop → output
      pop "(" (discard); if top is function: pop → output

  Pop remaining opStack → output

RPN Evaluation:
  stack = []
  For each element in output:
    if number: push to stack
    if binary operator: pop two, apply, push result
    if unary function: pop one, apply, push result
  Return stack[0]
```

---

## Helper: formatResult (unchanged)

```
formatResult(value: number) → string
  - parseFloat(value.toPrecision(10)).toString()
  - Handles integer display (no trailing .0)
  - Values > 1e15 shown in exponential notation
```

---

## Display Logic

Two display areas in scientific mode:

| Element | Content |
|---------|---------|
| `#expression-display` | Serialised `state.expression` token array: human-readable infix string (e.g., `sin(90)×2+(`). Empty when `expression` is null or empty. |
| `#display` | `state.currentValue` — the last evaluated result or the number being entered in simple mode |

Angle unit indicator: `#angle-unit` text node shows `DEG` or `RAD` based on `state.angleUnit`. Visible only in scientific mode.
