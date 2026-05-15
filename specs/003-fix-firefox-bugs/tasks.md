# Tasks: Fix Firefox Browser Bugs

**Input**: Design documents from `/specs/003-fix-firefox-bugs/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Organization**: Tasks are grouped by user story. US1 (CSS visibility) and US2 (keyboard input) are fully independent and can be implemented in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Create the new test file and wire it into the test runner

- [ ] T001 Create `tests/test-ui-keyboard.js` with empty test suite scaffold and add it to `tests/run.js` imports

---

## Phase 2: User Story 1 — Scientific Panel Visibility (Priority: P1) 🎯 MVP

**Goal**: The scientific button panel is hidden by default and toggled correctly in all browsers including Firefox.

**Independent Test**: Open `index.html` in Firefox. Verify panel is not visible on load. Click "Scientific" — panel appears. Click again — panel disappears. No click-based functionality regresses.

### Implementation for User Story 1

- [ ] T002 [US1] Add `[hidden] { display: none !important; }` in the Reset section of `style.css` (after line `*, *::before, *::after { … }`) to ensure `hidden` attribute takes priority over any `display` property

**Checkpoint**: After T002, the scientific panel is hidden on load and toggles correctly in Firefox.

---

## Phase 3: User Story 2 — Keyboard Input Support (Priority: P2)

**Goal**: All standard calculator keys (digits, operators, Enter, Escape, Backspace, period) work as keyboard input in Firefox and all other browsers.

**Independent Test**: Open `index.html` in Firefox. Press `7`, `*`, `6`, `Enter` — display shows `42`. Press `Escape` — display resets to `0`. Keyboard-only calculation works end-to-end.

### Tests for User Story 2 (Constitution Principle III — TDD required)

> **Write these tests FIRST, run them to confirm they FAIL, then implement.**

- [ ] T003 [US2] Write failing tests for `backspace(state)` in `tests/test-calc.js`:
  - `backspace` on `currentValue='5'` → `currentValue='0'`
  - `backspace` on `currentValue='0'` → `currentValue='0'`
  - `backspace` on `currentValue='123'` → `currentValue='12'`
  - `backspace` on `currentValue='-'` → `currentValue='0'`
  - `backspace` in scientific mode syncs last NumberToken in `expression[]`
  - `backspace` on error state → stays in error state

- [ ] T004 [P] [US2] Write failing tests for `mapKeyToAction(key)` in `tests/test-ui-keyboard.js`:
  - Each digit `'0'`–`'9'` → `'digit-0'`…`'digit-9'`
  - `'.'` → `'decimal'`
  - `'+'` → `'add'`, `'-'` → `'subtract'`, `'*'` → `'multiply'`, `'/'` → `'divide'`, `'^'` → `'power'`
  - `'Enter'` → `'equals'`, `'='` → `'equals'`
  - `'Escape'` → `'clear'`
  - `'Backspace'` → `'backspace'`
  - Unknown key `'a'`, `'F1'`, `'Tab'` → `null`

### Implementation for User Story 2

- [ ] T005 [US2] Add and export `backspace(state)` function in `src/calc.js`:
  - If `currentValue` has 1 char or is `'0'` or `'-'`: set to `'0'`
  - Otherwise: `currentValue = currentValue.slice(0, -1)`
  - In scientific mode: if expression's last token is a NumberToken, update its value to match new `currentValue` (remove last char, or replace with `'0'` if empty)

- [ ] T006 [P] [US2] Add pure function `mapKeyToAction(key)` to `src/ui.js` (not exported — module-private) that maps `KeyboardEvent.key` values to `data-action` strings (or `'backspace'` for Backspace); returns `null` for unmapped keys

- [ ] T007 [US2] Add `import { backspace } from './calc.js'` to `src/ui.js` and add `document.addEventListener('keydown', (e) => { … })` handler that: calls `mapKeyToAction(e.key)` to get the action, calls `e.preventDefault()` only for `'/'` (prevents browser find-in-page), dispatches via the same action chain as the click handler (reuse existing if/else logic), and calls `render(state)`

**Checkpoint**: After T007, keyboard input works end-to-end in Firefox. Digits, operators, Enter, Escape, Backspace, and period all behave identically to their button counterparts.

---

## Phase 4: Polish & Verification

**Purpose**: Run tests and validate in browser.

- [ ] T008 Run `node tests/run.js` to verify all unit tests pass (including new backspace and mapKeyToAction tests)
- [ ] T009 [P] Browser smoke test in Firefox: (1) panel hidden on load, (2) `7 * 6 Enter` → `42`, (3) `Escape` → `0`, (4) `1 . 5 + 2 . 5 Enter` → `4`, (5) multi-digit `Backspace` on `123` → `12`
- [ ] T010 [P] Browser smoke test in Chrome: same five scenarios pass with no regression

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: No dependencies on Setup or US2 — can start immediately in parallel
- **US2 (Phase 3)**: Depends on Phase 1 (test file must exist before writing tests); tests T003/T004 must fail before T005/T006/T007
- **Polish (Phase 4)**: Depends on all implementation tasks complete

### User Story Dependencies

- **US1 and US2 are fully independent** — they touch different files (`style.css` vs `src/ui.js` + `src/calc.js`)
- US2 tasks must follow TDD order: tests (T003, T004) → implementation (T005, T006, T007)

### Parallel Opportunities

- T002 (US1) and T003/T004 (US2 tests) can run in parallel after T001
- T006 (mapKeyToAction) and T003 (backspace tests) can run in parallel
- T009 and T010 (browser smoke tests) can run in parallel

---

## Parallel Example: US1 + US2 simultaneously

```
After T001:
  Thread A: T002 (style.css fix)
  Thread B: T003 (backspace tests) → T005 (backspace impl)
            T004 (keyboard tests)  → T006 (mapKeyToAction) → T007 (keydown handler)
```

---

## Implementation Strategy

### MVP First (US1 Only — 1 task)

1. Complete T001 (Setup)
2. Complete T002 (CSS fix — US1)
3. **STOP and VALIDATE**: Open Firefox, confirm panel hidden on load
4. If validated, proceed to US2

### Incremental Delivery

1. T001 → T002 → Firefox panel fix live
2. T003 → T004 → T005 → T006 → T007 → keyboard input live
3. T008 → T009 → T010 → fully validated

---

## Notes

- `mapKeyToAction` is intentionally NOT exported from `ui.js` — it is module-private. Tests should be co-located logic tests, not integration tests of DOM events.
- The `[hidden]` CSS rule belongs in the Reset section of `style.css` so it applies globally.
- `e.preventDefault()` is only called for `'/'` to avoid triggering browser quick-find; all other keys use default browser behavior.
- The `backspace` action string `'backspace'` is handled only in the `keydown` listener — there is no button with `data-action="backspace"` so it does not need to be added to the click handler.
