# Implementation Plan: Expanded Scientific Mode

**Branch**: `002-expand-scientific` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-expand-scientific/spec.md`

## Summary

Add parentheses grouping, six new unary functions (π, e, !, 1/x, %, DEG/RAD toggle), and a degree/radian mode indicator to the scientific calculator view. The implementation replaces the current two-operand chain state machine in `calc.js` with a token-array + shunting-yard evaluator to correctly handle arbitrary expression nesting while keeping the existing simple-mode behaviour intact.

## Technical Context

**Language/Version**: ES2020+ vanilla JavaScript modules, HTML5, CSS3

**Primary Dependencies**: None — zero-dependency per constitution

**Storage**: None — all state is in-memory JS objects; angle unit resets on page reload (spec assumption)

**Testing**: Custom in-repo test harness (`tests/harness.js`), run via `node tests/run.js` (Node-compatible, no test framework)

**Target Platform**: Static web page; tests run in Node.js (CI); production runs in modern browsers (Chrome, Firefox, Safari latest stable)

**Project Type**: Single-page web application

**Performance Goals**: All button-press state transitions < 16 ms; shunting-yard evaluation of any displayable expression is effectively instantaneous

**Constraints**: No libraries; no build tools; no bundler; static files only; all test code must be Node-compatible

**Scale/Scope**: 3 source files (~300 lines of JS after feature addition); 1 test file expanded with new suites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Principle | Status | Notes |
|------|-----------|--------|-------|
| G-I  | Zero-dependency plain web stack | ✅ PASS | Shunting-yard implemented in ~40 lines of vanilla JS; no external libs |
| G-II | Minimal code footprint | ✅ PASS | Token array + shunting-yard evaluator is the minimum required; no speculative abstractions |
| G-III | TDD (NON-NEGOTIABLE) | ✅ PASS | Plan mandates failing tests before each implementation step |
| G-IV | CI via GitHub Actions | ✅ PASS | Existing `ci.yml` unchanged; new tests run in the same `node tests/run.js` step |

*Post-design re-check*: No constitution violations introduced by Phase 1 design (see `data-model.md`).

## Project Structure

### Documentation (this feature)

```text
specs/002-expand-scientific/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-actions.md    # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not yet created)
```

### Source Code (repository root)

```text
index.html          # Calculator markup — add new scientific buttons + angle indicator
style.css           # Styles — new button layout rules + DEG/RAD indicator style
src/
  calc.js           # Core logic — refactor state machine → token-array + shunting-yard
  ui.js             # DOM event handling and render — wire new data-action values
tests/
  harness.js        # Unchanged
  run.js            # Unchanged
  test-calc.js      # Expand with new test suites; update for new state shape
```

**Structure Decision**: Single-project layout (no new source directories). All changes are in-place modifications of existing files.

## Complexity Tracking

No constitution violations — complexity justification table not required.
