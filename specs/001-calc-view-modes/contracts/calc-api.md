# Calc API Contract: Calculator View Modes

**Phase**: 1 | **Branch**: `001-calc-view-modes` | **Date**: 2026-05-15

This document defines the public API of `src/calc.js` — the pure-function state machine that `ui.js` calls and that unit tests verify directly.

## Module: `src/calc.js`

All exports are named. No default export.

---

### `createState() → CalculatorState`

Returns the initial calculator state.

```js
{
  currentValue: "0",
  storedOperand: null,
  pendingOperator: null,
  mode: "simple",
  isError: false,
  justEvaluated: false
}
```

---

### `inputDigit(state, digit) → CalculatorState`

**Parameters**:
- `state` — current `CalculatorState`
- `digit` — `string`, one of `"0"–"9"`

**Returns**: new state with `currentValue` updated.

**Guarantees**:
- No-op if `state.isError === true`
- Replaces leading `"0"` (unless digit is `"0"`)
- Replaces entire value if `state.justEvaluated === true`

---

### `inputDecimal(state) → CalculatorState`

**Parameters**: `state` — current `CalculatorState`

**Returns**: new state with `"."` appended to `currentValue` (once only).

**Guarantees**:
- No-op if `state.isError === true`
- No-op if `currentValue` already contains `"."`

---

### `selectOperator(state, op) → CalculatorState`

**Parameters**:
- `state` — current `CalculatorState`
- `op` — `"+" | "-" | "*" | "/" | "^"`

**Returns**: new state with `pendingOperator` set and `storedOperand` captured.

**Guarantees**:
- No-op if `state.isError === true`
- If a `pendingOperator` was already set and `!justEvaluated`, evaluates the pending operation first (left-to-right chaining)

---

### `evaluate(state) → CalculatorState`

**Parameters**: `state` — current `CalculatorState`

**Returns**: new state with the result in `currentValue`.

**Guarantees**:
- No-op if `state.isError === true` or `state.pendingOperator === null`
- Division by zero → `{ isError: true, currentValue: "Error" }`
- Sets `justEvaluated: true` on success
- Clears `pendingOperator` and `storedOperand` on success

---

### `applyScientific(state, fn) → CalculatorState`

**Parameters**:
- `state` — current `CalculatorState` with `mode === "scientific"`
- `fn` — `"sin" | "cos" | "tan" | "log" | "ln" | "sqrt"`

**Returns**: new state with function result in `currentValue`.

**Guarantees**:
- No-op if `state.isError === true`
- No-op if `state.mode !== "scientific"`
- `sin`/`cos`/`tan`: input in degrees (converted to radians internally)
- `log`: base-10
- `ln`: natural log (base e)
- `sqrt`: `Math.sqrt` — returns error state if `currentValue < 0`
- Non-finite result (NaN, Infinity) → `{ isError: true, currentValue: "Error" }`
- Sets `justEvaluated: true` on success

---

### `clear(state) → CalculatorState`

**Parameters**: `state` — current `CalculatorState`

**Returns**: initial state with `mode` preserved from input state.

**Guarantees**:
- Resets all fields to defaults except `mode`
- Callable in any state (including error state)

---

### `toggleMode(state) → CalculatorState`

**Parameters**: `state` — current `CalculatorState`

**Returns**: new state with `mode` flipped.

**Guarantees**:
- `"simple"` → `"scientific"`, `"scientific"` → `"simple"`
- `currentValue` preserved
- `pendingOperator`, `storedOperand`, `isError`, `justEvaluated` all reset to defaults

---

## `data-action` Mapping (consumed by `ui.js`)

| `data-action` value | Calls |
|--------------------|-------|
| `digit-0` … `digit-9` | `inputDigit(state, "0")` … `inputDigit(state, "9")` |
| `decimal` | `inputDecimal(state)` |
| `add` | `selectOperator(state, "+")` |
| `subtract` | `selectOperator(state, "-")` |
| `multiply` | `selectOperator(state, "*")` |
| `divide` | `selectOperator(state, "/")` |
| `equals` | `evaluate(state)` |
| `clear` | `clear(state)` |
| `sin` | `applyScientific(state, "sin")` |
| `cos` | `applyScientific(state, "cos")` |
| `tan` | `applyScientific(state, "tan")` |
| `log` | `applyScientific(state, "log")` |
| `ln` | `applyScientific(state, "ln")` |
| `sqrt` | `applyScientific(state, "sqrt")` |
| `power` | `selectOperator(state, "^")` |
| `mode-toggle` | `toggleMode(state)` |

## Error Handling

`calc.js` never throws. All error conditions produce a state with `isError: true` and `currentValue: "Error"`. The only way to exit the error state is `clear(state)`.
