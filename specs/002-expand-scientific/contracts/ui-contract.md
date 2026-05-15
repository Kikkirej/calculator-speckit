# UI Contract: Expanded Scientific Mode

**Phase**: 1 | **Branch**: `002-expand-scientific` | **Date**: 2026-05-15

This document defines the HTML element additions and changes for the expanded scientific mode.

---

## New Element Identifiers

| Element | Selector | Purpose |
|---------|----------|---------|
| Expression display | `#expression-display` | Shows the expression being built in scientific mode; hidden in simple mode |
| Angle unit indicator | `#angle-unit` | Shows `DEG` or `RAD`; visible only in scientific mode |

## Unchanged Element Identifiers (from v1)

| Element | Selector | Purpose |
|---------|----------|---------|
| Result display | `#display` | Shows current result / entry value |
| Mode toggle | `#mode-toggle` | Switches simple ↔ scientific |
| Mode status | `#mode-status` | SR-only live region for mode announcement |
| Simple buttons | `#buttons-simple` | Basic arithmetic; always visible |
| Scientific buttons | `#buttons-scientific` | Extended functions; visible only in scientific mode |
| Calculator container | `#calculator` | Root widget |

---

## New HTML Elements

### Expression Display (`#expression-display`)

```html
<div id="expression-display" aria-live="polite" aria-atomic="true" hidden></div>
```

- `hidden` in simple mode; `hidden` removed when scientific mode is active
- Updated by `ui.js` after every token input with the serialised expression string
- Font size smaller than `#display` (shows context, not the primary result)
- `aria-live="polite"` so screen readers announce expression updates without interrupting

### Angle Unit Indicator (`#angle-unit`)

```html
<span id="angle-unit" aria-live="polite" hidden>DEG</span>
```

- Content: `"DEG"` or `"RAD"`, updated by `ui.js` on `toggleAngleUnit`
- `hidden` in simple mode; visible in scientific mode
- `aria-live="polite"` so screen reader announces when unit changes

---

## New Buttons in `#buttons-scientific`

All new buttons follow the existing pattern: `type="button"`, `data-action`, visible text label.

```html
<!-- Parentheses row -->
<button type="button" data-action="open-paren">(</button>
<button type="button" data-action="close-paren">)</button>

<!-- Constants -->
<button type="button" data-action="constant-pi">π</button>
<button type="button" data-action="constant-e">e</button>

<!-- Unary functions -->
<button type="button" data-action="factorial">n!</button>
<button type="button" data-action="reciprocal" aria-label="1 divided by x">1/x</button>
<button type="button" data-action="percent">%</button>

<!-- Angle unit toggle -->
<button type="button" data-action="toggle-angle" id="angle-toggle" aria-pressed="false">DEG</button>
```

**`#angle-toggle` ARIA contract**:
- `aria-pressed="false"` when in degree mode (default)
- `aria-pressed="true"` when in radian mode
- Visible label updates to `DEG` / `RAD` to match current state
- `ui.js` updates both `aria-pressed` and `textContent` on toggle

**`1/x` button**: Visible label `1/x` — needs `aria-label="1 divided by x"` for unambiguous screen reader announcement.

---

## Mode Behaviour Contract (updated)

| Mode | `#buttons-scientific` | `#expression-display` | `#angle-unit` |
|------|-----------------------|-----------------------|---------------|
| simple | `hidden` | `hidden` | `hidden` |
| scientific | no `hidden` | no `hidden` | no `hidden` |

---

## Expression Display Serialisation

`ui.js` serialises `state.expression` tokens to a human-readable string for `#expression-display`:

| Token type | Serialised as |
|------------|--------------|
| `number` | the numeric string value |
| `operator "+"` | `+` |
| `operator "-"` | `−` (U+2212) |
| `operator "*"` | `×` (U+00D7) |
| `operator "/"` | `÷` (U+00F7) |
| `operator "^"` | `^` |
| `paren "("` | `(` |
| `paren ")"` | `)` |
| `function "sin"` | `sin(` |
| `function "cos"` | `cos(` |
| `function "tan"` | `tan(` |
| `function "log"` | `log(` |
| `function "ln"` | `ln(` |
| `function "sqrt"` | `√(` |
| `function "factorial"` | `!` (appended after number) |
| `function "reciprocal"` | `1/(` |
| `function "percent"` | `%` (appended after number) |
| `constant "pi"` | `π` |
| `constant "e"` | `e` |

---

## CSS Contract Additions

```css
#expression-display {
  /* Smaller than #display; right-aligned; muted color */
  font-size: 0.85rem;
  text-align: right;
  min-height: 1.5rem;
  color: var(--color-text-muted);
  padding: 0.25rem 1rem;
  word-break: break-all;
}

#angle-unit {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  /* Positioned near the mode toggle */
}

#angle-toggle[aria-pressed="true"] {
  /* Visually distinct when RAD is active */
  background: var(--color-button-eq);
}
```

---

## Color Contrast

All new buttons inherit the existing WCAG 2.1 AA color variables. No new color values introduced. The `#angle-toggle[aria-pressed="true"]` state reuses `--color-button-eq` (already verified ≥4.5:1 contrast).
