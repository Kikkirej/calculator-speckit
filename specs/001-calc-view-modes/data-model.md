# Data Model: Calculator View Modes

**Phase**: 1 | **Branch**: `001-calc-view-modes` | **Date**: 2026-05-15

## Entities

### CalculatorState

The single source of truth for all calculator behaviour. A plain JavaScript object. Immutable — every operation returns a new object.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentValue` | `string` | `"0"` | The value shown on the display. Always a valid numeric string or `"Error"`. |
| `storedOperand` | `number \| null` | `null` | The left-hand operand of a pending binary operation. |
| `pendingOperator` | `string \| null` | `null` | The pending binary operator: `"+"`, `"-"`, `"*"`, `"/"`, `"^"`. |
| `mode` | `"simple" \| "scientific"` | `"simple"` | The active view mode. |
| `isError` | `boolean` | `false` | `true` when the display shows an error (e.g., division by zero). |
| `justEvaluated` | `boolean` | `false` | `true` immediately after `=` is pressed; resets digit entry on next input. |

**Validation rules:**
- `currentValue` must always be a representable string (never `NaN`, `Infinity`; those become `"Error"`).
- When `isError` is `true`, all input is ignored until `clear()` is called.
- `storedOperand` is only non-null when `pendingOperator` is also non-null.

---

### Mode

An enumerated string type. Two values only.

| Value | Description |
|-------|-------------|
| `"simple"` | Default mode. Shows basic arithmetic controls only. |
| `"scientific"` | Extended mode. Shows basic controls plus sin, cos, tan, log, ln, √, xʸ, parentheses. |

---

## State Transitions

```
Initial State
  currentValue: "0", storedOperand: null, pendingOperator: null,
  mode: "simple", isError: false, justEvaluated: false

inputDigit(state, digit: string) → CalculatorState
  - If isError: no-op (return state unchanged)
  - If justEvaluated: replace currentValue with digit, justEvaluated = false
  - If currentValue === "0": replace with digit (unless digit === "0")
  - Otherwise: append digit to currentValue
  - Max 15 significant digits (display truncates beyond this)

inputDecimal(state) → CalculatorState
  - If isError: no-op
  - If currentValue already contains ".": no-op
  - If justEvaluated: set currentValue = "0.", justEvaluated = false
  - Otherwise: append "." to currentValue

selectOperator(state, op: "+" | "-" | "*" | "/" | "^") → CalculatorState
  - If isError: no-op
  - If pendingOperator !== null and !justEvaluated:
      evaluate pending operation first (storedOperand op currentValue)
      set currentValue = result string
      set storedOperand = result
  - Else: set storedOperand = parseFloat(currentValue)
  - Set pendingOperator = op
  - Set justEvaluated = false

evaluate(state) → CalculatorState  [triggered by "="]
  - If isError: no-op
  - If pendingOperator === null: no-op (nothing to evaluate)
  - Compute: storedOperand [pendingOperator] parseFloat(currentValue)
  - If result is not finite (division by zero, overflow): isError = true, currentValue = "Error"
  - Else: currentValue = formatResult(result), storedOperand = null, pendingOperator = null
  - Set justEvaluated = true

applyScientific(state, fn: "sin"|"cos"|"tan"|"log"|"ln"|"sqrt") → CalculatorState
  - If isError: no-op
  - Only available when mode === "scientific"
  - Apply Math function to parseFloat(currentValue)
  - sin/cos/tan: input treated as degrees (convert to radians: × π/180)
  - log: base-10 (Math.log10)
  - ln: natural log (Math.log)
  - sqrt: Math.sqrt — returns Error if input < 0
  - If result is not finite: isError = true, currentValue = "Error"
  - Else: currentValue = formatResult(result), justEvaluated = true

inputPower(state) → CalculatorState  [xʸ button]
  - Equivalent to selectOperator(state, "^")
  - Computed in evaluate() as Math.pow(storedOperand, currentValue)

clear(state) → CalculatorState  [C button]
  - Returns the initial state (all fields reset to defaults)
  - Mode is preserved (clear does not change simple/scientific)

toggleMode(state) → CalculatorState
  - Flips mode: "simple" → "scientific" or "scientific" → "simple"
  - Preserves: currentValue
  - Clears: pendingOperator, storedOperand, justEvaluated, isError
```

---

## Helper: formatResult

```
formatResult(value: number) → string
  - Use parseFloat(value.toPrecision(10)).toString()
  - This strips floating point noise (0.1 + 0.2 → "0.3" not "0.30000000000000004")
  - If result is an integer: display without decimal point
  - Max 15 characters displayed; if longer, use exponential notation
```

---

## Display Logic

The display always shows `state.currentValue`. The DOM element has `aria-live="polite" aria-atomic="true"` so screen readers announce updates automatically.
