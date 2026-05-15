# Tasks: Expanded Scientific Mode

**Input**: Design documents from `/specs/002-expand-scientific/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Included — Constitution Principle III mandates TDD (non-negotiable). Tests are written before implementation code.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared state dependency)
- **[Story]**: Maps to user story from spec.md (US1, US2, US3)
- TDD cycle is enforced: every implementation task is preceded by a failing-test task

---

## Phase 1: Setup (File Creation)

**Purpose**: Create the new source files required by the plan before any implementation begins.

- [x] T001 [P] Create src/evaluator.js with exported stubs: `tokenise`, `shuntingYard`, `evalRPN` (empty functions returning null)
- [x] T002 [P] Create tests/test-evaluator.js with harness import and empty describe block skeleton
- [x] T003 Update tests/run.js to import and run tests/test-evaluator.js alongside tests/test-calc.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shunting-yard evaluator engine and state model refactor that ALL user stories depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Write failing tests for `evalRPN()` in tests/test-evaluator.js: single number returns its value; binary operators +, -, *, /, ^ on two numbers
- [x] T005 [P] Write failing tests for updated `createState()` in tests/test-calc.js: new fields `expression: null`, `parenDepth: 0`, `angleUnit: 'degrees'`; updated `toggleMode()` sets `expression: []` when switching to scientific, `expression: null` when switching to simple
- [x] T006 Implement `evalRPN(rpn)` in src/evaluator.js: number tokens push to stack; binary operators pop two, apply, push result; division by zero and non-finite results return NaN
- [x] T007 Update `createState()` and `toggleMode()` in src/calc.js to include `expression`, `parenDepth`, `angleUnit` fields per data-model.md
- [x] T008 [P] Write failing tests for `shuntingYard()` in tests/test-evaluator.js: flat infix `2+3` → RPN `[2, 3, +]`; precedence `2+3*4` → `[2, 3, 4, *, +]`; right-associative `2^3` → `[2, 3, ^]`
- [x] T009 [P] Write failing tests for `inputDigit()` and `inputDecimal()` in scientific mode in tests/test-calc.js: first digit appends `{type:"number", value:"5"}` to expression; subsequent digits extend last NumberToken value; decimal appends to last NumberToken; `justEvaluated` true starts a new NumberToken
- [x] T010 Implement `shuntingYard(tokens)` in src/evaluator.js: operator precedence table for +/-/*/^; left-associativity for +,-,*,/ ; right-associativity for ^; flush remaining operators to output queue
- [x] T011 Update `inputDigit()` and `inputDecimal()` in src/calc.js: in scientific mode, append or extend a NumberToken in `state.expression` instead of mutating `currentValue`
- [x] T012 Write failing test for `evaluate()` in scientific mode in tests/test-calc.js: flat expression `[NumberToken(2), OperatorToken(+), NumberToken(3)]` evaluates to `currentValue: '5'`; non-finite result sets `isError: true, currentValue: 'Error'`
- [x] T013 Update `evaluate()` in src/calc.js: add scientific mode branch — commit last typed digit into expression, run `shuntingYard → evalRPN`, store formatted result in `currentValue`, clear `expression` and `parenDepth`, set `justEvaluated: true`

**Checkpoint**: `node tests/run.js` passes all tests. Simple mode fully intact. Scientific mode can evaluate flat expressions.

---

## Phase 3: User Story 1 — Bracketed Expressions (Priority: P1) 🎯 MVP

**Goal**: Users can enter and evaluate parenthesised sub-expressions of arbitrary nesting depth in scientific mode.

**Independent Test** (from spec.md): Enter `(2+3)×4=` in scientific mode and verify the result is `20`.

- [x] T014 Write failing tests for `shuntingYard()` with parentheses in tests/test-evaluator.js: `(2+3)*4` → result 20; `((1+2)*(3+4))` → result 21; unmatched `)` discarded; unmatched `(` auto-closed
- [x] T015 [US1] Extend `shuntingYard()` in src/evaluator.js: push `(` as sentinel onto operator stack; on `)`, pop until `(` is found (discard sentinel); flush sentinel on end-of-tokens for auto-close
- [x] T016 Write failing tests for `inputToken()` in tests/test-calc.js: operator token appends `OperatorToken` to expression; `(` increments `parenDepth`; `)` with `parenDepth > 0` appends and decrements; `)` with `parenDepth === 0` is silently ignored; no-op when `isError`
- [x] T017 [US1] Export `inputToken(state, token)` from src/calc.js implementing the transitions above
- [x] T018 Write failing tests for `evaluate()` with brackets in tests/test-calc.js: `(2+3)*4=20`; auto-close `(5+3=8`; error recovery: press `=` with `)` causing div-by-zero inside bracket sets `isError`
- [x] T019 [US1] Update `evaluate()` in src/calc.js: before shunting-yard, append `parenDepth` close-paren tokens to auto-close unclosed parentheses
- [x] T020 [P] [US1] Add `<div id="expression-display" aria-live="polite" aria-atomic="true" hidden></div>` to index.html above `<output id="display">`
- [x] T021 [P] [US1] Add CSS for `#expression-display` in style.css: smaller font, right-aligned, muted color, min-height, word-break (per ui-contract.md)
- [x] T022 [P] [US1] Wire `open-paren` and `close-paren` data-actions in src/ui.js calling `inputToken` with paren tokens
- [x] T023 [US1] Add `(` and `)` buttons to `#buttons-scientific` in index.html with `data-action="open-paren"` / `data-action="close-paren"`
- [x] T024 [US1] Update `render()` in src/ui.js: serialize `state.expression` tokens to a human-readable infix string (per ui-contract.md serialization table) and set as `#expression-display` textContent; show/hide `#expression-display` based on scientific mode

**Checkpoint**: `node tests/run.js` passes. Open index.html → scientific mode → `(2+3)×4=` shows `20` in display and `(2+3)×4` in expression display.

---

## Phase 4: User Story 2 — Additional Scientific Functions (Priority: P2)

**Goal**: Users can insert π and e constants, compute factorials, reciprocals, and percentages in scientific mode.

**Independent Test** (from spec.md): Press `π` — display shows `3.141592654`; clear, enter `5`, press `n!` — display shows `120`.

- [x] T025 Write failing tests for `inputConstant()` in tests/test-calc.js: pressing `pi` appends `NumberToken(Math.PI formatted)`; when last expression token is a NumberToken, an `OperatorToken(*)` is inserted first (implicit multiplication); same for `e`
- [x] T026 [US2] Export `inputConstant(state, name)` from src/calc.js implementing constant insertion with implicit multiply logic
- [x] T027 Write failing tests for `applyUnary()` in tests/test-calc.js: `5!→120`; `0!→1`; `-1!→isError`; non-integer `!→isError`; `171!→isError`; `4→1/x=0.25`; `0→1/x=isError`; `50→%=0.5`; no-op when `isError`
- [x] T028 [US2] Export `applyUnary(state, fn)` from src/calc.js: reads `currentValue` (or last NumberToken value); validates bounds; sets result back in `currentValue`; sets `isError` and descriptive `errorMessage` on invalid input
- [x] T029 [P] [US2] Add π, e, n!, 1/x, % buttons to `#buttons-scientific` in index.html with data-actions `constant-pi`, `constant-e`, `factorial`, `reciprocal`, `percent`
- [x] T030 [P] [US2] Wire `constant-pi`, `constant-e`, `factorial`, `reciprocal`, `percent` data-actions in src/ui.js to `inputConstant` and `applyUnary` calls

**Checkpoint**: `node tests/run.js` passes. All US2 functions work in browser. US1 bracket expressions still work.

---

## Phase 5: User Story 3 — Degree / Radian Toggle (Priority: P3)

**Goal**: Users can switch between degree and radian input for trigonometric functions; a visible indicator shows the current angle unit.

**Independent Test** (from spec.md): Switch to RAD, enter `90`, press `sin` → result is `1`. Switch to DEG, enter `90`, press `sin` → also `1`.

- [x] T031 Write failing tests for `toggleAngleUnit()` in tests/test-calc.js: default state has `angleUnit: 'degrees'`; after toggle, `angleUnit: 'radians'`; toggle again → `'degrees'`; no other fields changed
- [x] T032 [US3] Export `toggleAngleUnit(state)` from src/calc.js flipping `angleUnit` between `'degrees'` and `'radians'`
- [x] T033 Write failing tests for `applyScientific()` with `angleUnit` in tests/test-calc.js: `sin(90, degrees)→1`; `sin(Math.PI/2, radians)→1`; `cos(0, both)→1`; `tan(45, degrees)→1`; `log` and `ln` and `sqrt` unaffected by angleUnit
- [x] T034 [US3] Update `applyScientific()` in src/calc.js: gate the degree-to-radian conversion (`toRad`) on `state.angleUnit === 'degrees'` for sin, cos, tan; other functions unchanged
- [x] T035 [P] [US3] Add DEG/RAD toggle button `<button type="button" id="angle-toggle" data-action="toggle-angle" aria-pressed="false">DEG</button>` and `<span id="angle-unit" aria-live="polite" hidden>DEG</span>` to index.html inside `#buttons-scientific`
- [x] T036 [P] [US3] Add CSS for `#angle-unit` (small, bold, letter-spacing) and `#angle-toggle[aria-pressed="true"]` highlight (reuse `--color-button-eq`) in style.css
- [x] T037 [US3] Wire `toggle-angle` data-action in src/ui.js to call `toggleAngleUnit(state)`
- [x] T038 [US3] Update `render()` in src/ui.js: set `#angle-unit` textContent and `#angle-toggle` textContent + `aria-pressed` based on `state.angleUnit`; show/hide `#angle-unit` based on scientific mode

**Checkpoint**: `node tests/run.js` passes. Degree/radian toggle works in browser and trig results change correctly. All prior features still work.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification pass across all user stories.

- [ ] T039 Run `node tests/run.js` — confirm 0 failures; count and report total tests passing
- [ ] T040 [P] Browser smoke test: open index.html and verify all 5 integration scenarios from specs/002-expand-scientific/quickstart.md (bracketed expression, auto-close, trig in radians, factorial, implicit multiply with π)
- [x] T041 [P] Spot-check WCAG 2.1 AA color contrast for new buttons: confirm new buttons reuse existing CSS color variables; no new colors introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Requires Phase 1 complete — BLOCKS all user stories
- **US1 (Phase 3)**: Requires Phase 2 complete — no dependency on US2 or US3
- **US2 (Phase 4)**: Requires Phase 2 complete — no dependency on US1 or US3
- **US3 (Phase 5)**: Requires Phase 2 complete — no dependency on US1 or US2
- **Polish (Phase 6)**: Requires all desired user stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 only. Independent of US2/US3.
- **US2 (P2)**: After Phase 2 only. Independent of US1/US3.
- **US3 (P3)**: After Phase 2 only. Independent of US1/US2.

### Within Each Phase

- Test tasks MUST be written and FAIL before the corresponding implementation task begins (TDD)
- Within the evaluator: `evalRPN` before `shuntingYard` (shunting-yard output feeds evalRPN)
- Within state model: `createState` before `inputDigit`/`evaluate`
- Within US1: shunting-yard paren extension (T014-T015) before `inputToken` (T016-T017) before evaluate auto-close (T018-T019) before UI tasks (T020-T024)

### Parallel Opportunities

- **Phase 1**: T001, T002 run in parallel; T003 after T002
- **Phase 2**: T004+T005 parallel (different test files); T008+T009 parallel; T006 after T004; T007 after T005
- **Phase 3**: T020+T021 parallel (HTML + CSS); T022 parallel (ui.js wiring)
- **Phase 4**: T029+T030 parallel (HTML + ui.js)
- **Phase 5**: T035+T036 parallel (HTML + CSS)
- **Phase 6**: T040+T041 parallel

---

## Parallel Example: Phase 2 (Foundational)

```
# Batch 1 — run in parallel (different files):
T004: Write evalRPN tests in tests/test-evaluator.js
T005: Write createState/toggleMode tests in tests/test-calc.js

# Batch 2 — after Batch 1:
T006: Implement evalRPN in src/evaluator.js
T007: Update createState/toggleMode in src/calc.js

# Batch 3 — run in parallel:
T008: Write shuntingYard tests in tests/test-evaluator.js
T009: Write inputDigit/inputDecimal scientific-mode tests in tests/test-calc.js

# Batch 4 — after Batch 3:
T010: Implement shuntingYard in src/evaluator.js
T011: Update inputDigit/inputDecimal in src/calc.js

# Sequential:
T012: Write evaluate() scientific mode test
T013: Update evaluate() in src/calc.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T013)
3. Complete Phase 3: User Story 1 (T014–T024)
4. **STOP and VALIDATE**: `node tests/run.js` → 0 failures; browser test `(2+3)×4=`
5. Demo bracket evaluation as MVP

### Incremental Delivery

1. Phase 1 + Phase 2 → Evaluator engine + state model ready
2. Phase 3 → Bracketed expressions (MVP demo)
3. Phase 4 → π, e, !, 1/x, % (adds 6 new functions)
4. Phase 5 → DEG/RAD toggle (completes scientific mode)
5. Phase 6 → Final verification pass

Each phase delivers independently testable value without breaking prior phases.

---

## Notes

- `[P]` = different files with no shared incomplete dependency — safe to run in parallel
- Constitution Principle III mandates TDD: every test task MUST be written and confirmed failing before its implementation pair
- Simple mode state machine (`currentValue`, `storedOperand`, `pendingOperator`) is NEVER touched — zero regression risk
- Commit after each checkpoint (end of each phase) at minimum
- `formatResult(value)` helper in src/calc.js is unchanged and reused by all new numeric results
