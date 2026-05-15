# Research: Fix Firefox Browser Bugs

**Feature**: 003-fix-firefox-bugs  
**Date**: 2026-05-15

---

## Decision 1: How to reliably hide elements across browsers

**Decision**: Use a global `[hidden] { display: none !important; }` CSS rule to ensure the `hidden` HTML attribute always wins over any layout-specific `display` property.

**Rationale**: HTML's `hidden` attribute sets `display: none` via the browser's default stylesheet, but CSS author stylesheets have higher specificity than the UA stylesheet. When `#buttons-scientific { display: grid; }` is declared in `style.css`, it overrides the UA `display: none` from `hidden` in browsers that enforce this strictly — notably Firefox. The `!important` flag on a `[hidden]` selector in the author stylesheet restores the intended behavior without touching individual selectors.

**Alternatives considered**:
- Remove `display: grid` from `#buttons-scientific` and rely solely on the `[hidden]` attribute — rejected because the element needs `display: grid` when visible; we would have to add it back in JS or via a `.visible` class, which is more code.
- Toggle a CSS class instead of the `hidden` attribute — rejected because the existing `ui.js` uses the `hidden` attribute (`setAttribute('hidden', '')` / `removeAttribute('hidden')`); switching to class-based toggling would require changing both CSS and all JS toggle sites.
- Use inline `style.display = 'none'` in JS — rejected because inline styles are harder to maintain and bypass the CSS cascade entirely, creating two sources of truth.

---

## Decision 2: Keyboard event handler placement

**Decision**: Attach a single `keydown` listener to `document`, map known keys to the existing calculator action functions, and re-use the same state-update + `render()` flow as the click handler.

**Rationale**: Attaching to `document` ensures keyboard events are captured regardless of which element has focus. `keydown` fires before `keypress` (deprecated) and correctly handles Backspace, Escape, and Enter without needing `keypress`. Re-using the existing action functions keeps the code DRY — each key just calls the same function the click handler would call.

**Key mappings**:
- `0`–`9` → `inputDigit(state, key)`
- `.` → `inputDecimal(state)`
- `+` → `selectOperator(state, '+')`
- `-` → `selectOperator(state, '-')`
- `*` → `selectOperator(state, '*')`
- `/` → `selectOperator(state, '/')` (also prevent browser's default find-in-page shortcut)
- `^` → `selectOperator(state, '^')`
- `Enter` or `=` → `evaluate(state)`
- `Escape` → `clear(state)`
- `Backspace` → delete last digit from `currentValue` (or reset to `'0'`)

**Alternatives considered**:
- Attaching listener to `#calculator` div — rejected because the div is not focusable by default and would miss events when other elements are focused.
- `keypress` event — rejected because it is deprecated and does not fire for Backspace/Escape/Enter consistently across browsers.
- Mapping keys to simulated click events on buttons — rejected because it creates unnecessary indirection and would break in scientific mode where some keys have no visible button.

---

## Decision 3: Backspace behavior

**Decision**: If `currentValue` is a single character or `'0'`, reset to `'0'`. Otherwise, remove the last character. In scientific mode, also update the last NumberToken in the expression array to match.

**Rationale**: This matches standard calculator UX. The `currentValue` string already tracks the displayed number, so slicing off the last character is straightforward. Scientific mode must stay in sync (same dual-update contract as `inputDigit`).

**Alternatives considered**:
- Backspace always clears completely (same as C) — rejected; users expect fine-grained editing.
- No Backspace support — rejected; FR-008 requires defined behavior.
