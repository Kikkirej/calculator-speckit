---
description: "Implementation task list for Calculator View Modes feature"
---

# Tasks: Calculator View Modes

**Input**: Design documents from `/specs/001-calc-view-modes/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**TDD**: Tests are included per Constitution Principle III (Red-Green-Refactor enforced).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All descriptions include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — zero-dependency static web app scaffolding

- [X] T001 Create package.json with `"type": "module"` and scripts `"test": "node tests/run.js"` and `"check": "node --check src/calc.js src/ui.js tests/harness.js tests/run.js"` at package.json
- [X] T002 [P] Create .gitignore with Node.js (node_modules/, *.log), OS (.DS_Store, Thumbs.db), and editor (.vscode/, .idea/) patterns at .gitignore
- [X] T003 [P] Create .github/workflows/ci.yml — triggers on push and pull_request to main; ubuntu-latest; actions/setup-node@v4 pinned to Node 22 LTS; step 1: `node --check src/calc.js src/ui.js tests/harness.js tests/run.js`; step 2: `node tests/run.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Custom test harness that ALL user story tests depend on — must be complete before any test can run

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create tests/harness.js — export TestRunner class with `describe(name, fn)` and `it(name, fn)` block methods, pass/fail counters, and `run()` method that prints results and calls `process.exit(1)` on any failure; export `assertEqual(actual, expected, msg)` and `assertDeepEqual(actual, expected, msg)` utilities that throw `Error` with diff on mismatch
- [X] T005 Create tests/run.js — ES2020 module entry point that imports test suites (initially just `./test-calc.js`) and invokes the TestRunner; `import './test-calc.js'` pattern; file must exist so `node tests/run.js` is runnable from repo root

**Checkpoint**: Test harness ready — user story test and implementation work can now begin

---

## Phase 3: User Story 1 — Simple Mode (Priority: P1) 🎯 MVP

**Goal**: Default calculator view with basic arithmetic (+, −, ×, ÷), centered in viewport, with working state machine and DOM wiring

**Independent Test**: Open index.html in a browser, verify simple mode is displayed by default and centered, perform `7 × 8 = 56`; also run `node tests/run.js` and confirm all simple-mode tests pass

> **TDD**: Write T006 tests first, confirm they FAIL, then implement T007–T010

### Tests for User Story 1 ⚠️ Write first — must FAIL before implementation

- [X] T006 [US1] Write failing unit tests for simple-mode state machine in tests/test-calc.js — test cases: `createState()` returns default object (currentValue "0", mode "simple", isError false); `inputDigit()` appends to display, replaces leading zero, replaces after justEvaluated; `inputDecimal()` appends once, no-op if decimal exists; `selectOperator()` captures storedOperand, chains evaluation left-to-right; `evaluate()` for addition/subtraction/multiplication/division; `evaluate()` division by zero sets isError and currentValue "Error"; `clear()` resets all fields to defaults and preserves mode

### Implementation for User Story 1

- [X] T007 [P] [US1] Implement src/calc.js — named exports: `createState()` returning initial CalculatorState object; `inputDigit(state, digit)` with leading-zero replacement and justEvaluated reset; `inputDecimal(state)` once-only guard; `selectOperator(state, op)` accepting "+"/"-"/"*"/"//"/"^" with left-to-right chaining; `evaluate(state)` computing all operators including `Math.pow` for "^", division-by-zero guard (`isError:true, currentValue:"Error"`), `justEvaluated:true` on success; `clear(state)` resetting all fields except mode; private `formatResult(value)` using `parseFloat(value.toPrecision(10)).toString()`
- [X] T008 [P] [US1] Create index.html — full document structure: `<body>`, `<div id="calculator-wrapper">`, `<div id="calculator">`; `<output id="display" aria-live="polite" aria-atomic="true">0</output>`; `<button id="mode-toggle" type="button" aria-pressed="false">Scientific</button>`; `<div id="mode-status" aria-live="polite" aria-atomic="true" class="sr-only"></div>`; `<div id="buttons-simple">` with digit buttons 0–9 (data-action="digit-0"…"digit-9"), decimal (data-action="decimal"), add/subtract/multiply/divide (data-action="add|subtract|multiply|divide"), equals (data-action="equals"), clear (data-action="clear"); `<div id="buttons-scientific" hidden></div>`; `<script type="module" src="src/ui.js"></script>`
- [X] T009 [P] [US1] Create style.css — `body { display: grid; place-items: center; min-height: 100svh; margin: 0; }`; `#calculator-wrapper { max-height: 100svh; overflow-y: auto; }`; simple-mode button grid layout for #buttons-simple; `.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }`
- [X] T010 [US1] Implement src/ui.js — `import { createState, inputDigit, inputDecimal, selectOperator, evaluate, clear, toggleMode, applyScientific } from './calc.js'`; initialize `let state = createState()`; `render(state)` function that sets `#display` textContent to `state.currentValue`, sets `#mode-toggle` aria-pressed to `String(state.mode === "scientific")`, sets `#buttons-scientific` hidden attribute based on mode; event delegation: `document.querySelector('#calculator').addEventListener('click', handler)` using `e.target.dataset.action` to dispatch to correct calc function and re-render

