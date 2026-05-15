# Calc API Contract: Expanded Scientific Mode

**Phase**: 1 | **Branch**: `002-expand-scientific` | **Date**: 2026-05-15

This document defines the public API additions and changes to `src/calc.js` and the new `src/evaluator.js` module.

---

## New Module: `src/evaluator.js`

All exports are named. No default export.

### `tokenise(expression: Token[]) → Token[]`

Validates and normalises the token array (e.g., inserts implicit multiplication). Returns a cleaned token list ready for shunting-yard.

### `shuntingYard(tokens: Token[]) → RPNToken[]`

Converts an infix token array to Reverse Polish Notation using the Shunting-Yard algorithm.

**Precedence rules**:

| Operator/Function | Precedence | Associativity |
|-------------------|-----------|---------------|
| `+`, `-` | 1 | Left |
| `*`, `/` | 2 | Left |
| `^` | 3 | Right |
| Unary functions | 4 | Right |

**Guarantees**:
- Unmatched `)` are silently discarded
- Unmatched `(` are auto-closed (their sentinel is discarded on flush)

### `evalRPN(rpn: RPNToken[]) → number`

Evaluates a Reverse Polish Notation token list.

**Guarantees**:
- Division by zero → `NaN`
- `sqrt` of negative → `NaN`
- `factorial` of negative or non-integer → `NaN`
- `factorial` of value > 170 → `NaN`
- `ln`/`log` of non-positive → `NaN`
- Any `NaN` or `Infinity` result → `NaN` (caller converts to error state)

---

## Updated Module: `src/calc.js`

### New exports

#### `inputToken(state, token) → CalculatorState`

**Parameters**:
- `state` — current `CalculatorState` with `mode === "scientific"`
- `token` — any `Token` object

**Guarantees**:
- No-op if `state.isError === true`
- Implicit `*` inserted when constant follows number token
- `)` ignored if `state.parenDepth === 0`
- Increments/decrements `parenDepth` for `(` / `)`

#### `evaluate(state) → CalculatorState`  *(replaces simple-mode evaluate for scientific mode)*

The existing `evaluate` export handles simple mode unchanged. In scientific mode:

**Guarantees**:
- Auto-closes `parenDepth` unclosed `(` before evaluation
- Runs `tokenise → shuntingYard → evalRPN`
- Non-finite result → `{ isError: true, currentValue: "Error" }`
- Sets `justEvaluated: true`, clears `expression`, `parenDepth`

#### `toggleAngleUnit(state) → CalculatorState`

**Parameters**: `state` — current `CalculatorState`

**Returns**: new state with `angleUnit` flipped.

**Guarantees**:
- `"degrees"` → `"radians"`, `"radians"` → `"degrees"`
- No other state fields are changed

### Modified exports

#### `createState() → CalculatorState`

Now returns state with three additional fields:

```js
{
  currentValue: "0",
  storedOperand: null,
  pendingOperator: null,
  mode: "simple",
  isError: false,
  justEvaluated: false,
  expression: null,      // NEW
  parenDepth: 0,         // NEW
  angleUnit: "degrees",  // NEW
}
```

#### `toggleMode(state) → CalculatorState`

Updated behaviour when switching **to scientific**:
- Sets `expression = []`, `parenDepth = 0`
- `angleUnit` preserved

Updated behaviour when switching **to simple**:
- Sets `expression = null`, `parenDepth = 0`
- If `currentValue` is a valid result, it is preserved

All other existing exports (`inputDigit`, `inputDecimal`, `selectOperator`, `clear`, `applyScientific`) retain their existing contracts for **simple mode**. In scientific mode, `inputDigit` and `inputDecimal` append/extend a `NumberToken` in `expression`.

---

## `data-action` Mapping Additions (consumed by `ui.js`)

New `data-action` values for scientific mode buttons:

| `data-action` | Calls |
|--------------|-------|
| `open-paren` | `inputToken(state, { type:"paren", value:"(" })` |
| `close-paren` | `inputToken(state, { type:"paren", value:")" })` |
| `constant-pi` | `inputToken(state, { type:"constant", value:"pi" })` |
| `constant-e` | `inputToken(state, { type:"constant", value:"e" })` |
| `factorial` | `applyUnary(state, "factorial")` |
| `reciprocal` | `applyUnary(state, "reciprocal")` |
| `percent` | `applyUnary(state, "percent")` |
| `toggle-angle` | `toggleAngleUnit(state)` |

Existing `sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `power`, `mode-toggle` data-actions are unchanged in behaviour but now append to the expression buffer in scientific mode rather than immediately evaluating.
