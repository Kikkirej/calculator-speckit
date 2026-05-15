# Research: Calculator View Modes

**Phase**: 0 | **Branch**: `001-calc-view-modes` | **Date**: 2026-05-15

## Decision 1: ARIA and Keyboard Accessibility Patterns

**Decision**: Use semantic `<button>` elements with no explicit ARIA widget role; add `aria-live="polite" aria-atomic="true"` on the display element; use `aria-pressed` on the mode toggle button.

**Rationale**:
- Semantic `<button>` elements provide Tab/Enter/Space keyboard handling for free — no custom key handlers needed.
- `aria-live="polite"` on the result display ensures screen readers announce results without interrupting the user (polite queue). `aria-atomic="true"` ensures the full result string is read, not just the changed characters.
- The mode toggle uses `aria-pressed="true|false"` to expose toggle state to assistive technology. A companion `aria-live` status region announces the new mode name ("Scientific mode enabled") on switch.
- `role="application"` is not needed for a standard button-grid calculator; it is reserved for custom interaction patterns that differ fundamentally from standard widgets.
- Button labels: visible text (`+`, `−`, `×`, `÷`, `=`, `sin`, etc.) is sufficient per WCAG 2.5.3. `aria-label` is added only for the display area and any symbol-only controls.

**Alternatives considered**:
- `role="application"` — rejected; overkill for standard buttons, harms usability for AT users.
- `aria-live="assertive"` — rejected; too disruptive; polite is correct for non-urgent results.

---

## Decision 2: CSS Viewport Centering

**Decision**: Apply `display: grid; place-items: center; min-height: 100svh; margin: 0` to `body`. Wrap the calculator in a `<div id="app">` with `max-height: 100svh; overflow-y: auto` to handle viewport overflow gracefully.

**Rationale**:
- CSS Grid `place-items: center` centers in both axes with a single property (less code than Flexbox's separate `align-items` + `justify-content`).
- `100svh` (small viewport height) is correct for mobile: it excludes browser chrome (address bar, navigation bar) that `100vh` would include, preventing hidden content below the fold.
- When the scientific mode adds buttons and the calculator grows taller than the viewport, the wrapper's `overflow-y: auto` scrolls the content without breaking the centered layout.
- The calculator expands naturally downward from center when scientific mode activates — Grid automatically recenters the container, giving a symmetric expand/collapse effect.

**Alternatives considered**:
- Flexbox (`display: flex` on body) — works identically but requires two properties; Grid is more concise.
- `100vh` — rejected for mobile due to browser chrome overlap.
- Fixed positioning — rejected; breaks scroll on small screens.

---

## Decision 3: JavaScript State Machine Pattern

**Decision**: Export pure functions from `calc.js` that accept a state object and return a new state object (immutable reducer pattern). Use a plain object for state, not a class.

**Rationale**:
- Immutable updates via spread (`{ ...state, currentValue: newValue }`) make state transitions traceable and prevent accidental mutation.
- Pure functions (no side effects) are trivially testable in Node without a DOM — pass state in, assert state out.
- No class needed; plain exported functions are simpler and sufficient for this scope.
- Floating point precision: scale operands to integers before arithmetic, then scale back (e.g., `(0.1 * 10 + 0.2 * 10) / 10 = 0.3`). Use `parseFloat(result.toPrecision(10))` to strip floating point noise for display.
- Simple mode uses left-to-right evaluation (no operator precedence): `2 + 3 × 4 = 20`. This matches typical physical calculator behavior and the spec assumption that simple mode is "basic arithmetic."

**Alternatives considered**:
- Class-based calculator — rejected; adds no value over plain functions for this scope.
- Mutable state — rejected; harder to test, harder to trace bugs.
- `Decimal.js` / `Big.js` — rejected; violates Constitution Principle I (no dependencies).

---

## Decision 4: Custom Test Harness

**Decision**: Write a minimal `tests/harness.js` (TestRunner class + assert utilities) and a `tests/run.js` entry point. Use `"type": "module"` in `package.json` so Node.js treats all `.js` files as ES2020 modules. Runner exits with code 1 on any failure.

**Rationale**:
- `"type": "module"` in `package.json` is the standard way to enable native ES2020 `import`/`export` in Node without `.mjs` extensions or a bundler.
- Import paths must include file extensions (e.g., `import { createState } from '../src/calc.js'`) — required by Node's ES module resolver.
- `process.exit(1)` on test failure ensures GitHub Actions detects failures via exit code.
- Node's built-in test runner (`node --test`) was considered but rejected in favor of the custom harness to stay consistent with the constitution's "plain JS assertions, no test framework libraries" requirement.

**Alternatives considered**:
- Jest / Mocha — rejected; violates Constitution Principle I.
- Node's built-in `node --test` runner — borderline acceptable but not "plain JS assertions in-repo"; custom harness is more transparent and fully in-repo.
- `.mjs` extensions — works but `"type": "module"` is the standard practice for a project that is ES-module throughout.

---

## Decision 5: GitHub Actions CI Workflow

**Decision**: `.github/workflows/ci.yml` runs on `push` and `pull_request` to `main`, uses `ubuntu-latest`, pins Node to v22 LTS via `actions/setup-node@v4`, runs `node --check` for syntax validation then `node tests/run.js` for tests.

**Rationale**:
- Node 22 LTS provides full ES2020 module support and the longest maintenance window (active LTS through 2027).
- `actions/setup-node@v4` is included even with zero npm dependencies to ensure a reproducible Node version across CI runs (ubuntu-latest ships Node but the version is not pinned).
- `node --check src/calc.js src/ui.js` catches syntax errors fast before running the full suite.
- No `npm install` step is needed — zero runtime dependencies.
- `package.json` with `"type": "module"` must be present at the repo root; without it Node.js cannot resolve ES module imports.

**Alternatives considered**:
- Skip `setup-node` — rejected; ubuntu-latest Node version drifts over time.
- Node 20 LTS — also valid but Node 22 LTS has longer support window.
- Deno — rejected; not specified in constitution and adds unfamiliar tooling.