**Checkpoint**: Simple mode fully functional — `node tests/run.js` passes, `open index.html` shows centered calculator, basic arithmetic works

---

## Phase 4: User Story 2 — Scientific Mode (Priority: P2)

**Goal**: Mode toggle reveals extended scientific functions (sin, cos, tan, log, ln, √, xʸ); calculator remains centered in either mode; display value preserved on toggle

**Independent Test**: Click mode toggle, verify scientific buttons appear; enter 90, press sin, verify display shows 1; click toggle again, verify simple mode restores

> **TDD**: Write T011 tests first, confirm they FAIL, then implement T012–T015

### Tests for User Story 2 ⚠️ Write first — must FAIL before implementation

- [X] T011 [US2] Add failing unit tests for scientific mode in tests/test-calc.js — test cases: `toggleMode()` simple→scientific and scientific→simple; `toggleMode()` preserves currentValue; `toggleMode()` clears pendingOperator and storedOperand; `applyScientific()` sin(90°)=1, cos(0°)=1, tan(45°)≈1, log(100)=2, ln(e)≈1, sqrt(4)=2; `applyScientific()` sqrt(-1) sets isError; `applyScientific()` no-op when mode is "simple"; power operator `evaluate()` with "^" via `Math.pow(2,3)=8`

### Implementation for User Story 2

- [X] T012 [P] [US2] Extend src/calc.js — add `toggleMode(state)`: flips mode "simple"↔"scientific", preserves currentValue, resets pendingOperator/storedOperand/isError/justEvaluated to defaults; add `applyScientific(state, fn)`: no-op guards for isError and mode!=="scientific"; degree→radian conversion (`× Math.PI / 180`) for sin/cos/tan; Math.log10 for log; Math.log for ln; Math.sqrt with negative-input guard; non-finite result → `{isError:true, currentValue:"Error"}`; sets justEvaluated:true on success
- [X] T013 [P] [US2] Add scientific buttons to index.html inside `#buttons-scientific` (currently empty with hidden attribute) — `<button type="button" data-action="sin">sin</button>`, cos, tan, log, ln, `<button data-action="sqrt">√</button>`, `<button data-action="power">xʸ</button>`; buttons follow same pattern as simple-mode buttons (type="button", data-action per calc-api.md)
- [X] T014 [P] [US2] Extend style.css — scientific button grid layout for #buttons-scientific displayed below simple buttons; ensure body CSS Grid re-centers the expanded calculator automatically when #buttons-scientific becomes visible; add smooth height transition on #calculator if desired
- [X] T015 [US2] Extend src/ui.js mode toggle handling — in the `render(state)` function: when `state.mode === "scientific"` remove `hidden` attribute from `#buttons-scientific`, otherwise set it; update `#mode-toggle` aria-pressed="true" in scientific mode; set `#mode-status` textContent to "Scientific mode" or "Simple mode" on each toggle so screen readers announce the change; ensure the data-action="mode-toggle" case calls `toggleMode(state)` and re-renders

**Checkpoint**: Scientific mode functional — mode toggle works, sin/cos/tan/log/ln/sqrt/power all compute correct results, calculator re-centers after expansion

---

## Phase 5: User Story 3 — Accessibility (Priority: P3)

**Goal**: Full WCAG 2.1 AA compliance — keyboard-only operation, screen reader announcements for mode changes and results, sufficient color contrast across all states

**Independent Test**: Tab through all buttons in both modes without a mouse (verify no buttons are skipped); check color contrast ratios in browser DevTools; verify #mode-status textContent changes on toggle

> **Note**: Most ARIA structure was added in T008/T013. These tasks audit, complete, and harden it.

### Implementation for User Story 3

