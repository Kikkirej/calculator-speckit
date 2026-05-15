# Research: Expanded Scientific Mode

**Phase**: 0 | **Branch**: `002-expand-scientific` | **Date**: 2026-05-15

## Decision 1: Expression Evaluation Strategy — Shunting-Yard Algorithm

**Decision**: Implement the **Shunting-Yard algorithm** (Dijkstra, 1961) in a new `src/evaluator.js` module. Tokenise the expression buffer into an array of tokens, convert to Reverse Polish Notation (RPN) via shunting-yard, then evaluate the RPN stack.

**Rationale**:
- Single-pass linear algorithm — ~50 LOC for tokenise + shunting-yard + RPN eval.
- Handles operator precedence and right-associativity (`^`) declaratively via a lookup table.
- Handles parentheses natively: `(` pushes a sentinel; `)` pops until the sentinel.
- Unary functions (`sin`, `cos`, `sqrt`, `!`, `1/x`, `%`) are pushed onto the operator stack like high-precedence operators.
- Pure functions (no side effects) — trivially testable in Node without DOM.
- RPN evaluation is a second trivial pass: push numbers, pop/apply operators.

**Operator precedence table**:

| Symbol | Precedence | Associativity |
|--------|-----------|---------------|
| `+`, `-` | 1 | Left |
| `*`, `/` | 2 | Left |
| `^` | 3 | **Right** |
| Unary functions (`sin`, `cos`, `tan`, `log`, `ln`, `sqrt`, `!`, `1/x`, `%`) | 4 | Right |

**Alternatives considered**:
- Recursive descent parser — more LOC (one grammar rule per precedence level), overkill for a fixed-operator set. Rejected.
- Extend existing left-to-right state machine with a paren stack — complex and brittle; breaks chaining semantics. Rejected.
- `eval()` / `Function()` — security risk, violates Constitution Principle I (no dependencies on runtime hacks). Rejected.

---

## Decision 2: Simple Mode Isolation

**Decision**: Simple mode keeps its **existing left-to-right state machine** unchanged (`currentValue`, `storedOperand`, `pendingOperator`). Scientific mode activates the expression buffer and shunting-yard evaluator. State is switched on `toggleMode`.

**Rationale**:
- Constitution Principle II: YAGNI. Simple mode does not need precedence or parentheses — adding the evaluator there would add code with zero user value.
- Zero regression risk: the existing simple-mode tests continue to pass without modification.
- `CalculatorState` gains three new fields (`expression`, `parenDepth`, `angleUnit`); in simple mode these are ignored/null.

**Alternatives considered**:
- Unify both modes under the expression buffer — cleaner in theory but requires rewriting all simple-mode tests and risks subtle behavioral differences. Rejected.

---

## Decision 3: Expression Display Strategy

**Decision**: In scientific mode, `state.displayValue` (a derived string) replaces `state.currentValue` as the display source. `displayValue` is computed from the `expression` token array by serialising each token to a human-readable string: numbers as-is, operators as `+`, `−`, `×`, `÷`, `^`, functions as `sin(`, `cos(`, etc., constants as `π`, `e`. An `#expression-display` element shows the expression being built; the existing `#display` shows the current result/entry.

**Rationale**:
- Users need feedback on what expression they're building (FR-003).
- Separating "expression being built" from "result" mirrors every physical and software scientific calculator.
- The existing `#display` element becomes the result zone; a new `#expression-display` element (smaller font, above `#display`) shows the live expression.

**Alternatives considered**:
- Overload `#display` to show both — confusing when the expression is long. Rejected.
- Show expression in the page title or a tooltip — invisible to screen readers, poor UX. Rejected.

---

## Decision 4: Factorial and Boundary Behaviour

**Decision**: `factorial(n)` iterates from 2 to n. Valid range: non-negative integers 0–170. 0! = 1. Non-integers and values > 170 return `NaN` (→ error state). Values in range that produce `Infinity` also return `NaN`.

**Rationale**:
- 170! ≈ 7.26 × 10^306, just under `Number.MAX_VALUE`. 171! = Infinity in IEEE 754.
- Using iteration (not recursion) avoids stack overflow for valid range and stays simple.
- `Math.round(n) !== n` check guards against non-integers cleanly.

---

## Decision 5: Implicit Multiplication for Constants

**Decision**: When `π` or `e` is inserted immediately after a number token (the last token in the expression buffer is a `number`), automatically insert a `×` operator token before the constant.

**Rationale**:
- Natural mathematical notation: `2π` means `2 × π`.
- Prevents a common user input error (pressing π after a digit and getting a parse error).
- Consistent with how physical scientific calculators handle constant insertion.

---

## Decision 6: Angle Unit Storage

**Decision**: Add `angleUnit: "degrees" | "radians"` to `CalculatorState`. Defaults to `"degrees"`. Toggled by a new `toggleAngleUnit(state)` function exported from `src/calc.js`. `applyScientific` reads `state.angleUnit` to decide whether to convert to radians before calling `Math.sin/cos/tan`.

**Rationale**:
- Minimal state addition — one field, one function.
- Consistent with the pure-function reducer pattern already established.
- Persisting across simple↔scientific toggles (but not page reload) matches how physical calculators work.

---

## Decision 7: `src/evaluator.js` — Separate Module

**Decision**: Extract the tokeniser, shunting-yard, and RPN evaluator into a new `src/evaluator.js` ES2020 module. `src/calc.js` imports `evaluate` from it.

**Rationale**:
- Separation of concerns: `calc.js` owns the state machine; `evaluator.js` owns expression parsing.
- Each module is independently testable. `tests/test-evaluator.js` can be added without touching `tests/test-calc.js`.
- Keeps `calc.js` from growing beyond ~150 LOC (Constitution Principle II).

**Alternatives considered**:
- Inline evaluator inside `calc.js` — would push `calc.js` to ~250 LOC. Rejected.
