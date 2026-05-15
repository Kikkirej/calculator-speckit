# Quickstart: Expanded Scientific Mode

**Branch**: `002-expand-scientific` | **Date**: 2026-05-15

## Prerequisites

- A modern browser (Chrome, Firefox, or Safari — latest stable)
- Node.js 22 LTS (for running tests)
- No npm install required — zero runtime dependencies

## Run in Browser

```bash
open index.html          # macOS
xdg-open index.html     # Linux
```

Switch to scientific mode via the **Scientific** toggle to access all new functions.

## Run Tests Locally

```bash
node tests/run.js
```

Expected output after full implementation:

```
✓ createState includes expression, parenDepth, angleUnit
✓ inputToken appends number token
✓ inputToken inserts implicit multiply before constant
✓ inputToken ignores ) when parenDepth is 0
✓ inputToken increments parenDepth on (
✓ evaluate auto-closes unclosed parens
✓ evaluate computes (2+3)*4 = 20
✓ evaluate handles nested brackets ((1+2)*(3+4)) = 21
✓ toggleAngleUnit switches degrees to radians
✓ applyScientific sin in degrees: sin(90) = 1
✓ applyScientific sin in radians: sin(π/2) = 1
✓ applyUnary factorial(5) = 120
✓ applyUnary factorial(0) = 1
✓ applyUnary factorial(-1) sets error
✓ applyUnary factorial(171) sets error
✓ applyUnary reciprocal(4) = 0.25
✓ applyUnary reciprocal(0) sets error
✓ applyUnary percent(50) = 0.5
✓ constant pi inserts Math.PI value
✓ constant e inserts Math.E value
...
32 passed, 0 failed
```

## Key Integration Scenarios

### Scenario 1: Bracketed expression

1. Open `index.html`, click **Scientific**
2. Press `(`, `2`, `+`, `3`, `)`, `×`, `4`, `=`
3. `#expression-display` shows `(2+3)×4`
4. `#display` shows `20`

### Scenario 2: Auto-close unclosed brackets

1. In scientific mode, press `(`, `5`, `+`, `3`, `=`
2. Calculator auto-closes the bracket: evaluates `(5+3) = 8`
3. `#display` shows `8`

### Scenario 3: Trig in radians

1. In scientific mode, click **DEG** to switch to **RAD**
2. Press `π`, `÷`, `2`, then `sin`
3. Expression: `π÷2→sin(`... press `=`
4. `#display` shows `1`

### Scenario 4: Factorial

1. In scientific mode, press `5`, `n!`, `=`
2. `#display` shows `120`

### Scenario 5: Constant insertion with implicit multiply

1. In scientific mode, press `2`, `π`, `=`
2. Calculator inserts implicit `×`: evaluates `2×π`
3. `#display` shows `6.283185307`

## Project Layout (additions)

```
src/
  calc.js        State machine — updated for expression buffer and new functions
  evaluator.js   NEW: tokenise + shunting-yard + RPN evaluator
  ui.js          DOM wiring — updated to render expression-display and angle unit

tests/
  test-calc.js       Updated: new tests for inputToken, toggleAngleUnit, etc.
  test-evaluator.js  NEW: unit tests for shunting-yard and RPN evaluator
  run.js             Updated: imports test-evaluator.js
```

## Key Spec References

- **FR-001 – FR-015**: Functional requirements → `specs/002-expand-scientific/spec.md`
- **Data model + state transitions**: `specs/002-expand-scientific/data-model.md`
- **JS API additions**: `specs/002-expand-scientific/contracts/calc-api.md`
- **HTML/ARIA additions**: `specs/002-expand-scientific/contracts/ui-contract.md`
- **Shunting-Yard decision**: `specs/002-expand-scientific/research.md` Decision 1