- [X] T016 [P] [US3] Audit and complete ARIA attributes in index.html — verify `aria-live="polite" aria-atomic="true"` on `#display`; confirm `aria-pressed` attribute is present (not just set by JS) with initial value "false" on `#mode-toggle`; confirm `hidden` attribute (not CSS display:none) is on `#buttons-scientific` initially; confirm `.sr-only` class on `#mode-status`; verify every button has `type="button"` and a clear visible text label; add `aria-label` only for symbol-only buttons if any lack agreed-upon text equivalent per ui-contract.md
- [X] T017 [P] [US3] Add WCAG 2.1 AA color contrast rules to style.css — display text (#display) ≥4.5:1 contrast; button label text ≥4.5:1 contrast; UI component borders ≥3:1 contrast; focus-visible outline with ≥3:1 contrast against adjacent background; hover and active state color values maintain same contrast ratios; define CSS custom properties (--color-bg, --color-text, --color-button, --color-focus) for maintainability
- [X] T018 [US3] Verify DOM order and keyboard navigation in index.html — confirm #mode-toggle appears before #buttons-simple and #buttons-scientific in document order (Tab reaches toggle first); confirm no element uses tabindex="-1" to trap or skip keyboard focus; open in browser and manually Tab through all buttons in both simple and scientific modes to verify complete reachability; fix any ordering issues found

**Checkpoint**: Accessibility complete — keyboard-only navigation verified, ARIA attributes in place, color contrast meets AA

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and CI readiness

- [X] T019 [P] Run `node tests/run.js` from repo root and verify all tests pass with exit code 0 — confirm all test cases added in T006 and T011 are green; update tests/test-calc.js if any edge cases from quickstart.md expected output are not yet covered (e.g. `toggleMode preserves currentValue`, `applyScientific computes sin(90) = 1`)
- [X] T020 [P] Run `node --check src/calc.js src/ui.js tests/harness.js tests/run.js` and verify zero syntax errors — fix any ES2020 module syntax issues found (missing file extensions in import paths, CommonJS require() calls)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002 and T003 can run in parallel with T001
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user story test writing
- **User Story 1 (Phase 3)**: Depends on Phase 2; T006 first (tests), then T007/T008/T009 in parallel, then T010
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion; T011 first (tests), then T012/T013/T014 in parallel, then T015
- **User Story 3 (Phase 5)**: Depends on Phase 4 completion; T016/T017 in parallel, then T018
- **Polish (Phase 6)**: Depends on all user stories complete; T019/T020 in parallel

### User Story Dependencies

- **US1 (Simple Mode, P1)**: Standalone — no dependency on US2 or US3
- **US2 (Scientific Mode, P2)**: Extends US1 calc.js and ui.js (T012/T015 build on T007/T010)
- **US3 (Accessibility, P3)**: Cross-cutting layer on US1+US2 HTML/CSS; audits and completes ARIA from T008/T013

### Within Each User Story

- Tests MUST be written first and FAIL before implementation
- Different-file tasks [P] can run in parallel
- Same-file tasks are sequential (src/calc.js, src/ui.js, index.html, style.css)
- Verify tests pass (green) before moving to next story

---

## Parallel Execution Examples

### Phase 3 — User Story 1

```
Sequential:  T006 (write tests — confirm RED)
Parallel:    T007 src/calc.js  ║  T008 index.html  ║  T009 style.css
Sequential:  T010 src/ui.js (after T007+T008+T009)
```

### Phase 4 — User Story 2

```
Sequential:  T011 (write tests — confirm RED)
Parallel:    T012 src/calc.js  ║  T013 index.html  ║  T014 style.css
Sequential:  T015 src/ui.js (after T012+T013+T014)
```

### Phase 5 — User Story 3

```
Parallel:    T016 index.html  ║  T017 style.css
Sequential:  T018 (DOM order audit — after T016+T017)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — test harness must exist before any tests)
3. Write and red-check T006 tests
4. Complete Phase 3: User Story 1 (T007–T010)
5. **STOP and VALIDATE**: `node tests/run.js` + open `index.html` in browser
6. Demo simple mode working calculator

### Incremental Delivery

1. Setup + Foundational → harness ready
2. US1 (Simple Mode) → working calculator, all basic tests green → MVP demo
3. US2 (Scientific Mode) → extended functions, mode toggle, all tests green
4. US3 (Accessibility) → WCAG AA hardened, keyboard/screen-reader ready
5. Polish → CI green, syntax clean

---

## Notes

- `[P]` tasks target different files — safe to implement concurrently
- `[USn]` label maps each task to its user story for traceability
- All test tasks must produce RED (failing) before implementation begins (TDD)
- `node tests/run.js` is the single command to verify correctness at any checkpoint
- Zero npm dependencies — never add an `npm install` step
- Import paths in `.js` files must include the `.js` extension (ES module Node resolver requirement)
