# Implementation Plan: Expanded Scientific Mode

**Branch**: `002-expand-scientific` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-expand-scientific/spec.md`

## Summary

Add bracketed expression support, additional scientific functions (π, e, n!, 1/x, %), and a DEG/RAD toggle to the existing scientific mode. A new `src/evaluator.js` module implements the Shunting-Yard algorithm (infix → RPN → evaluate). `src/calc.js` gains `inputToken`, `toggleAngleUnit`, and `applyUnary` exports and three new state fields. Simple mode is left completely unchanged.

## Technical Context

**Language/Version**: ES2020, HTML5, CSS3 — no transpilation, no build step

**Primary Dependencies**: None (zero runtime dependencies)

**Storage**: N/A — ephemeral in-page state only

**Testing**: Custom in-repo harness (`tests/harness.js`), run via `node tests/run.js`

**Target Platform**: Modern browser (Chrome/Firefox/Safari latest stable); Node 22 LTS for tests

**Project Type**: Client-side web application

**Performance Goals**: Instantaneous button response (<16 ms per interaction)

**Constraints**: No npm packages; no external CDN; must pass Node 22 syntax check; WCAG 2.1 AA

**Scale/Scope**: ~3 modified source files + 2 new source files; ~32 new tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| No new runtime dependencies | PASS | `src/evaluator.js` uses only JS built-ins |
| Simple mode unchanged | PASS | Existing state machine and tests untouched |
| WCAG 2.1 AA | PASS | New elements reuse existing AA-verified color variables |
| No `eval()` / `Function()` | PASS | Shunting-Yard replaces any need for dynamic eval |

## Project Structure

### Documentation (this feature)

```text
specs/002-expand-scientific/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── calc-api.md      # Phase 1 output
│   └── ui-contract.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── calc.js          # Modified: inputToken, toggleAngleUnit, applyUnary; updated createState/toggleMode
├── evaluator.js     # NEW: tokenise, shuntingYard, evalRPN
└── ui.js            # Modified: expression-display render, angle-unit toggle, new button actions

tests/
├── harness.js           # Unchanged
├── test-calc.js         # Modified: new tests for inputToken, toggleAngleUnit
├── test-evaluator.js    # NEW: shunting-yard and RPN evaluator tests
└── run.js               # Modified: imports test-evaluator.js

index.html    # Modified: #expression-display, #angle-unit, new buttons
style.css     # Modified: #expression-display and #angle-unit styles
```

**Structure Decision**: Single-project flat layout (existing convention). `evaluator.js` extracted as a separate module per Decision 7 (separation of concerns; independently testable).
