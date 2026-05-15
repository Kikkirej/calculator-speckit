# Implementation Plan: Fix Firefox Browser Bugs

**Branch**: `003-fix-firefox-bugs` | **Date**: 2026-05-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-fix-firefox-bugs/spec.md`

## Summary

Two Firefox-specific bugs are present in the calculator: (1) the scientific button panel is always visible because `display: grid` in `style.css` overrides the `hidden` HTML attribute's UA `display: none`, and (2) keyboard input is completely non-functional because `ui.js` only registers a `click` listener — no `keydown` listener exists. Both fixes are surgical changes to existing files with no new abstractions needed.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2020 modules), HTML5, CSS3

**Primary Dependencies**: None — zero-dependency plain web stack per constitution

**Storage**: N/A

**Testing**: Custom in-repo test runner (`tests/run.js`) — plain JS assertions, Node-compatible

**Target Platform**: Static files in browser — latest stable Chrome, Firefox, Safari

**Project Type**: Web application (single-page static app)

**Performance Goals**: Keyboard input must respond within one animation frame; no perceptible lag

**Constraints**: No libraries, no build tools; all fixes in vanilla JS/CSS only

**Scale/Scope**: 2 bug fixes across 2 existing files (`style.css`, `src/ui.js`)

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| I. Zero-Dependency Plain Web Stack | PASS | No new dependencies introduced |
| II. Minimal Token / Code Footprint | PASS | Fixes add ≤10 lines each; no new abstractions |
| III. Test-Driven Development | PASS | Tests for keyboard handler and CSS fix written before code |
| IV. CI Verification via GitHub Actions | PASS | Existing workflow covers both tests and syntax check |

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-firefox-bugs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (modified files only)

```text
style.css                     # Bug 1: add [hidden] { display: none !important; }
src/ui.js                     # Bug 2: add keydown listener + backspace handler
tests/
└── test-ui-keyboard.js       # New tests for keyboard input and CSS visibility
```

## Implementation Notes

### Bug 1 — Scientific Panel Always Visible (CSS)

**Root cause**: `#buttons-scientific { display: grid; }` in `style.css` is an author-level rule with higher specificity than the UA stylesheet's `display: none` from the `hidden` attribute. Firefox applies the author rule and ignores `hidden`.

**Fix**: Add at the top of `style.css` (or in the Reset section):
```css
[hidden] { display: none !important; }
```
This ensures any element with the `hidden` attribute is hidden regardless of other display rules.

### Bug 2 — Keyboard Input Non-Functional

**Root cause**: `src/ui.js` only attaches a `click` listener to `#calculator`. No keyboard event listener exists.

**Fix**: Add a `keydown` listener on `document` that maps keys to the existing state functions:

```
'0'..'9'        → inputDigit(state, key)
'.'             → inputDecimal(state)
'+'             → selectOperator(state, '+')
'-'             → selectOperator(state, '-')
'*'             → selectOperator(state, '*')
'/'             → selectOperator(state, '/') + e.preventDefault()
'^'             → selectOperator(state, '^')
'Enter' or '='  → evaluate(state)
'Escape'        → clear(state)
'Backspace'     → delete last digit or reset to '0'
```

For `Backspace`: slice last char from `currentValue`; if result is empty or `-`, set `'0'`. In scientific mode, also update the last NumberToken in `expression[]`.

## Complexity Tracking

No constitution violations.
