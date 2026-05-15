# Quickstart: Calculator View Modes

**Branch**: `001-calc-view-modes` | **Date**: 2026-05-15

## Prerequisites

- A modern browser (Chrome, Firefox, or Safari — latest stable)
- Node.js 22 LTS (for running tests in CI / locally)
- No npm install required — zero runtime dependencies

## Run in Browser

Open `index.html` directly in a browser:

```bash
# From repo root
open index.html          # macOS
xdg-open index.html     # Linux
start index.html         # Windows
```

No dev server needed. The app is a static file.

## Run Tests Locally

```bash
node tests/run.js
```

Expected output on success:

```
✓ createState returns default simple mode
✓ inputDigit appends to display
✓ inputDigit replaces leading zero
✓ selectOperator stores operand
✓ evaluate computes addition
✓ evaluate handles division by zero
✓ toggleMode switches to scientific
✓ toggleMode preserves currentValue
✓ applyScientific computes sin(90) = 1
✓ clear resets all state
...
12 passed, 0 failed
```

Exit code is `0` on all pass, `1` on any failure.

## Syntax Check

```bash
node --check src/calc.js src/ui.js tests/harness.js tests/run.js
```

## Live Demo (GitHub Pages)

Once merged to `main`, the calculator is automatically deployed to GitHub Pages:

```
https://<your-github-username>.github.io/<repo-name>/
```

The deploy runs automatically after every successful merge to `main`. Check the **Actions** tab in GitHub for deploy status.

To enable GitHub Pages for the first time:
1. Go to **Settings → Pages** in your GitHub repository
2. Set **Source** to `GitHub Actions`
3. Merge a commit to `main` — the deploy job runs automatically

## CI (GitHub Actions)

Push or open a PR to `main` — the CI workflow runs automatically:

```
.github/workflows/ci.yml
```

Steps on push/PR: checkout → setup Node 22 → syntax check → run tests

Additional step on push to `main` only: deploy → GitHub Pages

## Project Layout

```
index.html          Open this in a browser to use the calculator
style.css           All styles (no external dependencies)
src/
  calc.js           Pure state machine — import this in tests
  ui.js             DOM wiring — loads in index.html only
tests/
  harness.js        Minimal test runner + assert utilities
  run.js            Entry point: node tests/run.js
  test-calc.js      Unit tests for calc.js
package.json        { "type": "module" } — required for ES2020 imports in Node
.github/
  workflows/
    ci.yml          GitHub Actions CI workflow
```

## Development Workflow (TDD)

Per Constitution Principle III, always Red-Green-Refactor:

1. Write a failing test in `tests/test-calc.js`
2. Run `node tests/run.js` — confirm it fails (red)
3. Write the minimum code in `src/calc.js` to pass
4. Run `node tests/run.js` — confirm it passes (green)
5. Refactor if needed, keeping tests green
6. Wire the new behaviour in `ui.js` + `index.html`
7. Open browser and verify manually

## Key Spec References

- **FR-001 – FR-010**: Functional requirements → `specs/001-calc-view-modes/spec.md`
- **Data model + state transitions**: `specs/001-calc-view-modes/data-model.md`
- **HTML/ARIA contract**: `specs/001-calc-view-modes/contracts/ui-contract.md`
- **JS API contract**: `specs/001-calc-view-modes/contracts/calc-api.md`
